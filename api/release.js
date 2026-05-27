// ════════════════════════════════════════════════════════════════════════════
// api/release.js — Libérer l'escrow après confirmation de livraison par le client
// Appelé quand le client clique "Confirmer la livraison" dans l'app
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { commandeId } = req.body;
  if (!commandeId) return res.status(400).json({ error: "Missing commandeId" });

  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

  try {
    // 1. Marquer la commande comme livrée + escrow libéré
    await sb.from("commandes")
      .update({ statut: "livree", escrow_libere: true })
      .eq("id", commandeId);

    // 2. Libérer tous les splits de cette commande
    await sb.from("splits_paiement")
      .update({ statut: "libere", libere_at: new Date().toISOString() })
      .eq("commande_id", commandeId)
      .eq("statut", "en_attente");

    // 3. Récupérer les splits pour notifier les bénéficiaires
    const { data: splits } = await sb
      .from("splits_paiement")
      .select("beneficiaire, role, montant_pi")
      .eq("commande_id", commandeId);

    // 4. Créer une notification de crédit pour chaque bénéficiaire
    if (splits && splits.length > 0) {
      const notifs = splits.map(s => ({
        destinataire_pi: s.beneficiaire,
        role:            s.role,
        priorite:        "🟡",
        type:            "paiement",
        titre:           "💰 Pi crédité !",
        message:         `+π${Number(s.montant_pi).toFixed(3)} — Livraison confirmée`,
        data:            { commande_id: commandeId, montant: s.montant_pi },
      }));
      await sb.from("notifications").insert(notifs);
    }

    res.status(200).json({ message: "released", splits });
  } catch (e) {
    console.error("release error:", e);
    res.status(500).json({ error: e.message });
  }
}
