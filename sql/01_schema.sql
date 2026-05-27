-- ════════════════════════════════════════════════════════════════════════════
-- MULTIVERS'EAU — Schéma Supabase COMPLET
-- Exécuter dans SQL Editor · Supabase Dashboard
-- ════════════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Relais ────────────────────────────────────────────────────────────────────
CREATE TABLE relais (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom           TEXT NOT NULL,
  region        TEXT NOT NULL DEFAULT 'grand_lome',
  regime        TEXT NOT NULL DEFAULT 'ets',
  type_local    TEXT DEFAULT 'boutique',
  adresse       TEXT,
  quartier      TEXT,
  wallet_pi     TEXT,
  pi_username   TEXT UNIQUE,
  tel_whatsapp  TEXT,
  nif           TEXT,
  capacite_c    INTEGER DEFAULT 0,  -- capacité en cartons
  capacite_p    INTEGER DEFAULT 0,  -- capacité en packs
  nb_livreurs   INTEGER DEFAULT 0,
  actif         BOOLEAN DEFAULT false,
  charte_signee BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Livreurs ──────────────────────────────────────────────────────────────────
CREATE TABLE livreurs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom           TEXT NOT NULL,
  pi_username   TEXT UNIQUE,
  vehicule      TEXT,               -- id dans FLOTTE: moto_sac, tricycle_l...
  quartier      TEXT,
  adresse       TEXT,
  tel_whatsapp  TEXT,
  relais_id     UUID REFERENCES relais(id),
  statut        TEXT DEFAULT 'attente', -- attente|recommande|actif|inactif
  note_relais   TEXT,
  wallet_pi     TEXT,
  charte_signee BOOLEAN DEFAULT false,
  dist_depot_km NUMERIC(6,2) DEFAULT 0,  -- distance km du livreur au dépôt
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── Stocks ────────────────────────────────────────────────────────────────────
CREATE TABLE stocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relais_id   UUID REFERENCES relais(id) ON DELETE CASCADE,
  produit_id  TEXT NOT NULL,        -- 'v1', 'c2', 't3'...
  quantite    INTEGER DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(relais_id, produit_id)
);

