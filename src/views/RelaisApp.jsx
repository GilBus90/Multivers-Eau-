import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";


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
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,marginBottom:4}}>{lang==="fr"?"Choisissez votre régime fiscal":"Choose your tax regime"}</div>
        <div style={{fontSize:13,color:C.sub}}>{lang==="fr"?"Ce choix définit votre gestion comptable dans l'app":"This defines your accounting management in the app"}</div>
      </div>
      <div style={{padding:"20px 18px"}}>
        {Object.values(REGIMES).map(r=>(
          <div key={r.id} onClick={()=>setRegime(r.id)} style={{padding:"15px 16px",borderRadius:14,cursor:"pointer",marginBottom:10,background:regime===r.id?r.color+"18":C.card,border:`2px solid ${regime===r.id?r.color:C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:r.color+"22",border:`2px solid ${r.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:r.color}}>{r.num}</div>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:regime===r.id?r.color:C.text,fontSize:14}}>{r.label}</span>
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:900}}>🏪 {lang==="fr"?"Dépôt Principal · Segbé":"Main Depot · Segbé"}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
              <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:8,background:regimeData.color+"22",color:regimeData.color}}>{regimeData.num}. {regimeData.label}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div onClick={()=>setOuvert(o=>!o)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:20,cursor:"pointer",background:ouvert?C.green+"22":C.red+"22",border:`1px solid ${ouvert?C.green:C.red}44`}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:ouvert?C.green:C.red,animation:ouvert?"pulse 2s infinite":"none"}}/>
              <span style={{fontSize:10,fontWeight:700,color:ouvert?C.green:C.red}}>{ouvert?(lang==="fr"?"Ouvert":"Open"):(lang==="fr"?"Fermé":"Closed")}</span>
            </div>
            <button onClick={()=>setLang(l=>l==="fr"?"en":"fr")} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:16,padding:"4px 10px",color:"#fff",fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.lang}</button>
            <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
          </div>
        </div>
      </div>

      {tab==="dashboard"&&(
        <div style={{padding:"14px",paddingBottom:80}}>
          <div style={{background:C.card,borderRadius:16,padding:"14px 16px",marginBottom:14,border:`1px solid ${COL}44`}}>
            <div style={{fontSize:10,color:COL,fontWeight:800,marginBottom:6}}>💹 {lang==="fr"?"ORACLE COINGECKO":"COINGECKO ORACLE"}</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:COL}}>{fmt(oracle.rate)} FCFA</div>
            <div style={{fontSize:12,color:C.muted}}>{lang==="fr"?"pour 1 π":"for 1 π"} · {oracle.status==="live"?"🟢 Live":"🟡 Fallback"}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[{i:"🆕",l:lang==="fr"?"Nouvelles":"New",v:cmds.filter(c=>c.statut==="nouvelle").length,col:COL},{i:"✅",l:lang==="fr"?"Livrées":"Delivered",v:cmds.filter(c=>c.statut==="livree").length,col:C.green},{i:"⚠️",l:lang==="fr"?"Alertes":"Alerts",v:alertes,col:C.red},{i:"❌",l:lang==="fr"?"Ruptures":"Out of stock",v:vides,col:C.red}].map(k=>(
              <div key={k.l} style={{background:C.card,borderRadius:12,padding:"12px 14px",border:`1px solid ${k.col}22`}}>
                <div style={{fontSize:18}}>{k.i}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:k.col}}>{k.v}</div>
                <div style={{fontSize:11,color:C.muted}}>{k.l}</div>
              </div>
            ))}
          </div>
          {/* Commandes nouvelles à assigner */}
          {cmds.filter(c=>c.statut==="nouvelle").map(c=>{const sp=calcSplit(c);return(
            <div key={c.id} style={{background:C.card,borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${COL}44`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <div><div style={{fontWeight:700}}>{c.client}</div><div style={{fontSize:11,color:C.muted}}>{c.id} · {c.distKm} km {lang==="fr"?"du dépôt":"from depot"}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:COL}}>{fmt(sp.total)} F</div><div style={{fontSize:10,color:C.muted}}>π{fmtPi(sp.total/oracle.rate)}</div></div>
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
                  <div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:12}}>{c.id}</div></div>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:14,background:`${sc.co}22`,color:sc.co}}>{sc.i} {sc.l}</span>
                </div>
                <div style={{fontWeight:700,marginBottom:4}}>{c.client}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:8}}>📍 {c.adresse}</div>
                {/* Distance dépôt→client */}
                <div style={{background:C.card2,borderRadius:10,padding:"8px 12px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:9,color:COL,fontWeight:700}}>📦 {lang==="fr"?"DÉPÔT → CLIENT":"DEPOT → CLIENT"}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:14}}>{c.distKm} km</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:10,color:C.muted}}>{t.fraisLivraison}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:COL}}>{fmt(c.livraison)} F</div></div>
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
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:br.color,fontSize:14}}>{br.label}</span>
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
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,marginBottom:6}}>{p.icon} {lang==="fr"?p.nFr:p.nEn} {p.d}</div>
                          <div style={{fontSize:11,color:C.muted,marginBottom:10}}>{lang==="fr"?"Unité":"Unit"} : <strong>{p.u}</strong> · {lang==="fr"?"Seuil alerte":"Alert threshold"} : {mn} {p.u}s</div>
                          <input type="number" min="0" value={editQty} onChange={e=>setEditQty(e.target.value)}
                            style={{width:"100%",padding:"12px",background:C.card2,border:`2px solid ${COL}`,borderRadius:10,color:C.text,fontSize:22,fontWeight:900,fontFamily:"'Syne',sans-serif",outline:"none",textAlign:"center",marginBottom:10}} autoFocus/>
                          <div style={{display:"flex",gap:8}}>
                            <button onClick={()=>setEditId(null)} style={{flex:1,padding:11,background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,color:C.muted,cursor:"pointer"}}>{t.annuler}</button>
                            <button onClick={()=>saveStock(p.id)} style={{flex:2,padding:11,background:C.grelais,border:"none",borderRadius:10,color:"#0B0804",fontWeight:900,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>{t.enregistrer}</button>
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
                            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:sc}}>{sq}</div>
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
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900,marginBottom:16}}>{lang==="fr"?"Mes Livreurs":"My Drivers"}</div>
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
                    {l.statut==="actif"&&<div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:900,color:COL,marginTop:4}}>π{fmtPi(l.gains)}</div>}
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:900,color:C.text,marginBottom:4}}>{regimeData.num}. {regimeData.label}</div>
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:900,color:COL}}>{fmt(caTotal)} F</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,padding:"10px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:13}}>{lang==="fr"?"Provision IMF 1%":"IMF 1% provision"}</span>
              <span style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:C.green,fontSize:15}}>{fmt(caTotal*.01)} F</span>
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
export { RelaisApp };
