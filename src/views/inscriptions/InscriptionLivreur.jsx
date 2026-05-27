import { useState, useEffect, useCallback, useRef } from "react";

import { C, GF, GCSS, fmt, fmtPi, useWindowWidth, CODE_INVITATION, FRAIS_RESEAU_PI, PI_SANDBOX, API_URL } from "../../design/theme.js";

import { CATALOGUE, BRANDS, PLANCHERS, REGIMES, FLOTTE, STOCK_INIT, STOCK_MIN, calcSplit, calcFraisLivraison, ZONE_A_KM } from "../../data/constants.js";

import { T } from "../../data/translations.js";

import { AppWrap, Toast, OracleBadge, TradingViewChart, Btn, Fld, Photo, BottomNav } from "../../components/index.jsx";

import { supabase } from "../../lib/supabase.js";


import { CharteQualite } from "./CharteQualite.jsx";
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
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:900}}>🏍️ {lang==="fr"?"Inscription Livreur":"Driver Registration"}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Identité & Localisation":"Identity & Location"}</div>
            </div>
            <Fld label={lang==="fr"?"NOM ET PRÉNOMS":"FULL NAME"} value={form.nom} onChange={e=>upd("nom",e.target.value)} placeholder={lang==="fr"?"Ex: Kofi Mensah":"Ex: Kofi Mensah"} req lang={lang}/>
            <Fld label={lang==="fr"?"NUMÉRO WHATSAPP":"WHATSAPP NUMBER"} value={form.tel} onChange={e=>upd("tel",e.target.value)} placeholder="+228 90 XX XX XX" type="tel" req lang={lang}/>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"RÉGION D'ACTIVITÉ":"ACTIVITY REGION"}<span style={{color:C.red}}> *</span></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {REGS.map(r=>(
                  <div key={r} onClick={()=>upd("region",r)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",textAlign:"center",background:form.region===r?C.livreur+"22":C.card2,border:`1.5px solid ${form.region===r?C.livreur:C.border}`,fontSize:12,fontWeight:700,color:form.region===r?C.livreur:C.text}}>{r}</div>
                ))}
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:6}}>⚠️ {lang==="fr"?"Vous devez habiter à moins de 5 km du dépôt":"You must live within 5 km of the depot"}</div>
            </div>
            <Fld label={lang==="fr"?"QUARTIER DE RÉSIDENCE":"HOME DISTRICT"} value={form.quartier} onChange={e=>upd("quartier",e.target.value)} placeholder={lang==="fr"?"Ex: Segbé, Adidogomé...":"Ex: Segbé, Adidogomé..."} req lang={lang}/>
          </div>
        )}
        {etape===2&&(
          <div>
            <div style={{borderLeft:`3px solid ${C.livreur}`,paddingLeft:12,marginBottom:18}}>
              <div style={{fontSize:10,color:C.livreur,fontWeight:800}}>SECTION 2</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Détails du Véhicule":"Vehicle Details"}</div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,marginBottom:8}}>{lang==="fr"?"TYPE D'ENGIN":"VEHICLE TYPE"}<span style={{color:C.red}}> *</span></div>
              {FLOTTE.map(v=>(
                <div key={v.id} onClick={()=>upd("vehicule",v.id)} style={{padding:"13px 16px",borderRadius:14,cursor:"pointer",marginBottom:8,background:form.vehicule===v.id?C.livreur+"18":C.card2,border:`1.5px solid ${form.vehicule===v.id?C.livreur:C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <div style={{width:22,height:22,borderRadius:"50%",background:form.vehicule===v.id?C.livreur:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:form.vehicule===v.id?"#fff":C.muted,fontSize:12,fontWeight:900,flexShrink:0}}>{form.vehicule===v.id?"✓":""}</div>
                    <span style={{fontSize:20}}>{v.icon}</span>
                    <span style={{fontWeight:700,color:form.vehicule===v.id?C.livreur:C.text,fontSize:13}}>{v.label}</span>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Équipements & Preuves":"Equipment & Proof"}</div>
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
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800}}>{lang==="fr"?"Écosystème Pi":"Pi Ecosystem"}</div>
            </div>
            <Fld label={lang==="fr"?"ADRESSE WALLET PI (CLÉ G...)":"PI WALLET ADDRESS (G... KEY)"} value={form.wallet} onChange={e=>upd("wallet",e.target.value)} placeholder="GDIFY...ET7HH" req lang={lang} note={lang==="fr"?"C'est ici que vous recevrez 90% des frais de livraison en Pi":"You receive 90% of delivery fees in Pi here"}/>
            <div style={{background:"linear-gradient(135deg,#0A1520,#0F1E30)",border:`2px solid ${C.admin}44`,borderRadius:16,padding:"16px 18px",marginBottom:18,textAlign:"center"}}>
              <div style={{fontSize:11,color:C.admin,fontWeight:800,marginBottom:8}}>{lang==="fr"?"VOUS N'AVEZ PAS ENCORE PI ?":"DON'T HAVE PI YET?"}</div>
              <div style={{fontSize:13,color:C.sub,marginBottom:10}}>{lang==="fr"?"Code d'invitation :":"Invitation code:"}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:900,color:C.admin,letterSpacing:3}}>{CODE_INVITATION}</div>
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
              <div style={{width:24,height:24,borderRadius:7,flexShrink:0,background:form.accepte?C.livreur:C.border,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:14}}>{form.accepte?"✓":""}</div>
              <div style={{fontSize:13,color:C.sub,lineHeight:1.5}}>{lang==="fr"?"J'accepte les conditions Multivers'Eau et je m'engage à protéger les produits et respecter les prix.":"I accept Multivers'Eau terms and commit to protecting products and respecting prices."}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:460,background:C.surf,borderTop:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",gap:10}}>
        {etape>1&&<button onClick={()=>setEtape(e=>e-1)} style={{flex:1,padding:13,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,color:C.muted,fontWeight:600,cursor:"pointer"}}>{t.retour}</button>}
        {etape<4
          ?<button onClick={()=>canNext[etape]&&setEtape(e=>e+1)} style={{flex:2,padding:13,background:canNext[etape]?C.glivreur:C.border,border:"none",borderRadius:12,color:canNext[etape]?"#fff":C.muted,fontWeight:800,fontSize:14,cursor:canNext[etape]?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif"}}>{t.suivant}</button>
          :<button onClick={()=>canNext[4]&&onSubmit(form)} style={{flex:2,padding:13,background:canNext[4]?C.glivreur:C.border,border:"none",borderRadius:12,color:canNext[4]?"#fff":C.muted,fontWeight:900,fontSize:14,cursor:canNext[4]?"pointer":"not-allowed",fontFamily:"'Syne',sans-serif"}}>🏍️ {lang==="fr"?"Soumettre ma candidature":"Submit my application"}</button>}
      </div>
    </AppWrap>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// CLIENT APP — Catalogue + Panier + Paiement Pi
// ════════════════════════════════════════════════════════════════════════════
export { InscriptionLivreur };
