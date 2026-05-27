// ════════════════════════════════════════════════════════════════════════════
// MOTEUR FISCAL + SPLIT Pi — Multivers'Eau
// Formule corrigée avec réserve IMF · Comptabilité OTR Togo
// ════════════════════════════════════════════════════════════════════════════

// ── Rappel du flux complet Pi ─────────────────────────────────────────────
//
//  CLIENT paie
//      │  totalPi = PV_Pi + livraison_Pi + 0,010π (blockchain)
//      ▼
//  💼 WALLET ENTREPRISE  (enregistré sur Pi Developer Portal)
//      │
//      ├── 🔒 RÉSERVE FISCALE (reste dans le wallet)
//      │       IMF 1% du CA HT  (Régime Ets/TPU)
//      │       TVA 18% si SARL/Grande Entreprise
//      │       Provision blockchain sortante (0,01π × nb dispatches)
//      │
//      ├── 🏪 → WALLET RELAIS
//      │       PA_Pi + 90% × (marge_Pi - IMF_Pi)
//      │
//      ├── 🏍️ → WALLET LIVREUR
//      │       90% × livraison_Pi
//      │
//      └── 👑 → WALLET ADMIN (flashman90)
//               10% × (marge_Pi - IMF_Pi) + 10% × livraison_Pi
//
//  Le wallet entreprise conserve la réserve fiscale jusqu'au paiement OTR.
//
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { REGIMES, CONFIG } from "../data/constants";
import { C, fmt, fmtPi } from "../design/theme";

// ── Taux fiscaux Togo (source : OTR / Code Général des Impôts 2024) ────────
export const TAUX_FISCAUX = {
  imf:         0.01,   // 1%  — Impôt Minimum Forfaitaire (sur CA HT)
  tva:         0.18,   // 18% — TVA (SARL et Grande Entreprise uniquement)
  tpu_taux:    0.005,  // 0,5% — TPU tranche basse (à titre indicatif)
  frais_bc_pi: 0.010,  // 0,01 Pi par transaction blockchain sortante
};

