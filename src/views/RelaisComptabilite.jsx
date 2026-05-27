// ════════════════════════════════════════════════════════════════════════════
// MODULE COMPTABILITÉ RELAIS — Multivers'Eau
// Calcul automatique IMF / TVA selon régime déclaré
// Réserve virtuelle dans Supabase (pas de sous-wallet séparé)
// Dashboard OTR mensuel/trimestriel pour chaque relais
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { REGIMES, TAUX_FISCAUX } from "./FiscalSplit";
import { C, fmt, fmtPi } from "../design/theme";
import { Btn } from "../components";

// ════════════════════════════════════════════════════════════════════════════
// LOGIQUE : Comment fonctionne la réserve fiscale relais
//
//  Quand un relais reçoit son split Pi :
//  → L'app calcule automatiquement sa provision fiscale selon son régime
//  → Le montant TOTAL est envoyé sur son wallet (on ne bloque rien)
//  → Supabase enregistre : montant reçu + provision fiscale calculée
//  → Le dashboard relais montre clairement :
//       "Reçu ce mois : π 45.230"
//       "À mettre de côté IMF : π 0.452 (1%)"
//       "Disponible net : π 44.778"
//  → Le relais est responsable de garder cette réserve dans son wallet
//  → L'app lui rappelle l'obligation à chaque connexion si provision > seuil
//
// ════════════════════════════════════════════════════════════════════════════

// ── SQL à ajouter dans Supabase ───────────────────────────────────────────
export const SQL_FISCAL_RELAIS = `
-- Provisions fiscales par relais (réserve virtuelle)
CREATE TABLE IF NOT EXISTS provisions_fiscales (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relais_id     UUID REFERENCES relais(id) ON DELETE CASCADE,
  commande_id   UUID REFERENCES commandes(id),
  mois          TEXT NOT NULL,              -- Format: "2026-06"
  ca_ht_fcfa    INTEGER DEFAULT 0,          -- CA HT de la commande
  tva_fcfa      INTEGER DEFAULT 0,          -- TVA calculée
  imf_fcfa      INTEGER DEFAULT 0,          -- IMF calculée
  total_fcfa    INTEGER DEFAULT 0,          -- Total provision
  ca_ht_pi      NUMERIC(12,6) DEFAULT 0,
  tva_pi        NUMERIC(12,6) DEFAULT 0,
  imf_pi        NUMERIC(12,6) DEFAULT 0,
  total_pi      NUMERIC(12,6) DEFAULT 0,
  oracle_rate   NUMERIC(10,2),
  statut        TEXT DEFAULT 'en_attente',  -- en_attente | declare | paye
  paye_le       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Index pour agréger par mois
CREATE INDEX IF NOT EXISTS idx_prov_relais_mois
  ON provisions_fiscales(relais_id, mois, statut);

-- RLS
ALTER TABLE provisions_fiscales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all_provisions" ON provisions_fiscales
  FOR ALL USING (true) WITH CHECK (true);
`;

// ════════════════════════════════════════════════════════════════════════════
// calcProvisionFiscaleRelais — Calcule la provision d'une commande
// Appelé dans api/complete.js quand le paiement est confirmé
// ════════════════════════════════════════════════════════════════════════════
export function calcProvisionFiscaleRelais({ caHtFcfa, regime, oracleRate }) {
  const r = REGIMES[regime] || REGIMES.ets;
  let imfFcfa = 0;
  let tvaFcfa = 0;

  if (r.imf) imfFcfa = Math.round(caHtFcfa * TAUX_FISCAUX.imf);       // 1% CA HT
  if (r.tva) tvaFcfa = Math.round(caHtFcfa * TAUX_FISCAUX.tva);       // 18% CA HT

  const totalFcfa = imfFcfa + tvaFcfa;

  return {
    imfFcfa,  tvaFcfa,  totalFcfa,
    imfPi:    imfFcfa  / oracleRate,
    tvaPi:    tvaFcfa  / oracleRate,
    totalPi:  totalFcfa / oracleRate,
    regime:   r,
    taux:     { imf: r.imf ? "1%" : "0%", tva: r.tva ? "18%" : "0%" },
  };
}

