export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "POST") return res.status(405).end();
  const { username } = req.body;
  // Par défaut client - le Super Admin sera assigné manuellement en BDD
  const adminUsernames = ["flashman90"]; // ← Ton username Pi ici
  const role = adminUsernames.includes(username) ? "admin" : "client";
  res.status(200).json({ role });
}
