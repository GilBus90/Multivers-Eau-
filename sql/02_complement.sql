-- ════════════════════════════════════════════════════════════════════════════
-- SQL COMPLÉMENT — À exécuter dans Supabase après le schema.sql principal
-- Ajoute : stocks_securite + config_app
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stocks_securite (
  produit_id   TEXT PRIMARY KEY,
  quantite_min INTEGER DEFAULT 5,
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS config_app (
  cle        TEXT PRIMARY KEY,
  valeur     TEXT NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stocks_securite ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_app      ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all_stocks_sec" ON stocks_securite FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_config"     ON config_app     FOR ALL USING (true) WITH CHECK (true);

-- Seuils de sécurité par défaut
INSERT INTO stocks_securite (produit_id, quantite_min) VALUES
  ('v1',10),('v2',8),('v3',8),('v4',6),('v5',15),('v6',15),
  ('v7',8),('v8',4),('v9',3),('c1',8),('c2',6),('c3',10),
  ('c4',10),('c5',10),('c6',6),('t1',5),('t2',6),('t3',4)
ON CONFLICT (produit_id) DO NOTHING;

-- Wallet entreprise par défaut (à modifier via l'interface admin)
INSERT INTO config_app (cle, valeur, updated_by)
VALUES ('wallet_entreprise', 'flashman90', 'flashman90')
ON CONFLICT (cle) DO NOTHING;
