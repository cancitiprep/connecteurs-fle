-- ═══════════════════════════════════════════════
-- Connecteurs FLE — Supabase Setup
-- Exécuter dans l'éditeur SQL de Supabase
-- ═══════════════════════════════════════════════

-- 1. Table des exercices créés par le prof
CREATE TABLE exercises (
  id TEXT PRIMARY KEY DEFAULT substr(gen_random_uuid()::text, 1, 8),
  phrase_ids INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Table des soumissions des élèves
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT REFERENCES exercises(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  -- answers format: [{ phrase_id, selected_connector, selected_category, connector_correct, category_correct }]
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS (Row Level Security)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire et créer (pas d'auth, app simple)
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (true);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (true);

-- 4. Index pour les requêtes fréquentes
CREATE INDEX idx_submissions_exercise_id ON submissions(exercise_id);

-- ═══════════════════════════════════════════════
-- IMPORTANT: Activer Realtime sur la table submissions
-- Dashboard Supabase → Database → Replication → submissions → ON
-- ═══════════════════════════════════════════════
