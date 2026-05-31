// ════════════════════════════════════════════════════════════════════════════
// MULTIVERS'EAU — Super-App de l'écosystème Pi Network spécialisée dans la distribution d'Eau Minérale embouteillée au Togo
// Version FINALE COMPLÈTE · 4 Rôles · Oracle CoinGecko · TradingView
// Auteur: GilBus90 · Code invitation Pi: flashman90
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
const _sb = () => createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── CONFIGURATION ────────────────────────────────────────────────────────────
const API_URL = ""; // Vercel serverless functions
const PI_SANDBOX = true; // ← Passer à false pour le mainnet production
const CODE_INVITATION = "flashman90";
const FRAIS_RESEAU_PI = 0.010;

// ── DESIGN SYSTEM ─────────────────────────────────────────────────────────────
const C = {
  bg:"#F0F9FF",surf:"#E0F2FE",card:"#FFFFFF",card2:"#EFF8FF",border:"#1E2A42",
  client:"#0066FF",livreur:"#FF6B00",relais:"#F59E0B",admin:"#00D4FF",
  green:"#22C55E",red:"#EF4444",muted:"#1E40AF",sub:"#3B82F6",text:"#EEF2FF",
  gclient:"linear-gradient(135deg,#003DA8,#0066FF)",
  glivreur:"linear-gradient(135deg,#CC3D00,#FF6B00)",
  grelais:"linear-gradient(135deg,#B45309,#F59E0B)",
  gadmin:"linear-gradient(135deg,#0098B5,#00D4FF)",
};
const gRole=(r)=>({client:C.gclient,livreur:C.glivreur,relais:C.grelais,admin:C.gadmin})[r]||C.gclient;
const fmt=(n)=>Math.round(n).toLocaleString("fr-FR");
const fmtPi=(n)=>Number(n).toFixed(3);
const GF="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap";
const GCSS=`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:#1E2A42;border-radius:2px}input::placeholder,textarea::placeholder{color:#4A5568}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes toastIn{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}
.fu{animation:fadeUp .35s ease both}.spin{animation:spin 1s linear infinite}`;

// ── TRADUCTIONS FR/EN ─────────────────────────────────────────────────────────
const T={
  fr:{
    appName:"Multivers'Eau",tagline:"L'eau minérale Pi Network au Togo",
    commander:"Commander",livreur:"Je suis livreur",relais:"Je suis un Relais",admin:"Super Admin",
    catalogue:"Catalogue",panier:"Panier",gains:"Gains",profil:"Profil",
    dashboard:"Dashboard",commandes:"Commandes",stocks:"Stocks",livreurs:"Livreurs",fiscal:"Fiscal",
    ajouter:"Ajouter",ajouterAu:"Ajouté !",retour:"← Retour",suivant:"Suivant →",
    enregistrer:"Enregistrer",annuler:"Annuler",valider:"Valider",rejeter:"Rejeter",
    rupture:"Rupture",disponible:"disponible",stockFaible:"Stock faible",
    payer:"Payer avec Pi Wallet",paiementCours:"Paiement en cours...",
    paiementOk:"Commande confirmée !",paiementErr:"Paiement annulé",
    fraisReseau:"Frais réseau blockchain",total:"Total",sousTotal:"Sous-total",
    livraison:"Livraison",fraisLivraison:"Frais de livraison",
    courseEnCours:"Course en cours",accepter:"Accepter la course",confirmerLiv:"Confirmer livraison",
    oracleSource:"Prix indexé Oracle CoinGecko",majLe:"Dernière mise à jour le",a:"à",
    lang:"EN",
  },
  en:{
    appName:"Multivers'Eau",tagline:"Pi Network mineral water in Togo",
    commander:"Order",livreur:"I'm a delivery driver",relais:"I'm a Relay",admin:"Super Admin",
    catalogue:"Catalogue",panier:"Cart",gains:"Earnings",profil:"Profile",
    dashboard:"Dashboard",commandes:"Orders",stocks:"Stock",livreurs:"Drivers",fiscal:"Finance",
    ajouter:"Add",ajouterAu:"Added!",retour:"← Back",suivant:"Next →",
    enregistrer:"Save",annuler:"Cancel",valider:"Validate",rejeter:"Reject",
    rupture:"Out of stock",disponible:"available",stockFaible:"Low stock",
    payer:"Pay with Pi Wallet",paiementCours:"Processing payment...",
    paiementOk:"Order confirmed!",paiementErr:"Payment cancelled",
    fraisReseau:"Blockchain network fee",total:"Total",sousTotal:"Subtotal",
    livraison:"Delivery",fraisLivraison:"Delivery fee",
    courseEnCours:"Delivery in progress",accepter:"Accept delivery",confirmerLiv:"Confirm delivery",
    oracleSource:"Price indexed on CoinGecko Oracle",majLe:"Last updated on",a:"at",
    lang:"FR",
  },
};

// ── CATALOGUE COMPLET — Prix réels usines ─────────────────────────────────────
const CATALOGUE=[
  // VOLTIC
  {id:"v1",b:"voltic",nFr:"Carton 1,5L",nEn:"Carton 1.5L",d:"×12",pv:3800,pa:3500,kg:18.7,pts:4,icon:"📦",u:"carton",noteF:"Format familial",noteE:"Family format"},
  {id:"v2",b:"voltic",nFr:"Carton 0,75L",nEn:"Carton 0.75L",d:"×20",pv:3800,pa:3300,kg:15.7,pts:4,icon:"📦",u:"carton",noteF:"Idéal bureaux",noteE:"Ideal for offices"},
  {id:"v3",b:"voltic",nFr:"Carton 0,5L",nEn:"Carton 0.5L",d:"×24",pv:3800,pa:3400,kg:12.6,pts:4,icon:"📦",u:"carton",noteF:"Pour événements",noteE:"For events"},
  {id:"v4",b:"voltic",nFr:"Pack 1,5L",nEn:"Pack 1.5L",d:"×6",pv:2150,pa:1750,kg:9.2,pts:2,icon:"🎒",u:"pack",noteF:"Réserve hebdo",noteE:"Weekly supply"},
  {id:"v5",b:"voltic",nFr:"Pack 0,75L",nEn:"Pack 0.75L",d:"×6",pv:1400,pa:950,kg:4.7,pts:1,icon:"🎒",u:"pack",noteF:"Pour se déplacer",noteE:"On the go"},
  {id:"v6",b:"voltic",nFr:"Pack 0,5L",nEn:"Pack 0.5L",d:"×6",pv:1250,pa:850,kg:3.1,pts:1,icon:"🎒",u:"pack",noteF:"Pack fraîcheur",noteE:"Freshness pack"},
  {id:"v7",b:"voltic",nFr:"Pack 0,33L",nEn:"Pack 0.33L",d:"×12",pv:1600,pa:1200,kg:4.1,pts:1,icon:"🎒",u:"pack",noteF:"Format mini",noteE:"Mini format"},
  {id:"v8",b:"voltic",nFr:"Bouteille 5L",nEn:"Bottle 5L",d:"×1",pv:1200,pa:800,kg:5.1,pts:2,icon:"🎒",u:"bout.",noteF:"Grande réserve",noteE:"Large reserve"},
  {id:"v9",b:"voltic",nFr:"Coupelles 0,25L",nEn:"Cups 0.25L",d:"×40",pv:1700,pa:1300,kg:10.5,pts:4,icon:"📦",u:"pack",noteF:"Pauses & cérémonies",noteE:"Ceremonies"},
  // CRISTAL
  {id:"c1",b:"cristal",nFr:"Carton 1,5L",nEn:"Carton 1.5L",d:"×12",pv:3700,pa:3300,kg:18.7,pts:4,icon:"📦",u:"carton",noteF:"Famille & fraîcheur",noteE:"Family freshness"},
  {id:"c2",b:"cristal",nFr:"Carton 0,5L",nEn:"Carton 0.5L",d:"×24",pv:4000,pa:3300,kg:12.6,pts:4,icon:"📦",u:"carton",noteF:"Pour vos stocks",noteE:"For your stocks"},
  {id:"c3",b:"cristal",nFr:"Pack 1,5L",nEn:"Pack 1.5L",d:"×6",pv:2000,pa:1650,kg:9.2,pts:2,icon:"🎒",u:"pack",noteF:"L'essentiel Cristal",noteE:"Cristal essential"},
  {id:"c4",b:"cristal",nFr:"Pack 1L",nEn:"Pack 1L",d:"×6",pv:2000,pa:1600,kg:6.2,pts:2,icon:"🎒",u:"pack",noteF:"Idéal pour la table",noteE:"For the table"},
  {id:"c5",b:"cristal",nFr:"Pack 0,5L",nEn:"Pack 0.5L",d:"×12",pv:2000,pa:1650,kg:6.2,pts:2,icon:"🎒",u:"pack",noteF:"Sorties en groupe",noteE:"Group outings"},
  {id:"c6",b:"cristal",nFr:"Pack 0,33L",nEn:"Pack 0.33L",d:"×15",pv:2000,pa:1600,kg:5.2,pts:2,icon:"🎒",u:"pack",noteF:"Les petites soifs",noteE:"Small thirsts"},
  // EAU VITALE
  {id:"t1",b:"vitale",nFr:"Carton 1,5L",nEn:"Carton 1.5L",d:"×12",pv:3700,pa:3300,kg:18.7,pts:4,icon:"📦",u:"carton",noteF:"Format généreux",noteE:"Generous format"},
  {id:"t2",b:"vitale",nFr:"Carton 0,5L",nEn:"Carton 0.5L",d:"×24",pv:3700,pa:3300,kg:12.6,pts:4,icon:"📦",u:"carton",noteF:"Distribution individuelle",noteE:"Individual distrib."},
  {id:"t3",b:"vitale",nFr:"Carton 0,35L",nEn:"Carton 0.35L",d:"×24",pv:3500,pa:3000,kg:8.9,pts:4,icon:"📦",u:"carton",noteF:"Format compact",noteE:"Compact format"},
];

const BRANDS={
  voltic: {label:"Voltic",emoji:"💧",color:"#1D4ED8",light:"#1D4ED820"},
  cristal:{label:"Cristal",emoji:"🫧",color:"#BE185D",light:"#BE185D20"},
  vitale: {label:"Eau Vitale",emoji:"✨",color:"#0369A1",light:"#0369A120"},
};

// Prix planchers régionaux (110 FCFA/tonne-km · Arrêté déc 2024)
const PLANCHERS={
  "v1":{grand_lome:3500,maritime_s:3600,maritime_n:3700,plateaux:3850,centrale:4150,kara:4350,savanes:4750},
  "v2":{grand_lome:3300,maritime_s:3400,maritime_n:3450,plateaux:3600,centrale:3850,kara:4050,savanes:4350},
  "v3":{grand_lome:3400,maritime_s:3450,maritime_n:3550,plateaux:3650,centrale:3850,kara:4000,savanes:4250},
  "v4":{grand_lome:1750,maritime_s:1800,maritime_n:1850,plateaux:1950,centrale:2100,kara:2200,savanes:2350},
  "v5":{grand_lome:950,maritime_s:1000,maritime_n:1000,plateaux:1050,centrale:1150,kara:1200,savanes:1300},
  "v6":{grand_lome:850,maritime_s:875,maritime_n:900,plateaux:925,centrale:975,kara:1000,savanes:1075},
  "v7":{grand_lome:1200,maritime_s:1225,maritime_n:1250,plateaux:1300,centrale:1350,kara:1400,savanes:1500},
  "v8":{grand_lome:800,maritime_s:825,maritime_n:850,plateaux:900,centrale:975,kara:1050,savanes:1150},
  "v9":{grand_lome:1300,maritime_s:1350,maritime_n:1400,plateaux:1500,centrale:1700,kara:1800,savanes:2000},
  "c1":{grand_lome:3300,maritime_s:3400,maritime_n:3500,plateaux:3650,centrale:3950,kara:4150,savanes:4550},
  "c2":{grand_lome:3300,maritime_s:3350,maritime_n:3450,plateaux:3550,centrale:3750,kara:3900,savanes:4150},
  "c3":{grand_lome:1650,maritime_s:1700,maritime_n:1750,plateaux:1850,centrale:2000,kara:2100,savanes:2250},
  "c4":{grand_lome:1600,maritime_s:1650,maritime_n:1700,plateaux:1750,centrale:1850,kara:1900,savanes:2050},
  "c5":{grand_lome:1650,maritime_s:1700,maritime_n:1750,plateaux:1800,centrale:1900,kara:1950,savanes:2100},
  "c6":{grand_lome:1600,maritime_s:1650,maritime_n:1700,plateaux:1750,centrale:1800,kara:1850,savanes:1950},
  "t1":{grand_lome:3300,maritime_s:3400,maritime_n:3500,plateaux:3650,centrale:3950,kara:4150,savanes:4550},
  "t2":{grand_lome:3300,maritime_s:3350,maritime_n:3450,plateaux:3550,centrale:3750,kara:3900,savanes:4150},
  "t3":{grand_lome:3000,maritime_s:3050,maritime_n:3100,plateaux:3200,centrale:3350,kara:3450,savanes:3600},
};

const REGIONS_INFO={
  grand_lome: {label:"Grand Lomé",dist:0},maritime_s:{label:"Maritime (Tsévié)",dist:35},
  maritime_n: {label:"Maritime (Tabligbo)",dist:80},plateaux:{label:"Plateaux (Atakpamé)",dist:165},
  centrale:   {label:"Centrale (Sokodé)",dist:310},kara:{label:"Kara",dist:410},
  savanes:    {label:"Savanes (Dapaong)",dist:590},
};

const STOCK_INIT={v1:18,v2:12,v3:24,v4:6,v5:30,v6:30,v7:15,v8:8,v9:5,c1:14,c2:10,c3:22,c4:18,c5:20,c6:16,t1:0,t2:11,t3:7};
const STOCK_MIN= {v1:10,v2:8, v3:8, v4:6,v5:15,v6:15,v7:8, v8:4,v9:3,c1:8, c2:6, c3:10,c4:10,c5:10,c6:6, t1:5,t2:6, t3:4};

// 4 RÉGIMES FISCAUX (dossier de conception qui fait foi)
const REGIMES={
  informel:{id:"informel",num:1,label:"Informel",otr:"Aucun enregistrement OTR",nif:false,tva:false,imf:true,seuil:null,color:"#9CA3AF",desc:"Pas de NIF, gestion simplifiée sans TVA",conseil:"Pour démarrer sans formalités. IMF 1% activée."},
  ets:     {id:"ets",num:2,label:"Établissement (Ets)",otr:"Régime Synthétique — TPU",nif:true,tva:false,imf:true,seuil:25000000,color:"#00D4FF",desc:"Régime Synthétique (TPU), sans TVA",conseil:"Le plus répandu au Togo pour les dépôts de boissons."},
  sarl:    {id:"sarl",num:3,label:"SARL / SARLU",otr:"Régime Simplifié — RSI",nif:true,tva:true,imf:true,seuil:150000000,color:"#F59E0B",desc:"Régime Simplifié (RSI), TVA 18% activée",conseil:"Pour les structures plus importantes avec comptabilité formelle."},
  grande:  {id:"grande",num:4,label:"Grande Entreprise",otr:"Régime du Réel — RNI",nif:true,tva:true,imf:true,seuil:null,color:"#22C55E",desc:"Régime du Réel (RNI), TVA 18% activée",conseil:"Comptabilité complète. Faites appel à un expert-comptable."},
};

// FLOTTE (dossier de conception)
const FLOTTE=[
  {id:"moto_sac",    icon:"🏍️",label:"Moto + sac isotherme",desc:"Type Gozem",kg:19.9,pts:4.9,tarifA:1000,equip:["Sac isotherme obligatoire","Casque recommandé"],alert:null},
  {id:"moto_bache",  icon:"🏍️",label:"Moto + attache sandow",desc:"Minibâche noire OBLIGATOIRE",kg:19.9,pts:4.9,tarifA:1000,equip:["Minibâche noire obligatoire","Attaches élastiques","Protection coupelles"],alert:"⚠️ Minibâche noire OBLIGATOIRE pour les coupelles 0,25L"},
  {id:"tricycle_s",  icon:"🛺", label:"Petit Tricycle Couvert",desc:"Kéké · Max 150 kg",kg:150,pts:15,tarifA:1000,equip:["Bâche lourde de protection"],alert:null},
  {id:"tricycle_l",  icon:"🚛", label:"Tricycle de Fret",desc:"Arrière ouvert · 151-800 kg",kg:800,pts:30,tarifA:1500,equip:["Bâche lourde imperméable","Sangles d'arrimage"],alert:null},
  {id:"voiture",     icon:"🚗", label:"Voiture Éco 5 places",desc:"Protection & Prestige · 151-400 kg",kg:400,pts:30,tarifA:2000,equip:["Coffre propre et sec"],alert:null},
];


// ════════════════════════════════════════════════════════════════════════════
// HOOKS GLOBAUX
// ════════════════════════════════════════════════════════════════════════════

