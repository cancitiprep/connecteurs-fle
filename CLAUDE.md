# Connecteurs FLE — Exercice interactif

## Projet
Application web pour créer et partager des exercices de connecteurs logiques (FLE niveau B1). Deux interfaces : professeur (création + suivi) et élève (exercice + soumission).

## Stack technique
- **Frontend** : HTML/CSS/JS vanilla (pas de React, pas de build)
- **Backend** : Supabase (auth implicite, real-time, base PostgreSQL)
- **Hébergement** : Cloudflare Pages (connecteurs-fle.pages.dev)
- **Style** : Moderne, épuré, responsive (mobile-first car les élèves utilisent souvent leur téléphone)

## Architecture des pages

### 1. `index.html` — Interface Professeur
- Affiche toutes les phrases organisées par catégorie (7 catégories)
- Sélection manuelle ou rapide (7, 10, 14 aléatoires)
- Bouton "Créer l'exercice" → sauvegarde dans Supabase → génère un lien unique
- Affiche aussi une vue "Corrigé" avec les réponses attendues (pour la préparation du prof)
- Dashboard résultats : voir les soumissions des élèves en temps réel (Supabase Realtime)

### 2. `exercice.html?id=XXX` — Interface Élève
- L'élève entre son prénom
- Voit les phrases mélangées (Fisher-Yates shuffle)
- Pour chaque phrase : clique sur les mots du connecteur + choisit la catégorie
- Soumet ses réponses → sauvegarde dans Supabase
- Voit son score (vert/rouge, PAS de réponses attendues affichées)

## Base de données Supabase — 2 tables

### Table `exercises`
```sql
CREATE TABLE exercises (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  phrase_ids INTEGER[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table `submissions`
```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id TEXT REFERENCES exercises(id),
  student_name TEXT NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### answers JSONB format
```json
[
  {
    "phrase_id": 1,
    "selected_connector": "parce que",
    "selected_category": "Cause",
    "connector_correct": true,
    "category_correct": true
  }
]
```

### RLS Policies
- exercises: SELECT pour tous (anon), INSERT pour tous (anon)
- submissions: SELECT pour tous (anon), INSERT pour tous (anon)
- Activer Realtime sur la table submissions

## Données des phrases
Toutes les phrases sont dans `data/phrases.js` — 52 phrases réparties en 7 catégories.

## Mécanique de l'exercice

### Sélection du connecteur (élève)
- Chaque phrase est tokenisée : les mots sont cliquables, les espaces/ponctuation ne le sont pas
- L'élève clique sur les mots qui forment le connecteur (1, 2, 3 ou plus)
- Tout ce qui est entre le premier et le dernier mot cliqué est surligné automatiquement
- L'aperçu du connecteur sélectionné s'affiche sous la phrase
- Bouton ✕ pour effacer la sélection

### Matching (correction)
- Le texte original entre les positions des mots sélectionnés est extrait
- Comparaison normalisée : minuscules, apostrophes unifiées, ponctuation ignorée en début/fin
- Tolérance : un mot adjacent en trop est accepté
- Tolérance : apostrophe finale optionnelle ("bien qu'" == "bien qu")

### Correction affichée à l'élève
- Juste vert (correct) / rouge (incorrect) — PAS de réponses attendues
- Score total X/Y
- La correction détaillée se fait en classe avec le prof via Zoom

## Fichiers du projet
```
connecteurs-fle/
├── index.html          # Interface prof (sélection + dashboard)
├── exercice.html       # Interface élève
├── css/
│   └── style.css       # Styles partagés
├── js/
│   ├── phrases.js      # Données des 52 phrases
│   ├── tokenizer.js    # Tokenisation + matching
│   ├── prof.js         # Logique interface prof
│   ├── exercice.js     # Logique interface élève
│   └── supabase.js     # Config Supabase
├── CLAUDE.md           # Ce fichier
├── PROJECT.md          # Spec détaillée
└── README.md           # Instructions de déploiement
```

## Conventions
- Français pour tout le contenu visible (UI, textes, commentaires dans le code)
- Anglais pour les noms de variables et fonctions
- Pas de framework, pas de bundler, pas de npm
- Utiliser le CDN Supabase : https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
- Mobile-first responsive design
- Couleurs par catégorie cohérentes entre interface prof et élève
