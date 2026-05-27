// ═══════════════════════════════════════════════════════════
// HOOKS — Multivers'Eau
// useOracle · useToast · useStock · usePiAuth
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { STOCK_INIT } from "../data/constants.js";
import { PI_SANDBOX } from "../design/theme.js";


// ─── useOracle — Prix Pi live CoinGecko · 60s countdown ───────────────────
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
      const r=await fetch("https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=xof",{signal:AbortSignal.timeout(8000)});
      const d=await r.json();const xof=d?.["pi-network"]?.xof;
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

// ─── useToast — Notifications temporaires ────────────────────────────────
function useToast(){
  const[toast,setToast]=useState(null);
  const show=(msg,color=C.green,dur=3000)=>{setToast({msg,color});setTimeout(()=>setToast(null),dur);};
  return{toast,show};
}

// Stock

// ─── useStock — Supabase real-time ───────────────────────────────────────
function useStock(){
  const[stocks,setStocks]=useState(STOCK_INIT);
  const update=(id,qty)=>setStocks(p=>({...p,[id]:Math.max(0,qty)}));
  const dec=(id,qty=1)=>setStocks(p=>({...p,[id]:Math.max(0,(p[id]||0)-qty)}));
  return{stocks,update,dec};
}

// Pi Auth

// ─── usePiAuth — SDK Pi Network ──────────────────────────────────────────
function usePiAuth(){
  const[user,setUser]=useState(null);
  const[role,setRole]=useState(null);
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const inPi=typeof window!=="undefined"&&window.Pi;
    if(!inPi){setUser({username:"demo_user",uid:"demo_uid"});setRole(null);setLoading(false);return;}
    window.Pi.init({version:"2.0",sandbox:PI_SANDBOX});
    window.Pi.authenticate(["username","payments"],async(inc)=>{
      try{await fetch(`/api/incomplete`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({paymentId:inc.identifier})});}catch(e){}
    }).then(async(auth)=>{
      setUser(auth.user);
      try{
        const res=await fetch(`/api/role`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({accessToken:auth.accessToken,username:auth.user.username})});
        const data=await res.json();setRole(data.role||"client");
      }catch{setRole("client");}
    }).catch(()=>{setRole("client");}).finally(()=>setLoading(false));
  },[]);
  return{user,role,loading,setRole};
}

// ════════════════════════════════════════════════════════════════════════════
// COMPOSANTS PARTAGÉS
// ════════════════════════════════════════════════════════════════════════════

export { useOracle, useToast, useStock, usePiAuth };