// Oracle CoinGecko
function useOracle(){
  const[rate,setRate]=useState(90.93);
  const[status,setStatus]=useState("loading");
  const[time,setTime]=useState(null);
  const[history,setHistory]=useState([]);
  const[modeManuel,setModeManuel]=useState(false);
  const[rateManuel,setRateManuel]=useState(90.93);

  const sync=useCallback(async()=>{
    if(modeManuel)return;
    setStatus("loading");
    try{
      const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=xof,eur,usd",{signal:AbortSignal.timeout(8000)});
      const d=await r.json();const pi=d?.["pi-network"];
      const xof=pi?.xof||(pi?.eur?Math.round(pi.eur*655.957):0)||(pi?.usd?Math.round(pi.usd*600):0);
      if(xof>0){setRate(xof);setStatus("live");setTime(new Date());setHistory(h=>[...h.slice(-29),{t:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),v:xof}]);}
      else throw new Error();
    }catch{setStatus("fallback");}
  },[modeManuel]);

  useEffect(()=>{sync();const id=setInterval(sync,5*60*1000);return()=>clearInterval(id);},[sync]);

  const appliquerManuel=(v)=>{const n=parseFloat(v);if(n>0){setRate(n);setModeManuel(true);setTime(new Date());setHistory(h=>[...h.slice(-29),{t:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),v:n}]);}};
  const desactiverManuel=()=>{setModeManuel(false);sync();};
  return{rate,status,time,history,sync,modeManuel,rateManuel,setRateManuel,appliquerManuel,desactiverManuel};
}

// Toast
function useToast(){
  const[toast,setToast]=useState(null);
  const show=(msg,color=C.green,dur=3000)=>{setToast({msg,color});setTimeout(()=>setToast(null),dur);};
  return{toast,show};
}

// Stock
function useStock(relaisId){
  const[stocks,setStocks]=useState(STOCK_INIT);
  useEffect(()=>{
    const rid=relaisId||import.meta.env.VITE_GRAND_LOME_ID;
    if(!rid)return;
    const sb=_sb();
    sb.from("stocks").select("produit_id,quantite").eq("relais_id",rid)
      .then(({data})=>{if(data&&data.length>0)setStocks(Object.fromEntries(data.map(s=>[s.produit_id,s.quantite])));});
    const ch=sb.channel("stocks-"+rid)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"stocks",filter:"relais_id=eq."+rid},
        p=>setStocks(prev=>({...prev,[p.new.produit_id]:p.new.quantite})))
      .subscribe();
    return()=>sb.removeChannel(ch);
  },[relaisId]);
  const update=async(id,qty)=>{
    const q=Math.max(0,qty);setStocks(p=>({...p,[id]:q}));
    const rid=relaisId||import.meta.env.VITE_GRAND_LOME_ID;
    if(rid){const sb=_sb();await sb.from("stocks").upsert({relais_id:rid,produit_id:id,quantite:q,updated_at:new Date()});}
  };
  const dec=(id,qty=1)=>update(id,(stocks[id]||0)-qty);
  return{stocks,update,dec};
}

// Pi Auth
function usePiAuth(){
  const[user,setUser]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const inPi=typeof window!=="undefined"&&window.Pi;
    if(!inPi){
      setUser({username:"demo_user",uid:"demo_uid"});
      setLoading(false);
      return;
    }
    window.Pi.init({version:"2.0",sandbox:PI_SANDBOX});
    window.Pi.authenticate(["username","payments"],async(inc)=>{
      try{await fetch(`/api/incomplete`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({paymentId:inc.identifier})});
      }catch(e){}
    }).then((auth)=>{
      setUser(auth.user);
    }).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return{user,loading};
}
// ════════════════════════════════════════════════════════════════════════════
// COMPOSANTS PARTAGÉS
// ════════════════════════════════════════════════════════════════════════════
const AppWrap=({children,mw=460})=>(
  <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',sans-serif",color:C.text,maxWidth:mw,margin:"0 auto"}}>
    <link href={GF} rel="stylesheet"/><style>{GCSS}</style>{children}
  </div>
);

const Toast=({data})=>!data?null:(
  <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:data.color,color:"#0C1A2E",borderRadius:16,padding:"13px 22px",fontWeight:700,fontSize:13,animation:"toastIn .3s ease",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center",boxShadow:`0 8px 24px ${data.color}55`}}>
    {data.msg}
  </div>
);

function OracleBadge({oracle,lang,compact}){
  const t=T[lang||"fr"];
  const col=oracle.status==="live"?C.green:oracle.status==="fallback"?C.relais:C.muted;
  return(
    <div onClick={oracle.sync} style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.06)",borderRadius:20,padding:compact?"5px 12px":"8px 16px",cursor:"pointer",border:`1px solid ${col}33`}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}`,animation:oracle.status==="live"?"pulse 2s infinite":"none"}}/>
      <div>
        {!compact&&<div style={{fontSize:8,color:col,fontWeight:800,letterSpacing:1}}>{oracle.modeManuel?"TAUX FIXE":oracle.status==="live"?"ORACLE LIVE":"FALLBACK"}</div>}
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:compact?12:15,fontWeight:900,color:"#fff"}}>1π = {fmt(oracle.rate)} F</div>
      </div>
    </div>
  );
}

function TradingViewChart(){
  const ref=useRef();
  useEffect(()=>{
    if(!ref.current)return;
    ref.current.innerHTML="";
    const s=document.createElement("script");
    s.src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    s.async=true;
    s.innerHTML=JSON.stringify({autosize:true,symbol:"MEXC:PIUSDT",interval:"60",timezone:"Africa/Abidjan",theme:"dark",style:"1",locale:"fr",backgroundColor:"#060912",gridColor:"rgba(30,42,66,.8)",hide_top_toolbar:false,hide_legend:false,save_image:false});
    ref.current.appendChild(s);
    return()=>{if(ref.current)ref.current.innerHTML="";}
  },[]);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:C.surf,borderRadius:"12px 12px 0 0",border:`1px solid ${C.border}`,borderBottom:"none"}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
        <span style={{fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:800,color:C.admin}}>PIUSDT — TradingView Live</span>
        <span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>MEXC Exchange</span>
      </div>
      <div ref={ref} className="tradingview-widget-container" style={{height:300,background:C.surf,borderRadius:"0 0 12px 12px",overflow:"hidden",border:`1px solid ${C.border}`,borderTop:"none"}}>
        <div className="tradingview-widget-container__widget" style={{height:"100%",width:"100%"}}/>
      </div>
    </div>
  );
}

function Btn({children,onClick,color=C.client,disabled,size="md",variant="solid",full=true}){
  const p=size==="lg"?"16px 0":size==="sm"?"7px 14px":"13px 0";
  const fs=size==="lg"?16:size==="sm"?12:14;
  return(
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto",padding:p,border:"none",borderRadius:14,cursor:disabled?"not-allowed":"pointer",
      fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:fs,letterSpacing:.3,transition:"all .15s",
      background:disabled?C.border:variant==="outline"?`${color}18`:`linear-gradient(135deg,${color}CC,${color})`,
      color:disabled?C.muted:variant==="outline"?color:"#0C1A2E",
      border:variant==="outline"?`1.5px solid ${color}44`:"none",
      boxShadow:disabled||variant==="outline"?"none":`0 5px 18px ${color}33`,
    }}>{children}</button>
  );
}

function Fld({label,value,onChange,placeholder,type="text",req,note,lang}){
  const lc=lang||"fr";
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:5}}>
        {label}{req&&<span style={{color:C.red}}> *</span>}
      </div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:"12px 14px",background:"#fff",border:`1.5px solid ${C.border}`,borderRadius:10,color:"#111",fontSize:14,outline:"none",fontFamily:"'Inter',sans-serif"}}
        onFocus={e=>e.target.style.borderColor=C.admin} onBlur={e=>e.target.style.borderColor=C.border}/>
      {note&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>{note}</div>}
    </div>
  );
}

function Photo({label,note,req}){
  const[prev,setPrev]=useState(null);
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:4}}>{label}{req&&<span style={{color:C.red}}> *</span>}</div>
      {note&&<div style={{fontSize:11,color:C.muted,marginBottom:6}}>{note}</div>}
      <label style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:prev?130:90,borderRadius:12,cursor:"pointer",background:prev?"transparent":C.card2,border:`2px dashed ${prev?C.green:C.border}`,overflow:"hidden"}}>
        {prev?<img src={prev} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :<><div style={{fontSize:26,marginBottom:4}}>📷</div><div style={{fontSize:11,color:C.muted}}>Appuyer pour prendre / importer</div></>}
        <input type="file" accept="image/*" capture="environment" style={{display:"none"}}
          onChange={e=>{const f=e.target.files[0];if(f)setPrev(URL.createObjectURL(f));}}/>
      </label>
      {prev&&<div style={{fontSize:11,color:C.admin,marginTop:4,textAlign:"right",cursor:"pointer"}} onClick={()=>setPrev(null)}>✕ Changer</div>}
    </div>
  );
}

function BottomNav({tabs,active,onSelect,color}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:500,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{flex:1,padding:"11px 0 9px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
          {(t.badge||0)>0&&<div style={{position:"absolute",top:5,right:"calc(50% - 16px)",background:C.red,color:"#0C1A2E",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900}}>{t.badge}</div>}
          <span style={{fontSize:20}}>{t.icon}</span>
          <span style={{fontSize:9,fontWeight:active===t.id?800:500,color:active===t.id?color:C.muted}}>{t.label}</span>
          {active===t.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2.5,background:color,borderRadius:2}}/>}
        </button>
      ))}
    </div>
  );
}

