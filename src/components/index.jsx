import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";
import { T } from "../data/translations.js";


// ─── AppWrap ─────────────────────────────────────────
const AppWrap=({children,mw=460})=>(
  <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Nunito',sans-serif",color:C.text,maxWidth:mw,margin:"0 auto"}}>
    <link href={GF} rel="stylesheet"/><style>{GCSS}</style>{children}
  </div>
);

// ─── Toast ───────────────────────────────────────────
const Toast=({data})=>!data?null:(
  <div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:data.color,color:"#fff",borderRadius:16,padding:"13px 22px",fontWeight:700,fontSize:13,animation:"toastIn .3s ease",whiteSpace:"nowrap",maxWidth:"90vw",textAlign:"center",boxShadow:`0 8px 24px ${data.color}55`}}>
    {data.msg}
  </div>
);

// ─── OracleBadge ─────────────────────────────────────
function OracleBadge({oracle,lang,compact}){
  const t=T[lang||"fr"];
  const col=oracle.status==="live"?C.green:oracle.status==="fallback"?C.relais:C.muted;
  return(
    <div onClick={oracle.sync} style={{display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,.06)",borderRadius:20,padding:compact?"5px 12px":"8px 16px",cursor:"pointer",border:`1px solid ${col}33`}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:col,boxShadow:`0 0 6px ${col}`,animation:oracle.status==="live"?"pulse 2s infinite":"none"}}/>
      <div>
        {!compact&&<div style={{fontSize:8,color:col,fontWeight:800,letterSpacing:1}}>{oracle.modeManuel?"TAUX FIXE":oracle.status==="live"?"ORACLE LIVE":"FALLBACK"}</div>}
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:compact?12:15,fontWeight:900,color:"#fff"}}>1π = {fmt(oracle.rate)} F</div>
      </div>
    </div>
  );
}

// ─── TradingViewChart ────────────────────────────────
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
        <span style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:800,color:C.admin}}>PIUSDT — TradingView Live</span>
        <span style={{fontSize:10,color:C.muted,marginLeft:"auto"}}>MEXC Exchange</span>
      </div>
      <div ref={ref} className="tradingview-widget-container" style={{height:300,background:C.surf,borderRadius:"0 0 12px 12px",overflow:"hidden",border:`1px solid ${C.border}`,borderTop:"none"}}>
        <div className="tradingview-widget-container__widget" style={{height:"100%",width:"100%"}}/>
      </div>
    </div>
  );
}

// ─── Btn ─────────────────────────────────────────────
function Btn({children,onClick,color=C.client,disabled,size="md",variant="solid",full=true}){
  const p=size==="lg"?"16px 0":size==="sm"?"7px 14px":"13px 0";
  const fs=size==="lg"?16:size==="sm"?12:14;
  return(
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto",padding:p,borderRadius:14,cursor:disabled?"not-allowed":"pointer",
      fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:fs,letterSpacing:.3,transition:"all .15s",
      background:disabled?C.border:variant==="outline"?`${color}18`:`linear-gradient(135deg,${color}CC,${color})`,
      color:disabled?C.muted:variant==="outline"?color:"#fff",
      border:variant==="outline"?`1.5px solid ${color}44`:"none",
      boxShadow:disabled||variant==="outline"?"none":`0 5px 18px ${color}33`,
    }}>{children}</button>
  );
}

// ─── Fld ─────────────────────────────────────────────
function Fld({label,value,onChange,placeholder,type="text",req,note,lang}){
  const lc=lang||"fr";
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:5}}>
        {label}{req&&<span style={{color:C.red}}> *</span>}
      </div>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:"12px 14px",background:C.card2,border:`1.5px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:14,outline:"none",fontFamily:"'Nunito',sans-serif"}}
        onFocus={e=>e.target.style.borderColor=C.admin} onBlur={e=>e.target.style.borderColor=C.border}/>
      {note&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>{note}</div>}
    </div>
  );
}

// ─── Photo ───────────────────────────────────────────
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

// ─── BottomNav ───────────────────────────────────────
function BottomNav({tabs,active,onSelect,color}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:C.surf,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:500,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onSelect(t.id)} style={{flex:1,padding:"11px 0 9px",background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
          {(t.badge||0)>0&&<div style={{position:"absolute",top:5,right:"calc(50% - 16px)",background:C.red,color:"#fff",borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900}}>{t.badge}</div>}
          <span style={{fontSize:20}}>{t.icon}</span>
          <span style={{fontSize:9,fontWeight:active===t.id?800:500,color:active===t.id?color:C.muted}}>{t.label}</span>
          {active===t.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:28,height:2.5,background:color,borderRadius:2}}/>}
        </button>
      ))}
    </div>
  );
}

// ── CHARTE QUALITÉ ─────────────────────────────────────────────────────────────

export { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav };
