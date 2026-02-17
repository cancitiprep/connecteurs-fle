// ═══════════════════════════════════════════════
// Admin — Gestion des phrases (CRUD local)
// Modifie en mémoire, puis deploy via GitHub API
// ═══════════════════════════════════════════════

const GITHUB_REPO = 'cancitiprep/connecteurs-fle';
const GITHUB_BRANCH = 'main';
const GITHUB_FILE_PATH = 'data/phrases.js';
const ADMIN_PASSWORD_HASH = '5f4a2a1d7a6d90e9f74dca2080ac0dc4b850a0ae4b6a7043a23b5a88c359ff80';

let phrases = [];
let nextId = 1;
let isAuthenticated = false;

document.addEventListener('DOMContentLoaded', () => {
  // Vérifier si déjà authentifié dans cette session
  if (sessionStorage.getItem('admin_auth') === 'true') {
    unlockAdmin();
  } else {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-password').focus();
    document.getElementById('login-btn').addEventListener('click', attemptLogin);
    document.getElementById('admin-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptLogin();
    });
  }
});

// ── Authentification ──

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function attemptLogin() {
  const input = document.getElementById('admin-password');
  const password = input.value;

  if (!password) {
    input.classList.add('error');
    return;
  }

  const hash = await hashPassword(password);
  if (hash === ADMIN_PASSWORD_HASH) {
    sessionStorage.setItem('admin_auth', 'true');
    unlockAdmin();
  } else {
    input.classList.add('error');
    input.value = '';
    input.placeholder = 'Mot de passe incorrect';
    input.addEventListener('input', () => {
      input.classList.remove('error');
      input.placeholder = 'Mot de passe';
    }, { once: true });
  }
}

function unlockAdmin() {
  isAuthenticated = true;
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-main').classList.remove('hidden');

  phrases = [...PHRASES];
  nextId = Math.max(...phrases.map(p => p.id)) + 1;

  renderAll();
  document.getElementById('btn-download').addEventListener('click', downloadPhrasesFile);
  document.getElementById('btn-deploy').addEventListener('click', onDeployClick);
  document.getElementById('btn-save-token').addEventListener('click', saveToken);
  document.getElementById('btn-cancel-config').addEventListener('click', () => {
    document.getElementById('github-config').classList.add('hidden');
  });
  updateDeployButton();
}

// ── Rendu complet ──

function renderAll() {
  const container = document.getElementById('admin-container');
  container.innerHTML = '';

  for (const cat of CATEGORIES) {
    const catPhrases = phrases.filter(p => p.category === cat);
    const colors = CAT_COLORS[cat];

    const section = document.createElement('div');
    section.className = 'category-section';

    // En-tête catégorie
    const header = document.createElement('div');
    header.className = 'category-header';
    header.style.background = colors.bg;
    header.style.borderLeftColor = colors.border;
    header.innerHTML = `
      <span style="color: ${colors.text}">${cat} (${catPhrases.length})</span>
      <button class="btn btn-sm btn-primary" data-cat="${cat}">+ Ajouter</button>
    `;
    header.querySelector('button').addEventListener('click', () => addPhrase(cat));
    section.appendChild(header);

    // Phrases
    for (const p of catPhrases) {
      section.appendChild(createPhraseRow(p, colors));
    }

    container.appendChild(section);
  }

  updateCount();
}

// ── Ligne d'une phrase ──

function createPhraseRow(phrase, colors) {
  const row = document.createElement('div');
  row.className = 'phrase-edit-row';
  row.id = `phrase-row-${phrase.id}`;

  row.innerHTML = `
    <div class="phrase-edit-fields">
      <input type="text" class="input-text" value="${escapeHtml(phrase.text)}" placeholder="Texte de la phrase" data-field="text">
      <div class="phrase-edit-bottom">
        <input type="text" class="input-connector" value="${escapeHtml(phrase.connector)}" placeholder="Connecteur" data-field="connector">
        <span class="connector-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">${phrase.category}</span>
        <div class="phrase-edit-actions">
          <button class="btn btn-sm btn-primary btn-save" data-id="${phrase.id}">Sauvegarder</button>
          <button class="btn btn-sm btn-danger btn-delete" data-id="${phrase.id}">Supprimer</button>
        </div>
      </div>
    </div>
  `;

  row.querySelector('.btn-save').addEventListener('click', () => savePhrase(phrase.id, row));
  row.querySelector('.btn-delete').addEventListener('click', () => deletePhrase(phrase.id));

  return row;
}

// ── CRUD ──

