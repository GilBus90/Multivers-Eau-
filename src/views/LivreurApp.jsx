import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";

import { useOracle, useToast, useStock, usePiAuth } from "../hooks/index.js";


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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:900}}>🏍️ {lang==="fr"?"Espace Livreur":"Driver Space"}</div>
            <div style={{fontSize:10,color:C.sub}}>Kofi Mensah · {lang==="fr"?"Dépôt Segbé":"Segbé Depot"}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div onClick={()=>setActif(a=>!a)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:actif?C.green+"22":C.red+"22",border:`1px solid ${actif?C.green:C.red}44`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:actif?C.green:C.red,animation:actif?"pulse 2s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:700,color:actif?C.green:C.red}}>{actif?(lang==="fr"?"Actif":"Active"):(lang==="fr"?"Hors ligne":"Offline")}</span>
            </div>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:16,padding:"4px 10px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.lang}</button>
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
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:k.col,marginTop:4}}>{k.v}</div>
                <div style={{fontSize:9,color:C.muted,marginTop:2}}>{k.l}</div>
              </div>
            ))}
          </div>
          {enCours&&(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:COL,fontWeight:800,letterSpacing:1,marginBottom:8}}>🏍️ {t.courseEnCours.toUpperCase()}</div>
              <div style={{background:C.card,borderRadius:16,padding:16,border:`2px solid ${COL}`,boxShadow:`0 0 20px ${COL}18`}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:15,marginBottom:4}}>{enCours.client}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:6}}>📍 {enCours.adresse}</div>
                {/* Deux distances */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div style={{background:C.card2,borderRadius:10,padding:"8px 12px"}}>
                    <div style={{fontSize:9,color:COL,fontWeight:800}}>📦 {lang==="fr"?"DÉPÔT → TOI":"DEPOT → YOU"}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,color:COL}}>{enCours.distRelaisKm} km</div>
                  </div>
                  <div style={{background:C.card2,borderRadius:10,padding:"8px 12px"}}>
                    <div style={{fontSize:9,color:C.sub,fontWeight:800}}>🏁 {lang==="fr"?"DÉPÔT → CLIENT":"DEPOT → CLIENT"}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:18,color:C.text}}>{enCours.distClientKm} km</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>window.open(`https://maps.google.com/?q=${encodeURIComponent(enCours.adresse)}`,"_blank")} style={{flex:1,padding:"11px",background:"#003A5C",border:`1px solid ${C.admin}33`,borderRadius:10,color:C.admin,fontWeight:700,cursor:"pointer",fontSize:12}}>🗺️ Maps</button>
                  <button onClick={()=>livrer(enCours.id)} style={{flex:2,padding:"11px",background:C.green,border:"none",borderRadius:10,color:"#fff",fontWeight:800,cursor:"pointer",fontSize:13,fontFamily:"'Syne',sans-serif"}}>{t.confirmerLiv}</button>
                </div>
              </div>
            </div>
          )}
          {attentes.map(c=>(
            <div key={c.id} style={{background:C.card,borderRadius:16,padding:16,marginBottom:10,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div><div style={{fontSize:10,color:C.muted}}>{c.heure} · {c.relais}</div></div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:C.relais+"22",color:C.relais}}>⏳ {lang==="fr"?"En attente":"Pending"}</span>
              </div>
              <div style={{fontWeight:700,marginBottom:4}}>{c.client}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:10}}>📍 {c.adresse}</div>
              <div style={{background:C.card2,borderRadius:10,padding:"10px 12px",marginBottom:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[{l:lang==="fr"?"Dépôt→toi":"Depot→you",v:`${c.distRelaisKm} km`,col:COL},{l:lang==="fr"?"Dépôt→client":"Depot→client",v:`${c.distClientKm} km`,col:C.sub},{l:lang==="fr"?"Ton gain":"Your gain",v:`π${fmtPi(c.gainPi)}`,col:COL}].map(m=>(
                  <div key={m.l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:900,color:m.col}}>{m.v}</div>
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
                <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div><div style={{fontSize:10,color:C.muted}}>{c.heure}</div></div>
                <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:`${sc.co}22`,color:sc.co}}>{sc.i} {sc.l}</span>
              </div>
              <div style={{fontWeight:700,marginBottom:3}}>{c.client}</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📍 {c.adresse}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:c.statut==="livre"?0:10}}>
                {[{l:lang==="fr"?"Dépôt→toi":"Depot→you",v:`${c.distRelaisKm}km`},{l:lang==="fr"?"Dépôt→client":"Depot→client",v:`${c.distClientKm}km`},{l:"Gain π",v:`π${fmtPi(c.gainPi)}`}].map(m=>(
                  <div key={m.l} style={{background:C.card2,borderRadius:8,padding:"8px",textAlign:"center"}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:COL}}>{m.v}</div>
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:42,fontWeight:900,color:COL}}>π {fmtPi(gains)}</div>
            <div style={{fontSize:13,color:C.muted,marginTop:4}}>≈ {fmt(gains*oracle.rate)} FCFA · {lang==="fr"?"Oracle CoinGecko":"CoinGecko Oracle"}</div>
          </div>
          {courses.filter(c=>c.statut!=="en_attente").map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginBottom:8,background:C.card,borderRadius:12,border:`1px solid ${C.border}`}}>
              <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12}}>{c.id}</div><div style={{fontSize:11,color:C.muted}}>{c.client} · {c.heure}</div></div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:900,color:c.statut==="livre"?C.green:COL}}>π{fmtPi(c.gainPi)}</div>
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
            <div style={{fontSize:11,color:C.muted,marginTop:8}}>Zone B (>15km) : +75 FCFA/km</div>
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
export { LivreurApp };
