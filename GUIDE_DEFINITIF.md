# 🚀 GUIDE DÉFINITIF — Multivers'Eau
## Architecture éclatée · Vercel + Supabase · Windows
## Objectif : multivers.pi avant le 19 décembre 2026

---

## ARCHITECTURE DU PROJET

```
multiverseau/                    ← Racine du projet GitHub
│
├── index.html                   ← HTML + SDK Pi Network
├── package.json                 ← Dépendances
├── vite.config.js               ← Config build (code splitting auto)
├── vercel.json                  ← Règles routing Vercel
├── .env.example                 ← Template variables
├── .gitignore                   ← Protège .env
│
├── api/                         ← Fonctions serveur Vercel
│   ├── approve.js               ← Callback Pi SDK : approuve paiement
│   ├── complete.js              ← Finalise + crée splits automatiques
│   ├── incomplete.js            ← Gère crashs/interruptions Pi SDK
│   ├── release.js               ← Libère escrow après livraison confirmée
│   └── notify.js                ← God View : toutes les notifications admin
│
├── sql/
│   ├── 01_schema.sql            ← Tables principales (exécuter EN PREMIER)
│   └── 02_complement.sql        ← stocks_securite + config_app
│
└── src/
    ├── App.jsx                  ← Router (187 lignes - léger !)
    ├── main.jsx                 ← Entrée React
    │
    ├── design/theme.js          ← C, GF, GCSS, fmt, fmtPi, useWindowWidth
    │
    ├── data/
    │   ├── constants.js         ← CATALOGUE, FLOTTE, calcSplit, Zone A/B,
    │   │                           pts encombrement, PLANCHERS, REGIMES...
    │   └── translations.js      ← T (FR / EN)
    │
    ├── hooks/index.js           ← useOracle, useToast, useStock, usePiAuth
    │
    ├── lib/supabase.js          ← Client Supabase
    │
    ├── components/index.jsx     ← AppWrap, Toast, OracleBadge,
    │                               TradingViewChart, Btn, Fld, Photo, BottomNav
    │
    └── views/
        ├── AdminApp.jsx         ← Dashboard admin complet
        ├── ClientApp.jsx        ← Catalogue + Panier + Paiement Pi
        ├── LivreurApp.jsx       ← Courses + Gains Pi
        ├── RelaisApp.jsx        ← Dépôt + Stocks + Commandes
        ├── FirstLaunch.jsx      ← Config initiale + StockEntry + TestReset
        ├── FiscalSplit.jsx      ← Moteur IMF/TVA + SplitVisualizer
        ├── RelaisComptabilite.jsx ← Dashboard OTR par relais
        ├── onboarding/
        │   └── LandingPage.jsx  ← Splash + "Que voulez-vous faire ?"
        └── inscriptions/
            ├── AcademiePi.jsx
            ├── CharteQualite.jsx
            ├── InscriptionRelais.jsx
            └── InscriptionLivreur.jsx
```

**Avantage clé de cette architecture :**
Vite découpe automatiquement le code en chunks à la compilation.
Le navigateur ne charge que ce dont il a besoin → app 3× plus rapide au chargement initial.

---

# ÉTAPE 1 — PRÉPARER WINDOWS
### ⏱ 20 min | Fait une seule fois

Ouvre le menu Démarrer → tape `cmd` → Entrée

```
node --version    → si absent : nodejs.org → télécharger LTS → installer → redémarrer PC
git --version     → si absent : git-scm.com/download/win → installer
code --version    → si absent : code.visualstudio.com → installer
```

---

# ÉTAPE 2 — RÉCUPÉRER LE CODE
### ⏱ 20 min

```bash
# Dans cmd ou PowerShell :
cd C:\Users\TON_NOM\Desktop
git clone https://github.com/TON_USERNAME/TON_REPO.git
cd TON_REPO
code .                    ← ouvre VS Code
```

Dans le terminal VS Code (menu Terminal → New Terminal) :
```bash
npm install
npm install @supabase/supabase-js
```

**Copier les fichiers de l'archive** `MultiversEau_V2_SPLIT.zip` :
- Dézippez sur le Bureau → dossier `multiverseau/`
- Copie TOUT son contenu dans ton repo → "Remplacer les fichiers" si demandé

**Créer le fichier `.env`** (à la racine, même niveau que package.json) :
```
VITE_SUPABASE_URL=https://XXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_URL=https://XXXXXX.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...
VITE_PI_SANDBOX=true
VITE_ADMIN_USER=flashman90
VITE_INVITE_CODE=flashman90
VITE_GRAND_LOME_ID=A_REMPLIR
GRAND_LOME_RELAIS_ID=A_REMPLIR
SUPABASE_WEBHOOK_SECRET=mve_webhook_secret_2024
```