function addPhrase(category) {
  const newPhrase = {
    id: nextId++,
    text: "",
    connector: "",
    category: category
  };
  phrases.push(newPhrase);
  renderAll();

  const row = document.getElementById(`phrase-row-${newPhrase.id}`);
  if (row) {
    row.querySelector('.input-text').focus();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showToast(`Nouvelle phrase ajoutee dans ${category}`);
}

function savePhrase(id, row) {
  const phrase = phrases.find(p => p.id === id);
  if (!phrase) return;

  const textInput = row.querySelector('[data-field="text"]');
  const connectorInput = row.querySelector('[data-field="connector"]');

  const newText = textInput.value.trim();
  const newConnector = connectorInput.value.trim();

  if (!newText) {
    textInput.classList.add('error');
    textInput.addEventListener('input', () => textInput.classList.remove('error'), { once: true });
    showToast('Le texte ne peut pas etre vide', true);
    return;
  }
  if (!newConnector) {
    connectorInput.classList.add('error');
    connectorInput.addEventListener('input', () => connectorInput.classList.remove('error'), { once: true });
    showToast('Le connecteur ne peut pas etre vide', true);
    return;
  }

  phrase.text = newText;
  phrase.connector = newConnector;

  showToast('Phrase sauvegardee');
}

function deletePhrase(id) {
  const phrase = phrases.find(p => p.id === id);
  if (!phrase) return;

  if (!confirm(`Supprimer cette phrase ?\n\n"${phrase.text}"`)) return;

  phrases = phrases.filter(p => p.id !== id);
  renderAll();
  showToast('Phrase supprimee');
}

// ── Génération du fichier (sécurisée) ──

function sanitizeText(str) {
  // Supprimer tout ce qui n'est pas du texte normal (lettres, chiffres, ponctuation courante, accents)
  return str.replace(/[^\w\s\u00C0-\u024Fà-ÿ.,;:!?'''""\-()\/…—–&]/g, '');
}

function generatePhrasesJs() {
  let output = `// ═══════════════════════════════════════════════\n`;
  output += `// PHRASES DATA — ${phrases.length} phrases, ${CATEGORIES.length} categories\n`;
  output += `// Source: Les Zexos — Relations logiques B1 (Barbara Delvern)\n`;
  output += `// ═══════════════════════════════════════════════\n\n`;
  output += `const PHRASES = [\n`;

  for (const cat of CATEGORIES) {
    const catPhrases = phrases.filter(p => p.category === cat);
    if (catPhrases.length === 0) continue;

    output += `  // ─── ${cat.toUpperCase()} (${catPhrases.length} phrases) ───\n`;
    for (const p of catPhrases) {
      const text = sanitizeText(p.text).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const conn = sanitizeText(p.connector).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      output += `  { id: ${parseInt(p.id)}, text: "${text}", connector: "${conn}", category: "${escapeHtml(p.category)}" },\n`;
    }
    output += `\n`;
  }

  output += `];\n\n`;
  output += `const CATEGORIES = ${JSON.stringify(CATEGORIES)};\n\n`;
  output += `const CAT_COLORS = {\n`;
  for (const [cat, colors] of Object.entries(CAT_COLORS)) {
    output += `  ${cat.padEnd(14)}: { bg: "${colors.bg}", border: "${colors.border}", text: "${colors.text}" },\n`;
  }
  output += `};\n`;

  return output;
}

// ── Téléchargement local ──

function downloadPhrasesFile() {
  if (!validatePhrases()) return;

  const content = generatePhrasesJs();
  const blob = new Blob([content], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'phrases.js';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`phrases.js telecharge (${phrases.length} phrases)`);
}

// ── GitHub Token ──

function getToken() {
  return localStorage.getItem('github_token_connecteurs');
}

function saveToken() {
  const input = document.getElementById('github-token');
  const token = input.value.trim();
  if (!token) {
    showToast('Veuillez entrer un token', true);
    return;
  }
  localStorage.setItem('github_token_connecteurs', token);
  document.getElementById('github-config').classList.add('hidden');
  updateDeployButton();
  showToast('Token enregistre');
}

function updateDeployButton() {
  const btn = document.getElementById('btn-deploy');
  if (getToken()) {
    btn.title = 'Commit et deploy sur GitHub';
  } else {
    btn.title = 'Configurer le token GitHub d\'abord';
  }
}

// ── Déploiement GitHub ──

function onDeployClick() {
  if (!getToken()) {
    document.getElementById('github-config').classList.remove('hidden');
    document.getElementById('github-token').focus();
    return;
  }

  // Confirmation avant deploy
  const count = phrases.length;
  if (!confirm(`Deployer ${count} phrases sur le site ?\n\nLe site sera mis a jour dans ~1 minute.`)) return;

  deployToGitHub();
}

async function deployToGitHub() {
  if (!validatePhrases()) return;

  const btn = document.getElementById('btn-deploy');
  btn.disabled = true;
  btn.textContent = 'Deploiement...';

  try {
    const token = getToken();
    const content = generatePhrasesJs();
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // 1. Récupérer le SHA actuel du fichier
    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
      { headers: { 'Authorization': `token ${token}` } }
    );

    if (getRes.status === 401) {
      localStorage.removeItem('github_token_connecteurs');
      updateDeployButton();
      throw new Error('Token invalide ou expire. Veuillez en creer un nouveau.');
    }

    if (!getRes.ok) throw new Error(`Erreur GitHub GET: ${getRes.status}`);

    const fileData = await getRes.json();
    const currentSha = fileData.sha;

    // 2. Mettre à jour le fichier
    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Mise a jour phrases (${phrases.length} phrases)`,
          content: contentBase64,
          sha: currentSha,
          branch: GITHUB_BRANCH
        })
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || `Erreur GitHub PUT: ${putRes.status}`);
    }

    showToast('Deploye ! Le site se met a jour dans ~1 minute.');
  } catch (err) {
    showToast('Erreur : ' + err.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Deployer';
  }
}

// ── Validation ──

function validatePhrases() {
  const empty = phrases.find(p => !p.text.trim() || !p.connector.trim());
  if (empty) {
    showToast('Certaines phrases ont des champs vides. Completez-les d\'abord.', true);
    const row = document.getElementById(`phrase-row-${empty.id}`);
    if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  }
  return true;
}

// ── Utilitaires ──

function updateCount() {
  const n = phrases.length;
  document.getElementById('phrase-count').textContent = `${n} phrase${n > 1 ? 's' : ''}`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
  void toast.offsetWidth;
  toast.classList.add('toast-visible');
  setTimeout(() => toast.classList.remove('toast-visible'), 2500);
}
