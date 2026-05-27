import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../../data/constants.js";

import { T } from "../../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../../components/index.jsx";

import { supabase } from "../../lib/supabase.js";


import { CharteQualite } from "./CharteQualite.jsx";
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900}}>🏪 {lang==="fr"?"Inscription Relais":"Relay Registration"}</div>
            <div style={{fontSize:11,color:C.sub}}>{lang==="fr"?"Formulaire standard Multivers'Eau":"Standard Multivers'Eau form"}</div>
          </div>
          <button onClick={onBack} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"6px 12px",color:"#fff",fontSize:11,cursor:"pointer"}}>{t.retour}</button>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Identification du Partenaire":"Partner Identification"}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Infrastructure de Stockage":"Storage Infrastructure"}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Logistique Locale":"Local Logistics"}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Fiscal & Engagement Pi":"Fiscal & Pi Commitment"}</div>
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
          ?<button onClick={()=>canNext[etape]&&setEtape(e=>e+1)} style={{flex:2,padding:13,background:canNext[etape]?C.grelais:C.border,border:"none",borderRadius:12,color:canNext[etape]?"#0B0804":C.muted,fontWeight:800,fontSize:14,cursor:canNext[etape]?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif"}}>{t.suivant}</button>
          :<button onClick={()=>canNext[4]&&onSubmit(form)} style={{flex:2,padding:13,background:canNext[4]?C.grelais:C.border,border:"none",borderRadius:12,color:canNext[4]?"#0B0804":C.muted,fontWeight:900,fontSize:14,cursor:canNext[4]?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif"}}>🏪 {lang==="fr"?"Soumettre ma candidature":"Submit my application"}</button>}
      </div>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// INSCRIPTION LIVREUR — 5 types véhicules + immatriculation + photos
// ════════════════════════════════════════════════════════════════════════════
export { InscriptionRelais };
