// ════════════════════════════════════════════════════════════════════════════
// api/complete.js — Compléter un paiement Pi + créer les splits
// Appelé quand la transaction blockchain est confirmée
// Les splits restent en "en_attente" jusqu'à la confirmation de livraison
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { paymentId, txId, orderId } = req.body;

  try {
    // 1. Mettre à jour la transaction Pi
    await sb().from("transactions_pi").upsert({
      payment_id: paymentId,
      tx_id:      txId,
      statut:     "completed",
    });

    if (!orderId) return res.status(200).json({ message: "ok" });

    // 2. Mettre à jour la commande → statut "payee" (en attente de livraison)
    const { data: cmd } = await sb()
      .from("commandes")
      .update({ statut: "payee", pi_tx_id: txId })
      .eq("id", orderId)
      .select()
      .single();

    // 3. Créer les splits (bloqués jusqu'à confirmation livraison)
    if (cmd) {
      await creerSplits(cmd);
    }

    res.status(200).json({ message: "completed" });
  } catch (e) {
    console.error("complete error:", e);
    res.status(500).json({ error: e.message });
  }
}

// ── Calcul splits exacts (formule du code original) ───────────────────────────
// relais  = PA total + 90% de la marge
// livreur = 90% des frais de livraison
// admin   = 10% de la marge + 10% des frais de livraison
async function creerSplits(cmd) {
  const pvTotal  = cmd.total_fcfa - cmd.frais_livraison_fcfa;
  const paTotal  = cmd.pa_total_fcfa || 0;
  const marge    = pvTotal - paTotal;
  const livr     = cmd.frais_livraison_fcfa || 0;
  const rate     = cmd.oracle_rate || 90;
  const fraisBc  = parseFloat(cmd.frais_blockchain_pi) || 0.01;

  // Montants Pi
  const relaisPi  = (paTotal + marge * 0.90) / rate;
  const livreurPi = (livr * 0.90) / rate;
  const adminPi   = (marge * 0.10 + livr * 0.10) / rate;

  // Récupérer les usernames
  const supabase = sb();
  const [relaisData, livreurData] = await Promise.all([
    supabase.from("relais").select("pi_username").eq("id", cmd.relais_id).single(),
    cmd.livreur_id
      ? supabase.from("livreurs").select("pi_username").eq("id", cmd.livreur_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const splits = [
    {
      commande_id:  cmd.id,
      beneficiaire: process.env.VITE_ADMIN_USER || "flashman90",
      role:         "admin",
      montant_pi:   adminPi,
      montant_fcfa: Math.round(adminPi * rate),
      statut:       "en_attente",
    },
    relaisData.data && {
      commande_id:  cmd.id,
      beneficiaire: relaisData.data.pi_username,
      role:         "relais",
      montant_pi:   relaisPi,
      montant_fcfa: Math.round(relaisPi * rate),
      statut:       "en_attente",
    },
    livreurData.data && {
      commande_id:  cmd.id,
      beneficiaire: livreurData.data.pi_username,
      role:         "livreur",
      montant_pi:   livreurPi,
      montant_fcfa: Math.round(livreurPi * rate),
      statut:       "en_attente",
    },
  ].filter(Boolean);

  await supabase.from("splits_paiement").insert(splits);
}