Test local :
```bash
npm run dev
```
→ Ouvre http://localhost:5173 → tu vois le Splash Multivers'Eau ✅

---

# ÉTAPE 3 — SUPABASE
### ⏱ 45 min

**Créer le projet :**
1. supabase.com → "Continue with GitHub" → "New project"
2. Name: `multiverseau` · Region: West EU · Plan: Free
3. Attends 2-3 min

**Exécuter les scripts SQL :**
→ SQL Editor → "New query"
→ Copie `sql/01_schema.sql` entier → Run ▶ → "Success"
→ "New query" → copie `sql/02_complement.sql` → Run ▶

**Insérer tes données :**
```sql
-- Ton relais Grand Lomé
INSERT INTO relais (nom, region, regime, pi_username, tel_whatsapp, actif, charte_signee)
VALUES ('Dépôt Grand Lomé — Flashman','grand_lome','ets','flashman90','22890XXXXXX',true,true);

-- Récupère et COPIE cet UUID
SELECT id FROM relais WHERE pi_username = 'flashman90';
```

```sql
-- Stocks initiaux à 0 (tu les rempliras dans l'app)
INSERT INTO stocks (relais_id, produit_id, quantite) VALUES
('UUID_ICI','v1',0),('UUID_ICI','v2',0),('UUID_ICI','v3',0),
('UUID_ICI','v4',0),('UUID_ICI','v5',0),('UUID_ICI','v6',0),
('UUID_ICI','v7',0),('UUID_ICI','v8',0),('UUID_ICI','v9',0),
('UUID_ICI','c1',0),('UUID_ICI','c2',0),('UUID_ICI','c3',0),
('UUID_ICI','c4',0),('UUID_ICI','c5',0),('UUID_ICI','c6',0),
('UUID_ICI','t1',0),('UUID_ICI','t2',0),('UUID_ICI','t3',0);

-- Livreur test
INSERT INTO livreurs(nom,pi_username,vehicule,quartier,tel_whatsapp,relais_id,statut)
SELECT 'Koffi Test','koffi_test','moto_sac','Adidogomé','22890000001',id,'actif'
FROM relais WHERE pi_username='flashman90';
```

**Clés API :** Settings ⚙️ → API → copie Project URL + anon/public + service_role
→ Met à jour ton `.env` avec ces valeurs + l'UUID du relais

---

# ÉTAPE 4 — DÉPLOYER SUR VERCEL
### ⏱ 15 min

**Variables d'env Vercel :**
→ vercel.com/dashboard → projet multivers-eau → Settings → Environment Variables
→ Ajoute les 10 variables de ton `.env` une par une

**Push sur GitHub → déploiement auto :**
```bash
git add .
git commit -m "feat: architecture éclatée + Supabase + modules fiscaux"
git push origin main
```
→ Vercel redéploie automatiquement (2-3 min)
→ https://multivers-eau.vercel.app fonctionne ✅

**Webhooks Supabase :**
→ Supabase → Database → Webhooks → Create webhook (×3)

| Name | Table | Events | URL |
|------|-------|--------|-----|
| notif-commandes | commandes | INSERT+UPDATE | https://multivers-eau.vercel.app/api/notify |
| notif-livreurs | livreurs | INSERT+UPDATE | https://multivers-eau.vercel.app/api/notify |
| notif-relais | relais | INSERT | https://multivers-eau.vercel.app/api/notify |

Header sur les 3 : `x-webhook-secret` = `mve_webhook_secret_2024`

---

# ÉTAPE 5 — PI DEVELOPER PORTAL
### ⏱ 20 min

Dans Pi Browser sur ton téléphone :
1. `pi://develop` → "My Apps" → "New App"
2. App URL + Sandbox URL = `https://multivers-eau.vercel.app`
3. Valide

**Test :** ouvre l'URL dans Pi Browser
→ Pi détecte flashman90 → AdminApp s'ouvre automatiquement ✅
→ Bouton flottant ⚙️ visible en bas à droite ✅

---

# ÉTAPE 6 — CONFIGURATION INITIALE + STOCKS
### ⏱ 30 min