// ── CHARTE QUALITÉ ─────────────────────────────────────────────────────────────
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
    <div style={{fontFamily:"'Inter',sans-serif",background:C.bg,minHeight:"100vh",maxWidth:460,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#001A5E,#003DA8)",padding:"28px 20px 24px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>📜</div>
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:900,color:"#0C1A2E"}}>Charte Qualité</div>
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
              <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:C.text,fontSize:14,marginBottom:4}}>{lang==="fr"?e.fr:e.en}</div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.5}}>{lang==="fr"?e.fr2:e.en2}</div>
            </div>
          </div>
        ))}
        <div onClick={()=>setOk(o=>!o)} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",margin:"20px 0",background:ok?C.green+"15":C.card,borderRadius:14,border:`2px solid ${ok?C.green:C.border}`,cursor:"pointer",transition:"all .2s"}}>
          <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:ok?C.green:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"#0C1A2E",fontWeight:900,fontSize:16}}>{ok?"✓":""}</div>
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
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:900,color:C.admin}}>🎓 {lang==="fr"?"Académie Pi":"Pi Academy"}</div>
          <button onClick={onClose} style={{background:C.card2,border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:18,color:C.sub}}>×</button>
        </div>
        <div style={{background:C.border,borderRadius:4,height:5,marginBottom:22}}>
          <div style={{background:C.admin,height:5,borderRadius:4,width:`${pct}%`,transition:"width .3s"}}/>
        </div>
        <div style={{textAlign:"center",marginBottom:22}}>
          <div style={{fontSize:52,marginBottom:14}}>{s.icon}</div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:12}}>{lang==="fr"?s.fr:s.en}</div>
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
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:28,fontWeight:900,color:C.admin,letterSpacing:3}}>{s.code}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>{lang==="fr"?s.notefr:s.noteen}</div>
            </div>
          )}
          {s.action&&<div style={{margin:"16px 0",background:C.green+"15",border:`1px solid ${C.green}33`,borderRadius:12,padding:"12px 16px",fontSize:14,fontWeight:700,color:C.green}}>🔍 {s.action}</div>}
          {(s.warnfr||s.warnen)&&<div style={{margin:"16px 0",background:"#78350F18",border:"2px solid #D9770644",borderRadius:12,padding:"14px 16px",fontSize:13,fontWeight:600,color:"#F59E0B",lineHeight:1.6,textAlign:"left"}}>{lang==="fr"?s.warnfr:s.warnen}</div>}
        </div>
        <div style={{display:"flex",gap:10}}>
          {e>0&&<button onClick={()=>setE(x=>x-1)} style={{flex:1,padding:13,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.sub,fontWeight:600,cursor:"pointer"}}>{lang==="fr"?"← Préc.":"← Prev."}</button>}
          {e<STEPS.length-1
            ?<button onClick={()=>setE(x=>x+1)} style={{flex:2,padding:13,background:C.gadmin,border:"none",borderRadius:12,color:C.bg,fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>{lang==="fr"?"Suivant →":"Next →"}</button>
            :<button onClick={onClose} style={{flex:2,padding:13,background:`linear-gradient(135deg,${C.green}CC,${C.green})`,border:"none",borderRadius:12,color:"#0C1A2E",fontWeight:900,fontSize:14,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>✅ {lang==="fr"?"Commencer":"Start"}</button>}
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
function LandingPage({onRole,oracle,lang,setLang, defaultStep="splash"}){
  const[step,setStep]=useState(defaultStep); // "splash" | "intention"
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
      gradient:"linear-gradient(135deg,#2D1200,#8B2500)",
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
      gradient:"linear-gradient(135deg,#2D1C00,#8B5500)",
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
      <div style={{background:"linear-gradient(180deg,#0A2560 0%,#0D3580 50%,#0A2560 100%)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",position:"relative",overflow:"hidden"}}>
        
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
        <div className="fu" style={{fontFamily:"'Poppins',sans-serif",fontSize:36,fontWeight:900,textAlign:"center",background:"linear-gradient(135deg,#FFFFFF 0%,#7AB8FF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:10,lineHeight:1.1}}>
          Multivers'Eau
        </div>

        {/* Accroche */}
        <div className="fu" style={{fontSize:14,color:"rgba(255,255,255,0.5)",textAlign:"center",lineHeight:1.75,marginBottom:10,maxWidth:290,animationDelay:".1s"}}>
          {lang==="fr"
            ?"La première Super-App de distribution d'eau minérale embouteillée au Togo dans l'écosystème Pi Network"
            :"The first bottled mineral water distribution Super-App in Togo within the Pi Network ecosystem"}
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
          <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",borderRadius:24,padding:"8px 18px",color:"#fff",border:"1px solid rgba(0,102,255,0.25)"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:oracle.status==="live"?"#22C55E":"#F59E0B",boxShadow:`0 0 6px ${oracle.status==="live"?"#22C55E":"#F59E0B"}`,animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:14,fontWeight:800,color:"#fff"}}>1π = {fmt(oracle.rate)} FCFA</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>CoinGecko</span>
          </div>
        </div>

        {/* CTA principal */}
        <button onClick={()=>setStep("intention")} className="fu" style={{width:"100%",maxWidth:320,padding:"18px 0",background:"linear-gradient(135deg,#0044CC,#0066FF)",border:"none",borderRadius:18,color:"#fff",fontFamily:"'Poppins',sans-serif",fontWeight:900,fontSize:17,cursor:"pointer",boxShadow:"0 8px 32px rgba(0,102,255,0.45)",animationDelay:".28s"}}>
          {lang==="fr"?"Découvrir l'app →":"Discover the app →"}
        </button>

        {/* Académie Pi link */}
        <button onClick={()=>setShowAcad(true)} style={{marginTop:16,background:"transparent",border:"none",color:"rgba(255,255,255,0.85)",fontSize:12,cursor:"pointer",padding:"4px 0"}}>
          🎓 {lang==="fr"?"C'est quoi Pi Network ?":"What is Pi Network?"} 
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
      <div style={{background:"linear-gradient(180deg,#0D3B7A,#0A2E5C)",minHeight:"100vh",padding:"0 0 32px"}}>

        {/* Header */}
        <div style={{background:"linear-gradient(160deg,#0D3B7A,#1A5FAD)",padding:"32px 22px 22px",textAlign:"center",position:"relative"}}>
          <button onClick={()=>setStep("splash")} style={{position:"absolute",top:18,left:16,background:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"6px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>← {lang==="fr"?"Retour":"Back"}</button>
          <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{position:"absolute",top:18,right:16,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"5px 14px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {lang==="fr"?"🇬🇧 EN":"🇫🇷 FR"}
          </button>
          <div style={{fontSize:30,marginBottom:10}}>💧</div>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:900,color:"#fff",marginBottom:6}}>
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
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:19,fontWeight:900,color:"#fff",marginBottom:8}}>
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
              <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:C.admin,fontSize:13}}>
                {lang==="fr"?"C'est quoi Pi Network ?":"What is Pi Network?"}
              </div>
              
            </div>
            <span style={{marginLeft:"auto",color:C.admin,fontSize:16}}>→</span>
          </div>
          {/* Oracle footer */}
          <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"rgba(255,255,255,.9)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
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
function InscriptionRelais({lang,onSubmit,onBack}){
  const[etape,setEtape]=useState(1);
  const[charteOk,setCharteOk]=useState(false);
  const[showCharte,setShowCharte]=useState(false);
  const[form,setForm]=useState({nom:"",depot:"",tel:"",region:"",ville:"",typeLocal:"",capaciteC:"",capaciteP:"",nbLiv:"",engins:[],wallet:"",nif:"",regime:"",accepte:false});
  const t=T[lang];
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleEngin=(e)=>setForm(f=>({...f,engins:f.engins.includes(e)?f.engins.filter(x=>x!==e):[...f.engins,e]}));
  const REGS=lang==="fr"?["Grand Lomé","Maritime","Plateaux","Centrale","Kara","Savanes"]:["Grand Lomé","Maritime","Plateaux","Centrale","Kara","Savanes"];
  const LOC=[{id:"boutique",icon:"🏪",fr:"Boutique",en:"Shop"},{id:"entrepot",icon:"🏭",fr:"Entrepôt",en:"Warehouse"},{id:"garage",icon:"🚗",fr:"Garage fermé",en:"Closed garage"}];
  const ENGS=[{id:"motos",icon:"🏍️",fr:"Motos",en:"Motorcycles"},{id:"tricycles",icon:"🛺",fr:"Tricycles",en:"Tricycles"},{id:"voitures",icon:"🚗",fr:"Voitures",en:"Cars"}];
  const canNext={1:form.nom&&form.depot&&form.tel&&form.region&&form.ville,2:form.typeLocal&&form.capaciteC,3:form.nbLiv&&form.engins.length>0,4:form.wallet&&form.regime&&form.accepte&&charteOk};
  const STEPS=lang==="fr"?["Identité","Infrastructure","Logistique","Engagement"]:["Identity","Infrastructure","Logistics","Commitment"];
  const pct=(etape/4)*100;

  if(showCharte)return<CharteQualite type="relais" lang={lang} onAccept={()=>{setCharteOk(true);setShowCharte(false);}}/>;

  return(
    <AppWrap>
      <div style={{background:"linear-gradient(160deg,#0A1A15,#0D2E22)",padding:"20px 18px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:19,fontWeight:900}}>🏪 {lang==="fr"?"Inscription Relais":"Relay Registration"}</div>
            <div style={{fontSize:11,color:C.sub}}>{lang==="fr"?"Formulaire standard Multivers'Eau":"Standard Multivers'Eau form"}</div>
          </div>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"6px 12px",color:"#0C1A2E",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:etape>i+1?C.relais:etape===i+1?"#F59E0B22":C.border,border:`2px solid ${etape>=i+1?C.relais:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:etape>i+1?"#0B0804":etape===i+1?C.relais:C.muted}}>{etape>i+1?"✓":i+1}</div>
              <span style={{fontSize:10,color:etape===i+1?C.relais:C.muted,fontWeight:etape===i+1?700:400}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.border,borderRadius:3,height:4}}><div style={{background:C.grelais,height:4,borderRadius:3,width:`${pct}%`,transition:"width .4s"}}/></div>
      </div>
      <div style={{padding:"18px 18px",paddingBottom:90}}>
        {etape===1&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.relais}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.relais,fontWeight:800}}>{lang==="fr"?"SECTION 1":"SECTION 1"}</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Identification du Partenaire":"Partner Identification"}</div>
            </div>
            <Fld label={lang==="fr"?"NOM DU RESPONSABLE":"MANAGER NAME"} value={form.nom} onChange={e=>upd("nom",e.target.value)} placeholder={lang==="fr"?"Ex: Mawuli Goka":"Ex: Mawuli Goka"} req lang={lang}/>
            <Fld label={lang==="fr"?"NOM DU DÉPÔT / BULLE":"DEPOT / BUBBLE NAME"} value={form.depot} onChange={e=>upd("depot",e.target.value)} placeholder={lang==="fr"?"Ex: Dépôt Bè Centre":"Ex: Bè Centre Depot"} req lang={lang}/>
            <Fld label={lang==="fr"?"NUMÉRO WHATSAPP":"WHATSAPP NUMBER"} value={form.tel} onChange={e=>upd("tel",e.target.value)} placeholder="+228 90 XX XX XX" type="tel" req lang={lang}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"RÉGION":"REGION"}<span style={{color:C.red}}> *</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {REGS.map(r=>(
                  <div key={r} onClick={()=>upd("region",r)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",textAlign:"center",background:form.region===r?C.relais+"22":C.card2,border:`1.5px solid ${form.region===r?C.relais:C.border}`,fontSize:12,fontWeight:700,color:form.region===r?C.relais:C.text}}>{r}</div>
                ))}
              </div>
            </div>
            <Fld label={lang==="fr"?"VILLE & QUARTIER DU DÉPÔT":"CITY & DISTRICT OF DEPOT"} value={form.ville} onChange={e=>upd("ville",e.target.value)} placeholder={lang==="fr"?"Ex: Lomé, Bè-Kpota, Rue Principale":"Ex: Lomé, Bè-Kpota, Main Street"} req lang={lang}/>
          </div>
        )}
        {etape===2&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.relais}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.relais,fontWeight:800}}>SECTION 2</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Infrastructure de Stockage":"Storage Infrastructure"}</div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"TYPE DE LOCAL":"LOCAL TYPE"}<span style={{color:C.red}}> *</span></div>
              {LOC.map(l=>(
                <div key={l.id} onClick={()=>upd("typeLocal",l.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,cursor:"pointer",marginBottom:8,background:form.typeLocal===l.id?C.relais+"18":C.card2,border:`1.5px solid ${form.typeLocal===l.id?C.relais:C.border}`}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:form.typeLocal===l.id?C.relais:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:C.bg,fontSize:11,fontWeight:900}}>{form.typeLocal===l.id?"✓":""}</div>
                  <span style={{fontSize:20}}>{l.icon}</span>
                  <span style={{fontWeight:700,color:form.typeLocal===l.id?C.relais:C.text}}>{lang==="fr"?l.fr:l.en}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"CAPACITÉ DE STOCKAGE":"STORAGE CAPACITY"}<span style={{color:C.red}}> *</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{lang==="fr"?"En cartons":"In cartons"}</div><Fld label="" value={form.capaciteC} onChange={e=>upd("capaciteC",e.target.value)} placeholder={lang==="fr"?"Ex: 200":"Ex: 200"} type="number" lang={lang}/></div>
                <div><div style={{fontSize:11,color:C.muted,marginBottom:4}}>{lang==="fr"?"En packs":"In packs"}</div><Fld label="" value={form.capaciteP} onChange={e=>upd("capaciteP",e.target.value)} placeholder={lang==="fr"?"Ex: 500":"Ex: 500"} type="number" lang={lang}/></div>
              </div>
            </div>
            <div style={{background:C.relais+"15",border:`1px solid ${C.relais}33`,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:C.relais,marginBottom:4}}>📷 {lang==="fr"?"Photos obligatoires":"Mandatory photos"}</div>
              <div style={{fontSize:11,color:C.muted}}>{lang==="fr"?"Vérification propreté & absence d'exposition au soleil":"Cleanliness & no sun exposure verification"}</div>
            </div>
            <Photo label={lang==="fr"?"PHOTO INTÉRIEUR DU LOCAL":"INTERIOR PHOTO"} note={lang==="fr"?"Montrer l'espace de stockage":"Show storage space"} req/>
            <Photo label={lang==="fr"?"PHOTO EXTÉRIEUR DU LOCAL":"EXTERIOR PHOTO"} note={lang==="fr"?"Façade du dépôt":"Depot facade"} req/>
          </div>
        )}
        {etape===3&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.relais}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.relais,fontWeight:800}}>SECTION 3</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Logistique Locale":"Local Logistics"}</div>
            </div>
            <Fld label={lang==="fr"?"NOMBRE DE LIVREURS DISPONIBLES":"NUMBER OF AVAILABLE DRIVERS"} value={form.nbLiv} onChange={e=>upd("nbLiv",e.target.value)} placeholder={lang==="fr"?"Ex: 3":"Ex: 3"} type="number" req lang={lang} note={lang==="fr"?"Livreurs déjà présents dans votre zone":"Drivers already present in your zone"}/>
            <div>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"TYPES D'ENGINS GÉRÉS":"TYPES OF VEHICLES MANAGED"}<span style={{color:C.red}}> *</span></div>
              {ENGS.map(e=>(
                <div key={e.id} onClick={()=>toggleEngin(e.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,cursor:"pointer",marginBottom:8,background:form.engins.includes(e.id)?C.relais+"18":C.card2,border:`1.5px solid ${form.engins.includes(e.id)?C.relais:C.border}`}}>
                  <div style={{width:22,height:22,borderRadius:6,background:form.engins.includes(e.id)?C.relais:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:C.bg,fontSize:12,fontWeight:900}}>{form.engins.includes(e.id)?"✓":""}</div>
                  <span style={{fontSize:20}}>{e.icon}</span>
                  <span style={{fontWeight:700,color:form.engins.includes(e.id)?C.relais:C.text}}>{lang==="fr"?e.fr:e.en}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {etape===4&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.relais}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.relais,fontWeight:800}}>SECTION 4</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Fiscal & Engagement Pi":"Fiscal & Pi Commitment"}</div>
            </div>
            {/* Régime fiscal */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"RÉGIME FISCAL":"TAX REGIME"}<span style={{color:C.red}}> *</span></div>
              {Object.values(REGIMES).map(r=>(
                <div key={r.id} onClick={()=>upd("regime",r.id)} style={{padding:"12px 14px",borderRadius:12,cursor:"pointer",marginBottom:8,background:form.regime===r.id?r.color+"18":C.card2,border:`1.5px solid ${form.regime===r.id?r.color:C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:form.regime===r.id?r.color:C.border,border:`1.5px solid ${r.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:form.regime===r.id?"#0B0804":C.muted}}>{r.num}</div>
                      <span style={{fontWeight:700,color:form.regime===r.id?r.color:C.text,fontSize:13}}>{r.label}</span>
                    </div>
                    {form.regime===r.id&&<span style={{color:r.color}}>✓</span>}
                  </div>
                  <div style={{fontSize:11,color:C.sub,marginLeft:30,marginBottom:4}}>{r.desc}</div>
                  <div style={{display:"flex",gap:6,marginLeft:30}}>
                    {[{l:"NIF",ok:r.nif},{l:"TVA",ok:r.tva},{l:"IMF ✓",ok:r.imf}].map(b=>(
                      <span key={b.l} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:8,background:b.ok?r.color+"22":"rgba(255,255,255,.05)",color:b.ok?r.color:C.muted}}>{b.l}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.values(REGIMES).find(r=>r.id===form.regime)?.nif&&(
              <Fld label="NIF" value={form.nif} onChange={e=>upd("nif",e.target.value)} placeholder={lang==="fr"?"Numéro NIF (optionnel)":"NIF number (optional)"} lang={lang} note={lang==="fr"?"Vous pouvez l'ajouter plus tard dans Profil → Fiscal":"Can be added later in Profile → Fiscal"}/>
            )}
            <Fld label={lang==="fr"?"ADRESSE WALLET PI (CLÉ G...)":"PI WALLET ADDRESS (G... KEY)"} value={form.wallet} onChange={e=>upd("wallet",e.target.value)} placeholder="GDIFY...ET7HH" req lang={lang} note={lang==="fr"?"Pour recevoir vos paiements Pi instantanément":"To receive your Pi payments instantly"}/>
            {/* Charte */}
            {!charteOk?(
              <button onClick={()=>setShowCharte(true)} style={{width:"100%",padding:"12px",background:C.relais+"18",border:`1.5px solid ${C.relais}44`,borderRadius:12,color:C.relais,fontWeight:700,cursor:"pointer",marginBottom:12,fontSize:13}}>
                📜 {lang==="fr"?"Lire & Signer la Charte Qualité":"Read & Sign Quality Charter"}
              </button>
            ):(
              <div style={{padding:"10px 14px",borderRadius:12,background:C.green+"15",border:`1px solid ${C.green}33`,marginBottom:12,fontSize:13,color:C.green,fontWeight:700}}>
                ✅ {lang==="fr"?"Charte Qualité signée":"Quality Charter signed"}
              </div>
            )}
            <div onClick={()=>upd("accepte",!form.accepte)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderRadius:14,cursor:"pointer",background:form.accepte?C.relais+"15":C.card,border:`1.5px solid ${form.accepte?C.relais:C.border}`,marginBottom:12}}>
              <div style={{width:24,height:24,borderRadius:7,flexShrink:0,background:form.accepte?C.relais:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"#0B0804",fontWeight:900,fontSize:14}}>{form.accepte?"✓":""}</div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.5}}>{lang==="fr"?"J'accepte les conditions de partenariat Multivers'Eau et m'engage à respecter les prix fixes de la plateforme.":"I accept Multivers'Eau partnership terms and commit to respecting the platform's fixed prices."}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:C.surf,borderTop:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",gap:10}}>
        {etape>1&&<button onClick={()=>setEtape(e=>e-1)} style={{flex:1,padding:13,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontWeight:600,cursor:"pointer"}}>{t.retour}</button>}
        {etape<4
          ?<button onClick={()=>canNext[etape]&&setEtape(e=>e+1)} style={{flex:2,padding:13,background:canNext[etape]?C.grelais:C.border,border:"none",borderRadius:12,color:canNext[etape]?"#0B0804":C.muted,fontWeight:800,fontSize:14,cursor:canNext[etape]?"pointer":"not-allowed",fontFamily:"'Poppins',sans-serif"}}>{t.suivant}</button>
          :<button onClick={()=>canNext[4]&&onSubmit(form)} style={{flex:2,padding:13,background:canNext[4]?C.grelais:C.border,border:"none",borderRadius:12,color:canNext[4]?"#0B0804":C.muted,fontWeight:900,fontSize:14,cursor:canNext[4]?"pointer":"not-allowed",fontFamily:"'Poppins',sans-serif"}}>🏪 {lang==="fr"?"Soumettre ma candidature":"Submit my application"}</button>}
      </div>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSCRIPTION LIVREUR — 5 types véhicules + immatriculation + photos
// ════════════════════════════════════════════════════════════════════════════
function InscriptionLivreur({lang,onSubmit,onBack}){
  const[etape,setEtape]=useState(1);
  const[charteOk,setCharteOk]=useState(false);
  const[showCharte,setShowCharte]=useState(false);
  const[form,setForm]=useState({nom:"",tel:"",region:"",quartier:"",vehicule:"",immat:"",wallet:"",accepte:false});
  const t=T[lang];
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const selectedV=FLOTTE.find(v=>v.id===form.vehicule);
  const REGS=["Grand Lomé","Maritime","Plateaux","Centrale","Kara","Savanes"];
  const canNext={1:form.nom&&form.tel&&form.region&&form.quartier,2:form.vehicule&&form.immat,3:true,4:form.wallet&&form.accepte&&charteOk};
  const STEPS=lang==="fr"?["Identité","Véhicule","Équipements","Pi Wallet"]:["Identity","Vehicle","Equipment","Pi Wallet"];
  const pct=(etape/4)*100;

  if(showCharte)return<CharteQualite type="livreur" lang={lang} onAccept={()=>{setCharteOk(true);setShowCharte(false);}}/>;

  return(
    <AppWrap>
      <div style={{background:"linear-gradient(160deg,#1A0900,#2D1200)",padding:"20px 18px 16px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:19,fontWeight:900}}>🏍️ {lang==="fr"?"Inscription Livreur":"Driver Registration"}</div>
            <div style={{fontSize:11,color:C.sub}}>{lang==="fr"?"Formulaire standard — Toutes bulles":"Standard form — All bubbles"}</div>
          </div>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:etape>i+1?C.livreur:C.border,border:`2px solid ${etape>=i+1?C.livreur:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:etape>i+1?"#fff":etape===i+1?C.livreur:C.muted}}>{etape>i+1?"✓":i+1}</div>
              <span style={{fontSize:10,color:etape===i+1?C.livreur:C.muted,fontWeight:etape===i+1?700:400}}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.border,borderRadius:3,height:4}}><div style={{background:C.glivreur,height:4,borderRadius:3,width:`${pct}%`,transition:"width .4s"}}/></div>
      </div>
      <div style={{padding:"18px 18px",paddingBottom:90}}>
        {etape===1&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.livreur}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.livreur,fontWeight:800}}>SECTION 1</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800,color:"#111"}}>{lang==="fr"?"Identité & Localisation":"Identity & Location"}</div>
            </div>
            <Fld label={lang==="fr"?"NOM ET PRÉNOMS":"FULL NAME"} value={form.nom} onChange={e=>upd("nom",e.target.value)} placeholder={lang==="fr"?"Ex: Kofi Mensah":"Ex: Kofi Mensah"} req lang={lang}/>
            <Fld label={lang==="fr"?"NUMÉRO WHATSAPP":"WHATSAPP NUMBER"} value={form.tel} onChange={e=>upd("tel",e.target.value)} placeholder="+228 90 XX XX XX" type="tel" req lang={lang}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"RÉGION D'ACTIVITÉ":"ACTIVITY REGION"}<span style={{color:C.red}}> *</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {REGS.map(r=>(
                  <div key={r} onClick={()=>upd("region",r)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",textAlign:"center",background:form.region===r?C.livreur+"22":C.card2,border:`1.5px solid ${form.region===r?C.livreur:C.border}`,fontSize:12,fontWeight:700,color:form.region===r?C.livreur:"#111"}}>{r}</div>
                ))}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>⚠️ {lang==="fr"?"Vous devez habiter à moins de 2 km du dépôt":"You must live within 2 km of the depot"}</div>
            </div>
            <Fld label={lang==="fr"?"QUARTIER DE RÉSIDENCE":"HOME DISTRICT"} value={form.quartier} onChange={e=>upd("quartier",e.target.value)} placeholder={lang==="fr"?"Ex: Segbé, Adidogomé...":"Ex: Segbé, Adidogomé..."} req lang={lang}/>
          </div>
        )}
        {etape===2&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.livreur}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.livreur,fontWeight:800}}>SECTION 2</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800,color:"#111"}}>{lang==="fr"?"Détails du Véhicule":"Vehicle Details"}</div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"TYPE D'ENGIN":"VEHICLE TYPE"}<span style={{color:C.red}}> *</span></div>
              {FLOTTE.map(v=>(
                <div key={v.id} onClick={()=>upd("vehicule",v.id)} style={{padding:"13px 16px",borderRadius:14,cursor:"pointer",marginBottom:8,background:form.vehicule===v.id?C.livreur+"18":C.card2,border:`1.5px solid ${form.vehicule===v.id?C.livreur:C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:form.vehicule===v.id?C.livreur:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:form.vehicule===v.id?"#fff":C.muted,fontSize:12,fontWeight:900,flexShrink:0}}>{form.vehicule===v.id?"✓":""}</div>
                    <span style={{fontSize:20}}>{v.icon}</span>
                    <span style={{fontWeight:700,color:form.vehicule===v.id?C.livreur:"#111",fontSize:13}}>{v.label}</span>
                  </div>
                  <div style={{fontSize:11,color:C.sub,marginLeft:32}}>{v.desc}</div>
                  {v.alert&&form.vehicule===v.id&&(
                    <div style={{marginLeft:32,marginTop:6,background:C.relais+"18",border:`1px solid ${C.relais}44`,borderRadius:8,padding:"5px 10px",fontSize:11,color:C.relais,fontWeight:700}}>{v.alert}</div>
                  )}
                </div>
              ))}
            </div>
            {form.vehicule&&(
              <Fld label={lang==="fr"?"NUMÉRO D'IMMATRICULATION":"LICENSE PLATE NUMBER"} value={form.immat} onChange={e=>upd("immat",e.target.value)} placeholder={lang==="fr"?"Ex: TG-1234-BC":"Ex: TG-1234-BC"} req lang={lang} note={lang==="fr"?"Le numéro visible sur la plaque de votre engin":"Number visible on your vehicle plate"}/>
            )}
          </div>
        )}
        {etape===3&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.livreur}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.livreur,fontWeight:800}}>SECTION 3</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800,color:"#111"}}>{lang==="fr"?"Équipements & Preuves":"Equipment & Proof"}</div>
            </div>
            {selectedV&&(
              <div style={{background:C.client+"15",border:`1px solid ${C.client}33`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
                <div style={{fontSize:11,color:C.client,fontWeight:800,marginBottom:6}}>{lang==="fr"?"ÉQUIPEMENTS REQUIS POUR":"REQUIRED EQUIPMENT FOR"} {selectedV.label.toUpperCase()}</div>
                {selectedV.equip.map(e=><div key={e} style={{fontSize:12,color:C.sub,marginBottom:3}}>✓ {e}</div>)}
              </div>
            )}
            <Photo label={lang==="fr"?"PHOTO DE L'ENGIN":"VEHICLE PHOTO"} note={lang==="fr"?"Photo claire, plaque visible":"Clear photo, plate visible"} req/>
            <Photo label={lang==="fr"?"PHOTO DE L'ÉQUIPEMENT":"EQUIPMENT PHOTO"} note={selectedV?.id==="moto_bache"?(lang==="fr"?"Montrer clairement la MINIBÂCHE NOIRE + attaches":"Clearly show BLACK TARP + straps"):(lang==="fr"?"Sac isotherme ou bâche selon votre engin":"Isothermal bag or tarp per vehicle")} req/>
            <div style={{background:C.relais+"15",border:`1px solid ${C.relais}33`,borderRadius:12,padding:"12px 14px",marginTop:8}}>
              <div style={{fontSize:12,fontWeight:700,color:C.relais,marginBottom:4}}>⚠️ {lang==="fr"?"Double vérification":"Double verification"}</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>{lang==="fr"?"Le Relais vérifiera physiquement vos équipements avant de recommander votre profil au Super Admin.":"The Relay will physically verify your equipment before recommending your profile to the Super Admin."}</div>
            </div>
          </div>
        )}
        {etape===4&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.livreur}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.livreur,fontWeight:800}}>SECTION 4</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:800,color:"#111"}}>{lang==="fr"?"Écosystème Pi":"Pi Ecosystem"}</div>
            </div>
            <Fld label={lang==="fr"?"ADRESSE WALLET PI (CLÉ G...)":"PI WALLET ADDRESS (G... KEY)"} value={form.wallet} onChange={e=>upd("wallet",e.target.value)} placeholder="GDIFY...ET7HH" req lang={lang} note={lang==="fr"?"C'est ici que vous recevrez 90% des frais de livraison en Pi":"You receive 90% of delivery fees in Pi here"}/>
            <div style={{background:"linear-gradient(135deg,#0A1520,#0F1E30)",border:`2px solid ${C.admin}44`,borderRadius:16,padding:"16px 18px",marginBottom:18,textAlign:"center"}}>
              <div style={{fontSize:11,color:C.admin,fontWeight:800,marginBottom:8}}>{lang==="fr"?"VOUS N'AVEZ PAS ENCORE PI ?":"DON'T HAVE PI YET?"}</div>
              <div style={{fontSize:13,color:C.sub,marginBottom:10}}>{lang==="fr"?"Code d'invitation :":"Invitation code:"}</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:26,fontWeight:900,color:C.admin,letterSpacing:3}}>{CODE_INVITATION}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>{lang==="fr"?"Minez du Pi gratuitement depuis votre téléphone":"Mine Pi for free from your phone"}</div>
            </div>
            {!charteOk?(
              <button onClick={()=>setShowCharte(true)} style={{width:"100%",padding:"12px",background:C.livreur+"18",border:`1.5px solid ${C.livreur}44`,borderRadius:12,color:C.livreur,fontWeight:700,cursor:"pointer",marginBottom:12,fontSize:13}}>
                📜 {lang==="fr"?"Lire & Signer la Charte Qualité":"Read & Sign Quality Charter"}
              </button>
            ):(
              <div style={{padding:"10px 14px",borderRadius:12,background:C.green+"15",border:`1px solid ${C.green}33`,marginBottom:12,fontSize:13,color:C.green,fontWeight:700}}>✅ {lang==="fr"?"Charte Qualité signée":"Quality Charter signed"}</div>
            )}
            <div onClick={()=>upd("accepte",!form.accepte)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"14px 16px",borderRadius:14,cursor:"pointer",background:form.accepte?C.livreur+"15":C.card,border:`1.5px solid ${form.accepte?C.livreur:C.border}`,marginBottom:12}}>
              <div style={{width:24,height:24,borderRadius:7,flexShrink:0,background:form.accepte?C.livreur:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"#0C1A2E",fontWeight:900,fontSize:14}}>{form.accepte?"✓":""}</div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.5}}>{lang==="fr"?"J'accepte les conditions Multivers'Eau et je m'engage à protéger les produits et respecter les prix.":"I accept Multivers'Eau terms and commit to protecting products and respecting prices."}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:"#0C1A2E",borderTop:`1px solid ${C.border}`,padding:"14px 18px",paddingBottom:"calc(14px + env(safe-area-inset-bottom))",display:"flex",gap:10}}>
        {etape>1&&<button onClick={()=>setEtape(e=>e-1)} style={{flex:1,padding:13,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontWeight:600,cursor:"pointer"}}>{t.retour}</button>}
        {etape<4
          ?<button onClick={()=>canNext[etape]&&setEtape(e=>e+1)} style={{flex:2,padding:13,background:canNext[etape]?C.glivreur:C.border,border:"none",borderRadius:12,color:canNext[etape]?"#fff":C.muted,fontWeight:800,fontSize:14,cursor:canNext[etape]?"pointer":"not-allowed",fontFamily:"'Poppins',sans-serif"}}>{t.suivant}</button>
          :<button onClick={()=>canNext[4]&&onSubmit(form)} style={{flex:2,padding:13,background:canNext[4]?C.glivreur:C.border,border:"none",borderRadius:12,color:canNext[4]?"#fff":C.muted,fontWeight:900,fontSize:14,cursor:canNext[4]?"pointer":"not-allowed",fontFamily:"'Poppins',sans-serif"}}>🏍️ {lang==="fr"?"Soumettre":"Submit"}</button>}
      </div>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CLIENT APP — Catalogue + Panier + Paiement Pi
// ════════════════════════════════════════════════════════════════════════════
function ClientApp({oracle,stocks,dec,lang,setLang,onBack}){
  const[tab,setTab]=useState("catalogue");
  const[brand,setBrand]=useState("all");
  const[panier,setPanier]=useState({});
  const[payStatus,setPayStatus]=useState(null);
  const[showAcad,setShowAcad]=useState(false);
  const{toast,show}=useToast();
  const t=T[lang];const COL=C.client;

  const add=(id)=>{if((panier[id]||0)>=(stocks[id]||0))return;setPanier(p=>({...p,[id]:(p[id]||0)+1}));};
  const rem=(id)=>setPanier(p=>{if((p[id]||0)<=1){const n={...p};delete n[id];return n;}return{...p,[id]:p[id]-1};});
  const panierCount=Object.values(panier).reduce((s,n)=>s+n,0);
  const subtotal=Object.entries(panier).reduce((s,[id,q])=>{const p=CATALOGUE.find(x=>x.id===id);return s+(p?.pv||0)*q;},0);
  const totalPi=parseFloat((subtotal/oracle.rate+FRAIS_RESEAU_PI).toFixed(3));
  const prods=CATALOGUE.filter(p=>brand==="all"||p.b===brand);

  const payerAvecPi=async()=>{
    // Vérifier Pi Browser
    if(!window.Pi){
      show(lang==="fr"?"Ouvrez dans Pi Browser !":"Open in Pi Browser!",C.red);
      return;
    }

    setPayStatus("loading");

    // ÉTAPE 1 — Initialiser le SDK
    window.Pi.init({version:"2.0",sandbox:PI_SANDBOX});

    // ÉTAPE 2 — Authentifier (OBLIGATOIRE avant createPayment)
    let authResult;
    try{
      authResult=await window.Pi.authenticate(
        ["payments"],
        async(inc)=>{
          // Paiement incomplet précédent
          fetch(`/api/incomplete`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({paymentId:inc.identifier})}).catch(()=>{});
        }
      );
    }catch(authErr){
      console.error("Auth Pi échouée:",authErr);
      setPayStatus(null);
      show("Erreur auth Pi: "+(authErr?.message||String(authErr)),C.red);
      return; // STOP — sans auth, impossible de payer
    }

    // ÉTAPE 3 — Créer le paiement
    const orderId=`MVE-${Date.now().toString(36).toUpperCase()}`;
    window.Pi.createPayment(
      {amount:totalPi,memo:`Multivers'Eau #${orderId}`,metadata:{orderId,user:authResult?.user?.username}},
      {
        // NON-BLOQUANT — fire & forget, Pi n'attend PAS la réponse
        onReadyForServerApproval:(paymentId)=>{
          fetch(`/api/approve`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({paymentId,orderId})}).catch(e=>console.error("approve:",e));
        },
        // NON-BLOQUANT — succès IMMÉDIAT côté client
        onReadyForServerCompletion:(paymentId,txId)=>{
          fetch(`/api/complete`,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({paymentId,txId,orderId})}).catch(e=>console.error("complete:",e));
          setPayStatus("success");
          Object.entries(panier).forEach(([id,qty])=>dec(id,qty));
          setPanier({});
          show(t.paiementOk,C.green);
        },
        onCancel:(paymentId)=>{
          console.log("Paiement annulé:",paymentId);
          setPayStatus(null);
          show(t.paiementErr,C.red);
        },
        onError:(error,payment)=>{
          // Afficher la VRAIE erreur pour diagnostic
          console.error("Pi payment error:",error,payment);
          setPayStatus(null);
          show("Erreur Pi: "+(error?.message||JSON.stringify(error)),C.red);
        },
      }
    );
  };

  const TABS=[{id:"catalogue",icon:"🛍️",label:t.catalogue},{id:"panier",icon:"🛒",label:t.panier,badge:panierCount}];

  return(
    <AppWrap>
      <Toast data={toast}/>
      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#001A5E,#003DA8)",padding:"16px 18px 12px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:900,color:"#fff"}}>💧 {t.appName}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>{lang==="fr"?"Eau minérale · Livraison Pi Network":"Mineral water · Pi Network Delivery"}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <OracleBadge oracle={oracle} lang={lang} compact/>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:16,padding:"5px 10px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.lang}</button>
            <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
          </div>
        </div>
        {/* Académie Pi */}
        <div onClick={()=>setShowAcad(true)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:12,cursor:"pointer",background:"rgba(0,212,255,.08)",border:"1px solid rgba(0,212,255,.2)",marginBottom:10}}>
          <span style={{fontSize:16}}>🎓</span>
          <span style={{fontSize:12,color:"rgba(255,255,255,.8)",fontWeight:600}}>{lang==="fr"?"C'est quoi Pi ? Académie Pi":"What is Pi? Pi Academy"}</span>
        </div>
        {/* Filtres */}
        <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
          {[{k:"all",label:lang==="fr"?"Tous":"All",col:COL},...Object.entries(BRANDS).map(([k,b])=>({k,label:`${b.emoji} ${b.label}`,col:b.color}))].map(f=>(
            <button key={f.k} onClick={()=>setBrand(f.k)} style={{padding:"5px 13px",borderRadius:20,border:"none",cursor:"pointer",flexShrink:0,background:brand===f.k?f.col:"rgba(255,255,255,.08)",color:"#fff",fontWeight:brand===f.k?800:400,fontSize:12}}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Catalogue */}
      {tab==="catalogue"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          {Object.entries(BRANDS).filter(([k])=>brand==="all"||brand===k).map(([bk,br])=>{
            const items=prods.filter(p=>p.b===bk);if(!items.length)return null;
            return(
              <div key={bk} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"8px 12px",background:br.light,borderRadius:10,border:`1px solid ${br.color}22`}}>
                  <span style={{fontSize:20}}>{br.emoji}</span>
                  <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:br.color,fontSize:14}}>{br.label}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {items.map(p=>{
                    const sq=stocks[p.id]||0,iq=panier[p.id]||0,rest=sq-iq;
                    const epuise=rest<=0,faible=sq>0&&sq<=STOCK_MIN[p.id];
                    return(
                      <div key={p.id} style={{background:"#fff",borderRadius:16,padding:13,border:`1.5px solid ${iq>0?br.color:C.border}`,opacity:epuise?.55:1,position:"relative",boxShadow:iq>0?`0 4px 16px ${br.color}22`:"none"}}>
                        {iq>0&&<div style={{position:"absolute",top:-9,right:-9,background:br.color,color:"#0C1A2E",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>{iq}</div>}
                        <div style={{width:40,height:40,borderRadius:10,background:br.color+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:8}}>{p.icon}</div>
                        <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:13,marginBottom:1,color:"#000"}}>{lang==="fr"?p.nFr:p.nEn}</div>
                        <div style={{fontSize:11,color:"#111",marginBottom:2}}>{p.d}</div>
                        <div style={{fontSize:10,color:br.color,marginBottom:6}}>{lang==="fr"?p.noteF:p.noteE}</div>
                        {/* Stock bar */}
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:10,color:epuise?"#CC0000":faible?"#FF6B00":"#16A34A",marginBottom:3}}>
                            {epuise?t.rupture:faible?`⚠️ ${rest} ${p.u}${rest>1?"s":""}`:` ${rest} ${p.u}${rest>1?"s":""}`}
                          </div>
                          <div style={{background:C.border,borderRadius:3,height:4}}>
                            <div style={{background:epuise?C.red:faible?C.relais:br.color,height:4,borderRadius:3,width:`${Math.max(0,(rest/Math.max(1,sq))*100)}%`,transition:"width .3s"}}/>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,color:"#111",fontSize:18,marginBottom:2}}>π {(p.pv/oracle.rate).toFixed(3)}</div>
                        <div style={{fontSize:11,color:"#111",marginBottom:8}}>≈ {fmt(p.pv)} FCFA</div>
                        {epuise?(
                          <div style={{textAlign:"center",padding:"8px",background:C.red+"18",borderRadius:10,fontSize:11,fontWeight:700,color:"#CC0000"}}>{t.rupture}</div>
                        ):iq===0?(
                          <button onClick={()=>add(p.id)} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${br.color}CC,${br.color})`,border:"none",borderRadius:10,color:"#0C1A2E",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>{t.ajouter}</button>
                        ):(
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button onClick={()=>rem(p.id)} style={{width:30,height:30,borderRadius:"50%",background:C.card2,border:"none",fontWeight:900,fontSize:16,cursor:"pointer",color:C.text}}>−</button>
                            <span style={{flex:1,textAlign:"center",fontFamily:"'Poppins',sans-serif",fontWeight:900,fontSize:16,color:br.color}}>{iq}</span>
                            <button onClick={()=>add(p.id)} style={{width:30,height:30,borderRadius:"50%",background:br.color,border:"none",fontWeight:900,fontSize:16,cursor:"pointer",color:"#0C1A2E"}}>+</button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Panier */}
      {tab==="panier"&&(
        <div style={{padding:"16px",paddingBottom:100}}>
          {panierCount===0?(
            <div style={{textAlign:"center",padding:"60px 0",color:C.muted}}>
              <div style={{fontSize:52,marginBottom:12}}>🛒</div>
              <div style={{fontSize:15,fontWeight:700}}>{lang==="fr"?"Votre panier est vide":"Your cart is empty"}</div>
              <button onClick={()=>setTab("catalogue")} style={{marginTop:14,padding:"10px 24px",background:COL,border:"none",borderRadius:12,color:"#0C1A2E",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'Poppins',sans-serif"}}>{lang==="fr"?"Voir le catalogue":"View catalogue"}</button>
            </div>
          ):(
            <>
              {Object.entries(panier).map(([id,qty])=>{
                const p=CATALOGUE.find(x=>x.id===id);const br=BRANDS[p.b];
                return(
                  <div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{width:36,height:36,borderRadius:10,background:br.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{br.label} {lang==="fr"?p.nFr:p.nEn}</div>
                      <div style={{fontSize:11,color:C.muted}}>{p.d} · {qty} {p.u}{qty>1?"s":""}</div>
                      <div style={{fontWeight:800,color:br.color,fontSize:13}}>{fmt(p.pv*qty)} F</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button onClick={()=>rem(id)} style={{width:27,height:27,borderRadius:"50%",background:C.card2,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,color:C.text}}>−</button>
                      <span style={{fontWeight:800,minWidth:16,textAlign:"center"}}>{qty}</span>
                      <button onClick={()=>add(id)} style={{width:27,height:27,borderRadius:"50%",background:br.color,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,color:"#0C1A2E"}}>+</button>
                    </div>
                  </div>
                );
              })}
              <div style={{background:C.card,borderRadius:16,padding:"14px 16px",margin:"16px 0"}}>
                {[{l:t.sousTotal,v:`${fmt(subtotal)} FCFA`},{l:t.fraisReseau,v:"π 0,010"}].map(r=>(
                  <div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}><span style={{color:C.sub}}>{r.l}</span><span style={{fontWeight:700}}>{r.v}</span></div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                  <span>{t.total}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:900,color:COL}}>π {totalPi}</div>
                    <div style={{fontSize:11,color:C.muted}}>≈ {fmt(subtotal)} FCFA</div>
                  </div>
                </div>
                <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:8}}>
                  {t.oracleSource} · {t.majLe} {new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB")} {t.a} {new Date().toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB")}
                  {oracle.modeManuel&&<span style={{color:C.relais}}> · ⚠️ {lang==="fr"?"Taux fixe":"Fixed rate"}</span>}
                </div>
              </div>
              {payStatus==="loading"?(
                <div style={{textAlign:"center",padding:"16px",background:C.card,borderRadius:14}}>
                  <div style={{fontSize:28,marginBottom:8}}>⏳</div>
                  <div style={{color:C.sub}}>{t.paiementCours}</div>
                </div>
              ):payStatus==="success"?(
                <div style={{textAlign:"center",padding:"20px",background:C.green+"15",borderRadius:14,border:`1px solid ${C.green}33`}}>
                  <div style={{fontSize:40,marginBottom:8}}>🎉</div>
                  <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,color:C.green,fontSize:18}}>{t.paiementOk}</div>
                </div>
              ):(
                <Btn size="lg" color={COL} onClick={payerAvecPi}>💧 {t.payer} · π {totalPi}</Btn>
              )}
            </>
          )}
        </div>
      )}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab} color={COL}/>
      {showAcad&&<AcademiePi lang={lang} onClose={()=>setShowAcad(false)}/>}
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LIVREUR APP
// ════════════════════════════════════════════════════════════════════════════
function LivreurApp({oracle,lang,setLang,onBack}){
  const[tab,setTab]=useState("accueil");
  const[actif,setActif]=useState(true);
  const[inscription,setInscription]=useState(false);
  const{toast,show}=useToast();
  const t=T[lang];const COL=C.livreur;

  const[courses,setCourses]=useState([
    {id:"MVE-A1B2",client:"Ama Dufour",adresse:"Bè-Kpota, Rue des Cocotiers N°12",statut:"en_attente",relais:"Dépôt Segbé",distRelaisKm:0.8,distClientKm:3.2,vehicule:"Moto Express",gainPi:0.988,livraisonFcfa:1000,heure:"09:14"},
    {id:"MVE-E5F6",client:"Yao Koffi",adresse:"Agbalépédogan, Av. du Bénin N°8",statut:"en_cours",relais:"Dépôt Segbé",distRelaisKm:0.8,distClientKm:5.8,vehicule:"Moto Express",gainPi:0.988,livraisonFcfa:1000,heure:"09:02"},
    {id:"MVE-C9D0",client:"Kwame Agbeko",adresse:"Hanoukopé N°7",statut:"livre",relais:"Dépôt Segbé",distRelaisKm:0.8,distClientKm:4.3,vehicule:"Moto Express",gainPi:0.988,livraisonFcfa:1000,heure:"07:58"},
  ]);

  const accepter=(id)=>{setCourses(p=>p.map(c=>c.id===id?{...c,statut:"en_cours"}:c));show(lang==="fr"?"✅ Course acceptée — En route !":"✅ Delivery accepted — En route!",COL);};
  const livrer=(id)=>{setCourses(p=>p.map(c=>c.id===id?{...c,statut:"livre"}:c));show(lang==="fr"?"🎉 Livraison confirmée !":"🎉 Delivery confirmed!",C.green);};

  const enCours=courses.find(c=>c.statut==="en_cours");
  const attentes=courses.filter(c=>c.statut==="en_attente");
  const livrees=courses.filter(c=>c.statut==="livre");
  const gains=courses.filter(c=>c.statut!=="en_attente").reduce((s,c)=>s+c.gainPi,0);

  const SC=(s)=>({en_attente:{l:lang==="fr"?"En attente":"Pending",co:C.relais,i:"⏳"},en_cours:{l:lang==="fr"?"En cours":"In progress",co:COL,i:"🏍️"},livre:{l:lang==="fr"?"Livré":"Delivered",co:C.green,i:"✅"}}[s]||{});
  const TABS=[{id:"accueil",icon:"🏠",label:lang==="fr"?"Accueil":"Home"},{id:"courses",icon:"📦",label:t.commandes,badge:attentes.length},{id:"gains",icon:"💰",label:t.gains}];

  if(inscription)return<InscriptionLivreur lang={lang} onSubmit={(f)=>{show(lang==="fr"?"✅ Candidature envoyée !":"✅ Application sent!",C.green);setInscription(false);}} onBack={()=>setInscription(false)}/>;

  return(
    <AppWrap>
      <Toast data={toast}/>
      <div style={{background:"linear-gradient(160deg,#1A0900,#2D1200)",padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:17,fontWeight:900}}>🏍️ {lang==="fr"?"Espace Livreur":"Driver Space"}</div>
            <div style={{fontSize:10,color:C.sub}}>Kofi Mensah · {lang==="fr"?"Dépôt Segbé":"Segbé Depot"}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div onClick={()=>setActif(a=>!a)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:actif?C.green+"22":C.red+"22",border:`1px solid ${actif?C.green:C.red}44`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:actif?C.green:C.red,animation:actif?"pulse 2s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:700,color:actif?C.green:C.red}}>{actif?(lang==="fr"?"Actif":"Active"):(lang==="fr"?"Hors ligne":"Offline")}</span>
            </div>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:16,padding:"4px 10px",color:"#0C1A2E",fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.lang}</button>
            <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
          </div>
        </div>
      </div>

      {tab==="accueil"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:18}}>
            {[{i:"📦",l:lang==="fr"?"Livrées":"Delivered",v:livrees.length,col:C.green},{i:"⏳",l:lang==="fr"?"En attente":"Pending",v:attentes.length,col:C.relais},{i:"💰",l:"Gains π",v:`π${fmtPi(gains)}`,col:COL}].map(k=>(
              <div key={k.l} style={{background:C.card,borderRadius:14,padding:"12px 10px",textAlign:"center",border:`1px solid ${k.col}22`}}>
                <div style={{fontSize:18}}>{k.i}</div>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:900,color:k.col,marginTop:4}}>{k.v}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
          {enCours&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:COL,fontWeight:800,letterSpacing:1,marginBottom:8}}>🏍️ {t.courseEnCours.toUpperCase()}</div>
              <div style={{background:C.card,borderRadius:16,padding:16,border:`2px solid ${COL}`,boxShadow:`0 0 20px ${COL}18`}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,fontSize:15,marginBottom:4}}>{enCours.client}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:6}}>📍 {enCours.adresse}</div>
                {/* Deux distances */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div style={{background:C.card2,borderRadius:10,padding:"8px 12px"}}>
                    <div style={{fontSize:9,color:COL,fontWeight:800}}>📦 {lang==="fr"?"DÉPÔT → TOI":"DEPOT → YOU"}</div>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,fontSize:18,color:COL}}>{enCours.distRelaisKm} km</div>
                  </div>
                  <div style={{background:C.card2,borderRadius:10,padding:"8px 12px"}}>
                    <div style={{fontSize:9,color:C.sub,fontWeight:800}}>🏁 {lang==="fr"?"DÉPÔT → CLIENT":"DEPOT → CLIENT"}</div>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,fontSize:18,color:C.text}}>{enCours.distClientKm} km</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(enCours.adresse)}`,"_blank")} style={{flex:1,padding:"11px",background:"#003A5C",border:`1px solid ${C.admin}33`,borderRadius:10,color:C.admin,fontWeight:700,cursor:"pointer",fontSize:12}}>🗺️ Maps</button>
                  <button onClick={()=>livrer(enCours.id)} style={{flex:2,padding:"11px",background:C.green,border:"none",borderRadius:10,color:"#0C1A2E",fontWeight:800,cursor:"pointer",fontSize:13,fontFamily:"'Poppins',sans-serif"}}>{t.confirmerLiv}</button>
                </div>
              </div>
            </div>
          )}
          {attentes.map(c=>(
            <div key={c.id} style={{background:C.card,borderRadius:16,padding:16,marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div><div style={{fontSize:10,color:C.muted}}>{c.heure} · {c.relais}</div></div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:C.relais+"22",color:C.relais}}>⏳ {lang==="fr"?"En attente":"Pending"}</span>
              </div>
              <div style={{fontWeight:700,marginBottom:4}}>{c.client}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>📍 {c.adresse}</div>
              <div style={{background:C.card2,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:lang==="fr"?"Dépôt→toi":"Depot→you",v:`${c.distRelaisKm} km`,col:COL},{l:lang==="fr"?"Dépôt→client":"Depot→client",v:`${c.distClientKm} km`,col:C.sub},{l:lang==="fr"?"Ton gain":"Your gain",v:`π${fmtPi(c.gainPi)}`,col:COL}].map(m=>(
                  <div key={m.l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:900,color:m.col}}>{m.v}</div>
                    <div style={{fontSize:9,color:C.muted}}>{m.l}</div>
                  </div>
                ))}
              </div>
              <Btn color={COL} onClick={()=>accepter(c.id)}>{t.accepter}</Btn>
            </div>
          ))}
          {!enCours&&attentes.length===0&&(
            <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>
              <div style={{fontSize:48,marginBottom:12}}>🏍️</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>{lang==="fr"?"Aucune course pour le moment":"No deliveries at the moment"}</div>
              <div style={{fontSize:12,marginBottom:16}}>{lang==="fr"?"Reste actif, les commandes arrivent bientôt !":"Stay active, orders are coming soon!"}</div>
              <button onClick={()=>setInscription(true)} style={{padding:"10px 20px",background:COL+"22",border:`1px solid ${COL}44`,borderRadius:12,color:COL,fontWeight:700,cursor:"pointer",fontSize:12}}>
                {lang==="fr"?"📝 Modifier mon profil":"📝 Edit my profile"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab==="courses"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          {courses.map(c=>{const sc=SC(c.statut);return(
            <div key={c.id} style={{background:C.card,borderRadius:16,padding:16,marginBottom:10,border:`1.5px solid ${c.statut==="en_cours"?COL:C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div><div style={{fontSize:10,color:C.muted}}>{c.heure}</div></div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:`${sc.co}22`,color:sc.co}}>{sc.i} {sc.l}</span>
              </div>
              <div style={{fontWeight:700,marginBottom:3}}>{c.client}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📍 {c.adresse}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:c.statut==="livre"?0:10}}>
                {[{l:lang==="fr"?"Dépôt→toi":"Depot→you",v:`${c.distRelaisKm}km`},{l:lang==="fr"?"Dépôt→client":"Depot→client",v:`${c.distClientKm}km`},{l:"Gain π",v:`π${fmtPi(c.gainPi)}`}].map(m=>(
                  <div key={m.l} style={{background:C.card2,borderRadius:8,padding:"8px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:12,fontWeight:800,color:COL}}>{m.v}</div>
                    <div style={{fontSize:9,color:C.muted}}>{m.l}</div>
                  </div>
                ))}
              </div>
              {c.statut==="en_attente"&&<Btn color={COL} onClick={()=>accepter(c.id)}>{t.accepter}</Btn>}
              {c.statut==="en_cours"&&<Btn color={C.green} onClick={()=>livrer(c.id)}>{t.confirmerLiv}</Btn>}
            </div>
          );})}
        </div>
      )}

      {tab==="gains"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{background:"linear-gradient(135deg,#1A0900,#2D1200)",borderRadius:20,padding:"22px 20px",marginBottom:16,border:`1px solid ${COL}44`}}>
            <div style={{fontSize:10,color:COL,fontWeight:800,marginBottom:8}}>💰 {lang==="fr"?"GAINS AUJOURD'HUI":"TODAY'S EARNINGS"}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:42,fontWeight:900,color:COL}}>π {fmtPi(gains)}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>≈ {fmt(gains*oracle.rate)} FCFA · {lang==="fr"?"Oracle CoinGecko":"CoinGecko Oracle"}</div>
          </div>
          {courses.filter(c=>c.statut!=="en_attente").map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:8,background:C.card,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:12}}>{c.id}</div><div style={{fontSize:11,color:C.muted}}>{c.client} · {c.heure}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:15,fontWeight:900,color:c.statut==="livre"?C.green:COL}}>π{fmtPi(c.gainPi)}</div>
                <div style={{fontSize:9,color:C.muted}}>{c.statut==="livre"?"✅":"🏍️"}</div>
              </div>
            </div>
          ))}
          <div style={{background:C.card,borderRadius:14,padding:"14px 16px",marginTop:10,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:8}}>{lang==="fr"?"FRAIS DE LIVRAISON — TARIFS ZONE A (≤15km)":"DELIVERY FEES — ZONE A RATES (≤15km)"}</div>
            {FLOTTE.slice(0,4).map(v=>(
              <div key={v.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"6px 0",borderTop:`1px solid ${C.border}`}}>
                <span style={{color:C.sub}}>{v.icon} {v.label}</span>
                <span style={{fontWeight:700,color:COL}}>{fmt(v.tarifA)} F</span>
              </div>
            ))}
            <div style={{fontSize:11,color:C.muted,marginTop:8}}>Zone B (&gt;15km) : +75 FCFA/km</div>
          </div>
        </div>
      )}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab} color={COL}/>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// RELAIS APP
// ════════════════════════════════════════════════════════════════════════════
function RelaisApp({oracle,stocks,update,lang,setLang,onBack}){
  const[tab,setTab]=useState("dashboard");
  const[ouvert,setOuvert]=useState(true);
  const[editId,setEditId]=useState(null);
  const[editQty,setEditQty]=useState("");
  const[regime,setRegime]=useState(null);
  const[showOnboarding,setShowOnboarding]=useState(true);
  const[showCharte,setShowCharte]=useState(false);
  const{toast,show}=useToast();
  const t=T[lang];const COL=C.relais;

  const[cmds,setCmds]=useState([
    {id:"MVE-A1B2",client:"Ama Dufour",adresse:"Bè-Kpota N°12",prods:[{n:"Voltic Pack 0,5L×6",qty:2,pv:1250,pa:850}],statut:"nouvelle",distKm:3.2,livraison:1000},
    {id:"MVE-E5F6",client:"Yao Koffi",adresse:"Agbalépédogan N°8",prods:[{n:"Voltic Carton 1,5L×12",qty:1,pv:3800,pa:3500}],statut:"assignee",distKm:5.8,livraison:1000,livreur:"Kofi Mensah"},
    {id:"MVE-C9D0",client:"Kwame Agbeko",adresse:"Hanoukopé N°7",prods:[{n:"Vitale Carton 0,5L×24",qty:1,pv:3700,pa:3300}],statut:"livree",distKm:4.3,livraison:1000},
  ]);
  const marquerLivree=(id)=>{setCmds(p=>p.map(c=>c.id===id?{...c,statut:"livree"}:c));show(lang==="fr"?"✅ Commande livrée !":"✅ Order delivered!",C.green);};

  const calcSplit=(cmd)=>{
    const pv=cmd.prods.reduce((s,p)=>s+p.pv*p.qty,0);
    const pa=cmd.prods.reduce((s,p)=>s+p.pa*p.qty,0);
    const marge=pv-pa;
    return{relais:pa+marge*.9,livreur:cmd.livraison*.9,admin:marge*.1+cmd.livraison*.1,total:pv+cmd.livraison};
  };

  const vides=CATALOGUE.filter(p=>stocks[p.id]===0).length;
  const alertes=CATALOGUE.filter(p=>stocks[p.id]>0&&stocks[p.id]<STOCK_MIN[p.id]).length;
  const saveStock=(id)=>{const q=Math.max(0,parseInt(editQty)||0);update(id,q);setEditId(null);if(q===0)show(lang==="fr"?"⚠️ Rupture — Produit désactivé":"⚠️ Out of stock — Product disabled",COL);else show(lang==="fr"?"✅ Stock mis à jour":"✅ Stock updated");};

  const TABS=[
    {id:"dashboard",icon:"📊",label:t.dashboard},
    {id:"commandes",icon:"📦",label:t.commandes,badge:cmds.filter(c=>c.statut==="nouvelle").length},
    {id:"stocks",   icon:"🏪",label:t.stocks,  badge:vides+alertes},
    {id:"livreurs", icon:"🏍️",label:t.livreurs},
    {id:"fiscal",   icon:"💼",label:t.fiscal},
  ];

  // Onboarding fiscal au 1er lancement
  if(showOnboarding&&!regime)return(
    <AppWrap>
      <div style={{background:"linear-gradient(160deg,#1A0E00,#2D1800)",padding:"28px 20px 24px",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:12}}>💼</div>
        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>{lang==="fr"?"Choisissez votre régime fiscal":"Choose your tax regime"}</div>
        <div style={{fontSize:13,color:C.sub}}>{lang==="fr"?"Ce choix définit votre gestion comptable dans l'app":"This defines your accounting management in the app"}</div>
      </div>
      <div style={{padding:"20px 18px"}}>
        {Object.values(REGIMES).map(r=>(
          <div key={r.id} onClick={()=>setRegime(r.id)} style={{padding:"15px 16px",borderRadius:14,cursor:"pointer",marginBottom:10,background:regime===r.id?r.color+"18":C.card,border:`2px solid ${regime===r.id?r.color:C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:r.color+"22",border:`2px solid ${r.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:r.color}}>{r.num}</div>
                <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:regime===r.id?r.color:C.text,fontSize:14}}>{r.label}</span>
              </div>
              {regime===r.id&&<span style={{color:r.color}}>✓</span>}
            </div>
            <div style={{fontSize:12,color:C.sub,marginLeft:34,marginBottom:6}}>{r.desc}</div>
            <div style={{display:"flex",gap:6,marginLeft:34}}>
              {[{l:"NIF",ok:r.nif},{l:"TVA",ok:r.tva},{l:"IMF 1% ✓",ok:r.imf,force:true}].map(b=>(
                <span key={b.l} style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:8,background:(b.ok||b.force)?r.color+"22":"rgba(255,255,255,.05)",color:(b.ok||b.force)?r.color:C.muted}}>{b.l}</span>
              ))}
            </div>
            {regime===r.id&&<div style={{marginTop:8,fontSize:12,color:r.color,marginLeft:34}}>💡 {r.conseil}</div>}
          </div>
        ))}
        <Btn size="lg" color={COL} disabled={!regime} onClick={()=>{if(regime){setShowOnboarding(false);}}}>
          {regime?(lang==="fr"?"[ J'ACCEPTE ET JE LANCE MA BULLE ]":"[ I ACCEPT AND LAUNCH MY BUBBLE ]"):(lang==="fr"?"Sélectionnez votre régime":"Select your regime")}
        </Btn>
      </div>
    </AppWrap>
  );

  const regimeData=REGIMES[regime]||REGIMES.ets;
  const caTotal=cmds.filter(c=>c.statut==="livree").reduce((s,c)=>s+c.prods.reduce((ss,p)=>ss+p.pv*p.qty,0)+c.livraison,0);

  return(
    <AppWrap>
      <Toast data={toast}/>
      <div style={{background:"linear-gradient(160deg,#1A0E00,#2D1800)",padding:"16px 18px 12px",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:17,fontWeight:900}}>🏪 {lang==="fr"?"Dépôt Principal · Segbé":"Main Depot · Segbé"}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,background:regimeData.color+"22",color:regimeData.color}}>{regimeData.num}. {regimeData.label}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div onClick={()=>setOuvert(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:ouvert?C.green+"22":C.red+"22",border:`1px solid ${ouvert?C.green:C.red}44`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:ouvert?C.green:C.red,animation:ouvert?"pulse 2s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:700,color:ouvert?C.green:C.red}}>{ouvert?(lang==="fr"?"Ouvert":"Open"):(lang==="fr"?"Fermé":"Closed")}</span>
            </div>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:16,padding:"4px 10px",color:"#0C1A2E",fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.lang}</button>
            <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
          </div>
        </div>
      </div>

      {tab==="dashboard"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{background:C.card,borderRadius:16,padding:"14px 16px",marginBottom:14,border:`1px solid ${COL}44`}}>
            <div style={{fontSize:10,color:COL,fontWeight:800,marginBottom:6}}>💹 {lang==="fr"?"ORACLE COINGECKO":"COINGECKO ORACLE"}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:26,fontWeight:900,color:COL}}>{fmt(oracle.rate)} FCFA</div>
            <div style={{fontSize:12,color:C.muted}}>{lang==="fr"?"pour 1 π":"for 1 π"} · {oracle.status==="live"?"🟢 Live":"🟡 Fallback"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[{i:"🆕",l:lang==="fr"?"Nouvelles":"New",v:cmds.filter(c=>c.statut==="nouvelle").length,col:COL},{i:"✅",l:lang==="fr"?"Livrées":"Delivered",v:cmds.filter(c=>c.statut==="livree").length,col:C.green},{i:"⚠️",l:lang==="fr"?"Alertes":"Alerts",v:alertes,col:C.red},{i:"❌",l:lang==="fr"?"Ruptures":"Out of stock",v:vides,col:C.red}].map(k=>(
              <div key={k.l} style={{background:C.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${k.col}22`}}>
                <div style={{fontSize:18}}>{k.i}</div>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,color:k.col}}>{k.v}</div>
                <div style={{fontSize:11,color:C.muted}}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Commandes nouvelles à assigner */}
          {cmds.filter(c=>c.statut==="nouvelle").map(c=>{const sp=calcSplit(c);return(
            <div key={c.id} style={{background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${COL}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontWeight:700}}>{c.client}</div><div style={{fontSize:11,color:C.muted}}>{c.id} · {c.distKm} km {lang==="fr"?"du dépôt":"from depot"}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,color:COL}}>{fmt(sp.total)} F</div><div style={{fontSize:10,color:C.muted}}>π{fmtPi(sp.total/oracle.rate)}</div></div>
              </div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📦 {c.prods.map(p=>`${p.n} ×${p.qty}`).join(", ")}</div>
              <Btn color={COL} onClick={()=>show(lang==="fr"?"🏍️ Livreur assigné":"🏍️ Driver assigned",COL)}>{lang==="fr"?"Assigner un livreur":"Assign a driver"}</Btn>
            </div>
          );})}
        </div>
      )}

      {tab==="commandes"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          {cmds.map(c=>{
            const sp=calcSplit(c);
            const sc={nouvelle:{l:lang==="fr"?"Nouvelle":"New",co:COL,i:"🆕"},assignee:{l:lang==="fr"?"Assignée":"Assigned",co:C.livreur,i:"🏍️"},livree:{l:lang==="fr"?"Livrée":"Delivered",co:C.green,i:"✅"}}[c.statut];
            return(
              <div key={c.id} style={{background:C.card,borderRadius:16,padding:16,marginBottom:10,border:`1px solid ${sc.co}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div></div>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:`${sc.co}22`,color:sc.co}}>{sc.i} {sc.l}</span>
                </div>
                <div style={{fontWeight:700,marginBottom:4}}>{c.client}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📍 {c.adresse}</div>
                {/* Distance dépôt→client */}
                <div style={{background:C.card2,borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:9,color:COL,fontWeight:700}}>📦 {lang==="fr"?"DÉPÔT → CLIENT":"DEPOT → CLIENT"}</div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:14}}>{c.distKm} km</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.muted}}>{t.fraisLivraison}</div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,color:COL}}>{fmt(c.livraison)} F</div></div>
                </div>
                {/* Split */}
                <div style={{background:C.card2,borderRadius:10,padding:"10px 12px",marginBottom:10}}>
                  <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:6}}>⚡ SPLIT-PAYMENT</div>
                  {[{l:lang==="fr"?"Relais (Achat+90% Marge)":"Relay (Cost+90% Margin)",v:sp.relais,col:COL},{l:lang==="fr"?"Livreur (90% Livraison)":"Driver (90% Delivery)",v:sp.livreur,col:C.livreur},{l:lang==="fr"?"Admin (10% Marge+Livraison)":"Admin (10% Margin+Delivery)",v:sp.admin,col:C.admin}].map(r=>(
                    <div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"3px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{color:C.muted}}>{r.l}</span>
                      <span style={{fontWeight:700,color:r.col}}>{fmt(r.v)} F · π{fmtPi(r.v/oracle.rate)}</span>
                    </div>
                  ))}
                </div>
                {c.livreur&&<div style={{fontSize:12,color:C.livreur,marginBottom:8}}>🏍️ {c.livreur}</div>}
                {c.statut==="assignee"&&<Btn color={C.green} variant="outline" onClick={()=>marquerLivree(c.id)}>{lang==="fr"?"✅ Confirmer livraison":"✅ Confirm delivery"}</Btn>}
              </div>
            );
          })}
        </div>
      )}

      {tab==="stocks"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:12}}>⏰ {lang==="fr"?"Mise à jour obligatoire à 8h00 chaque matin":"Mandatory update at 8:00 AM every morning"}</div>
          {Object.entries(BRANDS).map(([bk,br])=>{
            const ps=CATALOGUE.filter(p=>p.b===bk);
            return(
              <div key={bk} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,padding:"8px 12px",background:br.light,borderRadius:10}}>
                  <span style={{fontSize:18}}>{br.emoji}</span>
                  <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:br.color,fontSize:14}}>{br.label}</span>
                </div>
                {ps.map(p=>{
                  const sq=stocks[p.id]||0,mn=STOCK_MIN[p.id]||5;
                  const st=sq===0?"rupture":sq<mn?"alerte":"ok";
                  const sc={rupture:C.red,alerte:C.relais,ok:C.green}[st];
                  const isE=editId===p.id;
                  return(
                    <div key={p.id} style={{background:C.card,borderRadius:14,padding:"13px 16px",marginBottom:8,border:`1.5px solid ${sq===0?C.red:sq<mn?C.relais:C.border}`,cursor:"pointer"}}
                      onClick={()=>{if(!isE){setEditId(p.id);setEditQty(String(sq));}}}>
                      {isE?(
                        <div onClick={e=>e.stopPropagation()}>
                          <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,marginBottom:6}}>{p.icon} {lang==="fr"?p.nFr:p.nEn} {p.d}</div>
                          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{lang==="fr"?"Unité":"Unit"} : <strong>{p.u}</strong> · {lang==="fr"?"Seuil alerte":"Alert threshold"} : {mn} {p.u}s</div>
                          <input type="number" min="0" value={editQty} onChange={e=>setEditQty(e.target.value)}
                            style={{width:"100%",padding:"12px",background:C.card2,border:`2px solid ${COL}`,borderRadius:10,color:C.text,fontSize:22,fontWeight:900,fontFamily:"'Poppins',sans-serif",outline:"none",textAlign:"center",marginBottom:10}} autoFocus/>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>setEditId(null)} style={{flex:1,padding:11,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,cursor:"pointer"}}>{t.annuler}</button>
                            <button onClick={()=>saveStock(p.id)} style={{flex:2,padding:11,background:C.grelais,border:"none",borderRadius:10,color:"#0B0804",fontWeight:900,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>{t.enregistrer}</button>
                          </div>
                        </div>
                      ):(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.icon} {lang==="fr"?p.nFr:p.nEn} {p.d}</div>
                            <div style={{background:C.border,borderRadius:3,height:5,marginBottom:4,width:"80%"}}>
                              <div style={{background:sc,height:5,borderRadius:3,width:`${Math.min(100,(sq/(mn*3))*100)}%`,transition:"width .4s"}}/>
                            </div>
                            <div style={{fontSize:10,color:sc}}>{st==="rupture"?(lang==="fr"?"RUPTURE":"OUT OF STOCK"):st==="alerte"?`⚠️ ${sq}/${mn} min`:`✓ ${sq} ${p.u}${sq>1?"s":""}`}</div>
                          </div>
                          <div style={{textAlign:"right",marginLeft:12}}>
                            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:900,color:sc}}>{sq}</div>
                            <div style={{fontSize:9,color:C.muted}}>✏️ {lang==="fr"?"modifier":"edit"}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {tab==="livreurs"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:900,marginBottom:16}}>{lang==="fr"?"Mes Livreurs":"My Drivers"}</div>
          {[{id:"L1",nom:"Kofi Mensah",vehicule:"Moto Express",icon:"🏍️",statut:"actif",kyb:true,equip:true,livraisons:47,gains:51.24,quartier:"Segbé",distDepot:"0.8"},
            {id:"L2",nom:"Edem Adzaho",vehicule:"Moto Express",icon:"🏍️",statut:"actif",kyb:true,equip:true,livraisons:31,gains:33.18,quartier:"Adidogomé",distDepot:"1.2"},
            {id:"L3",nom:"Sena Wutor",vehicule:"Petit Tricycle",icon:"🛺",statut:"attente",kyb:false,equip:false,livraisons:0,gains:0,quartier:"Sagbado",distDepot:"2.1"},
          ].map(l=>{
            const sc={actif:{c:C.green,l:lang==="fr"?"Actif":"Active"},attente:{c:COL,l:lang==="fr"?"En attente":"Pending"},inactif:{c:C.muted,l:lang==="fr"?"Inactif":"Inactive"}}[l.statut];
            return(
              <div key={l.id} style={{background:C.card,borderRadius:16,padding:"14px 16px",marginBottom:10,border:`1.5px solid ${l.statut==="attente"?COL+"55":C.border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:l.statut==="attente"?12:0}}>
                  <span style={{fontSize:24}}>{l.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14}}>{l.nom}</div>
                    <div style={{fontSize:11,color:C.muted}}>{l.quartier} · {l.vehicule}</div>
                    <div style={{fontSize:11,color:COL}}>📦 {l.distDepot} km {lang==="fr"?"du dépôt":"from depot"}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:`${sc.c}22`,color:sc.c}}>{sc.l}</span>
                    {l.statut==="actif"&&<div style={{fontFamily:"'Poppins',sans-serif",fontSize:13,fontWeight:900,color:COL,marginTop:4}}>π{fmtPi(l.gains)}</div>}
                  </div>
                </div>
                {l.statut==="attente"&&(
                  <div>
                    <div style={{display:"flex",gap:6,marginBottom:10}}>
                      {[{l:"KYB Pi",ok:l.kyb},{l:lang==="fr"?"Équipements":"Equipment",ok:l.equip}].map(e=>(
                        <span key={e.l} style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10,background:e.ok?C.green+"22":C.red+"22",color:e.ok?C.green:C.red}}>{e.ok?"✓":"✗"} {e.l}</span>
                      ))}
                    </div>
                    <Btn color={C.green} onClick={()=>show(lang==="fr"?"✅ Recommandé au Super Admin":"✅ Recommended to Super Admin",C.green)}>
                      {lang==="fr"?"Recommander au Super Admin":"Recommend to Super Admin"}
                    </Btn>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==="fiscal"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          {/* Régime actuel */}
          <div style={{background:regimeData.color+"18",border:`1.5px solid ${regimeData.color}44`,borderRadius:16,padding:"16px 18px",marginBottom:16}}>
            <div style={{fontSize:10,color:regimeData.color,fontWeight:800,marginBottom:4}}>{lang==="fr"?"VOTRE RÉGIME":"YOUR REGIME"}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,color:C.text,marginBottom:4}}>{regimeData.num}. {regimeData.label}</div>
            <div style={{fontSize:12,color:C.sub,marginBottom:10}}>{regimeData.otr}</div>
            {[{l:"NIF",v:regimeData.nif?(lang==="fr"?"Requis":"Required"):(lang==="fr"?"Non requis":"Not required"),c:regimeData.nif?C.green:C.muted},
              {l:"TVA",v:regimeData.tva?"18% activée":(lang==="fr"?"Non applicable":"Not applicable"),c:regimeData.tva?COL:C.muted},
              {l:"IMF",v:`1% du CA — ${lang==="fr"?"Activée pour TOUS":"Active for ALL"}`,c:C.green},
            ].map(r=>(
              <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderTop:`1px solid ${C.border}`,fontSize:12}}>
                <span style={{color:C.muted}}>{r.l}</span><span style={{fontWeight:700,color:r.c}}>{r.v}</span>
              </div>
            ))}
          </div>
          {/* CA & IMF */}
          <div style={{background:C.card,borderRadius:14,padding:"16px",marginBottom:14,border:`1px solid ${COL}44`}}>
            <div style={{fontSize:10,color:COL,fontWeight:800,marginBottom:8}}>📈 {lang==="fr"?"CHIFFRE D'AFFAIRES":"REVENUE"}</div>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:28,fontWeight:900,color:COL}}>{fmt(caTotal)} F</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,padding:"10px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:13}}>{lang==="fr"?"Provision IMF 1%":"IMF 1% provision"}</span>
              <span style={{fontFamily:"'Poppins',sans-serif",fontWeight:900,color:C.green,fontSize:15}}>{fmt(caTotal*.01)} F</span>
            </div>
            {regimeData.seuil&&(
              <div>
                <div style={{background:C.border,borderRadius:4,height:8,marginTop:10}}>
                  <div style={{background:COL,height:8,borderRadius:4,width:`${Math.min(100,(caTotal/regimeData.seuil)*100)}%`,transition:"width .5s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.muted,marginTop:4}}>
                  <span>0</span><span style={{color:COL}}>{Math.round((caTotal/regimeData.seuil)*100)}%</span><span>{fmt(regimeData.seuil)} F</span>
                </div>
                {caTotal>regimeData.seuil*.8&&<div style={{marginTop:8,background:C.red+"11",border:`1px solid ${C.red}33`,borderRadius:10,padding:"8px 12px",fontSize:12,color:C.red,fontWeight:700}}>⚠️ {lang==="fr"?"Seuil de changement de régime imminent !":"Tax regime change threshold imminent!"}</div>}
              </div>
            )}
          </div>
          {/* Tableau 4 régimes */}
          <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:10}}>{lang==="fr"?"TABLEAU DES 4 RÉGIMES OTR TOGO":"4 OTR TOGO TAX REGIMES"}</div>
            {Object.values(REGIMES).map(r=>(
              <div key={r.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:`1px solid ${C.border}`}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:r.color+"22",border:`1.5px solid ${r.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:r.color,flexShrink:0}}>{r.num}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:12,color:C.text}}>{r.label}</div>
                  <div style={{fontSize:10,color:C.muted}}>{r.desc}</div>
                </div>
                <div style={{display:"flex",gap:3}}>
                  {r.tva&&<span style={{fontSize:8,background:COL+"22",color:COL,padding:"1px 5px",borderRadius:4,fontWeight:700}}>TVA</span>}
                  <span style={{fontSize:8,background:C.green+"22",color:C.green,padding:"1px 5px",borderRadius:4,fontWeight:700}}>IMF</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowOnboarding(true)} style={{width:"100%",padding:12,marginTop:14,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,cursor:"pointer",fontSize:12,fontWeight:600}}>
            🔄 {lang==="fr"?"Modifier mon régime fiscal":"Change my tax regime"}
          </button>
        </div>
      )}
      <BottomNav tabs={TABS} active={tab} onSelect={setTab} color={COL}/>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ADMIN APP — Dashboard complet + Oracle + TradingView + Validation
// ════════════════════════════════════════════════════════════════════════════
function AdminApp({oracle,lang,setLang,onBack}){
  const[section,setSection]=useState("dashboard");
  const{toast,show}=useToast();
  const COL=C.admin;

  const CANDIDATS=[
    {id:"C001",nom:"Sena Wutor",vehicule:"Moto + sac isotherme",region:"Grand Lomé",bulle:"Dépôt Segbé",kyb:true,distDepot:"2.1 km",relaisNote:"Bâche vérifiée, engin propre — je recommande.",relaisNom:"Kofi Mensah",immat:"TG-4521-BC",equips:["Sac isotherme ✓","KYB Pi ✓"],alerte:null,photos:true},
    {id:"C002",nom:"Akosua Fiadjoe",vehicule:"Moto + attache (minibâche)",region:"Grand Lomé",bulle:"Mini-Relais Bè",kyb:true,distDepot:"3.4 km",relaisNote:"Minibâche noire présente et vérifiée physiquement.",relaisNom:"Edem Adzaho",immat:"TG-7832-AC",equips:["Minibâche noire ✓","Attaches élastiques ✓","KYB Pi ✓"],alerte:null,photos:true},
    {id:"C003",nom:"Kodjo Bedi",vehicule:"Petit Tricycle Couvert",region:"Kara",bulle:"Hub Kara Nord",kyb:false,distDepot:"4.8 km",relaisNote:"Tricycle en parfait état. KYB Pi en cours de validation.",relaisNom:"Afi Tsati",immat:"TG-2910-TC",equips:["Bâche lourde ✓","KYB Pi ⏳"],alerte:"KYB Pi non complété — validation possible mais risquée",photos:true},
  ];
  const[decisions,setDecisions]=useState({});
  const valider=(id)=>{setDecisions(d=>({...d,[id]:"valide"}));show(lang==="fr"?"✅ Compte activé !":"✅ Account activated!",C.green);};
  const rejeter=(id)=>{setDecisions(d=>({...d,[id]:"rejete"}));show(lang==="fr"?"❌ Candidature rejetée":"❌ Application rejected",C.red);};

  const RELAIS=[
    {n:"Dépôt Segbé (Hub 1)",r:"Golfe 7",ca:18400000,regime:"SARL/RSI",actif:true,piToday:22.4,color:COL},
    {n:"Mini-Relais Bè (Hub 2)",r:"Golfe 1",ca:9500000,regime:"Ets/TPU",actif:true,piToday:11.2,color:C.relais},
    {n:"Point Atakpamé",r:"Plateaux",ca:3100000,regime:"Ets/TPU",actif:true,piToday:5.1,color:C.green},
    {n:"Hub Kara Nord",r:"Kara",ca:920000,regime:"Informel",actif:false,piToday:0,color:C.muted},
    {n:"Hub Savanes",r:"Savanes (Dapaong)",ca:0,regime:"Informel",actif:false,piToday:0,color:C.muted},
  ];

  const totalPi=RELAIS.reduce((s,r)=>s+r.piToday,0);
  const adminPi=totalPi*.10;
  const[modeManuel,setModeManuel]=useState(false);
  const[rateM,setRateM]=useState(String(oracle.rate));

  const NAV=[
    {id:"dashboard",icon:"📊",label:lang==="fr"?"Synthèse":"Overview"},
    {id:"validation",icon:"🛡️",label:lang==="fr"?"Validation":"Validation",badge:CANDIDATS.filter(c=>!decisions[c.id]).length},
    {id:"oracle",icon:"💹",label:"Oracle"},
    {id:"relais",icon:"🌍",label:lang==="fr"?"Réseau":"Network"},
    {id:"prix",icon:"💰",label:lang==="fr"?"Prix":"Prices"},
  ];

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Inter',sans-serif",color:C.text}}>
      <link href={GF} rel="stylesheet"/><style>{GCSS}</style>
      <Toast data={toast}/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        {/* Sidebar */}
        <div style={{width:190,background:C.surf,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"18px 10px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
          <div style={{marginBottom:20,padding:"0 8px"}}>
            <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:900,color:COL}}>💧 Multivers'Eau</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>Super Admin</div>
          </div>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSection(n.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:10,background:section===n.id?COL+"18":"transparent",border:section===n.id?`1px solid ${COL}33`:"1px solid transparent",color:section===n.id?COL:C.muted,fontWeight:section===n.id?700:500,fontSize:12,cursor:"pointer",marginBottom:4,textAlign:"left",position:"relative"}}>
              <span>{n.icon}</span>{n.label}
              {(n.badge||0)>0&&<span style={{marginLeft:"auto",background:C.red,color:"#0C1A2E",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{n.badge}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto"}}>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{width:"100%",padding:"7px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:11,cursor:"pointer",marginBottom:8}}>{lang==="fr"?"🇬🇧 English":"🇫🇷 Français"}</button>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",border:`1px solid ${COL}22`}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>ORACLE · COINGECKO</div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:900,color:COL}}>{fmt(oracle.rate)} F</div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:oracle.status==="live"?C.green:C.relais,animation:oracle.status==="live"?"pulse 2s infinite":"none"}}/>
                <span style={{fontSize:8,color:C.muted}}>{oracle.status==="live"?"Live":"Fallback"}</span>
              </div>
            </div>
            <button onClick={onBack} style={{width:"100%",padding:"7px",marginTop:8,background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:11,cursor:"pointer"}}>{lang==="fr"?"← Retour":"← Back"}</button>
          </div>
        </div>

        {/* Main */}
        <div style={{flex:1,padding:"22px",overflowY:"auto",minWidth:0}}>

          {section==="dashboard"&&(
            <div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>{lang==="fr"?"Vue d'ensemble":"Overview"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[{i:"📦",l:lang==="fr"?"Commandes/jour":"Orders/day",v:"42",col:COL},{i:"💧",l:"Pi collecté",v:`π${fmtPi(totalPi)}`,col:COL},{i:"💰",l:lang==="fr"?"Commission Admin":"Admin commission",v:`π${fmtPi(adminPi)}`,col:C.relais},{i:"🌍",l:lang==="fr"?"Relais actifs":"Active relays",v:`${RELAIS.filter(r=>r.actif).length}/${RELAIS.length}`,col:C.green}].map(k=>(
                  <div key={k.l} style={{background:C.card,borderRadius:14,padding:"16px 18px",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at 100% 0%,${k.col}18,transparent 70%)`}}/>
                    <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{k.i} {k.l}</div>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:22,fontWeight:900,color:k.col}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {/* Split du jour */}
              <div style={{background:C.card,borderRadius:16,padding:"18px 20px",marginBottom:18,border:`1px solid ${C.border}`}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:800,marginBottom:14}}>⚡ {lang==="fr"?"Répartition Split-Payment":"Split-Payment Distribution"}</div>
                {[{l:lang==="fr"?"Relais (Achat + 90% Marge)":"Relay (Cost + 90% Margin)",v:`π${fmtPi(totalPi*.80)}`,pct:80,col:C.relais},
                  {l:lang==="fr"?"Livreurs (90% Livraison)":"Drivers (90% Delivery)",v:`π${fmtPi(totalPi*.10)}`,pct:10,col:C.livreur},
                  {l:lang==="fr"?"Admin (10% Marge+Livraison)":"Admin (10% Margin+Delivery)",v:`π${fmtPi(adminPi)}`,pct:10,col:COL},
                ].map(r=>(
                  <div key={r.l} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.sub}}>{r.l}</span><span style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,color:r.col}}>{r.v}</span></div>
                    <div style={{background:C.border,borderRadius:4,height:6}}><div style={{background:r.col,height:6,borderRadius:4,width:`${r.pct}%`,transition:"width .5s"}}/></div>
                  </div>
                ))}
              </div>
              {/* TradingView */}
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:800,marginBottom:12}}>📈 PIUSDT — TradingView Live</div>
                <TradingViewChart/>
              </div>
            </div>
          )}

          {section==="validation"&&(
            <div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🛡️ {lang==="fr"?"Centre de Validation":"Validation Center"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{lang==="fr"?"Double verrou · Étape finale Super Admin":"Double lock · Final Super Admin step"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                {[{l:lang==="fr"?"En attente":"Pending",v:CANDIDATS.filter(c=>!decisions[c.id]).length,col:C.relais},{l:lang==="fr"?"Validés":"Validated",v:Object.values(decisions).filter(d=>d==="valide").length,col:C.green},{l:lang==="fr"?"Rejetés":"Rejected",v:Object.values(decisions).filter(d=>d==="rejete").length,col:C.red}].map(k=>(
                  <div key={k.l} style={{background:C.card,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.col}33`}}>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:24,fontWeight:900,color:k.col}}>{k.v}</div>
                    <div style={{fontSize:12,color:C.muted}}>{k.l}</div>
                  </div>
                ))}
              </div>
              {CANDIDATS.map(c=>{
                const dec=decisions[c.id];
                const dc=dec==="valide"?C.green:dec==="rejete"?C.red:COL;
                return(
                  <div key={c.id} style={{background:C.card,borderRadius:16,padding:"18px 20px",marginBottom:14,border:`1.5px solid ${dc}33`,opacity:dec?.7:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <div>
                        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:16,fontWeight:900}}>{c.nom}</div>
                        <div style={{fontSize:12,color:C.sub}}>{c.vehicule} · {c.immat} · {c.region} · {c.distDepot} {lang==="fr"?"du dépôt":"from depot"}</div>
                      </div>
                      <span style={{fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:`${dc}22`,color:dc}}>
                        {dec==="valide"?"✅ Validé":dec==="rejete"?"❌ Rejeté":"⏳ En attente"}
                      </span>
                    </div>
                    {/* Photos côte à côte */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                      {[{l:lang==="fr"?"ENGIN":"VEHICLE",i:"🏍️"},{l:lang==="fr"?"ÉQUIPEMENT":"EQUIPMENT",i:"🛡️"}].map(ph=>(
                        <div key={ph.l} style={{background:C.card2,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                          <div style={{height:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.card2},${C.border}22)`}}>
                            <span style={{fontSize:32}}>{ph.i}</span>
                            <span style={{fontSize:9,color:C.muted,marginTop:4}}>photo_{c.id.toLowerCase()}_{ph.l.toLowerCase()}.jpg</span>
                          </div>
                          <div style={{padding:"5px",fontSize:9,color:COL,fontWeight:700,textAlign:"center"}}>{ph.l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Note relais */}
                    <div style={{background:C.card2,borderRadius:10,padding:"10px 12px",marginBottom:10,borderLeft:`3px solid ${COL}`}}>
                      <div style={{fontSize:10,color:COL,fontWeight:700,marginBottom:4}}>{lang==="fr"?"RECOMMANDATION":"RECOMMENDATION"} · {c.relaisNom}</div>
                      <div style={{fontSize:12,color:C.sub,fontStyle:"italic"}}>"{c.relaisNote}"</div>
                    </div>
                    {/* Équipements */}
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                      {c.equips.map(e=>(
                        <span key={e} style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:8,background:e.includes("✓")?C.green+"22":C.relais+"22",color:e.includes("✓")?C.green:C.relais}}>{e}</span>
                      ))}
                    </div>
                    <div style={{marginBottom:10}}>
                      <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:8,background:c.kyb?C.green+"22":C.relais+"22",color:c.kyb?C.green:C.relais}}>🔐 KYB : {c.kyb?"✓ Vérifié":"⏳ En cours"}</span>
                    </div>
                    {c.alerte&&<div style={{background:C.relais+"15",border:`1px solid ${C.relais}33`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12,color:C.relais}}>⚠️ {c.alerte}</div>}
                    {!dec&&(
                      <div style={{display:"flex",gap:10}}>
                        <button onClick={()=>rejeter(c.id)} style={{flex:1,padding:12,background:C.red+"22",border:`1px solid ${C.red}44`,borderRadius:10,color:C.red,fontWeight:700,cursor:"pointer"}}>❌ {lang==="fr"?"Rejeter":"Reject"}</button>
                        <button onClick={()=>valider(c.id)} style={{flex:2,padding:12,background:`linear-gradient(135deg,${C.green}CC,${C.green})`,border:"none",borderRadius:10,color:"#0C1A2E",fontWeight:900,cursor:"pointer",fontFamily:"'Poppins',sans-serif",fontSize:14}}>✅ {lang==="fr"?"Validation Finale":"Final Validation"}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {section==="oracle"&&(
            <div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>💹 {lang==="fr"?"Oracle & Configuration":"Oracle & Configuration"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>Source : CoinGecko API · PIUSDT</div>
              {/* Taux actuel */}
              <div style={{background:`linear-gradient(135deg,${C.card},#0D1A30)`,borderRadius:18,padding:"20px 22px",marginBottom:18,border:`1px solid ${COL}44`,boxShadow:`0 0 30px ${COL}11`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:COL,fontWeight:800,letterSpacing:1,marginBottom:4}}>{lang==="fr"?"TAUX ACTUEL · COINGECKO":"CURRENT RATE · COINGECKO"}</div>
                    <div style={{fontFamily:"'Poppins',sans-serif",fontSize:38,fontWeight:900,color:COL}}>{fmt(oracle.rate)} F</div>
                    <div style={{fontSize:12,color:C.muted}}>{lang==="fr"?"pour 1 π Pi Network":"for 1 π Pi Network"}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:oracle.status==="live"?C.green:C.relais,fontWeight:700}}>
                      {oracle.status==="live"?"🟢 Connecté":"🟡 Fallback"}
                    </div>
                    {oracle.time&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>{oracle.time.toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB")}</div>}
                    <button onClick={oracle.sync} style={{marginTop:8,padding:"5px 12px",background:"transparent",border:`1px solid ${COL}44`,borderRadius:8,color:COL,fontSize:11,cursor:"pointer"}}>↻ Sync</button>
                  </div>
                </div>
                {oracle.history.length>1&&(
                  <div style={{background:C.bg,borderRadius:10,padding:"10px 12px"}}>
                    <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:8}}>{lang==="fr"?"HISTORIQUE":"HISTORY"} (CoinGecko)</div>
                    <div style={{display:"flex",alignItems:"flex-end",gap:3,height:40}}>
                      {oracle.history.map((h,i)=>{
                        const max=Math.max(...oracle.history.map(x=>x.v));
                        const min=Math.min(...oracle.history.map(x=>x.v));
                        const pct=max===min?50:((h.v-min)/(max-min))*100;
                        return <div key={i} style={{flex:1,borderRadius:"2px 2px 0 0",height:`${Math.max(6,pct*.34+6)}px`,background:i===oracle.history.length-1?COL:COL+"44"}}/>;
                      })}
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.muted,marginTop:4}}>
                      <span>Min {Math.min(...oracle.history.map(x=>x.v)).toFixed(2)} F</span>
                      <span>Max {Math.max(...oracle.history.map(x=>x.v)).toFixed(2)} F</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Mode Manuel */}
              <div style={{background:C.card,borderRadius:16,padding:"16px 18px",marginBottom:18,border:`1.5px solid ${modeManuel?C.relais+"66":C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:modeManuel?16:0}}>
                  <div>
                    <div style={{fontWeight:700,color:modeManuel?C.relais:C.text}}>⚙️ {lang==="fr"?"Mode Taux Fixe Manuel":"Manual Fixed Rate Mode"}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:2}}>{lang==="fr"?"En cas de coupure CoinGecko — protection des relais":"In case of CoinGecko outage — relay protection"}</div>
                  </div>
                  <div onClick={()=>setModeManuel(m=>!m)} style={{width:50,height:26,borderRadius:13,background:modeManuel?C.relais:C.border,position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}}>
                    <div style={{position:"absolute",top:3,left:modeManuel?26:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 2px 4px rgba(0,0,0,.3)"}}/>
                  </div>
                </div>
                {modeManuel&&(
                  <div>
                    <div style={{background:C.relais+"15",border:`1px solid ${C.relais}33`,borderRadius:10,padding:"10px 12px",marginBottom:12,fontSize:12,color:C.relais}}>⚠️ {lang==="fr"?"CoinGecko suspendu. Taux fixe appliqué.":"CoinGecko suspended. Fixed rate applied."}</div>
                    <div style={{display:"flex",gap:10}}>
                      <input type="number" value={rateM} onChange={e=>setRateM(e.target.value)} style={{flex:1,padding:"12px",background:C.card2,border:`1.5px solid ${C.relais}`,borderRadius:10,color:C.text,fontSize:18,fontWeight:900,outline:"none",fontFamily:"'Poppins',sans-serif"}}/>
                      <button onClick={()=>show(`✅ ${lang==="fr"?"Taux fixé à":"Rate set to"} ${rateM} F`,C.relais)} style={{padding:"12px 16px",background:`linear-gradient(135deg,${C.relais}CC,${C.relais})`,border:"none",borderRadius:10,color:"#0B0804",fontWeight:900,cursor:"pointer",fontFamily:"'Poppins',sans-serif"}}>{lang==="fr"?"Appliquer":"Apply"}</button>
                    </div>
                  </div>
                )}
              </div>
              {/* Mention oracle */}
              <div style={{background:C.card2,borderRadius:14,padding:"14px 16px",marginBottom:18,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:10,color:C.sub,fontWeight:700,marginBottom:6}}>{lang==="fr"?"MENTION AFFICHÉE AUX CLIENTS":"DISPLAYED TO CLIENTS"}</div>
                <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",fontSize:12,color:C.sub,fontStyle:"italic",lineHeight:1.6}}>
                  "{lang==="fr"?"Prix indexé sur l'Oracle CoinGecko · Dernière mise à jour le":"Price indexed on CoinGecko Oracle · Last updated on"} {new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB")} {lang==="fr"?"à":"at"} {new Date().toLocaleTimeString(lang==="fr"?"fr-FR":"en-GB")}{modeManuel?` · ⚠️ ${lang==="fr"?"Taux fixe temporaire":"Temporary fixed rate"}`:""}
                  "
                </div>
              </div>
              {/* TradingView bonus */}
              <div>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:800,color:COL,marginBottom:12}}>📊 PIUSDT — TradingView ({lang==="fr"?"graphique bonus":"bonus chart"})</div>
                <TradingViewChart/>
              </div>
            </div>
          )}

          {section==="relais"&&(
            <div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🌍 {lang==="fr"?"Réseau des Relais":"Relay Network"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>6 {lang==="fr"?"régions":"regions"} · {RELAIS.filter(r=>r.actif).length} {lang==="fr"?"actifs":"active"}</div>
              {/* 3 Hubs */}
              <div style={{background:C.card,borderRadius:16,padding:"16px 18px",marginBottom:18,border:`1px solid ${COL}44`}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:800,color:COL,marginBottom:12}}>🗺️ {lang==="fr"?"Stratégie 3 Hubs — Grand Lomé":"3 Hubs Strategy — Grand Lomé"}</div>
                {[{icon:"🏠",nom:"Hub Principal Segbé",communes:["Golfe 7","Golfe 5","Golfe 4","Golfe 3","Agoè-Nyivé 1","Agoè-Nyivé 3","Agoè-Nyivé 5"],color:COL},
                  {icon:"🏪",nom:"Mini-Relais Bè",communes:["Golfe 1","Golfe 2","Golfe 6"],color:C.relais},
                  {icon:"🔜",nom:"Mini-Relais Agoè-Nord",communes:["Agoè-Nyivé 4","Agoè-Nyivé 6","Agoè-Nyivé 2"],color:C.muted},
                ].map(h=>(
                  <div key={h.nom} style={{marginBottom:12,padding:"10px 12px",background:C.card2,borderRadius:10,border:`1px solid ${h.color}33`}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:18}}>{h.icon}</span>
                      <span style={{fontWeight:700,color:h.color,fontSize:13}}>{h.nom}</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {h.communes.map(c=><span key={c} style={{fontSize:10,padding:"2px 7px",borderRadius:8,background:h.color+"15",color:h.color,fontWeight:600}}>{c}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Table relais */}
              {RELAIS.map(r=>(
                <div key={r.n} style={{background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${r.actif?C.border:C.muted+"22"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                    <div><div style={{fontFamily:"'Poppins',sans-serif",fontWeight:800,fontSize:14}}>{r.n}</div><div style={{fontSize:12,color:C.sub}}>{r.r} · {r.regime}</div></div>
                    <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:14,background:r.actif?C.green+"22":C.muted+"22",color:r.actif?C.green:C.muted}}>{r.actif?"● Actif":"○ Inactif"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{l:lang==="fr"?"CA cumulé":"Total revenue",v:`${fmt(r.ca)} F`},{l:lang==="fr"?"Pi (jour)":"Pi (day)",v:`π${fmtPi(r.piToday)}`},{l:"IMF 1%",v:`${fmt(r.ca*.01)} F`}].map(m=>(
                      <div key={m.l} style={{background:C.card2,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontFamily:"'Poppins',sans-serif",fontSize:12,fontWeight:800,color:r.actif?r.color:C.muted}}>{m.v}</div>
                        <div style={{fontSize:9,color:C.muted}}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {section==="prix"&&(
            <div>
              <div style={{fontFamily:"'Poppins',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>💰 {lang==="fr"?"Gestion des Prix Planchers":"Floor Price Management"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{lang==="fr"?"Arrêté interministériel Togo · 110 FCFA/tonne-km (groupage) · Décembre 2024":"Togo ministerial order · 110 FCFA/tonne-km (groupage) · December 2024"}</div>
              {/* Tableau planchers produits phares */}
              <div style={{background:C.card,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.border}`}}>
                <div style={{fontFamily:"'Poppins',sans-serif",fontSize:14,fontWeight:800,marginBottom:14}}>📋 {lang==="fr"?"Planchers régionaux — Cartons 1,5L × 12":"Regional floors — Cartons 1.5L × 12"}</div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                    <thead>
                      <tr style={{borderBottom:`2px solid ${C.border}`}}>
                        <th style={{textAlign:"left",padding:"8px 6px",color:C.sub,fontWeight:700,fontSize:10}}>RÉGION</th>
                        {[{label:"Voltic",col:"#0080FF"},{label:"Cristal",col:"#00A87A"},{label:"Vitale",col:"#9333EA"}].map(b=>(
                          <th key={b.label} style={{textAlign:"right",padding:"8px 6px",color:b.col,fontWeight:700,fontSize:10}}>{b.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(REGIONS_INFO).map(([rid,rinfo],i)=>(
                        <tr key={rid} style={{borderBottom:`1px solid ${C.border}11`,background:i%2===0?"transparent":C.card2+"44"}}>
                          <td style={{padding:"8px 6px",color:C.sub,fontWeight:600}}>{rinfo.label}</td>
                          {["v1","c1","t1"].map(pid=>(
                            <td key={pid} style={{padding:"8px 6px",textAlign:"right",fontFamily:"'Poppins',sans-serif",fontWeight:800,color:C.text}}>{fmt(PLANCHERS[pid]?.[rid]||0)} F</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{marginTop:12,padding:"10px 12px",background:C.card2,borderRadius:10,fontSize:11,color:C.sub}}>
                  💡 {lang==="fr"?"Prix plancher = Prix usine Lomé + frais transport groupage. Déclaration sous le plancher → révision obligatoire avec justificatif.":"Floor price = Lomé factory price + groupage transport fees. Declaration below floor → mandatory review with justification."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROUTER PRINCIPAL — Export default unique
// Super Admin détecté automatiquement via Pi username (flashman90)
// ════════════════════════════════════════════════════════════════════════════

// Écran de chargement Pi Auth
function PiAuthLoading({lang}){
  return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',sans-serif",color:C.text}}>
      <link href={GF} rel="stylesheet"/>
      <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#0033A8,#0066FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:20,boxShadow:"0 0 40px rgba(0,102,255,0.4)"}}>💧</div>
      <div style={{fontFamily:"'Poppins',sans-serif",fontSize:18,fontWeight:900,marginBottom:8}}>Multivers'Eau</div>
      <div style={{display:"flex",alignItems:"center",gap:8,color:C.sub,fontSize:13}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.admin,animation:"pulse 1s infinite"}}/>
        {lang==="fr"?"Connexion Pi Network…":"Connecting to Pi Network…"}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
    </div>
  );
}

// ── Switcher de rôle flottant — visible uniquement pour flashman90 ─────────
// Permet à l'admin de basculer en mode client sans se déconnecter
function AdminRoleSwitcher({role,setRole,lang}){
  const[open,setOpen]=useState(false);
  const ROLES=[
    {id:"admin",  icon:"⚙️", label:lang==="fr"?"Admin":"Admin",   color:C.admin},
    {id:"client", icon:"💧", label:lang==="fr"?"Commander":"Order",color:C.client},
    {id:"relais", icon:"🏪", label:lang==="fr"?"Mon Relais":"My Relay",color:C.relais},
  ];
  const current=ROLES.find(r=>r.id===role)||ROLES[0];
  return(
    <div style={{position:"fixed",bottom:80,right:16,zIndex:900}}>
      {open&&(
        <div style={{position:"absolute",bottom:52,right:0,background:C.surf,borderRadius:16,padding:8,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px rgba(0,0,0,.5)",display:"flex",flexDirection:"column",gap:6,minWidth:160}}>
          {ROLES.map(r=>(
            <button key={r.id} onClick={()=>{setRole(r.id);setOpen(false);}}
              style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:role===r.id?`${r.color}22`:C.card,border:`1px solid ${role===r.id?r.color:C.border}`,borderRadius:12,cursor:"pointer",color:C.text,fontSize:13,fontWeight:role===r.id?800:500,textAlign:"left"}}>
              <span style={{fontSize:18}}>{r.icon}</span>
              <span style={{color:role===r.id?r.color:C.text}}>{r.label}</span>
              {role===r.id&&<span style={{marginLeft:"auto",fontSize:10,color:r.color}}>●</span>}
            </button>
          ))}
          <div style={{padding:"6px 14px",fontSize:10,color:C.muted,borderTop:`1px solid ${C.border}`,marginTop:2}}>
            flashman90 — multi-rôle
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)}
        style={{width:48,height:48,borderRadius:"50%",background:`linear-gradient(135deg,${current.color}CC,${current.color})`,border:"none",cursor:"pointer",fontSize:20,boxShadow:`0 4px 16px ${current.color}66`,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {current.icon}
      </button>
    </div>
  );
}

export default function MultiversEau(){
  const piAuth=usePiAuth();
  const{user,role:piRole,loading}=piAuth;
  const[manualRole,setManualRole]=useState(null);
  const isAdmin=piAuth.user?.username===CODE_INVITATION;
  const role=isAdmin?"admin":(piRole||manualRole);
  const setRole=setManualRole;
  const[lang,setLang]=useState("fr");
  const[showInscRelais,setShowInscRelais]=useState(false);
  const[showInscLiv,setShowInscLiv]=useState(false);
  const[prevRole,setPrevRole]=useState(null); // navigation retour
  const[landingStep,setLandingStep]=useState("splash");
  const oracle=useOracle();
  const{stocks,update,dec}=useStock(import.meta.env.VITE_GRAND_LOME_ID);
  const{toast,show}=useToast();

  // ── Détection automatique Super Admin ──────────────────────────────────
  useEffect(()=>{
    if(isAdmin&&!role) setManualRole("admin");
  },[isAdmin,role]);

  if(piAuth.loading&&typeof window!=="undefined"&&window.Pi){
    return<PiAuthLoading lang={lang}/>;
  }

  const onBack=()=>{
    setLandingStep("intention");
    setShowInscRelais(false);
    setShowInscLiv(false);
    if(isAdmin){
      // Admin: retourne à AdminApp sauf si vient de landing
      setRole("admin");
    } else if(prevRole){
      // Utilisateur normal: retourne au rôle précédent
      setRole(prevRole);
      setPrevRole(null);
    } else {
      setRole(null); // retour landing
    }
  };

  const PROPS={oracle,stocks,update,dec,lang,setLang,piUser:piAuth.user,isAdmin,onBack};

  if(showInscRelais)return<InscriptionRelais {...PROPS} onSubmit={()=>{show(lang==="fr"?"✅ Candidature Relais envoyée !":"✅ Relay application sent!",C.green);setShowInscRelais(false);}}/>;
  if(showInscLiv)   return<InscriptionLivreur {...PROPS} onSubmit={()=>{show(lang==="fr"?"✅ Candidature Livreur envoyée !":"✅ Driver application sent!",C.green);setShowInscLiv(false);}}/>;

  if(!role)return(
    <div>
      <Toast data={toast}/>
      <LandingPage defaultStep={landingStep} onRole={(r)=>{
        setLandingStep ("splash");
        if(r==="relais")setShowInscRelais(true);
        else if(r==="livreur")setShowInscLiv(true);
        else{setPrevRole(role);setRole(r);}
      }} oracle={oracle} lang={lang} setLang={setLang}/>
    </div>
  );

  const view={
    client: <ClientApp  {...PROPS}/>,
    livreur:<LivreurApp {...PROPS}/>,
    relais: <RelaisApp  {...PROPS}/>,
    admin:  <AdminApp   {...PROPS}/>,
  }[role]||<LandingPage onRole={setRole} oracle={oracle} lang={lang} setLang={setLang}/>;

  return(
    <div>
      <Toast data={toast}/>
      {view}
      {/* Switcher flottant — visible uniquement pour flashman90 */}
      {isAdmin&&role&&<AdminRoleSwitcher role={role} setRole={setRole} lang={lang}/>}
    </div>
  );
}
