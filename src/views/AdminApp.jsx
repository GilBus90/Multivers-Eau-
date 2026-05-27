import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";

import { useOracle, useToast, useStock, usePiAuth } from "../hooks/index.js";


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
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Nunito',sans-serif",color:C.text}}>
      <link href={GF} rel="stylesheet"/><style>{GCSS}</style>
      <Toast data={toast}/>
      <div style={{display:"flex",minHeight:"100vh"}}>
        {/* Sidebar */}
        <div style={{width:190,background:C.surf,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"18px 10px",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
          <div style={{marginBottom:20,padding:"0 8px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900,color:COL}}>💧 Multivers'Eau</div>
            <div style={{fontSize:10,color:C.muted,marginTop:2}}>Super Admin</div>
          </div>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>setSection(n.id)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:10,background:section===n.id?COL+"18":"transparent",border:section===n.id?`1px solid ${COL}33`:"1px solid transparent",color:section===n.id?COL:C.muted,fontWeight:section===n.id?700:500,fontSize:12,cursor:"pointer",marginBottom:4,textAlign:"left",position:"relative"}}>
              <span>{n.icon}</span>{n.label}
              {(n.badge||0)>0&&<span style={{marginLeft:"auto",background:C.red,color:"#fff",borderRadius:"50%",width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900}}>{n.badge}</span>}
            </button>
          ))}
          <div style={{marginTop:"auto"}}>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{width:"100%",padding:"7px",background:C.card2,border:`1px solid ${C.border}`,borderRadius:8,color:C.muted,fontSize:11,cursor:"pointer",marginBottom:8}}>{lang==="fr"?"🇬🇧 English":"🇫🇷 Français"}</button>
            <div style={{background:C.bg,borderRadius:10,padding:"10px 12px",border:`1px solid ${COL}22`}}>
              <div style={{fontSize:9,color:C.muted,fontWeight:700,marginBottom:4}}>ORACLE · COINGECKO</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:900,color:COL}}>{fmt(oracle.rate)} F</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>{lang==="fr"?"Vue d'ensemble":"Overview"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{new Date().toLocaleDateString(lang==="fr"?"fr-FR":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {[{i:"📦",l:lang==="fr"?"Commandes/jour":"Orders/day",v:"42",col:COL},{i:"💧",l:"Pi collecté",v:`π${fmtPi(totalPi)}`,col:COL},{i:"💰",l:lang==="fr"?"Commission Admin":"Admin commission",v:`π${fmtPi(adminPi)}`,col:C.relais},{i:"🌍",l:lang==="fr"?"Relais actifs":"Active relays",v:`${RELAIS.filter(r=>r.actif).length}/${RELAIS.length}`,col:C.green}].map(k=>(
                  <div key={k.l} style={{background:C.card,borderRadius:14,padding:"16px 18px",border:`1px solid ${C.border}`,position:"relative",overflow:"hidden"}}>
                    <div style={{position:"absolute",top:0,right:0,width:60,height:60,background:`radial-gradient(circle at 100% 0%,${k.col}18,transparent 70%)`}}/>
                    <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{k.i} {k.l}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:k.col}}>{k.v}</div>
                  </div>
                ))}
              </div>
              {/* Split du jour */}
              <div style={{background:C.card,borderRadius:16,padding:"18px 20px",marginBottom:18,border:`1px solid ${C.border}`}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,marginBottom:14}}>⚡ {lang==="fr"?"Répartition Split-Payment":"Split-Payment Distribution"}</div>
                {[{l:lang==="fr"?"Relais (Achat + 90% Marge)":"Relay (Cost + 90% Margin)",v:`π${fmtPi(totalPi*.80)}`,pct:80,col:C.relais},
                  {l:lang==="fr"?"Livreurs (90% Livraison)":"Drivers (90% Delivery)",v:`π${fmtPi(totalPi*.10)}`,pct:10,col:C.livreur},
                  {l:lang==="fr"?"Admin (10% Marge+Livraison)":"Admin (10% Margin+Delivery)",v:`π${fmtPi(adminPi)}`,pct:10,col:COL},
                ].map(r=>(
                  <div key={r.l} style={{marginBottom:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span style={{color:C.sub}}>{r.l}</span><span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:r.col}}>{r.v}</span></div>
                    <div style={{background:C.border,borderRadius:4,height:6}}><div style={{background:r.col,height:6,borderRadius:4,width:`${r.pct}%`,transition:"width .5s"}}/></div>
                  </div>
                ))}
              </div>
              {/* TradingView */}
              <div style={{marginBottom:18}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,marginBottom:12}}>📈 PIUSDT — TradingView Live</div>
                <TradingViewChart/>
              </div>
            </div>
          )}

          {section==="validation"&&(
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🛡️ {lang==="fr"?"Centre de Validation":"Validation Center"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{lang==="fr"?"Double verrou · Étape finale Super Admin":"Double lock · Final Super Admin step"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:20}}>
                {[{l:lang==="fr"?"En attente":"Pending",v:CANDIDATS.filter(c=>!decisions[c.id]).length,col:C.relais},{l:lang==="fr"?"Validés":"Validated",v:Object.values(decisions).filter(d=>d==="valide").length,col:C.green},{l:lang==="fr"?"Rejetés":"Rejected",v:Object.values(decisions).filter(d=>d==="rejete").length,col:C.red}].map(k=>(
                  <div key={k.l} style={{background:C.card,borderRadius:12,padding:"14px 16px",border:`1px solid ${k.col}33`}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:900,color:k.col}}>{k.v}</div>
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
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:900}}>{c.nom}</div>
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
                        <button onClick={()=>valider(c.id)} style={{flex:2,padding:12,background:`linear-gradient(135deg,${C.green}CC,${C.green})`,border:"none",borderRadius:10,color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"'Syne',sans-serif",fontSize:14}}>✅ {lang==="fr"?"Validation Finale":"Final Validation"}</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {section==="oracle"&&(
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>💹 {lang==="fr"?"Oracle & Configuration":"Oracle & Configuration"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>Source : CoinGecko API · PIUSDT</div>
              {/* Taux actuel */}
              <div style={{background:`linear-gradient(135deg,${C.card},#0D1A30)`,borderRadius:18,padding:"20px 22px",marginBottom:18,border:`1px solid ${COL}44`,boxShadow:`0 0 30px ${COL}11`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div>
                    <div style={{fontSize:10,color:COL,fontWeight:800,letterSpacing:1,marginBottom:4}}>{lang==="fr"?"TAUX ACTUEL · COINGECKO":"CURRENT RATE · COINGECKO"}</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:38,fontWeight:900,color:COL}}>{fmt(oracle.rate)} F</div>
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
                      <input type="number" value={rateM} onChange={e=>setRateM(e.target.value)} style={{flex:1,padding:"12px",background:C.card2,border:`1.5px solid ${C.relais}`,borderRadius:10,color:C.text,fontSize:18,fontWeight:900,outline:"none",fontFamily:"'Syne',sans-serif"}}/>
                      <button onClick={()=>show(`✅ ${lang==="fr"?"Taux fixé à":"Rate set to"} ${rateM} F`,C.relais)} style={{padding:"12px 16px",background:`linear-gradient(135deg,${C.relais}CC,${C.relais})`,border:"none",borderRadius:10,color:"#0B0804",fontWeight:900,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>{lang==="fr"?"Appliquer":"Apply"}</button>
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
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:COL,marginBottom:12}}>📊 PIUSDT — TradingView ({lang==="fr"?"graphique bonus":"bonus chart"})</div>
                <TradingViewChart/>
              </div>
            </div>
          )}

          {section==="relais"&&(
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>🌍 {lang==="fr"?"Réseau des Relais":"Relay Network"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>6 {lang==="fr"?"régions":"regions"} · {RELAIS.filter(r=>r.actif).length} {lang==="fr"?"actifs":"active"}</div>
              {/* 3 Hubs */}
              <div style={{background:C.card,borderRadius:16,padding:"16px 18px",marginBottom:18,border:`1px solid ${COL}44`}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,color:COL,marginBottom:12}}>🗺️ {lang==="fr"?"Stratégie 3 Hubs — Grand Lomé":"3 Hubs Strategy — Grand Lomé"}</div>
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
                    <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14}}>{r.n}</div><div style={{fontSize:12,color:C.sub}}>{r.r} · {r.regime}</div></div>
                    <span style={{fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:14,background:r.actif?C.green+"22":C.muted+"22",color:r.actif?C.green:C.muted}}>{r.actif?"● Actif":"○ Inactif"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[{l:lang==="fr"?"CA cumulé":"Total revenue",v:`${fmt(r.ca)} F`},{l:lang==="fr"?"Pi (jour)":"Pi (day)",v:`π${fmtPi(r.piToday)}`},{l:"IMF 1%",v:`${fmt(r.ca*.01)} F`}].map(m=>(
                      <div key={m.l} style={{background:C.card2,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:800,color:r.actif?r.color:C.muted}}>{m.v}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>💰 {lang==="fr"?"Gestion des Prix Planchers":"Floor Price Management"}</div>
              <div style={{color:C.sub,fontSize:13,marginBottom:18}}>{lang==="fr"?"Arrêté interministériel Togo · 110 FCFA/tonne-km (groupage) · Décembre 2024":"Togo ministerial order · 110 FCFA/tonne-km (groupage) · December 2024"}</div>
              {/* Tableau planchers produits phares */}
              <div style={{background:C.card,borderRadius:16,padding:"16px 18px",border:`1px solid ${C.border}`}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,marginBottom:14}}>📋 {lang==="fr"?"Planchers régionaux — Cartons 1,5L × 12":"Regional floors — Cartons 1.5L × 12"}</div>
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
                            <td key={pid} style={{padding:"8px 6px",textAlign:"right",fontFamily:"'Syne',sans-serif",fontWeight:800,color:C.text}}>{fmt(PLANCHERS[pid]?.[rid]||0)} F</td>
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
export { AdminApp };
