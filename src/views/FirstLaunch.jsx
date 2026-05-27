// ════════════════════════════════════════════════════════════════════════════
// FIRST LAUNCH + STOCK MANAGEMENT + CATALOGUE FILTER + TEST RESET
// Multivers'Eau — Ce fichier couvre :
//
// 1. FirstLaunchAdmin   — Écran de configuration initiale (admin seul au départ)
// 2. AdminStockMinimums — Admin fixe les stocks de sécurité
// 3. RelaisStockEntry   — Relais entre ses stocks réels + coûts d'achat
// 4. useCatalogue       — Hook : catalogue filtré (stock > 0 uniquement)
// 5. PriceDisplay       — Prix Pi temps réel affiché en grand
// 6. TestDataReset      — Suppression des données de test
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { CATALOGUE, BRANDS, STOCK_MIN, CONFIG, calcSplit } from "../data/constants";
import { C, fmt, fmtPi } from "../design/theme";
import { Btn, Fld } from "../components";

// ════════════════════════════════════════════════════════════════════════════
// 1. FirstLaunchAdmin
// Affiché quand l'admin se connecte et qu'il n'y a AUCUN relais actif
// Guide l'admin à travers les 3 étapes de configuration initiale
// ════════════════════════════════════════════════════════════════════════════
export function FirstLaunchAdmin({ oracle, lang, onComplete }) {
  const [step,    setStep]    = useState(1); // 1=stocks_min | 2=prix | 3=wallet
  const [saving,  setSaving]  = useState(false);
  const [stockMins, setStockMins] = useState({ ...STOCK_MIN });
  const [walletPi,  setWalletPi]  = useState("");
  const [prix,      setPrix]      = useState({});

  // Charger les prix existants
  useEffect(() => {
    supabase.from("prix_vente").select("produit_id, prix_fcfa")
      .then(({ data }) => {
        if (data) setPrix(Object.fromEntries(data.map(p => [p.produit_id, p.prix_fcfa])));
      });
  }, []);

  const sauvegarderConfig = async () => {
    setSaving(true);

    // 1. Sauvegarder les stocks de sécurité
    const stockRows = Object.entries(stockMins).map(([produit_id, quantite_min]) => ({
      produit_id, quantite_min
    }));
    await supabase.from("stocks_securite").upsert(stockRows);

    // 2. Sauvegarder le wallet Pi de l'entreprise
    if (walletPi.trim()) {
      await supabase.from("config_app").upsert({
        cle: "wallet_entreprise",
        valeur: walletPi.trim(),
        updated_by: CONFIG.ADMIN_USERNAME,
      });
    }

    setSaving(false);
    onComplete();
  };

  const steps = [
    { num: 1, icon: "📦", label: "Stocks de sécurité" },
    { num: 2, icon: "💹", label: "Prix de vente" },
    { num: 3, icon: "🔐", label: "Wallet entreprise" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(160deg,#001040,#020818)", padding: "32px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>💧</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 6 }}>
          Configuration initiale
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
          L'app démarre vierge. Configure les paramètres de base avant d'ouvrir aux relais.
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, padding: "16px 20px" }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center" }}>
            <div
              onClick={() => setStep(s.num)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", opacity: step === s.num ? 1 : 0.5 }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: step === s.num ? C.admin : C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginBottom: 4, transition: "all .2s" }}>
                {step > s.num ? "✅" : s.icon}
              </div>
              <div style={{ fontSize: 9, color: step === s.num ? C.admin : C.muted, fontWeight: 700, textAlign: "center", maxWidth: 60 }}>{s.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 40, height: 1, background: C.border, margin: "0 4px 20px" }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "0 18px" }}>

        {/* ── ÉTAPE 1 : Stocks de sécurité ── */}
        {step === 1 && (
          <div>
            <div style={{ background: `${C.admin}15`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.admin}33` }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: C.admin, fontSize: 14, marginBottom: 4 }}>
                📦 Stocks de sécurité (minimums d'alerte)
              </div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                Quand un relais descend en-dessous de ce seuil, une alerte est déclenchée. Tu peux modifier ces valeurs à tout moment.
              </div>
            </div>

            {CATALOGUE.map(p => {
              const b = BRANDS[p.b];
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.card, borderRadius: 12, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 16 }}>{b.emoji}</span>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
                    {lang === "fr" ? p.nFr : p.nEn} <span style={{ color: C.muted }}>{p.d}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => setStockMins(m => ({ ...m, [p.id]: Math.max(0, (m[p.id] || 0) - 1) }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: C.card2, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14 }}>−</button>
                    <div style={{ width: 32, textAlign: "center", fontWeight: 800, fontSize: 14, color: C.admin }}>
                      {stockMins[p.id] || 0}
                    </div>
                    <button onClick={() => setStockMins(m => ({ ...m, [p.id]: (m[p.id] || 0) + 1 }))}
                      style={{ width: 28, height: 28, borderRadius: 8, background: C.card2, border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", fontSize: 14 }}>+</button>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 16 }}>
              <Btn onClick={() => setStep(2)} color={C.admin}>Suivant → Prix de vente</Btn>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 2 : Prix de vente ── */}
        {step === 2 && (
          <div>
            <div style={{ background: `${C.admin}15`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.admin}33` }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: C.admin, fontSize: 14, marginBottom: 4 }}>
                💹 Prix de vente clients
              </div>
              <div style={{ fontSize: 12, color: C.sub }}>
                Oracle live · 1π = {fmt(oracle.rate)} FCFA · Countdown : {oracle.countdown}s
              </div>
            </div>

            {CATALOGUE.map(p => {
              const b      = BRANDS[p.b];
              const pFcfa  = prix[p.id] || p.pv;
              const pPi    = pFcfa / oracle.rate;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.card, borderRadius: 12, marginBottom: 6, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: 16 }}>{b.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{lang === "fr" ? p.nFr : p.nEn} {p.d}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>Achat min : {fmt(p.pa)} F</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16, color: "#fff" }}>
                      π {fmtPi(pPi)}
                    </div>
                    <div style={{ fontSize: 10, color: C.sub }}>{fmt(pFcfa)} F</div>
                    <div style={{ fontSize: 9, color: pFcfa > p.pa ? C.green : C.red }}>
                      marge {fmt(pFcfa - p.pa)} F
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: C.muted, textAlign: "center", margin: "10px 0 16px", padding: "8px", background: C.card2, borderRadius: 10 }}>
              ℹ️ Les prix Pi se recalculent automatiquement en temps réel selon l'oracle. Tu peux modifier les prix FCFA dans l'onglet "Gestion" de l'AdminApp.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Btn onClick={() => setStep(1)} variant="outline" color={C.muted}>← Retour</Btn>
              <Btn onClick={() => setStep(3)} color={C.admin}>Suivant → Wallet</Btn>
            </div>
          </div>
        )}

        {/* ── ÉTAPE 3 : Wallet entreprise ── */}
        {step === 3 && (
          <div>
            <div style={{ background: `${C.admin}15`, borderRadius: 16, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.admin}33` }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: C.admin, fontSize: 14, marginBottom: 4 }}>
                🔐 Wallet Pi de l'entreprise
              </div>
              <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>
                Crée un compte Pi dédié (ex: <strong style={{ color: C.admin }}>multiverseau_togo</strong>) dans Pi Browser. C'est le username qui recevra la part admin sur chaque commande. Tu peux utiliser ton propre username <strong style={{ color: C.admin }}>flashman90</strong> pour démarrer.
              </div>
            </div>

            {/* Explication wallet */}
            <div style={{ background: C.card, borderRadius: 16, padding: "16px", marginBottom: 16, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: C.text }}>
                ❓ Comment ça fonctionne dans Pi Network
              </div>
              {[
                ["💳 Paiement", "Le client paie en Pi depuis son wallet Pi Browser vers l'app"],
                ["🔒 Escrow", "Les Pi sont bloqués jusqu'à confirmation de livraison"],
                ["🔑 Accès wallet", "Tu accèdes à ton wallet via Pi Browser avec tes 24 mots de récupération"],
                ["📝 24 mots", "Générés à la création du compte Pi — à noter précieusement et garder secret"],
                ["🏢 Wallet business", "Option : crée un 2ème compte Pi (ex: multiverseau_togo) dédié à l'entreprise"],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 16, flexShrink: 0 }}>{title.split(" ")[0]}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{title.split(" ").slice(1).join(" ")}</div>
                    <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <Fld
              label="Username Pi de l'entreprise *"
              value={walletPi}
              onChange={e => setWalletPi(e.target.value)}
              placeholder="ex: flashman90 ou multiverseau_togo"
              note="Ce username recevra 10% de la marge sur chaque commande (commission plateforme)"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
              <Btn onClick={() => setStep(2)} variant="outline" color={C.muted}>← Retour</Btn>
              <Btn onClick={sauvegarderConfig} color={C.green} disabled={saving || !walletPi.trim()}>
                {saving ? "Sauvegarde..." : "✅ Démarrer l'app"}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 2. RelaisStockEntry
// Le relais entre son stock réel produit par produit + coût d'achat
// Appelé dans RelaisApp → onglet Stocks → bouton "+ Approvisionner"
// ════════════════════════════════════════════════════════════════════════════
export function RelaisStockEntry({ relaisId, stockMins, oracle, lang, show, onDone }) {
  const [stocks,  setStocks]  = useState({});
  const [prixVte, setPrixVte] = useState({});
  const [modal,   setModal]   = useState(null); // produit sélectionné
  const [form,    setForm]    = useState({ qte: "", prix_achat: "", transport: "", fournisseur: "" });
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!relaisId) return;
    supabase.from("stocks").select("produit_id,quantite").eq("relais_id", relaisId)
      .then(({ data }) => {
        if (data) setStocks(Object.fromEntries(data.map(s => [s.produit_id, s.quantite])));
      });
    supabase.from("prix_vente").select("produit_id,prix_fcfa")
      .then(({ data }) => {
        if (data) setPrixVte(Object.fromEntries(data.map(p => [p.produit_id, p.prix_fcfa])));
      });
  }, [relaisId]);

  const ouvrirModal = (produit) => {
    setForm({ qte: "", prix_achat: String(produit.pa), transport: "0", fournisseur: "" });
    setModal(produit);
  };

  const enregistrer = async () => {
    if (!form.qte || !form.prix_achat) return;
    setSaving(true);
    const qte = parseInt(form.qte);
    const pa  = parseInt(form.prix_achat);
    const tp  = parseInt(form.transport) || 0;

    // 1. Enregistrer l'achat
    await supabase.from("stock_achats").insert({
      relais_id: relaisId, produit_id: modal.id,
      quantite: qte, prix_achat_unit: pa, frais_transport: tp,
      fournisseur: form.fournisseur || null,
    });

    // 2. Mettre à jour le stock (additionner)
    const actuel = stocks[modal.id] || 0;
    await supabase.from("stocks").upsert({
      relais_id: relaisId, produit_id: modal.id,
      quantite: actuel + qte, updated_at: new Date(),
    });

    setStocks(s => ({ ...s, [modal.id]: (s[modal.id] || 0) + qte }));

    const pv = prixVte[modal.id] || modal.pv;
    const coutUnit = pa + Math.round(tp / qte);
    const split = calcSplit(pv * qte, pa * qte, 0); // calcSplit sans livraison
    const margeUnit = pv - coutUnit;

    show(
      `✅ +${qte} ${modal.nFr} · Marge : ${fmt(margeUnit)} F/unité · Relais : ${fmt(Math.round(split.relais))} F total`,
      C.green
    );
    setSaving(false);
    setModal(null);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ background: `${C.relais}15`, borderRadius: 16, padding: "14px 16px", marginBottom: 14, border: `1px solid ${C.relais}33` }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: C.relais, fontSize: 14 }}>
          📦 Mes stocks actuels
        </div>
        <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
          Seuls les produits avec stock {">"}  0 sont visibles dans le catalogue client · Oracle : 1π = {fmt(oracle.rate)} F
        </div>
      </div>

      {/* Liste produits */}
      {CATALOGUE.map(p => {
        const b        = BRANDS[p.b];
        const qte      = stocks[p.id] || 0;
        const pv       = prixVte[p.id] || p.pv;
        const pPi      = pv / oracle.rate;
        const sMin     = stockMins?.[p.id] || 0;
        const alerte   = qte === 0 ? "rupture" : qte <= sMin ? "bas" : "ok";
        const alerteColor = alerte === "rupture" ? C.red : alerte === "bas" ? C.relais : C.green;

        return (
          <div key={p.id} style={{ background: C.card, borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${alerte !== "ok" ? alerteColor : C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Produit info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14 }}>{b.emoji}</span>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{lang === "fr" ? p.nFr : p.nEn} {p.d}</span>
                  {alerte !== "ok" && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: alerteColor, background: `${alerteColor}22`, padding: "2px 6px", borderRadius: 20 }}>
                      {alerte === "rupture" ? "RUPTURE" : "STOCK BAS"}
                    </span>
                  )}
                </div>
                {/* Prix Pi en temps réel */}
                <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 15, color: C.text }}>
                    π {fmtPi(pPi)}
                  </span>
                  <span style={{ fontSize: 10, color: C.muted }}>{fmt(pv)} F</span>
                  {sMin > 0 && (
                    <span style={{ fontSize: 9, color: C.muted }}>sécurité : {sMin}</span>
                  )}
                </div>
              </div>

              {/* Stock quantité */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 28, color: alerteColor, lineHeight: 1 }}>
                  {qte}
                </div>
                <div style={{ fontSize: 9, color: C.muted, marginBottom: 6 }}>unités</div>
                <button
                  onClick={() => ouvrirModal(p)}
                  style={{ padding: "5px 12px", background: `${C.relais}22`, border: `1px solid ${C.relais}55`, borderRadius: 10, color: C.relais, fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  + Appro
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal saisie approvisionnement */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: C.surf, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px", width: "100%", maxWidth: 480 }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 17, marginBottom: 4 }}>
              {BRANDS[modal.b].emoji} {modal.nFr} {modal.d}
            </div>

            {/* Prix vente + split preview */}
            <div style={{ background: C.card, borderRadius: 12, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Simulation de marge (par unité)</div>
              {form.qte && form.prix_achat ? (() => {
                const pa   = parseInt(form.prix_achat) || 0;
                const tp   = parseInt(form.transport)  || 0;
                const qte  = parseInt(form.qte)        || 1;
                const pv   = prixVte[modal.id]         || modal.pv;
                const cout = pa + Math.round(tp / qte);
                const marge= pv - cout;
                const { relais, admin } = calcSplit(pv, cout, 0);
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {[
                      ["Prix vente", fmt(pv) + " F", "π " + fmtPi(pv / oracle.rate)],
                      ["Coût réel",  fmt(cout) + " F", ""],
                      ["Ta marge",   fmt(marge) + " F", marge > 0 ? "✅" : "🚨"],
                    ].map(([lbl, val, sub]) => (
                      <div key={lbl} style={{ textAlign: "center", background: C.card2, borderRadius: 8, padding: "6px 4px" }}>
                        <div style={{ fontSize: 9, color: C.muted }}>{lbl}</div>
                        <div style={{ fontWeight: 800, fontSize: 12, color: marge > 0 ? C.green : C.red }}>{val}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>{sub}</div>
                      </div>
                    ))}
                  </div>
                );
              })() : (
                <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
                  Remplis la quantité et le prix d'achat pour voir la simulation
                </div>
              )}
            </div>

            <Fld label="Quantité reçue *" value={form.qte}
              onChange={e => setForm(f => ({ ...f, qte: e.target.value }))}
              placeholder="Ex: 20 cartons" type="number" req />
            <Fld label="Prix d'achat unitaire FCFA *" value={form.prix_achat}
              onChange={e => setForm(f => ({ ...f, prix_achat: e.target.value }))}
              placeholder={`Ex: ${modal.pa} (prix usine)`} type="number" req />
            <Fld label="Frais de transport total (FCFA)" value={form.transport}
              onChange={e => setForm(f => ({ ...f, transport: e.target.value }))}
              placeholder="Ex: 5000 pour tout le lot"
              note={form.transport && form.qte ? `Soit ${fmt(Math.round(parseInt(form.transport || "0") / Math.max(1, parseInt(form.qte || "1"))))} F/unité` : ""}
              type="number" />
            <Fld label="Fournisseur" value={form.fournisseur}
              onChange={e => setForm(f => ({ ...f, fournisseur: e.target.value }))}
              placeholder="Ex: CEVITAL Lomé, Grossiste marché..." />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
              <Btn onClick={() => setModal(null)} variant="outline" color={C.muted}>Annuler</Btn>
              <Btn onClick={enregistrer} color={C.relais}
                disabled={saving || !form.qte || !form.prix_achat}>
                {saving ? "..." : "✅ Enregistrer"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 3. useCatalogue — Catalogue filtré : seulement les produits en stock
// + prix Pi recalculé en temps réel selon l'oracle
// ════════════════════════════════════════════════════════════════════════════
export function useCatalogue(relaisId, oracle) {
  const [catalogue, setCatalogue] = useState([]);
  const [prixVente, setPrixVente] = useState({});
  const [stocks,    setStocks]    = useState({});
  const [loading,   setLoading]   = useState(true);

  // Charger prix + stocks
  useEffect(() => {
    if (!relaisId) { setLoading(false); return; }
    Promise.all([
      supabase.from("prix_vente").select("produit_id, prix_fcfa"),
      supabase.from("stocks").select("produit_id, quantite").eq("relais_id", relaisId),
    ]).then(([pRes, sRes]) => {
      const pMap = Object.fromEntries((pRes.data || []).map(p => [p.produit_id, p.prix_fcfa]));
      const sMap = Object.fromEntries((sRes.data || []).map(s => [s.produit_id, s.quantite]));
      setPrixVente(pMap);
      setStocks(sMap);
      setLoading(false);
    });

    // Real-time stocks
    const ch = supabase.channel(`catalogue-${relaisId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "stocks", filter: `relais_id=eq.${relaisId}` },
        payload => setStocks(prev => ({ ...prev, [payload.new.produit_id]: payload.new.quantite }))
      ).subscribe();
    return () => supabase.removeChannel(ch);
  }, [relaisId]);

  // Recalcul catalogue à chaque changement de stocks, prix, ou oracle
  useEffect(() => {
    const result = CATALOGUE
      .filter(p => (stocks[p.id] || 0) > 0)   // UNIQUEMENT les produits en stock
      .map(p => {
        const pFcfa = prixVente[p.id] || p.pv;
        const pPi   = pFcfa / oracle.rate;      // Prix Pi recalculé en temps réel
        return {
          ...p,
          pFcfa,
          pPi,
          stock: stocks[p.id] || 0,
          disponible: (stocks[p.id] || 0) > 0,
        };
      });
    setCatalogue(result);
  }, [stocks, prixVente, oracle.rate]);

  return { catalogue, loading, stocks, prixVente };
}

