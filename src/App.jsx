import { useState, useEffect } from "react";
import { useOracle, usePiAuth, useStock, useToast } from "./hooks/index.js";
import { Toast } from "./components/index.jsx";
import { C, GF, CODE_INVITATION } from "./design/theme.js";
import { LandingPage } from "./views/onboarding/LandingPage.jsx";
import { InscriptionRelais } from "./views/inscriptions/InscriptionRelais.jsx";
import { InscriptionLivreur } from "./views/inscriptions/InscriptionLivreur.jsx";
import { ClientApp } from "./views/ClientApp.jsx";
import { LivreurApp } from "./views/LivreurApp.jsx";
import { RelaisApp } from "./views/RelaisApp.jsx";
import { AdminApp } from "./views/AdminApp.jsx";

function PiAuthLoading({ lang }) {
  return (
    <div style={{ background: "#060912", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito',sans-serif", color: "#EEF2FF" }}>
      <link href={GF} rel="stylesheet" />
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#0033A8,#0066FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 20 }}>💧</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 900, marginBottom: 8 }}>Multivers'Eau</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#7A8899", fontSize: 13 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00D4FF", animation: "pulse 1s infinite" }} />
        {lang === "fr" ? "Connexion Pi Network…" : "Connecting to Pi Network…"}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  );
}

function AdminRoleSwitcher({ role, setRole, lang }) {
  const [open, setOpen] = useState(false);
  const ROLES = [
    { id: "admin",  icon: "⚙️", label: lang === "fr" ? "Admin"      : "Admin",    color: "#00D4FF" },
    { id: "client", icon: "💧", label: lang === "fr" ? "Commander"  : "Order",    color: "#0066FF" },
    { id: "relais", icon: "🏪", label: lang === "fr" ? "Mon Relais" : "My Relay", color: "#F59E0B" },
  ];
  const current = ROLES.find(r => r.id === role) || ROLES[0];
  return (
    <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 900 }}>
      {open && (
        <div style={{ position: "absolute", bottom: 52, right: 0, background: "#0C1020", borderRadius: 16, padding: 8, border: "1px solid #1E2A42", boxShadow: "0 8px 32px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", gap: 6, minWidth: 160 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => { setRole(r.id); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: role === r.id ? `${r.color}22` : "#111828", border: `1px solid ${role === r.id ? r.color : "#1E2A42"}`, borderRadius: 12, cursor: "pointer", color: "#EEF2FF", fontSize: 13, fontWeight: role === r.id ? 800 : 500, textAlign: "left" }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span style={{ color: role === r.id ? r.color : "#EEF2FF" }}>{r.label}</span>
              {role === r.id && <span style={{ marginLeft: "auto", fontSize: 10, color: r.color }}>●</span>}
            </button>
          ))}
          <div style={{ padding: "6px 14px", fontSize: 10, color: "#4A5568", borderTop: "1px solid #1E2A42", marginTop: 2 }}>
            flashman90 — multi-rôle
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${current.color}CC,${current.color})`, border: "none", cursor: "pointer", fontSize: 20, boxShadow: `0 4px 16px ${current.color}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {current.icon}
      </button>
    </div>
  );
}

export default function MultiversEau() {
  // Pile de navigation — permet le vrai "retour en arrière"
  const [navStack, setNavStack] = useState([{ screen: "landing" }]);
  const [lang, setLang]         = useState("fr");

  const oracle  = useOracle();
  const piAuth  = usePiAuth();
  const RELAIS_ID = import.meta.env.VITE_GRAND_LOME_ID;
  const { stocks, update, dec } = useStock(RELAIS_ID);

  const isAdmin = piAuth.user?.username === CODE_INVITATION;

  // Écran actuel = dernier de la pile
  const current = navStack[navStack.length - 1];

  // Navigation : aller vers un nouvel écran
  const goTo = (screen, params = {}) => {
    setNavStack(prev => [...prev, { screen, ...params }]);
  };

  // Retour : enlève le dernier écran de la pile
  const goBack = () => {
    if (navStack.length > 1) {
      setNavStack(prev => prev.slice(0, -1));
    }
  };

  // Admin détecté automatiquement
  useEffect(() => {
    if (isAdmin && current.screen === "landing") {
      setNavStack([{ screen: "admin" }]);
    }
  }, [isAdmin]);

  if (piAuth.loading && typeof window !== "undefined" && window.Pi) {
    return <PiAuthLoading lang={lang} />;
  }

  const PROPS = {
    oracle, stocks, update, dec, lang, setLang,
    piUser: piAuth.user, isAdmin, show,
    // onBack navigue vraiment en arrière
    onBack: goBack,
  };

  const VIEWS = {
    landing: (
      <LandingPage
        oracle={oracle} lang={lang} setLang={setLang}
        onRole={(r) => {
          if (r === "relais")  goTo("insc_relais");
          else if (r === "livreur") goTo("insc_livreur");
          else goTo(r);
        }}
      />
    ),
    client:      <ClientApp  {...PROPS} />,
    livreur:     <LivreurApp {...PROPS} />,
    relais:      <RelaisApp  {...PROPS} />,
    admin:       <AdminApp   {...PROPS} />,
    insc_relais: (
      <InscriptionRelais
        {...PROPS}
        onSubmit={() => { show("✅ Candidature Relais envoyée !", "#22C55E"); goBack(); }}
      />
    ),
    insc_livreur: (
      <InscriptionLivreur
        {...PROPS}
        onSubmit={() => { show("✅ Candidature Livreur envoyée !", "#22C55E"); goBack(); }}
      />
    ),
  };

  return (
    <>
      <Toast data={toast} />
      {VIEWS[current.screen] || VIEWS["landing"]}
      {isAdmin && current.screen !== "landing" && (
        <AdminRoleSwitcher
          role={current.screen}
          setRole={(r) => setNavStack([{ screen: r }])}
          lang={lang}
        />
      )}
    </>
  );
}
