// ═══════════════════════════════════════════════
// Tokenizer, Matching & Utilities
// ═══════════════════════════════════════════════

/** Découpe une phrase en tokens (mots cliquables + espaces/ponctuation) */
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

/** Extrait le texte entre le premier et le dernier mot sélectionné */
function getSelectedSpan(text, tokens, selectedWordIndices) {
  if (!selectedWordIndices || selectedWordIndices.size === 0) return "";
  const sorted = [...selectedWordIndices].sort((a, b) => a - b);
  const first = tokens.find(t => t.idx === sorted[0]);
  const last = tokens.find(t => t.idx === sorted[sorted.length - 1]);
  if (!first || !last) return "";
  return text.slice(first.start, last.end);
}

/** Retourne l'ensemble des indices de tokens à surligner (plage min-max) */
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

/** Normalise une chaîne pour la comparaison */
function norm(s) {
  return s.toLowerCase().replace(/[\u2019\u2018\u0060'']/g, "'").replace(/\s+/g, " ").trim();
}

/** Matching tolérant entre la sélection de l'élève et le connecteur attendu */
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

/** Fisher-Yates shuffle */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