-- ── Historique achats relais (coûts réels) ────────────────────────────────────
CREATE TABLE stock_achats (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relais_id       UUID REFERENCES relais(id) ON DELETE CASCADE,
  produit_id      TEXT NOT NULL,
  quantite        INTEGER NOT NULL,
  prix_achat_unit INTEGER NOT NULL,      -- prix unitaire FCFA usine
  frais_transport INTEGER DEFAULT 0,     -- transport total pour le lot
  cout_unit_total INTEGER GENERATED ALWAYS AS
    (prix_achat_unit + CASE WHEN quantite > 0 THEN frais_transport / quantite ELSE 0 END)
    STORED,
  fournisseur     TEXT,
  date_achat      DATE DEFAULT CURRENT_DATE,
  facture_ref     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Prix de vente (fixés par admin) ──────────────────────────────────────────
CREATE TABLE prix_vente (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produit_id  TEXT UNIQUE NOT NULL,
  prix_fcfa   INTEGER NOT NULL,
  actif       BOOLEAN DEFAULT true,
  updated_by  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Prix de vente initiaux (basés sur le catalogue original)
INSERT INTO prix_vente (produit_id, prix_fcfa, updated_by) VALUES
  ('v1',3800,'flashman90'),('v2',3800,'flashman90'),('v3',3800,'flashman90'),
  ('v4',2150,'flashman90'),('v5',1400,'flashman90'),('v6',1250,'flashman90'),
  ('v7',1600,'flashman90'),('v8',1200,'flashman90'),('v9',1700,'flashman90'),
  ('c1',3700,'flashman90'),('c2',4000,'flashman90'),('c3',2000,'flashman90'),
  ('c4',2000,'flashman90'),('c5',2000,'flashman90'),('c6',2000,'flashman90'),
  ('t1',3700,'flashman90'),('t2',3700,'flashman90'),('t3',3500,'flashman90');

-- ── Commandes ─────────────────────────────────────────────────────────────────
CREATE TABLE commandes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relais_id            UUID REFERENCES relais(id),
  client_pi            TEXT NOT NULL,
  tel_client           TEXT,
  adresse              TEXT,
  adresse_courte       TEXT,
  quartier             TEXT,
  dist_km              NUMERIC(6,2) DEFAULT 0,    -- distance dépôt→client
  vehicule_id          TEXT,                       -- véhicule utilisé pour la course
  statut               TEXT DEFAULT 'nouvelle',   -- nouvelle|assignee|en_cours|livree|annulee|echec
  total_fcfa           INTEGER NOT NULL,
  pa_total_fcfa        INTEGER DEFAULT 0,          -- total prix achat (pour calcSplit)
  frais_livraison_fcfa INTEGER DEFAULT 0,
  frais_blockchain_pi  NUMERIC(12,6) DEFAULT 0.010,
  total_pi             NUMERIC(12,6) NOT NULL,
  oracle_rate          NUMERIC(10,2),
  livreur_id           UUID REFERENCES livreurs(id),
  pi_payment_id        TEXT,                       -- PaymentID Pi SDK
  pi_tx_id             TEXT,                       -- TxID blockchain
  escrow_libere        BOOLEAN DEFAULT false,       -- Pi libéré après confirmation
  produits             JSONB,                       -- snapshot [{id,nom,qty,pv,pa}]
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ── Splits de paiement ────────────────────────────────────────────────────────
-- Créés quand la commande est payée · Libérés quand le client confirme la livraison
CREATE TABLE splits_paiement (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id  UUID REFERENCES commandes(id),
  beneficiaire TEXT NOT NULL,       -- pi_username
  role         TEXT NOT NULL,       -- 'admin' | 'relais' | 'livreur'
  montant_pi   NUMERIC(12,6),
  montant_fcfa INTEGER,
  statut       TEXT DEFAULT 'en_attente', -- en_attente|libere
  libere_at    TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Transactions Pi ───────────────────────────────────────────────────────────
CREATE TABLE transactions_pi (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id  UUID REFERENCES commandes(id),
  payment_id   TEXT UNIQUE NOT NULL,
  tx_id        TEXT,
  montant_pi   NUMERIC(12,6),
  statut       TEXT DEFAULT 'pending', -- pending|approved|completed|cancelled|failed
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── Notifications ─────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinataire_pi TEXT NOT NULL,
  role            TEXT NOT NULL,
  priorite        TEXT DEFAULT '⚪', -- '🔴' urgent | '🟡' important | '⚪' info
  type            TEXT NOT NULL,
  titre           TEXT NOT NULL,
  message         TEXT NOT NULL,
  data            JSONB DEFAULT '{}',
  lu              BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Real-time activé ─────────────────────────────────────────────────────────
ALTER TABLE stocks        REPLICA IDENTITY FULL;
ALTER TABLE commandes     REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE livreurs      REPLICA IDENTITY FULL;

-- ── Vue marge par relais ──────────────────────────────────────────────────────
CREATE VIEW vue_marges AS
SELECT
  sa.relais_id,
  r.nom AS relais_nom,
  sa.produit_id,
  sa.quantite,
  sa.prix_achat_unit,
  sa.frais_transport,
  sa.cout_unit_total,
  pv.prix_fcfa AS prix_vente,
  (pv.prix_fcfa - sa.cout_unit_total) AS marge_unit,
  ROUND(((pv.prix_fcfa - sa.cout_unit_total)::NUMERIC / NULLIF(pv.prix_fcfa,0) * 100), 1) AS marge_pct,
  sa.date_achat
FROM stock_achats sa
JOIN relais r ON r.id = sa.relais_id
LEFT JOIN prix_vente pv ON pv.produit_id = sa.produit_id
ORDER BY sa.date_achat DESC;

-- ── Row Level Security (accès public MVP) ────────────────────────────────────
ALTER TABLE relais          ENABLE ROW LEVEL SECURITY;
ALTER TABLE livreurs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_achats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE prix_vente      ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE splits_paiement ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_pi ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications   ENABLE ROW LEVEL SECURITY;

-- Politiques lecture publique
CREATE POLICY "read_relais"       ON relais          FOR SELECT USING (true);
CREATE POLICY "read_livreurs"     ON livreurs        FOR SELECT USING (true);
CREATE POLICY "read_stocks"       ON stocks          FOR SELECT USING (true);
CREATE POLICY "read_prix"         ON prix_vente      FOR SELECT USING (true);
CREATE POLICY "read_commandes"    ON commandes       FOR SELECT USING (true);
CREATE POLICY "read_splits"       ON splits_paiement FOR SELECT USING (true);
CREATE POLICY "read_notifs"       ON notifications   FOR SELECT USING (true);

-- Politiques écriture publique (MVP — à sécuriser avec JWT en production)
CREATE POLICY "insert_relais"     ON relais          FOR INSERT WITH CHECK (true);
CREATE POLICY "update_relais"     ON relais          FOR UPDATE USING (true);
CREATE POLICY "insert_livreurs"   ON livreurs        FOR INSERT WITH CHECK (true);
CREATE POLICY "update_livreurs"   ON livreurs        FOR UPDATE USING (true);
CREATE POLICY "insert_stocks"     ON stocks          FOR INSERT WITH CHECK (true);
CREATE POLICY "update_stocks"     ON stocks          FOR UPDATE USING (true);
CREATE POLICY "insert_achats"     ON stock_achats    FOR INSERT WITH CHECK (true);
CREATE POLICY "update_prix"       ON prix_vente      FOR UPDATE USING (true);
CREATE POLICY "insert_commandes"  ON commandes       FOR INSERT WITH CHECK (true);
CREATE POLICY "update_commandes"  ON commandes       FOR UPDATE USING (true);
CREATE POLICY "insert_splits"     ON splits_paiement FOR INSERT WITH CHECK (true);
CREATE POLICY "update_splits"     ON splits_paiement FOR UPDATE USING (true);
CREATE POLICY "insert_notifs"     ON notifications   FOR INSERT WITH CHECK (true);
CREATE POLICY "update_notifs"     ON notifications   FOR UPDATE USING (true);

-- ════════════════════════════════════════════════════════════════════════════
-- DONNÉES DE TEST — À exécuter APRÈS avoir noté l'UUID du relais
-- Remplacer 'XXXXXXXXXX-XXXX...' par le vrai UUID retourné
-- ════════════════════════════════════════════════════════════════════════════

-- 1. Ton relais Grand Lomé (toi = admin + relais)
INSERT INTO relais (nom, region, regime, pi_username, tel_whatsapp, actif, charte_signee)
VALUES ('Dépôt Grand Lomé — Flashman', 'grand_lome', 'ets', 'flashman90', '22890XXXXXX', true, true);

-- 2. Vérifier et noter l'UUID
-- SELECT id FROM relais WHERE pi_username = 'flashman90';

-- 3. Stocks initiaux (remplace RELAIS_UUID par le vrai UUID)
-- INSERT INTO stocks (relais_id, produit_id, quantite) VALUES
--   ('RELAIS_UUID','v1',18),('RELAIS_UUID','v2',12),('RELAIS_UUID','v3',24),
--   ('RELAIS_UUID','v4',6), ('RELAIS_UUID','v5',30),('RELAIS_UUID','v6',30),
--   ('RELAIS_UUID','v7',15),('RELAIS_UUID','v8',8), ('RELAIS_UUID','v9',5),
--   ('RELAIS_UUID','c1',14),('RELAIS_UUID','c2',10),('RELAIS_UUID','c3',22),
--   ('RELAIS_UUID','c4',18),('RELAIS_UUID','c5',20),('RELAIS_UUID','c6',16),
--   ('RELAIS_UUID','t1',0), ('RELAIS_UUID','t2',11),('RELAIS_UUID','t3',7);

-- 4. Livreur de test actif
-- INSERT INTO livreurs (nom, pi_username, vehicule, quartier, tel_whatsapp, relais_id, statut)
-- SELECT 'Koffi Mensah','test_livreur_1','moto_sac','Adidogomé','22890000001',id,'actif'
-- FROM relais WHERE pi_username='flashman90';
