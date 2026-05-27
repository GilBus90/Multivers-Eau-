// ═══════════════════════════════════════════════════════════
// DESIGN SYSTEM — Multivers'Eau
// Couleurs · Gradients · CSS global · Formatters · Config
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";

// ── Configuration (via variables d'env Vite) ──────────────
export const API_URL         = import.meta.env.VITE_API_URL     || "";
export const PI_SANDBOX      = import.meta.env.VITE_PI_SANDBOX  !== "false";
export const CODE_INVITATION = import.meta.env.VITE_ADMIN_USER  || "flashman90";
export const FRAIS_RESEAU_PI = 0.010;

// ── Design System ─────────────────────────────────────────
export const C = {
  bg: "#ffffff",
  text: "#1a1a1a",
  muted: "#6c757d",
  border: "#e0e0e0",
  green: "#28a745",
  gclient: "#007bff",
  glivreur: "#ff9800",
  grelais: "#17a2b8"
};
export const gRole=(r)=>({client:C.gclient,livreur:C.glivreur,relais:C.grelais,admin:C.gadmin})[r]||C.gclient;
export const fmt=(n)=>Math.round(n).toLocaleString("fr-FR");
export const fmtPi=(n)=>Number(n).toFixed(3);
export const GF="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Nunito:wght@400;500;600;700;800&display=swap";
export const GCSS=`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#1E2A42;border-radius:2px}input::placeholder,textarea::placeholder{color:#4A5568}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes toastIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}
.fu{animation:fadeUp .35s ease both}.spin{animation:spin 1s linear infinite}`;

// ── TRADUCTIONS FR/EN ─────────────────────────────────────────────────────────

// ── useWindowWidth — responsive ───────────────────────────
export function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 460);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}