// ════════════════════════════════════════════════════════════════════════════
// 4. CatalogueProduit — Affichage d'un produit avec prix Pi en grand
// ════════════════════════════════════════════════════════════════════════════
export function CatalogueProduit({ produit, oracle, onAjouter, lang }) {
  const b = BRANDS[produit.b];
  return (
    <div style={{ background: C.card, borderRadius: 18, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 18 }}>{b.emoji}</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: C.text }}>{lang === "fr" ? produit.nFr : produit.nEn}</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{produit.d} · {produit.noteF}</div>
          {/* Stock restant */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, background: produit.stock <= 5 ? `${C.red}22` : `${C.green}18`, borderRadius: 20, padding: "2px 8px" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: produit.stock <= 5 ? C.red : C.green }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: produit.stock <= 5 ? C.red : C.green }}>
              {produit.stock} {lang === "fr" ? "disponibles" : "available"}
            </span>
          </div>
        </div>

        {/* PRIX PI — affiché en grand en premier */}
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", lineHeight: 1.1 }}>
            π {fmtPi(produit.pPi)}
          </div>
          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
            ≈ {fmt(produit.pFcfa)} F
          </div>
          {/* Oracle live indicator */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3 }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: oracle.status === "live" ? C.green : C.relais, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 8, color: C.muted }}>live</span>
          </div>
        </div>
      </div>

      {/* Bouton ajouter */}
      <button
        onClick={() => onAjouter(produit)}
        style={{ width: "100%", padding: "11px 0", background: `linear-gradient(135deg,${b.color}CC,${b.color})`, border: "none", borderRadius: 12, color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, cursor: "pointer", boxShadow: `0 4px 14px ${b.color}33` }}
      >
        + {lang === "fr" ? "Ajouter au panier" : "Add to cart"}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 5. TestDataReset — Suppression des données de test (admin uniquement)