// ════════════════════════════════════════════════════════════════════════════
// calcSplitFiscal — Formule complète avec réserve IMF
// ════════════════════════════════════════════════════════════════════════════
export function calcSplitFiscal({
  pvFcfa,           // Prix de vente produits FCFA (hors livraison)
  paFcfa,           // Prix d'achat total FCFA
  livraisonFcfa,    // Frais de livraison FCFA
  oracleRate,       // Taux Pi/FCFA
  regimeRelais,     // 'informel' | 'ets' | 'sarl' | 'grande'
}) {
  const marge     = pvFcfa - paFcfa;
  const totalFcfa = pvFcfa + livraisonFcfa;

  // ── 1. Calcul fiscal selon le régime ──────────────────────────────────────
  let imfFcfa = 0;
  let tvaFcfa = 0;

  // IMF s'applique sur le CA HT — tous les régimes sauf si exonéré
  // Pour le régime Établissement (TPU) le plus courant :
  imfFcfa = Math.round(pvFcfa * TAUX_FISCAUX.imf);     // 1% du PV HT

  // TVA uniquement SARL et Grande Entreprise
  if (regimeRelais === "sarl" || regimeRelais === "grande") {
    tvaFcfa = Math.round(pvFcfa * TAUX_FISCAUX.tva);   // 18% du PV HT
  }

  const reserveFiscaleFcfa = imfFcfa + tvaFcfa;
  const margeNette         = marge - reserveFiscaleFcfa; // marge après impôts

  // ── 2. Splits (en FCFA) ───────────────────────────────────────────────────
  const relaisFcfa  = paFcfa + Math.round(margeNette * 0.90);
  const livreurFcfa = Math.round(livraisonFcfa * 0.90);
  const adminFcfa   = Math.round(margeNette * 0.10) + Math.round(livraisonFcfa * 0.10);

  // Vérification : tout doit être distribué + réserve = total
  // relais + livreur + admin + réserveFiscale = PV + livraison
  const checkTotal = relaisFcfa + livreurFcfa + adminFcfa + reserveFiscaleFcfa;

  // ── 3. Conversion Pi ──────────────────────────────────────────────────────
  const toPI = (fcfa) => fcfa / oracleRate;
  const nbDispatchs = 3; // 3 transactions sortantes : relais, livreur, admin

  return {
    // Montants FCFA
    relaisFcfa,
    livreurFcfa,
    adminFcfa,
    imfFcfa,
    tvaFcfa,
    reserveFiscaleFcfa,
    // Montants Pi
    relaisPi:         toPI(relaisFcfa),
    livreurPi:        toPI(livreurFcfa),
    adminPi:          toPI(adminFcfa),
    reserveFiscalePi: toPI(reserveFiscaleFcfa),
    fraisDispatchPi:  TAUX_FISCAUX.frais_bc_pi * nbDispatchs,  // 0,03π
    // Total envoyé par client
    totalFcfa,
    totalPi:          toPI(totalFcfa) + TAUX_FISCAUX.frais_bc_pi, // +0,01π blockchain
    // Vérification équilibre
    checkOk:          Math.abs(checkTotal - totalFcfa) < 2,
    checkTotal,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// SplitVisualizer — Affichage détaillé du split pour le client + admin
// ════════════════════════════════════════════════════════════════════════════
export function SplitVisualizer({ split, oracle, lang, mode = "client" }) {
  // mode "client"  → montre uniquement ce que le client voit
  // mode "admin"   → montre le détail complet avec fiscal

  if (mode === "client") return (
    <div style={{ background: C.card, borderRadius: 16, padding: "16px 18px" }}>
      {/* Oracle live */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, padding: "6px 12px", background: `${C.green}11`, borderRadius: 10, border: `1px solid ${C.green}33` }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>Oracle live · 1π = {fmt(oracle.rate)} FCFA</span>
        <span style={{ fontSize: 9, color: C.muted, marginLeft: "auto" }}>↻ {oracle.countdown}s</span>
      </div>

      {[
        { label: lang === "fr" ? "🛍️ Produits" : "🛍️ Products",
          pi: split.relaisPi + split.adminPi * 0.5, // simplifié pour le client
          fcfa: split.relaisFcfa + split.adminFcfa * 0.5 },
        { label: lang === "fr" ? "🏍️ Livraison" : "🏍️ Delivery",
          pi: split.livreurPi + split.adminPi * 0.5,
          fcfa: split.livreurFcfa + split.adminFcfa * 0.5 },
        { label: lang === "fr" ? "⛓️ Frais réseau Pi" : "⛓️ Pi network fee",
          pi: 0.010, fcfa: Math.round(0.010 * oracle.rate), note: "fixe" },
      ].map(l => (
        <div key={l.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
          <div>
            <div style={{ fontSize: 13, color: C.sub }}>{l.label}</div>
            {l.note && <div style={{ fontSize: 10, color: C.muted }}>{l.note}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>
              π {fmtPi(l.pi)}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>≈ {fmt(Math.round(l.fcfa))} F</div>
          </div>
        </div>
      ))}

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16 }}>TOTAL</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 26, color: "#fff" }}>
            π {fmtPi(split.totalPi)}
          </div>
          <div style={{ fontSize: 12, color: C.sub }}>≈ {fmt(Math.round(split.totalFcfa))} FCFA</div>
        </div>
      </div>

      {/* Info escrow */}
      <div style={{ background: `${C.client}11`, border: `1px solid ${C.client}33`, borderRadius: 10, padding: "10px 12px", marginTop: 12 }}>
        <div style={{ fontSize: 11, color: C.client, fontWeight: 700, marginBottom: 2 }}>🔒 Paiement sécurisé</div>
        <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5 }}>
          {lang === "fr"
            ? "Vos π sont réservés jusqu'à confirmation de livraison. Aucun débit si la commande est annulée."
            : "Your π are reserved until delivery confirmation. No debit if order is cancelled."}
        </div>
      </div>
    </div>
  );

  // ── Mode admin : détail fiscal complet ────────────────────────────────────
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 14, color: C.admin, marginBottom: 14 }}>
        📊 Détail fiscal & distribution
      </div>

      {[
        { icon: "💼", label: "Wallet entreprise reçoit", pi: split.totalPi, fcfa: split.totalFcfa, color: "#fff", bold: true },
        null, // séparateur
        { icon: "🏛️", label: `IMF (1% CA HT)`, pi: split.reserveFiscalePi, fcfa: split.reserveFiscaleFcfa, color: C.red, note: "Reste dans le wallet entreprise" },
        { icon: "⛓️", label: `Frais dispatch (×3 tx)`, pi: split.fraisDispatchPi, fcfa: Math.round(split.fraisDispatchPi * 16), color: C.muted, note: "0,01π × 3 transactions sortantes" },
        null,
        { icon: "🏪", label: "Relais reçoit", pi: split.relaisPi, fcfa: split.relaisFcfa, color: C.relais, note: "PA + 90% marge nette → envoyé sur wallet relais" },
        { icon: "🏍️", label: "Livreur reçoit", pi: split.livreurPi, fcfa: split.livreurFcfa, color: C.livreur, note: "90% frais livraison → envoyé sur wallet livreur" },
        { icon: "👑", label: "Admin reçoit", pi: split.adminPi, fcfa: split.adminFcfa, color: C.admin, note: "10% marge nette + 10% livraison → wallet admin" },
      ].map((l, i) => {
        if (l === null) return <div key={i} style={{ height: 1, background: C.border, margin: "8px 0" }} />;
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0" }}>
            <div>
              <div style={{ fontSize: l.bold ? 14 : 12, fontWeight: l.bold ? 800 : 600, color: l.color }}>
                {l.icon} {l.label}
              </div>
              {l.note && <div style={{ fontSize: 10, color: C.muted }}>{l.note}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: l.bold ? 900 : 700, fontSize: l.bold ? 16 : 13, color: l.color }}>
                π {fmtPi(l.pi)}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{fmt(Math.round(l.fcfa))} F</div>
            </div>
          </div>
        );
      })}

      {/* Vérification équilibre */}
      <div style={{ marginTop: 12, padding: "8px 12px", background: split.checkOk ? `${C.green}15` : `${C.red}15`, borderRadius: 10, border: `1px solid ${split.checkOk ? C.green : C.red}33` }}>
        <div style={{ fontSize: 11, color: split.checkOk ? C.green : C.red, fontWeight: 700 }}>
          {split.checkOk ? "✅ Balance OK — tout est distribué" : "⚠️ Erreur de balance"}
        </div>
        <div style={{ fontSize: 10, color: C.muted }}>
          Distribué : {fmt(split.relaisFcfa + split.livreurFcfa + split.adminFcfa + split.reserveFiscaleFcfa)} F / Reçu : {fmt(split.totalFcfa)} F
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AdminComptabilite — Dashboard fiscal mensuel
// ════════════════════════════════════════════════════════════════════════════
export function AdminComptabilite({ oracle, lang }) {
  const [stats, setStats] = useState(null);
  const [mois,  setMois]  = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [regime, setRegime] = useState("ets");

  useEffect(() => {
    // Agréger les commandes du mois sélectionné
    const debut = mois + "-01";
    const fin   = mois + "-31";

    supabase.from("commandes")
      .select("total_fcfa, pa_total_fcfa, frais_livraison_fcfa, oracle_rate, statut")
      .gte("created_at", debut)
      .lte("created_at", fin)
      .eq("statut", "livree") // uniquement les commandes finalisées
      .then(({ data }) => {
        if (!data || data.length === 0) { setStats(null); return; }

        let caTotalFcfa = 0, paTotalFcfa = 0, livraisonTotalFcfa = 0;
        data.forEach(c => {
          caTotalFcfa       += c.total_fcfa || 0;
          paTotalFcfa       += c.pa_total_fcfa || 0;
          livraisonTotalFcfa += c.frais_livraison_fcfa || 0;
        });

        const pvTotalFcfa  = caTotalFcfa - livraisonTotalFcfa;
        const margeTotale  = pvTotalFcfa - paTotalFcfa;
        const imfDu        = Math.round(pvTotalFcfa * TAUX_FISCAUX.imf);
        const tvaDue       = (regime === "sarl" || regime === "grande")
                               ? Math.round(pvTotalFcfa * TAUX_FISCAUX.tva) : 0;
        const margeNette   = margeTotale - imfDu - tvaDue;

        setStats({
          nbCommandes:       data.length,
          caTotalFcfa,
          pvTotalFcfa,
          paTotalFcfa,
          livraisonTotalFcfa,
          margeTotale,
          imfDu,
          tvaDue,
          reserveFiscale:    imfDu + tvaDue,
          margeNette,
          adminFcfa:         Math.round(margeNette * 0.10) + Math.round(livraisonTotalFcfa * 0.10),
          relaisFcfa:        paTotalFcfa + Math.round(margeNette * 0.90),
          livreurFcfa:       Math.round(livraisonTotalFcfa * 0.90),
        });
      });
  }, [mois, regime]);

  const r = REGIMES[regime];

  return (
    <div>
      {/* Sélecteur */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700 }}>PÉRIODE</div>
          <input type="month" value={mois} onChange={e => setMois(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 700 }}>RÉGIME FISCAL</div>
          <select value={regime} onChange={e => setRegime(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 12 }}>
            {Object.values(REGIMES).map(r => (
              <option key={r.id} value={r.id}>{r.num}. {r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info régime */}
      <div style={{ background: `${r.color}15`, borderRadius: 12, padding: "10px 14px", marginBottom: 16, border: `1px solid ${r.color}33` }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: r.color, marginBottom: 3 }}>
          {r.label} — {r.otr}
        </div>
        <div style={{ fontSize: 11, color: C.sub }}>{r.conseil}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          {r.nif && <span style={{ fontSize: 10, background: `${r.color}22`, color: r.color, padding: "2px 8px", borderRadius: 20 }}>NIF requis</span>}
          {r.tva && <span style={{ fontSize: 10, background: `${C.red}22`, color: C.red, padding: "2px 8px", borderRadius: 20 }}>TVA 18%</span>}
          {r.imf && <span style={{ fontSize: 10, background: `${C.relais}22`, color: C.relais, padding: "2px 8px", borderRadius: 20 }}>IMF 1%</span>}
        </div>
      </div>

      {/* Stats ou vide */}
      {!stats ? (
        <div style={{ textAlign: "center", padding: "32px", color: C.muted, fontSize: 13 }}>
          Aucune commande livrée sur cette période
        </div>
      ) : (
        <div>
          {/* KPIs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Commandes",      val: stats.nbCommandes,                   unit: "", color: C.admin },
              { label: "CA Total",       val: fmt(stats.caTotalFcfa),              unit: " F", color: C.text },
              { label: "Marge brute",    val: fmt(stats.margeTotale),              unit: " F", color: C.green },
              { label: "Marge nette",    val: fmt(stats.margeNette),               unit: " F", color: C.green },
            ].map(k => (
              <div key={k.label} style={{ background: C.card, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 18, color: k.color }}>{k.val}{k.unit}</div>
              </div>
            ))}
          </div>

          {/* Tableau distribution */}
          <div style={{ background: C.card, borderRadius: 14, padding: "14px", marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: C.text }}>Répartition du chiffre d'affaires</div>
            {[
              { label: "Prix d'achat (sortie stock)", fcfa: stats.paTotalFcfa,       pct: stats.paTotalFcfa / stats.caTotalFcfa * 100,    color: C.muted },
              { label: "👑 Admin (10% marge nette + 10% livr.)", fcfa: stats.adminFcfa,   pct: stats.adminFcfa / stats.caTotalFcfa * 100,     color: C.admin },
              { label: "🏪 Relais (PA + 90% marge nette)",       fcfa: stats.relaisFcfa,  pct: stats.relaisFcfa / stats.caTotalFcfa * 100,    color: C.relais },
              { label: "🏍️ Livreurs (90% livraison)",            fcfa: stats.livreurFcfa, pct: stats.livreurFcfa / stats.caTotalFcfa * 100,   color: C.livreur },
              { label: "🏛️ Réserve fiscale (IMF + TVA)",         fcfa: stats.reserveFiscale, pct: stats.reserveFiscale / stats.caTotalFcfa * 100, color: C.red },
            ].map(l => (
              <div key={l.label} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.sub }}>{l.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: l.color }}>{fmt(l.fcfa)} F ({l.pct.toFixed(1)}%)</span>
                </div>
                <div style={{ height: 4, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, l.pct)}%`, background: l.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Obligations fiscales du mois */}
          <div style={{ background: `${C.red}10`, borderRadius: 14, padding: "14px", border: `1px solid ${C.red}33` }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.red, marginBottom: 10 }}>
              🏛️ Obligations fiscales OTR — {mois}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: C.text }}>IMF à provisionner</div>
                <div style={{ fontSize: 10, color: C.muted }}>1% × {fmt(stats.pvTotalFcfa)} F CA HT</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: C.red, fontSize: 16 }}>{fmt(stats.imfDu)} F</div>
                <div style={{ fontSize: 10, color: C.muted }}>π {fmtPi(stats.imfDu / oracle.rate)}</div>
              </div>
            </div>
            {stats.tvaDue > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.text }}>TVA collectée</div>
                  <div style={{ fontSize: 10, color: C.muted }}>18% × {fmt(stats.pvTotalFcfa)} F</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: C.red, fontSize: 16 }}>{fmt(stats.tvaDue)} F</div>
                  <div style={{ fontSize: 10, color: C.muted }}>π {fmtPi(stats.tvaDue / oracle.rate)}</div>
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: C.sub, marginTop: 8, padding: "8px", background: `${C.red}10`, borderRadius: 8 }}>
              ⚠️ Ces montants restent dans le wallet entreprise. Ne pas les dispatcher aux bénéficiaires. Paiement OTR en FCFA à la fin du trimestre.
            </div>
          </div>

          {/* Note sur la conversion Pi → FCFA pour OTR */}
          <div style={{ background: C.card2, borderRadius: 12, padding: "12px 14px", marginTop: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: C.admin, marginBottom: 6 }}>
              💡 Comment payer l'OTR en Pi ?
            </div>
            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.65 }}>
              <strong style={{ color: C.text }}>Étape 1</strong> — Convertis les Pi de réserve fiscale en FCFA via un exchange partenaire Pi Network au Togo ou une passerelle locale.<br />
              <strong style={{ color: C.text }}>Étape 2</strong> — Verse le montant FCFA à l'OTR selon ton régime (mensuel pour TVA, trimestriel pour IMF/TPU).<br />
              <strong style={{ color: C.text }}>Étape 3</strong> — Conserve les reçus OTR et les relevés de transactions Pi pour la comptabilité.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
