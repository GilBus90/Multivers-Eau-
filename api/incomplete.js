// ════════════════════════════════════════════════════════════════════════════
// api/incomplete.js — Gérer les paiements Pi incomplets (crash, fermeture app)
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { paymentId } = req.body;

  if (paymentId) {
    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
    // Loguer le paiement incomplet pour analyse
    await sb.from("transactions_pi").upsert({
      payment_id: paymentId,
      statut:     "incomplete",
    }).catch(() => {});
    console.log("Incomplete Pi payment:", paymentId);
  }

  res.status(200).json({ message: "noted" });
}
