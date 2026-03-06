# Connecteurs FLE

Exercice interactif de connecteurs logiques pour le FLE (Français Langue Étrangère), niveau B1.

## Structure du projet

```
connecteurs-fle/
├── CLAUDE.md              # Contexte pour Claude Code
├── PROJECT.md             # Spécification détaillée
├── README.md              # Ce fichier
├── data/
│   └── phrases.js         # 52 phrases avec connecteurs et catégories
├── docs/
│   └── TOKENIZER.md       # Logique de tokenisation et matching (testée)
└── supabase/
    └── setup.sql          # Script de création des tables Supabase
```

## Setup

### 1. Supabase
- Créer un projet sur [supabase.com](https://supabase.com)
- Exécuter `supabase/setup.sql` dans l'éditeur SQL
- Activer Realtime sur la table `submissions`
- Noter l'URL et la clé anon

### 2. Développement local
```bash
# Pas de build, juste un serveur statique
npx serve .
```

### 3. Déploiement
- Push sur GitHub
- Connecter à Cloudflare Pages
- Build command : (vide)
- Output directory : `/`
- Domaine :