**Première connexion admin :**
L'app affiche l'écran "Configuration initiale" (3 étapes) :
1. Ajuste les stocks de sécurité (seuils d'alerte)
2. Vérifie les prix de vente en π (live selon oracle)
3. Entre le username Pi de l'entreprise pour recevoir les commissions

**Entrer les vrais stocks (rôle Relais) :**
→ Bouton flottant → 🏪 Mon Relais → onglet Stocks
→ Pour chaque produit physiquement en stock : bouton "+ Appro"
→ Saisis : quantité + prix d'achat FCFA + frais transport
→ La marge s'affiche instantanément
→ Dès stock > 0 → le produit apparaît dans le catalogue client avec son prix Pi live

---

# ÉTAPE 7 — TESTER LES 4 RÔLES
### ⏱ 2h

1. **Client** → bouton flottant → 💧 Commander → panier → paiement Pi Sandbox
2. **Admin** → ⚙️ → onglet Commandes → assigner livreur
3. **Livreur** → 2ème appareil ou navigation privée → accepter + confirmer livraison
4. **Relais** → bouton flottant → 🏪 → vérifier stocks décrémentés + onglet Fiscal

Tout fonctionne → passer à l'étape 8.

---

# ÉTAPE 8 — RESET DONNÉES TEST → PRODUCTION
### ⏱ 10 min

AdminApp → Paramètres → "Réinitialisation pour la production"
→ Tape `PRODUCTION` → confirme
→ Re-entre tes vrais stocks
→ App ouverte au public ✅

---

# ÉTAPE 9 — 5 PIONNIERS → multivers.pi
### ⏱ 2-4 semaines

Message à diffuser dans tes groupes Pi Togo :
```
🌊 Teste Multivers'Eau sur Pi Browser !
App eau minérale Pi Network · 1ère au Togo

👉 Pi Browser → https://multivers-eau.vercel.app
👉 Fais une commande test
→ Aide-moi à récupérer mon domaine multivers.pi !
Code invite : flashman90
```

Une fois 5 pionniers vérifiés :
→ Pi Browser → Pi Domains → multivers.pi → "Claim" ✅

---

# CHRONOGRAMME

```
SEMAINE 1 — Étapes 1 + 2          (2-8 juin 2026)
  Lun-Mar : Node.js, Git, VS Code, clone repo
  Mer-Jeu : Copie fichiers archive, npm install, test local
  Ven     : .env configuré, npm run dev OK

SEMAINE 2 — Étapes 3 + 4          (9-15 juin 2026)
  Lun-Mar : Supabase créé, 2 SQL scripts exécutés
  Mer     : Données insérées, clés API récupérées
  Jeu     : Variables Vercel ajoutées, git push
  Ven     : App en ligne + Webhooks Supabase configurés

SEMAINE 3 — Étapes 5 + 6          (16-22 juin 2026)
  Lun     : Pi Developer Portal configuré
  Mar-Mer : Test connexion Pi Browser → AdminApp auto
  Jeu-Ven : Config initiale + vrais stocks entrés

SEMAINE 4 — Étapes 7 + 8          (23-29 juin 2026)
  Lun-Mar : Test 4 rôles complets
  Mer     : Ajustements si nécessaire
  Jeu-Ven : Reset données test → app ouverte production

JUILLET semaine 1-2                (30 juin - 11 juil)
  Recrutement 5 pionniers Pi vérifiés
  Chacun commande ou s'inscrit

JUILLET semaine 3                  (14-18 juil 2026)
  ✅ multivers.pi RÉCLAMÉ
  → 5 mois d'avance sur la deadline du 19 déc. 2026

AOÛT → NOVEMBRE 2026
  WhatsApp Business (notifications hors app)
  Vrais livreurs actifs + vraies commandes
  Dashboard comptable OTR utilisé par les relais

DÉCEMBRE 2026
  VITE_PI_SANDBOX=false → paiements Pi réels mainnet
  App en production complète
────────────────────────────────────────
19 DÉC 2026 = DEADLINE ABSOLUE (déjà dépassée en juil ✅)
```

---

# EN CAS DE BLOCAGE

| Symptôme | Solution |
|----------|----------|
| Page blanche | F12 → Console → copie l'erreur → envoie-la |
| "Module not found" | `npm install` |
| Variables non lues | `.env` doit être à la racine du projet |
| Vercel build fail | Dashboard Vercel → Deployments → lire les logs |
| Admin non détecté | Vérifier `VITE_ADMIN_USER=flashman90` sur Vercel |
| Stocks invisibles dans catalogue | quantite doit être > 0 dans Supabase |
| Paiement Pi bloqué | Vérifier que `index.html` charge le SDK Pi |

Coût total : **0 €/mois** jusqu'à ~50 000 utilisateurs.
