# PROJECT.md — Connecteurs FLE

## Contexte
Zoé est professeure de FLE (Français Langue Étrangère) avec 15 ans d'expérience et un Master en FLE. Elle donne des cours en ligne via Zoom à des élèves de niveau B1. Ce projet est un outil pour créer des exercices interactifs sur les connecteurs logiques, basé sur le document pédagogique "Les Zexos — Relations logiques B1" de Barbara Delvern.

## Objectif pédagogique
L'exercice évalue deux compétences :
1. **Repérer** le connecteur logique dans une phrase
2. **Classifier** le connecteur dans la bonne catégorie

## Les 7 catégories de connecteurs

| Catégorie | Couleur | Exemples de connecteurs |
|-----------|---------|------------------------|
| Cause | Orange #EF6C00 | parce que, puisque, comme, car, grâce à, à cause de |
| Conséquence | Vert #2E7D32 | donc, par conséquent, si bien que, du coup, c'est pourquoi |
| But | Bleu #1565C0 | pour que, afin que, afin de, en vue de, de peur que |
| Opposition | Rouge #C62828 | mais, alors que, tandis que, au lieu de, contrairement à |
| Concession | Violet #7B1FA2 | même si, pourtant, bien que, malgré, avoir beau |
| Hypothèse | Jaune #F9A825 | à condition que, à moins que, au cas où, en cas de |
| Temps | Cyan #00838F | dès que, pendant que, avant que, jusqu'à ce que, lorsque |

## Flux utilisateur détaillé

### Flux Professeur

1. Zoé ouvre `index.html`
2. Elle voit les 52 phrases organisées par catégorie avec le connecteur + catégorie affichés
3. Elle peut :
   - Cocher/décocher des phrases individuellement
   - Utiliser "Sélection rapide" (7, 10, 14 aléatoires)
   - Filtrer par catégorie
   - "Tout" / "Rien" par catégorie
4. Elle clique "Créer l'exercice"
5. L'exercice est sauvegardé dans Supabase
6. Elle obtient :
   - Un **lien élève** à partager (ex: `connecteurs-fle.pages.dev/exercice.html?id=abc123`)
   - Un **corrigé** : tableau des phrases sélectionnées avec connecteur attendu + catégorie attendue
   - Un **dashboard résultats** qui se met à jour en temps réel quand les élèves soumettent

### Flux Élève

1. L'élève ouvre le lien partagé par Zoé
2. Il voit un écran d'accueil : titre + champ "Entrez votre prénom"
3. Il entre son prénom et clique "Commencer"
4. Les phrases s'affichent dans un **ordre mélangé** (Fisher-Yates)
5. Pour chaque phrase, l'élève :
   a. Clique sur les mots formant le connecteur (les mots se surlignent en orange)
   b. Voit un aperçu du connecteur sélectionné
   c. Choisit la catégorie parmi 7 pastilles colorées
6. Quand toutes les phrases sont complétées, le bouton "Soumettre" s'active
7. L'élève soumet → les réponses sont envoyées à Supabase
8. L'écran de résultat affiche :
   - Score total (X/Y)
   - Chaque phrase avec ✓ vert ou ✗ rouge
   - **PAS** de réponses attendues (la correction se fait en classe)

### Dashboard Prof (résultats en temps réel)

Après avoir créé un exercice, Zoé reste sur sa page et voit un tableau :

| Élève | Score | Heure | Détail |
|-------|-------|-------|--------|
| Marie | 8/10 | 14:32 | ✓✓✗✓✓✓✓✗✓✓ |
| Pierre | 6/10 | 14:35 | ✓✗✓✓✗✓✗✓✓✗ |

- Se met à jour en temps réel via Supabase Realtime
- Zoé peut voir quelles phrases ont posé le plus de problèmes (stats agrégées par phrase)

## Supabase Setup Instructions

### 1. Créer les tables
```sql
-- Table des exercices
CREATE TABLE exercises (
  id TEXT PRIMARY KEY DEFAULT substr(gen_random_uuid()::text, 1, 8),
  phrase_ids INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des soumissions élèves
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT REFERENCES exercises(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Activer RLS + Policies
```sql
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire et créer des exercices (pas d'auth)
CREATE POLICY "exercises_select" ON exercises FOR SELECT USING (true);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT WITH CHECK (true);

-- Tout le monde peut lire et soumettre des résultats
CREATE POLICY "submissions_select" ON submissions FOR SELECT USING (true);
CREATE POLICY "submissions_insert" ON submissions FOR INSERT WITH CHECK (true);
```

### 3. Activer Realtime
Dans le dashboard Supabase → Database → Replication → activer `submissions`.

### 4. Configuration
Mettre l'URL Supabase et la clé anon dans `js/supabase.js`.

## Notes techniques

### Tokenisation
Chaque phrase est découpée en tokens "mot" (cliquables) et "gap" (espaces/ponctuation, non-cliquables). Chaque token connaît sa position (start/end) dans la chaîne originale. Le connecteur sélectionné = la sous-chaîne entre le start du premier mot cliqué et le end du dernier mot cliqué.

### Matching tolérant
La comparaison entre la sélection de l'élève et le connecteur attendu est flexible :
- Normalisation : minuscules, apostrophes typographiques → apostrophes droites
- Ponctuation ignorée en début/fin
- Apostrophe finale optionnelle ("bien qu'" ≈ "bien qu")
- Un mot adjacent en trop est toléré

### Responsive
Les élèves FLE utilisent souvent leur téléphone. L'interface élève doit être parfaitement utilisable sur mobile (boutons assez grands, texte lisible).

## Déploiement Cloudflare Pages

1. Créer un repo GitHub `connecteurs-fle`
2. Connecter à Cloudflare Pages
3. Build command : (aucune, c'est du HTML statique)
4. Output directory : `/` (racine)
5. Domaine : 