// Accessible dans AdminApp → Paramètres → "Réinitialiser pour la production"
// ════════════════════════════════════════════════════════════════════════════
export function TestDataReset({ show, lang }) {
  const [confirm, setConfirm]   = useState("");
  const [step,    setStep]      = useState("idle"); // idle|confirm|resetting|done
  const [progress,setProgress]  = useState([]);

  const RESET_STEPS = [
    { label: "Suppression des commandes de test",      table: "commandes",      filter: null },
    { label: "Suppression des splits de test",         table: "splits_paiement",filter: null },
    { label: "Suppression des transactions Pi test",   table: "transactions_pi",filter: null },
    { label: "Suppression des notifications test",     table: "notifications",  filter: null },
    { label: "Suppression des livreurs test",          table: "livreurs",       filter: { col: "pi_username", val: "koffi_test" } },
    { label: "Remise à zéro des stocks",               table: "stocks",         action: "reset_qty" },
    { label: "Suppression des achats test",            table: "stock_achats",   filter: null },
  ];

  const lancerReset = async () => {
    if (confirm !== "PRODUCTION") return;
    setStep("resetting");
    const log = [];

    for (const s of RESET_STEPS) {
      log.push({ label: s.label, status: "running" });
      setProgress([...log]);

      try {
        if (s.action === "reset_qty") {
          // Remettre tous les stocks à 0
          await supabase.from("stocks").update({ quantite: 0 });
        } else if (s.filter) {
          await supabase.from(s.table).delete().eq(s.filter.col, s.filter.val);
        } else {
          // Tout supprimer sauf les données de config (relais, prix, stocks_securite)
          await supabase.from(s.table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
        }
        log[log.length - 1].status = "done";
      } catch (e) {
        log[log.length - 1].status = "error";
        log[log.length - 1].error = e.message;
      }
      setProgress([...log]);
      await new Promise(r => setTimeout(r, 400)); // petite pause visuelle
    }

    setStep("done");
    show("✅ Données de test supprimées. L'app est prête pour la production !", C.green, 5000);
  };

  if (step === "done") return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 18, color: C.green, marginBottom: 8 }}>
        App prête pour la production !
      </div>
      <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
        Toutes les données de test ont été supprimées. Les stocks sont à zéro. Les relais peuvent maintenant entrer leurs vrais stocks.
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: `${C.red}15`, borderRadius: 16, padding: "16px", marginBottom: 16, border: `1px solid ${C.red}44` }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, color: C.red, fontSize: 15, marginBottom: 6 }}>
          ⚠️ Réinitialisation pour la production
        </div>
        <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65 }}>
          Cette action supprime toutes les données de test (commandes, splits, notifications, livreurs test). Les stocks sont remis à 0. Les relais, prix et stocks de sécurité sont conservés.
        </div>
      </div>

      {/* Ce qui est supprimé / gardé */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: `${C.red}10`, borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.red, marginBottom: 8 }}>🗑 SUPPRIMÉ</div>
          {["Commandes test","Paiements Pi test","Notifications","Livreurs test","Stocks (→ 0)"].map(i => (
            <div key={i} style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>• {i}</div>
          ))}
        </div>
        <div style={{ background: `${C.green}10`, borderRadius: 12, padding: "12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.green, marginBottom: 8 }}>✅ CONSERVÉ</div>
          {["Relais validés","Prix de vente","Stocks de sécurité","Config wallet","Zones livraison"].map(i => (
            <div key={i} style={{ fontSize: 11, color: C.sub, marginBottom: 4 }}>• {i}</div>
          ))}
        </div>
      </div>

      {step === "idle" && (
        <div>
          <Btn onClick={() => setStep("confirm")} color={C.red} variant="outline">
            Préparer la réinitialisation →
          </Btn>
        </div>
      )}

      {step === "confirm" && (
        <div>
          <Fld
            label='Tape "PRODUCTION" pour confirmer'
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="PRODUCTION"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Btn onClick={() => { setStep("idle"); setConfirm(""); }} variant="outline" color={C.muted}>Annuler</Btn>
            <Btn onClick={lancerReset} color={C.red} disabled={confirm !== "PRODUCTION"}>
              🚀 Lancer la réinitialisation
            </Btn>
          </div>
        </div>
      )}

      {step === "resetting" && (
        <div>
          {progress.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
              <span style={{ fontSize: 14 }}>
                {p.status === "running" ? "⏳" : p.status === "done" ? "✅" : "❌"}
              </span>
              <span style={{ fontSize: 12, color: p.status === "error" ? C.red : C.sub }}>{p.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// 6. SQL à ajouter dans Supabase pour les nouvelles tables
// ════════════════════════════════════════════════════════════════════════════
export const SQL_COMPLEMENT = `
-- Table stocks de sécurité (seuils d'alerte par produit)
CREATE TABLE IF NOT EXISTS stocks_securite (
  produit_id   TEXT PRIMARY KEY,
  quantite_min INTEGER DEFAULT 5,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Table configuration générale
CREATE TABLE IF NOT EXISTS config_app (
  cle          TEXT PRIMARY KEY,
  valeur       TEXT NOT NULL,
  updated_by   TEXT,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE stocks_securite ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_app ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all_stocks_sec" ON stocks_securite FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_config"     ON config_app     FOR ALL USING (true) WITH CHECK (true);

-- Stocks de sécurité par défaut (basés sur code original)
INSERT INTO stocks_securite (produit_id, quantite_min) VALUES
  ('v1',10),('v2',8),('v3',8),('v4',6),('v5',15),('v6',15),
  ('v7',8),('v8',4),('v9',3),('c1',8),('c2',6),('c3',10),
  ('c4',10),('c5',10),('c6',6),('t1',5),('t2',6),('t3',4)
ON CONFLICT (produit_id) DO NOTHING;
`;