// ════════════════════════════════════════════════════════════════════════════
// RelaisComptabilite — Dashboard fiscal du relais
// Affiché dans RelaisApp → onglet Fiscal
// ════════════════════════════════════════════════════════════════════════════
export function RelaisComptabilite({ relaisId, regime = "ets", oracle, lang }) {
  const [mois,        setMois]        = useState(new Date().toISOString().slice(0, 7));
  const [provisions,  setProvisions]  = useState([]);
  const [gains,       setGains]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showDetail,  setShowDetail]  = useState(false);

  const r = REGIMES[regime] || REGIMES.ets;

  useEffect(() => {
    if (!relaisId) return;
    setLoading(true);

    const debut = mois + "-01";
    const fin   = mois + "-31";

    Promise.all([
      // Provisions fiscales du mois
      supabase.from("provisions_fiscales")
        .select("*")
        .eq("relais_id", relaisId)
        .eq("mois", mois)
        .order("created_at", { ascending: false }),

      // Gains (splits) du mois
      supabase.from("splits_paiement")
        .select("montant_pi, montant_fcfa, statut, created_at, commande_id")
        .eq("beneficiaire", relaisId)  // ou par pi_username selon le schéma
        .gte("created_at", debut)
        .lte("created_at", fin),
    ]).then(([pRes, gRes]) => {
      setProvisions(pRes.data || []);
      setGains(gRes.data || []);
      setLoading(false);
    });
  }, [relaisId, mois]);

  // Agrégats
  const totalGainsPi     = gains.reduce((s, g) => s + parseFloat(g.montant_pi || 0), 0);
  const totalGainsFcfa   = gains.reduce((s, g) => s + (g.montant_fcfa || 0), 0);
  const totalImfFcfa     = provisions.reduce((s, p) => s + (p.imf_fcfa || 0), 0);
  const totalTvaFcfa     = provisions.reduce((s, p) => s + (p.tva_fcfa || 0), 0);
  const totalProvFcfa    = provisions.reduce((s, p) => s + (p.total_fcfa || 0), 0);
  const totalProvPi      = provisions.reduce((s, p) => s + parseFloat(p.total_pi || 0), 0);
  const disponibleNetPi  = totalGainsPi - totalProvPi;

  const marquerPaye = async (ids) => {
    await supabase.from("provisions_fiscales")
      .update({ statut: "paye", paye_le: new Date().toISOString() })
      .in("id", ids);
    setProvisions(prev => prev.map(p => ids.includes(p.id)
      ? { ...p, statut: "paye", paye_le: new Date().toISOString() } : p));
  };

  if (loading) return <div style={{ padding: 20, textAlign: "center", color: C.muted }}>Chargement...</div>;

  return (
    <div>
      {/* Régime fiscal actif */}
      <div style={{ background: `${r.color}18`, borderRadius: 14, padding: "12px 14px", marginBottom: 14, border: `1px solid ${r.color}33` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 13, color: r.color }}>
              📋 Régime : {r.label}
            </div>
            <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{r.otr}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            {r.imf && <div style={{ fontSize: 10, color: C.relais, fontWeight: 700 }}>IMF 1% CA HT</div>}
            {r.tva && <div style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>TVA 18%</div>}
            {!r.imf && !r.tva && <div style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>Aucune taxe</div>}
          </div>
        </div>
      </div>

      {/* Sélecteur de mois */}
      <div style={{ marginBottom: 14 }}>
        <input type="month" value={mois} onChange={e => setMois(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13 }} />
      </div>

      {/* Résumé du mois */}
      <div style={{ background: C.card, borderRadius: 16, padding: "16px", marginBottom: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Résumé — {mois}</div>

        {[
          { label: "💰 Gains bruts reçus",    pi: totalGainsPi,    fcfa: totalGainsFcfa,   color: C.green },
          totalImfFcfa > 0 && { label: "🏛️ IMF à mettre de côté (1%)", pi: totalImfFcfa / oracle.rate,   fcfa: totalImfFcfa,  color: C.red },
          totalTvaFcfa > 0 && { label: "🏛️ TVA collectée (18%)",       pi: totalTvaFcfa / oracle.rate,   fcfa: totalTvaFcfa,  color: C.red },
          { label: "✅ Net disponible",       pi: disponibleNetPi, fcfa: Math.round(disponibleNetPi * oracle.rate), color: C.text, bold: true },
        ].filter(Boolean).map((l, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}22` }}>
            <div style={{ fontSize: l.bold ? 14 : 12, fontWeight: l.bold ? 800 : 500, color: l.color || C.sub }}>
              {l.label}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: l.bold ? 900 : 700, fontSize: l.bold ? 16 : 13, color: l.color || C.text }}>
                π {fmtPi(l.pi)}
              </div>
              <div style={{ fontSize: 10, color: C.muted }}>{fmt(Math.round(l.fcfa))} F</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerte provision si > 0 */}
      {totalProvFcfa > 0 && (
        <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}44`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, color: C.red, fontSize: 13, marginBottom: 6 }}>
            ⚠️ Réserve fiscale à conserver
          </div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.65, marginBottom: 10 }}>
            Garde <strong style={{ color: C.red }}>π {fmtPi(totalProvPi)}</strong> ({fmt(totalProvFcfa)} F) dans ton wallet Pi. Ces fonds correspondent à tes obligations OTR du mois. Ne les dépense pas — ils serviront à payer l'impôt en FCFA via une passerelle de change.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Btn onClick={() => setShowDetail(!showDetail)} variant="outline" color={C.admin} size="sm">
              {showDetail ? "Masquer détail" : "Voir détail"}
            </Btn>
            <Btn onClick={() => marquerPaye(provisions.filter(p => p.statut === "en_attente").map(p => p.id))} color={C.green} size="sm">
              ✅ Marquer payé OTR
            </Btn>
          </div>
        </div>
      )}

      {/* Détail des provisions */}
      {showDetail && provisions.length > 0 && (
        <div style={{ background: C.card, borderRadius: 14, padding: "14px", marginBottom: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 12, marginBottom: 10, color: C.muted }}>
            Détail par commande
          </div>
          {provisions.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${C.border}22` }}>
              <div>
                <div style={{ fontSize: 11, color: C.text }}>Cmd #{p.commande_id?.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: 10, color: C.muted }}>CA: {fmt(p.ca_ht_fcfa)} F · Taux 1π={fmt(p.oracle_rate)} F</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.red }}>π {fmtPi(p.total_pi)}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{fmt(p.total_fcfa)} F</div>
                <div style={{ fontSize: 9, color: p.statut === "paye" ? C.green : C.relais }}>
                  {p.statut === "paye" ? "✅ Payé" : "⏳ En attente"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Guide pratique OTR */}
      <div style={{ background: C.card2, borderRadius: 14, padding: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ fontWeight: 800, fontSize: 12, color: C.admin, marginBottom: 8 }}>
          📌 Comment payer ton OTR au Togo
        </div>
        {[
          ["1. Échange Pi → FCFA", r.tva
            ? "À la fin de chaque mois : convertis la réserve TVA via une passerelle Pi/FCFA locale."
            : "À la fin du trimestre : convertis ta réserve IMF via une passerelle Pi/FCFA locale."],
          ["2. Paiement OTR",      r.tva
            ? "TVA : déclaration mensuelle obligatoire. IMF : annuelle."
            : "IMF/TPU : déclaration annuelle, acompte trimestriel si CA > 5M FCFA."],
          ["3. Preuve",            "Conserve les relevés de transactions Pi + reçus OTR pour la comptabilité annuelle."],
        ].map(([titre, desc]) => (
          <div key={titre} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{titre}</div>
            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}

        {/* Seuils OTR Togo */}
        <div style={{ marginTop: 10, padding: "8px 10px", background: C.card, borderRadius: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, marginBottom: 6 }}>SEUILS OTR TOGO (référence)</div>
          {[
            ["Informel → Ets/TPU", "CA > 10 M FCFA/an"],
            ["Ets/TPU → SARL/RSI", "CA > 25 M FCFA/an"],
            ["SARL → Grande Ets",  "CA > 150 M FCFA/an"],
          ].map(([label, seuil]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.sub, marginBottom: 3 }}>
              <span>{label}</span>
              <span style={{ color: C.relais, fontWeight: 700 }}>{seuil}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AdminFiscalNetwork — Vue admin : toutes les provisions de tous les relais
// ════════════════════════════════════════════════════════════════════════════
export function AdminFiscalNetwork({ oracle, lang }) {
  const [mois,   setMois]   = useState(new Date().toISOString().slice(0, 7));
  const [data,   setData]   = useState([]);

  useEffect(() => {
    supabase.from("provisions_fiscales")
      .select(`*, relais:relais_id(nom, regime, pi_username)`)
      .eq("mois", mois)
      .order("total_fcfa", { ascending: false })
      .then(({ data }) => setData(data || []));
  }, [mois]);

  // Grouper par relais
  const parRelais = data.reduce((acc, p) => {
    const key = p.relais_id;
    if (!acc[key]) acc[key] = { relais: p.relais, provisions: [], totalFcfa: 0, totalPi: 0 };
    acc[key].provisions.push(p);
    acc[key].totalFcfa += p.total_fcfa || 0;
    acc[key].totalPi   += parseFloat(p.total_pi || 0);
    return acc;
  }, {});

  const totalReseau = Object.values(parRelais).reduce((s, r) => s + r.totalFcfa, 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <input type="month" value={mois} onChange={e => setMois(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13 }} />
        </div>
        <div style={{ background: `${C.red}15`, borderRadius: 10, padding: "10px 14px", border: `1px solid ${C.red}33`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: C.red, fontWeight: 800 }}>TOTAL RÉSEAU</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 16, color: C.red }}>{fmt(totalReseau)} F</div>
        </div>
      </div>

      {Object.values(parRelais).length === 0 ? (
        <div style={{ textAlign: "center", padding: 24, color: C.muted, fontSize: 13 }}>Aucune provision ce mois</div>
      ) : (
        Object.values(parRelais).map(({ relais, totalFcfa, totalPi }) => {
          const r = REGIMES[relais?.regime] || REGIMES.ets;
          return (
            <div key={relais?.pi_username} style={{ background: C.card, borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{relais?.nom || "Relais"}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>@{relais?.pi_username} · {r.label}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                    {r.imf && <span style={{ fontSize: 9, color: C.relais, background: `${C.relais}22`, padding: "1px 6px", borderRadius: 20 }}>IMF 1%</span>}
                    {r.tva && <span style={{ fontSize: 9, color: C.red, background: `${C.red}22`, padding: "1px 6px", borderRadius: 20 }}>TVA 18%</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 17, color: C.red }}>
                    π {fmtPi(totalPi)}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted }}>{fmt(totalFcfa)} F</div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
