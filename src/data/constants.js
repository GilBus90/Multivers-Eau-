// ═══════════════════════════════════════════════
// DONNÉES MÉTIER — Multivers'Eau
// CATALOGUE · BRANDS · PLANCHERS · REGIMES · FLOTTE
// calcSplit · Zone A/B · pts encombrement
// ═══════════════════════════════════════════════

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
  voltic: {label:"Voltic",emoji:"💧",color:"#0080FF",light:"#0080FF15"},
  cristal:{label:"Cristal",emoji:"🫧",color:"#00A87A",light:"#00A87A15"},
  vitale: {label:"Eau Vitale",emoji:"✨",color:"#9333EA",light:"#9333EA15"},
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

// ── Zones livraison ────────────────────────────
export const ZONE_A_KM    = 15;
export const ZONE_B_EXTRA = 75; // FCFA/km au-delà de 15km

export function calcFraisLivraison(distKm, vehiculeId = "moto_sac") {
  const v = FLOTTE.find(f => f.id === vehiculeId) || FLOTTE[0];
  if (distKm <= ZONE_A_KM) return v.tarifA;
  return v.tarifA + Math.round((distKm - ZONE_A_KM) * ZONE_B_EXTRA);
}

// ── Split paiement ─────────────────────────────
// relais  = PA + 90% marge nette (après IMF)
// livreur = 90% frais livraison
// admin   = 10% marge + 10% livraison
export function calcSplit(pvTotal, paTotal, livraison, oracleRate = 90, regime = "ets") {
  const marge    = pvTotal - paTotal;
  const imfFcfa  = regime !== "informel" ? Math.round(pvTotal * 0.01) : 0;
  const tvaFcfa  = (regime === "sarl" || regime === "grande") ? Math.round(pvTotal * 0.18) : 0;
  const fiscalRsv= imfFcfa + tvaFcfa;
  const margeNet = marge - fiscalRsv;
  return {
    relaisFcfa:    paTotal  + Math.round(margeNet * 0.90),
    livreurFcfa:   Math.round(livraison * 0.90),
    adminFcfa:     Math.round(margeNet * 0.10) + Math.round(livraison * 0.10),
    fiscalReserve: fiscalRsv,
    relaisPi:   (paTotal  + Math.round(margeNet * 0.90)) / oracleRate,
    livreurPi:  Math.round(livraison * 0.90) / oracleRate,
    adminPi:    (Math.round(margeNet * 0.10) + Math.round(livraison * 0.10)) / oracleRate,
  };
}

export { CATALOGUE, BRANDS, PLANCHERS, REGIONS_INFO, STOCK_INIT, STOCK_MIN, REGIMES, FLOTTE };
