# Tokenizer & Matching — Logique testée et validée

Ce fichier documente la logique de tokenisation et de matching qui a été testée dans le prototype React. À réutiliser telle quelle dans la version vanilla JS.

## Tokenisation (smartTokenize)

Chaque phrase est découpée en tokens. Chaque token a :
- `text` : le texte du token
- `start` : position de début dans la chaîne originale
- `end` : position de fin dans la chaîne originale  
- `isWord` : true si c'est un mot cliquable (lettres/chiffres), false si c'est un espace/ponctuation
- `idx` : index séquentiel du token

```javascript
function smartTokenize(text) {
  const tokens = [];
  const wordRegex = /[a-zA-ZÀ-ÿ0-9]+/g;
  let match;
  let lastEnd = 0;
  while ((match = wordRegex.exec(text)) !== null) {
    if (match.index > lastEnd) {
      tokens.push({ text: text.slice(lastEnd, match.index), start: lastEnd, end: match.index, isWord: false, idx: tokens.length });
    }
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length, isWord: true, idx: tokens.length });
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd < text.length) {
    tokens.push({ text: text.slice(lastEnd), start: lastEnd, end: text.length, isWord: false, idx: tokens.length });
  }
  return tokens;
}
```

## Extraction du span sélectionné

L'élève clique sur N mots (N ≥ 1). Le connecteur sélectionné = sous-chaîne du texte original allant du `start` du premier token cliqué au `end` du dernier token cliqué. Cela inclut automatiquement les espaces, apostrophes et ponctuation entre les mots.

```javascript
function getSelectedSpan(text, tokens, selectedWordIndices) {
  if (!selectedWordIndices || selectedWordIndices.size === 0) return "";
  const sorted = [...selectedWordIndices].sort((a, b) => a - b);
  const first = tokens.find(t => t.idx === sorted[0]);
  const last = tokens.find(t => t.idx === sorted[sorted.length - 1]);
  if (!first || !last) return "";
  return text.slice(first.start, last.end);
}
```

## Surlignage par plage

Tous les tokens entre le min et le max des tokens cliqués sont surlignés (mots ET gaps).

```javascript
function getHighlightedRange(tokens, selectedWordIndices) {
  if (!selectedWordIndices || selectedWordIndices.size === 0) return new Set();
  const sorted = [...selectedWordIndices].sort((a, b) => a - b);
  const minIdx = sorted[0];
  const maxIdx = sorted[sorted.length - 1];
  const highlighted = new Set();
  for (const t of tokens) {
    if (t.idx >= minIdx && t.idx <= maxIdx) highlighted.add(t.idx);
  }
  return highlighted;
}
```

## Matching tolérant

```javascript
function norm(s) {
  return s.toLowerCase().replace(/[\u2019\u2018'']/g, "'").replace(/\s+/g, " ").trim();
}

function isConnectorMatch(selectedSpan, expectedConnector) {
  if (!selectedSpan) return false;
  const ns = norm(selectedSpan);
  const ne = norm(expectedConnector);
  if (ns === ne) return true;
  
  const strip = (s) => s.replace(/^[^a-zà-ÿ0-9]+/, "").replace(/[^a-zà-ÿ0-9]+$/, "");
  if (strip(ns) === strip(ne)) return true;
  
  // Apostrophe finale optionnelle
  if (strip(ns) === strip(ne.replace(/'$/, ""))) return true;
  if (strip(ne) === strip(ns.replace(/'$/, ""))) return true;
  
  // Un mot de tolérance en plus
  if (ns.includes(ne) && ns.split(" ").length <= ne.split(" ").length + 1) return true;
  if (ne.includes(ns) && ne.split(" ").length <= ns.split(" ").length + 1) return true;
  
  return false;
}
```

## Mécanique de clic (toggle)

- Clic sur un mot non sélectionné → l'ajouter aux endpoints
- Clic sur un mot déjà sélectionné → le retirer des endpoints
- Pas de limite de clics (connecteurs de 1, 2, 3+ mots)
- Bouton ✕ pour tout effacer et recommencer
- La plage surlignée = du min au max de tous les endpoints

## Fisher-Yates shuffle

```javascript
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
```
