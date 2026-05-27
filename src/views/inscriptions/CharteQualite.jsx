import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../../data/constants.js";

import { T } from "../../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../../components/index.jsx";

import { supabase } from "../../lib/supabase.js";


function CharteQualite({type="livreur",lang="fr",onAccept}){
  const[ok,setOk]=useState(false);
  const t=T[lang];
  const ENGAGEMENTS=[
    {icon:"🛡️",fr:"Protéger le produit",en:"Protect the product",fr2:"Maintenir l'eau à l'abri du soleil et de la pluie. Bâche ou sac isotherme obligatoires.",en2:"Keep water away from sun and rain. Cover or isothermal bag mandatory."},
    {icon:"💲",fr:"Respecter le prix",en:"Respect the price",fr2:"Ne jamais modifier le prix fixé en Pi par la plateforme. Seul le Super Admin peut modifier les prix.",en2:"Never modify prices set in Pi by the platform. Only Super Admin can modify prices."},
    {icon:"📦",fr:"Garantir l'intégrité",en:"Guarantee integrity",fr2:"Ne jamais ouvrir ou altérer les cartons, packs ou coupelles. Tout produit endommagé doit être signalé.",en2:"Never open or alter cartons, packs or cups. Any damaged product must be reported."},
    {icon:"🌍",fr:"Incarner l'Écosystème Pi",en:"Embody the Pi Ecosystem",fr2:"Agir avec courtoisie et professionnalisme pour renforcer la confiance dans Pi Network au Togo.",en2:"Act with courtesy and professionalism to reinforce trust in Pi Network in Togo."},
  ];
  return(
    <div style={{fontFamily:"'Nunito',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:460,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#001A5E,#003DA8)",padding:"28px 20px 24px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>📜</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#fff"}}>Charte Qualité</div>
        <div style={{fontSize:13,color:"rgba(255,255,255,.7)",marginTop:4}}>Multivers'Eau — {type==="livreur"?lang==="fr"?"Charte du Livreur":"Delivery Driver Charter":lang==="fr"?"Charte du Relais":"Relay Charter"}</div>
      </div>
      <div style={{padding:"24px 18px"}}>
        <div style={{fontSize:14,color:C.sub,lineHeight:1.7,marginBottom:20,padding:"14px 16px",background:C.card,borderRadius:14,border:`1px solid ${C.border}`}}>
          {lang==="fr"?"En rejoignant Multivers'Eau, je m'engage à respecter les engagements suivants pour garantir la qualité du service et la confiance des clients dans tout le Togo.":"By joining Multivers'Eau, I commit to respecting the following commitments to guarantee service quality and customer trust throughout Togo."}
        </div>
        {ENGAGEMENTS.map(e=>(
          <div key={e.icon} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px",marginBottom:12,background:C.card,borderRadius:14,border:`1px solid ${C.border}`}}>
            <span style={{fontSize:26,flexShrink:0}}>{e.icon}</span>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:C.text,fontSize:14,marginBottom:4}}>{lang==="fr"?e.fr:e.en}</div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.5}}>{lang==="fr"?e.fr2:e.en2}</div>
            </div>
          </div>
        ))}
        <div onClick={()=>setOk(o=>!o)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",margin:"20px 0",background:ok?C.green+"15":C.card,borderRadius:14,border:`2px solid ${ok?C.green:C.border}`,cursor:"pointer",transition:"all .2s"}}>
          <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:ok?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:16}}>{ok?"✓":""}</div>
          <div style={{fontSize:13,fontWeight:600,color:C.text,lineHeight:1.5}}>
            {lang==="fr"?"Je m'engage à respecter intégralement la Charte Qualité Multivers'Eau et à agir en ambassadeur de l'écosystème Pi Network au Togo.":"I commit to fully respecting the Multivers'Eau Quality Charter and to act as an ambassador of the Pi Network ecosystem in Togo."}
          </div>
        </div>
        <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:16}}>🔒 {lang==="fr"?"Signature numérique horodatée · Enregistrée sur la blockchain Pi":"Digital timestamp signature · Recorded on Pi blockchain"}</div>
        <Btn size="lg" color={C.client} disabled={!ok} onClick={onAccept}>
          {ok?(lang==="fr"?"✅ Signer & Continuer":"✅ Sign & Continue"):(lang==="fr"?"Cochez la case pour continuer":"Check the box to continue")}
        </Btn>
      </div>
    </div>
  );
}

// ── ACADÉMIE PI ────────────────────────────────────────────────────────────────
export { CharteQualite };
