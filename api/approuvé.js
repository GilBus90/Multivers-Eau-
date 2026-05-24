export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();
  const { paymentId } = req.body;
  try {
    const r = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      { method:"POST", headers:{ Authorization:`Key ${process.env.PI_API_KEY}` } }
    );
    res.status(200).json(await r.json());
  } catch(e) { res.status(500).json({ error: e.message }); }
}
