import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";


import { AcademiePi } from "../inscriptions/AcademiePi.jsx";
function LandingPage({onRole,oracle,lang,setLang}){
  const[step,setStep]=useState("splash"); // "splash" | "intention"
  const[showAcad,setShowAcad]=useState(false);
  const[tapCount,setTapCount]=useState(0);         // Easter egg admin
  const[adminVisible,setAdminVisible]=useState(false);
  const[adminTaps,setAdminTaps]=useState(0);        // 7× tap sur logo splash
  const tapTimer=useRef(null);

  // Easter egg : tap logo 7× dans les 4 secondes → révèle accès admin
  const handleLogoTap=()=>{
    setAdminTaps(n=>{
      const next=n+1;
      clearTimeout(tapTimer.current);
      if(next>=7){setAdminVisible(true);return 0;}
      tapTimer.current=setTimeout(()=>setAdminTaps(0),4000);
      return next;
    });
  };

  // 3 choix visibles pour l'utilisateur
  const CHOICES=[
    {
      id:"client",
      icon:"💧",
      gradient:"linear-gradient(135deg,#001A5E,#002D99)",
      border:"rgba(0,102,255,0.4)",
      glow:"rgba(0,50,180,0.35)",
      tagColor:"#7AB8FF",
      tagBg:"rgba(0,102,255,0.2)",
      fr:"Commander de l'eau",
      en:"Order water",
      dfr:"Recevez Voltic, Cristal ou Eau Vitale chez vous. Payez en Pi, livraison rapide dans votre zone.",
      den:"Get Voltic, Cristal or Eau Vitale delivered home. Pay in Pi, fast delivery in your area.",
      tags:{fr:["💧 Voltic","🫧 Cristal","✨ Eau Vitale","💳 Paiement Pi"],en:["💧 Voltic","🫧 Cristal","✨ Eau Vitale","💳 Pi Payment"]},
      cta:{fr:"Commander →",en:"Order →"},
    },
    {
      id:"livreur",
      icon:"🏍️",
      gradient:"linear-gradient(135deg,#1A0900,#2D1500)",
      border:"rgba(255,107,0,0.4)",
      glow:"rgba(180,60,0,0.3)",
      tagColor:"#FF9A4D",
      tagBg:"rgba(255,107,0,0.2)",
      fr:"Devenir Livreur",
      en:"Become a Driver",
      dfr:"Livrez de l'eau minérale dans votre quartier et gagnez des Pi à chaque course.",
      den:"Deliver mineral water in your area and earn Pi for every delivery.",
      tags:{fr:["🏍️ Moto","🛺 Tricycle","🚗 Voiture","💰 Pi par course"],en:["🏍️ Motorcycle","🛺 Tricycle","🚗 Car","💰 Pi per trip"]},
      cta:{fr:"Rejoindre →",en:"Join →"},
    },
    {
      id:"relais",
      icon:"🏪",
      gradient:"linear-gradient(135deg,#1A1000,#2D1C00)",
      border:"rgba(245,158,11,0.4)",
      glow:"rgba(180,120,0,0.25)",
      tagColor:"#F59E0B",
      tagBg:"rgba(245,158,11,0.18)",
      fr:"Ouvrir un Relais",
      en:"Open a Relay",
      dfr:"Gérez un dépôt d'eau minérale. Pilotez vos stocks, vos livreurs, votre business Pi.",
      den:"Run a mineral water depot. Manage your stock, drivers, and Pi business.",
      tags:{fr:["📦 Stocks","🏍️ Livreurs","💼 Gestion Fiscale","📊 Dashboard"],en:["📦 Stock","🏍️ Drivers","💼 Tax Management","📊 Dashboard"]},
      cta:{fr:"Candidater →",en:"Apply →"},
    },
  ];

  // ── ÉCRAN 1 : SPLASH ──────────────────────────────────────────────────────
  if(step==="splash")return(
    <AppWrap>
      <style>{`@keyframes dropFall{0%{transform:translateY(-50px) scale(.8);opacity:0}60%{transform:translateY(6px) scale(1.05)}100%{transform:translateY(0) scale(1);opacity:1}}@keyframes ringPulse{0%,100%{opacity:.06}50%{opacity:.14}}`}</style>
      <div style={{background:"linear-gradient(180deg,#020818 0%,#030D2E 50%,#050A1A 100%)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",position:"relative",overflow:"hidden"}}>
        
        {/* Anneaux animés */}
        {[360,260,170,90].map((s,i)=>(
          <div key={s} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:s,height:s,borderRadius:"50%",border:"1px solid rgba(0,120,255,0.08)",animation:`ringPulse ${2.5+i*.4}s ease-in-out infinite`,animationDelay:`${i*.3}s`,pointerEvents:"none"}}/>
        ))}

        {/* Lang toggle */}
        <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
          {lang==="fr"?"🇬🇧 EN":"🇫🇷 FR"}
        </button>

        {/* Logo */}
        <div style={{width:108,height:108,borderRadius:"50%",background:"linear-gradient(135deg,#0033A8,#0066FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:50,marginBottom:28,boxShadow:"0 0 70px rgba(0,102,255,0.55)",animation:"dropFall .75s cubic-bezier(.22,.68,0,1.2) both",userSelect:"none"}}>
          💧
        </div>

        {/* Titre */}
        <div className="fu" style={{fontFamily:"'Syne',sans-serif",fontSize:36,fontWeight:900,textAlign:"center",background:"linear-gradient(135deg,#FFFFFF 0%,#7AB8FF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10,lineHeight:1.1}}>
          Multivers'Eau
        </div>

        {/* Accroche */}
        <div className="fu" style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",lineHeight:1.75,marginBottom:10,maxWidth:290,animationDelay:".1s"}}>
          {lang==="fr"
            ?"La première Super-App eau minérale Pi Network du Togo"
            :"The first Pi Network mineral water Super-App in Togo"}
        </div>

        {/* 3 bullets courts */}
        <div className="fu" style={{display:"flex",flexDirection:"column",gap:6,marginBottom:28,animationDelay:".18s"}}>
          {(lang==="fr"
            ?["💧 Commandez Voltic, Cristal, Eau Vitale","🏍️ Livrez et gagnez des Pi","🏪 Gérez un dépôt de distribution"]
            :["💧 Order Voltic, Cristal, Eau Vitale","🏍️ Deliver and earn Pi","🏪 Manage a distribution depot"]
          ).map((b,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.05)",borderRadius:12,padding:"7px 14px",fontSize:12,color:"rgba(255,255,255,.75)",fontWeight:600}}>
              {b}
            </div>
          ))}
        </div>

        {/* Oracle badge */}
        <div className="fu" style={{marginBottom:36,animationDelay:".22s"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",borderRadius:24,padding:"8px 18px",border:"1px solid rgba(0,102,255,0.25)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:oracle.status==="live"?"#22C55E":"#F59E0B",boxShadow:`0 0 6px ${oracle.status==="live"?"#22C55E":"#F59E0B"}`,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>1π = {fmt(oracle.rate)} FCFA</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>CoinGecko</span>
          </div>
        </div>

        {/* CTA principal */}
        <button onClick={()=>setStep("intention")} className="fu" style={{width:"100%",maxWidth:320,padding:"18px 0",background:"linear-gradient(135deg,#0044CC,#0066FF)",border:"none",borderRadius:18,color:"#fff",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:17,cursor:"pointer",boxShadow:"0 8px 32px rgba(0,102,255,0.45)",animationDelay:".28s"}}>
          {lang==="fr"?"Découvrir l'app →":"Discover the app →"}
        </button>

        {/* Académie Pi link */}
        <button onClick={()=>setShowAcad(true)} style={{marginTop:16,background:"transparent",border:"none",color:"rgba(255,255,255,0.3)",fontSize:12,cursor:"pointer",padding:"4px 0"}}>
          🎓 {lang==="fr"?"C'est quoi Pi Network ?":"What is Pi Network?"} · <span style={{color:C.admin}}>flashman90</span>
        </button>

        {/* Admin Easter egg révélé */}
        {adminVisible&&(
          <button onClick={()=>onRole("admin")} style={{marginTop:12,background:"transparent",border:`1px solid ${C.admin}44`,borderRadius:12,padding:"6px 18px",color:C.admin,fontSize:11,fontWeight:700,cursor:"pointer",animation:"fadeUp .3s ease both"}}>
            🔐 {lang==="fr"?"Accès Super Admin":"Super Admin Access"}
          </button>
        )}
      </div>
      {showAcad&&<AcademiePi lang={lang} onClose={()=>setShowAcad(false)}/>}
    </AppWrap>
  );

  // ── ÉCRAN 2 : INTENTION — "Que souhaitez-vous faire ?" ───────────────────
  return(
    <AppWrap>
      <div style={{background:"linear-gradient(180deg,#020818,#040C22)",minHeight:"100vh",padding:"0 0 32px"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(160deg,#001040,#020818)",padding:"32px 22px 22px",textAlign:"center",position:"relative"}}>
          <button onClick={()=>setStep("splash")} style={{position:"absolute",top:18,left:16,background:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"6px 12px",color:"rgba(255,255,255,.5)",fontSize:11,cursor:"pointer"}}>← {lang==="fr"?"Retour":"Back"}</button>
          <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{position:"absolute",top:18,right:16,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {lang==="fr"?"🇬🇧 EN":"🇫🇷 FR"}
          </button>
          <div style={{fontSize:30,marginBottom:10}}>💧</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>
            {lang==="fr"?"Que souhaitez-vous faire ?":"What would you like to do?"}
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.4)",lineHeight:1.6,maxWidth:300,margin:"0 auto"}}>
            {lang==="fr"
              ?"Multivers'Eau s'adapte à votre rôle dans l'écosystème Pi Network"
              :"Multivers'Eau adapts to your role in the Pi Network ecosystem"}
          </div>
        </div>

        {/* 3 choix */}
        <div style={{padding:"20px 18px 0"}}>
          {CHOICES.map((c,i)=>(
            <div key={c.id} className="fu" style={{animationDelay:`${i*.09}s`,marginBottom:14}}
              onClick={()=>onRole(c.id)}>
              <div style={{background:c.gradient,border:`1.5px solid ${c.border}`,borderRadius:22,padding:"22px 20px",cursor:"pointer",boxShadow:`0 8px 32px ${c.glow}`}}>
                <div style={{fontSize:36,marginBottom:10}}>{c.icon}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900,color:"#fff",marginBottom:8}}>
                  {lang==="fr"?c.fr:c.en}
                </div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.55)",lineHeight:1.65,marginBottom:14}}>
                  {lang==="fr"?c.dfr:c.den}
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:14}}>
                  {(lang==="fr"?c.tags.fr:c.tags.en).map(tag=>(
                    <span key={tag} style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,background:c.tagBg,color:c.tagColor}}>{tag}</span>
                  ))}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:c.tagBg,borderRadius:20,padding:"7px 16px"}}>
                  <span style={{fontSize:13,color:c.tagColor,fontWeight:800}}>{lang==="fr"?c.cta.fr:c.cta.en}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Académie Pi */}
        <div style={{padding:"8px 18px 0"}}>
          <div onClick={()=>setShowAcad(true)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderRadius:16,cursor:"pointer",background:"rgba(0,212,255,0.06)",border:"1px solid rgba(0,212,255,0.18)"}}>
            <span style={{fontSize:22}}>🎓</span>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:C.admin,fontSize:13}}>
                {lang==="fr"?"C'est quoi Pi Network ?":"What is Pi Network?"}
              </div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>
                {lang==="fr"?"Code invitation :":"Invitation code:"} <strong style={{color:C.admin}}>flashman90</strong>
              </div>
            </div>
            <span style={{marginLeft:"auto",color:C.admin,fontSize:16}}>→</span>
          </div>
          {/* Oracle footer */}
          <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"rgba(255,255,255,.2)"}}>
            <span onClick={()=>{setTapCount(n=>{const next=n+1;if(next>=7){setAdminVisible(true);return 0;}return next;})}} style={{cursor:"default"}}>
              {lang==="fr"?"Prix Oracle CoinGecko · 1π =":"CoinGecko Oracle · 1π ="} {fmt(oracle.rate)} FCFA
            </span>
          </div>
          {adminVisible&&(
            <div style={{textAlign:"center",marginTop:10}}>
              <button onClick={()=>onRole("admin")} style={{background:"transparent",border:`1px solid ${C.admin}44`,borderRadius:12,padding:"6px 18px",color:C.admin,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                🔐 {lang==="fr"?"Accès Super Admin":"Super Admin Access"}
              </button>
            </div>
          )}
        </div>
      </div>
      {showAcad&&<AcademiePi lang={lang} onClose={()=>setShowAcad(false)}/>}
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSCRIPTION RELAIS — 4 sections complètes
// ════════════════════════════════════════════════════════════════════════════
export { LandingPage };
