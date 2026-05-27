import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../data/constants.js";

import { T } from "../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../components/index.jsx";

import { supabase } from "../lib/supabase.js";
import { useToast } from "../hooks/index.js";


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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:18,fontWeight:900}}>💧 {t.appName}</div>
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
          <strong style={{marginLeft:"auto",color:C.admin,fontSize:12}}>{CODE_INVITATION}</strong>
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
                  <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,color:br.color,fontSize:14}}>{br.label}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {items.map(p=>{
                    const sq=stocks[p.id]||0,iq=panier[p.id]||0,rest=sq-iq;
                    const epuise=rest<=0,faible=sq>0&&sq<=STOCK_MIN[p.id];
                    return(
                      <div key={p.id} style={{background:C.card,borderRadius:16,padding:13,border:`1.5px solid ${iq>0?br.color:C.border}`,opacity:epuise?.55:1,position:"relative",boxShadow:iq>0?`0 4px 16px ${br.color}22`:"none"}}>
                        {iq>0&&<div style={{position:"absolute",top:-9,right:-9,background:br.color,color:"#fff",borderRadius:"50%",width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900}}>{iq}</div>}
                        <div style={{width:40,height:40,borderRadius:10,background:br.light,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:8}}>{p.icon}</div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,marginBottom:1}}>{lang==="fr"?p.nFr:p.nEn}</div>
                        <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{p.d}</div>
                        <div style={{fontSize:10,color:br.color,marginBottom:6}}>{lang==="fr"?p.noteF:p.noteE}</div>
                        {/* Stock bar */}
                        <div style={{marginBottom:8}}>
                          <div style={{fontSize:10,color:epuise?C.red:faible?C.relais:C.green,marginBottom:3}}>
                            {epuise?t.rupture:faible?`⚠️ ${rest} ${p.u}${rest>1?"s":""}`:` ${rest} ${p.u}${rest>1?"s":""}`}
                          </div>
                          <div style={{background:C.border,borderRadius:3,height:4}}>
                            <div style={{background:epuise?C.red:faible?C.relais:br.color,height:4,borderRadius:3,width:`${Math.max(0,(rest/Math.max(1,sq))*100)}%`,transition:"width .3s"}}/>
                          </div>
                        </div>
                        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:20,color:"#0088cc"}}>{fmtPi(p.prix/oracle.rate)} π</div>
                        <div style={{fontSize:10,color:C.muted,marginBottom:8}}>≈ {fmt(p.prix)} F</div>
                        {epuise?(
                          <div style={{textAlign:"center",padding:"8px",background:C.red+"18",borderRadius:10,fontSize:11,fontWeight:700,color:C.red}}>{t.rupture}</div>
                        ):iq===0?(
                          <button onClick={()=>add(p.id)} style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${br.color}CC,${br.color})`,border:"none",borderRadius:10,color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"'Syne',sans-serif"}}>{t.ajouter}</button>
                        ):(
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <button onClick={()=>rem(p.id)} style={{width:30,height:30,borderRadius:"50%",background:C.card2,border:"none",fontWeight:900,fontSize:16,cursor:"pointer",color:C.text}}>−</button>
                            <span style={{flex:1,textAlign:"center",fontFamily:"'Syne',sans-serif",fontWeight:900,fontSize:16,color:br.color}}>{iq}</span>
                            <button onClick={()=>add(p.id)} style={{width:30,height:30,borderRadius:"50%",background:br.color,border:"none",fontWeight:900,fontSize:16,cursor:"pointer",color:"#fff"}}>+</button>
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
              <button onClick={()=>setTab("catalogue")} style={{marginTop:14,padding:"10px 24px",background:COL,border:"none",borderRadius:12,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13,fontFamily:"'Syne',sans-serif"}}>{lang==="fr"?"Voir le catalogue":"View catalogue"}</button>
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
                      <button onClick={()=>add(id)} style={{width:27,height:27,borderRadius:"50%",background:br.color,border:"none",cursor:"pointer",fontWeight:800,fontSize:14,color:"#fff"}}>+</button>
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
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:900,color:COL}}>π {totalPi}</div>
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
                  <div style={{fontFamily:"'Syne',sans-serif",fontWeight:900,color:C.green,fontSize:18}}>{t.paiementOk}</div>
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
export { ClientApp };
