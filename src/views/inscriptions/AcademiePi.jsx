import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";


function AcademiePi({lang="fr",onClose}){
  const[e,setE]=useState(0);
  const STEPS=[
    {icon:"🌍",fr:"Qu'est-ce que Pi Network ?",en:"What is Pi Network?",cfr:"Pi est une monnaie numérique mondiale minée gratuitement depuis votre téléphone, sans consommer votre batterie. Conçu par des chercheurs de Stanford pour être accessible à tous.",cen:"Pi is a global digital currency mined for free from your phone, without consuming your battery. Designed by Stanford researchers to be accessible to everyone."},
    {icon:"⚡",fr:"Pourquoi Pi sur Multivers'Eau ?",en:"Why Pi on Multivers'Eau?",pts:[{i:"⚡",fr:"Instantané",en:"Instant",dfr:"Paiements en quelques secondes",den:"Payments in seconds"},{i:"🔒",fr:"Sécurisé",en:"Secure",dfr:"Vous seul contrôlez votre argent",den:"You alone control your money"},{i:"🌍",fr:"Inclusif",en:"Inclusive",dfr:"Sans compte bancaire requis",den:"No bank account required"}]},
    {icon:"📱",fr:"Étape 1 — Télécharger",en:"Step 1 — Download",cfr:"Rendez-vous sur le Play Store ou l'App Store et téléchargez l'application Pi Network. C'est entièrement gratuit.",cen:"Go to the Play Store or App Store and download the Pi Network app. It's completely free.",action:"Play Store / App Store → Pi Network"},
    {icon:"🤝",fr:"Étape 2 — Code d'invitation",en:"Step 2 — Invitation code",cfr:"Pi est un réseau de confiance. Entrez le code d'invitation pour commencer :",cen:"Pi is a trust network. Enter the invitation code to get started:",code:CODE_INVITATION,notefr:"Vous commencez immédiatement avec votre premier Pi offert",noteen:"You immediately start with your first Pi offered"},
    {icon:"⚡",fr:"Étape 3 — Miner chaque jour",en:"Step 3 — Mine every day",cfr:"Une fois par jour, ouvrez Pi Network et appuyez sur l'éclair ⚡. Cela prouve que vous êtes humain et vous rapporte des Pi gratuitement.",cen:"Once a day, open Pi Network and press the lightning bolt ⚡. This proves you are human and earns you Pi for free."},
    {icon:"👛",fr:"Étape 4 — Votre Wallet",en:"Step 4 — Your Wallet",cfr:"Installez Pi Browser et créez votre Wallet.",cen:"Install Pi Browser and create your Wallet.",warnfr:"⚠️ PASSPHRASE : Lors de la création, vous recevrez 24 mots secrets. Ne les donnez JAMAIS à personne. Si vous les perdez, vos Pi sont perdus définitivement.",warnen:"⚠️ PASSPHRASE: During creation, you will receive 24 secret words. NEVER give them to anyone. If you lose them, your Pi are lost forever."},
    {icon:"💧",fr:"Acheter avec Pi sur Multivers'Eau",en:"Buy with Pi on Multivers'Eau",cfr:"Dès que vous avez des Pi dans votre Wallet (après la migration vers le Mainnet), revenez sur Multivers'Eau, choisissez vos produits et cliquez Payer en Pi.",cen:"Once you have Pi in your Wallet (after Mainnet migration), return to Multivers'Eau, choose your products and click Pay with Pi."},
  ];
  const s=STEPS[e];const pct=((e+1)/STEPS.length)*100;
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,background:"rgba(0,5,20,.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:C.surf,borderRadius:"28px 28px 0 0",width:"100%",maxWidth:460,padding:"28px 22px 40px",maxHeight:"88vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:C.admin}}>🎓 {lang==="fr"?"Académie Pi":"Pi Academy"}</div>
          <button onClick={onClose} style={{background:C.card2,border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18,color:C.sub}}>×</button>
        </div>
        <div style={{background:C.border,borderRadius:4,height:5,marginBottom:22}}>
          <div style={{background:C.admin,height:5,borderRadius:4,width:`${pct}%`,transition:"width .3s"}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:52,marginBottom:14}}>{s.icon}</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:12}}>{lang==="fr"?s.fr:s.en}</div>
          {(s.cfr||s.cen)&&<div style={{fontSize:14,color:C.sub,lineHeight:1.7}}>{lang==="fr"?s.cfr:s.cen}</div>}
          {s.pts&&s.pts.map(p=>(
            <div key={p.i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:C.card,borderRadius:12,marginBottom:8,textAlign:"left"}}>
              <span style={{fontSize:20}}>{p.i}</span>
              <div><div style={{fontWeight:700}}>{lang==="fr"?p.fr:p.en}</div><div style={{fontSize:12,color:C.sub}}>{lang==="fr"?p.dfr:p.den}</div></div>
            </div>
          ))}
          {s.code&&(
            <div style={{margin:"16px 0",background:"linear-gradient(135deg,#0A1828,#0D2040)",borderRadius:16,padding:"16px 20px",border:`2px solid ${C.admin}44`}}>
              <div style={{fontSize:11,color:C.admin,fontWeight:800,marginBottom:8}}>{lang==="fr"?"VOTRE CODE D'INVITATION":"YOUR INVITATION CODE"}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900,color:C.admin,letterSpacing:3}}>{s.code}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>{lang==="fr"?s.notefr:s.noteen}</div>
            </div>
          )}
          {s.action&&<div style={{margin:"16px 0",background:C.green+"15",border:`1px solid ${C.green}33`,borderRadius:12,padding:"12px 16px",fontSize:14,fontWeight:700,color:C.green}}>🔍 {s.action}</div>}
          {(s.warnfr||s.warnen)&&<div style={{margin:"16px 0",background:"#78350F18",border:"2px solid #D9770644",borderRadius:12,padding:"14px 16px",fontSize:13,fontWeight:600,color:"#F59E0B",lineHeight:1.6,textAlign:"left"}}>{lang==="fr"?s.warnfr:s.warnen}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          {e>0&&<button onClick={()=>setE(x=>x-1)} style={{flex:1,padding:13,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.sub,fontWeight:600,cursor:"pointer"}}>{lang==="fr"?"← Préc.":"← Prev."}</button>}
          {e<STEPS.length-1
            ?<button onClick={()=>setE(x=>x+1)} style={{flex:2,padding:13,background:C.gadmin,border:"none",borderRadius:12,color:C.bg,fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>{lang==="fr"?"Suivant →":"Next →"}</button>
            :<button onClick={onClose} style={{flex:2,padding:13,background:`linear-gradient(135deg,${C.green}CC,${C.green})`,border:"none",borderRadius:12,color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>✅ {lang==="fr"?"Commencer":"Start"}</button>}
        </div>
        <div style={{textAlign:"center",fontSize:11,color:C.muted,marginTop:10}}>{e+1} / {STEPS.length}</div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════
// SMART ONBOARDING — Flow conversationnel · Admin complètement caché
// Splash → Intention (3 choix) · Easter egg 7× tap → accès admin
// ════════════════════════════════════════════════════════════════════════════
export { AcademiePi };
