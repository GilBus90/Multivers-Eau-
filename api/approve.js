// ════════════════════════════════════════════════════════════════════════════
// api/approve.js — Approuver un paiement Pi (server-side)
// ════════════════════════════════════════════════════════════════════════════
import { createClient } from "@supabase/supabase-js";

const sb = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { paymentId, orderId } = req.body;
  if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });

  try {
    // Enregistrer en base
    await sb().from("transactions_pi").upsert({
      payment_id: paymentId,
      statut: "approved",
    });
    // Lier à la commande
    if (orderId) {
      await sb().from("commandes").update({ pi_payment_id: paymentId }).eq("id", orderId);
    }
    res.status(200).json({ message: "approved" });
  } catch (e) {
    console.error("approve error:", e);
    res.status(500).json({ error: e.message });
  }
}
