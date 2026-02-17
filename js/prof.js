// ═══════════════════════════════════════════════
// Interface Professeur — Logique
// ═══════════════════════════════════════════════

const selectedPhraseIds = new Set();
let currentExerciseId = null;
let submissionsData = [];

document.addEventListener('DOMContentLoaded', () => {
  renderPhrases();
  updateCount();

  document.getElementById('btn-7').addEventListener('click', () => quickSelect(7));
  document.getElementById('btn-10').addEventListener('click', () => quickSelect(10));
  document.getElementById('btn-14').addEventListener('click', () => quickSelect(14));
  document.getElementById('btn-clear').addEventListener('click', clearAll);
  document.getElementById('create-btn').addEventListener('click', createExercise);
});

// ── Affichage des phrases par catégorie ──

function renderPhrases() {
  const container = document.getElementById('phrases-container');
  container.innerHTML = '';

  for (const cat of CATEGORIES) {
    const phrases = PHRASES.filter(p => p.category === cat);
    const colors = CAT_COLORS[cat];

    const section = document.createElement('div');
    section.className = 'category-section';

    // En-tête catégorie
    const header = document.createElement('div');
    header.className = 'category-header';
    header.style.background = colors.bg;
    header.style.borderLeftColor = colors.border;
    header.innerHTML = `
      <span style="color: ${colors.text}">${cat} (${phrases.length})</span>
      <div class="cat-actions">
        <button class="btn btn-sm btn-secondary" data-cat="${cat}" data-action="all">Tout</button>
        <button class="btn btn-sm btn-secondary" data-cat="${cat}" data-action="none">Rien</button>
      </div>
    `;
    header.querySelector('[data-action="all"]').addEventListener('click', () => selectCategory(cat, true));
    header.querySelector('[data-action="none"]').addEventListener('click', () => selectCategory(cat, false));
    section.appendChild(header);

    // Phrases
    for (const p of phrases) {
      const item = document.createElement('label');
      item.className = 'phrase-item';
      item.innerHTML = `
        <input type="checkbox" data-phrase-id="${p.id}">
        <div class="phrase-content">
          <span class="phrase-text">${p.text}</span>
          <span class="connector-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
            ${p.connector} — ${p.category}
          </span>
        </div>
      `;
      const cb = item.querySelector('input');
      cb.addEventListener('change', () => {
        if (cb.checked) selectedPhraseIds.add(p.id);
        else selectedPhraseIds.delete(p.id);
        updateCount();
      });
      section.appendChild(item);
    }

    container.appendChild(section);
  }
}

// ── Sélection rapide ──

function quickSelect(n) {
  selectedPhraseIds.clear();
  const shuffled = shuffle([...PHRASES]);
  for (let i = 0; i < Math.min(n, shuffled.length); i++) {
    selectedPhraseIds.add(shuffled[i].id);
  }
  syncCheckboxes();
  updateCount();
}

function selectCategory(cat, select) {
  const phrases = PHRASES.filter(p => p.category === cat);
  for (const p of phrases) {
    if (select) selectedPhraseIds.add(p.id);
    else selectedPhraseIds.delete(p.id);
  }
  syncCheckboxes();
  updateCount();
}

function clearAll() {
  selectedPhraseIds.clear();
  syncCheckboxes();
  updateCount();
}

function syncCheckboxes() {
  document.querySelectorAll('input[data-phrase-id]').forEach(cb => {
    cb.checked = selectedPhraseIds.has(parseInt(cb.dataset.phraseId));
  });
}

function updateCount() {
  const n = selectedPhraseIds.size;
  document.getElementById('selection-count').textContent =
    n === 0 ? 'Aucune phrase sélectionnée' : `${n} phrase${n > 1 ? 's' : ''} sélectionnée${n > 1 ? 's' : ''}`;
  document.getElementById('create-btn').disabled = n === 0;
}

// ── Création d'exercice ──

async function createExercise() {
  if (selectedPhraseIds.size === 0) return;

  const btn = document.getElementById('create-btn');
  btn.disabled = true;
  btn.textContent = 'Création en cours...';

  try {
    const { data, error } = await db
      .from('exercises')
      .insert({ phrase_ids: [...selectedPhraseIds] })
      .select()
      .single();

    if (error) throw error;

    currentExerciseId = data.id;
    showExerciseResult(data);
  } catch (err) {
    alert('Erreur lors de la création : ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Créer l\'exercice';
  }
}

// ── Affichage résultat (lien + tableau unifié) ──

let selectedPhrases = [];
let realtimeChannel = null;

function showExerciseResult(exercise) {
  document.getElementById('creation-section').classList.add('hidden');
  document.getElementById('result-section').classList.remove('hidden');

  selectedPhrases = exercise.phrase_ids
    .map(id => PHRASES.find(p => p.id === id))
    .filter(Boolean);

  // Lien de partage
  const base = window.location.href.replace(/index\.html.*$/, '').replace(/\/$/, '');
  const link = `${base}/exercice.html?id=${exercise.id}`;
  document.getElementById('exercise-link').value = link;
  document.getElementById('copy-btn').addEventListener('click', () => copyLink(link));

  // Tableau unifié (corrigé = colonnes fixes, élèves = colonnes dynamiques)
  renderUnifiedTable();

  // Temps réel
  loadExistingSubmissions(exercise.id);
  subscribeToSubmissions(exercise.id);
}

function copyLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copié !';
    setTimeout(() => btn.textContent = 'Copier', 2000);
  });
}

// ── Tableau unifié : corrigé + colonnes élèves ──

function renderUnifiedTable() {
  const tbody = document.getElementById('unified-tbody');
  tbody.innerHTML = '';

  selectedPhrases.forEach((p, i) => {
    const colors = CAT_COLORS[p.category];
    const tr = document.createElement('tr');
    tr.id = `row-${p.id}`;
    tr.innerHTML = `
      <td class="col-num">${i + 1}</td>
      <td class="col-phrase">${p.text}</td>
      <td class="col-connector"><strong>${p.connector}</strong></td>
      <td class="col-category"><span class="cat-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">${p.category}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Ajout d'une colonne élève ──

function addStudentColumn(submission) {
  // Éviter les doublons
  if (submissionsData.find(s => s.id === submission.id)) return;
  submissionsData.push(submission);

  // Cacher le message d'attente, afficher le footer
  document.getElementById('submissions-empty').classList.add('hidden');
  document.getElementById('unified-tfoot').classList.remove('hidden');

  const answers = typeof submission.answers === 'string' ? JSON.parse(submission.answers) : submission.answers;
  const pct = Math.round((submission.score / submission.total) * 100);
  const scoreClass = pct >= 70 ? 'result-correct' : pct >= 40 ? '' : 'result-incorrect';

  // En-tête : nom de l'élève
  const th = document.createElement('th');
  th.className = 'col-student';
  th.innerHTML = `<div class="student-name">${submission.student_name}</div>`;
  document.getElementById('unified-thead-row').appendChild(th);

  // Cellules ✓/✗ pour chaque phrase
  selectedPhrases.forEach(phrase => {
    const row = document.getElementById(`row-${phrase.id}`);
    const answer = answers.find(a => a.phrase_id === phrase.id);
    const td = document.createElement('td');
    td.className = 'col-student';

    if (answer) {
      const cc = answer.connector_correct;
      const catc = answer.category_correct;
      let cls, label;
      if (cc && catc) { cls = 'result-correct'; label = '✓✓'; }
      else if (cc && !catc) { cls = 'result-partial'; label = '✓✗'; }
      else if (!cc && catc) { cls = 'result-partial'; label = '✗✓'; }
      else { cls = 'result-incorrect'; label = '✗✗'; }
      td.innerHTML = `<span class="${cls}">${label}</span>`;
    } else {
      td.textContent = '—';
    }
    row.appendChild(td);
  });

  // Pied de tableau : score
  const footTd = document.createElement('td');
  footTd.className = 'col-student';
  footTd.innerHTML = `<strong class="${scoreClass}">${submission.score}/${submission.total}</strong>`;
  document.getElementById('unified-tfoot-row').appendChild(footTd);
}

// ── Chargement & temps réel ──

async function loadExistingSubmissions(exerciseId) {
  const { data } = await db
    .from('submissions')
    .select('*')
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: true });

  if (data && data.length > 0) {
    for (const sub of data) {
      addStudentColumn(sub);
    }
  }
}

function subscribeToSubmissions(exerciseId) {
  realtimeChannel = db.channel('submissions-realtime')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'submissions',
      filter: `exercise_id=eq.${exerciseId}`
    }, (payload) => {
      addStudentColumn(payload.new);
    })
    .subscribe();
}

// ── Remettre à zéro ──

function resetExercise() {
  if (!confirm('Remettre à zéro ? Cela permet de créer un nouvel exercice avec de nouvelles questions.')) return;

  // Couper le realtime
  if (realtimeChannel) {
    db.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }

  currentExerciseId = null;
  submissionsData = [];
  selectedPhrases = [];
  selectedPhraseIds.clear();
  syncCheckboxes();
  updateCount();

  // Remettre l'UI en état initial
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('creation-section').classList.remove('hidden');
  document.getElementById('create-btn').textContent = 'Créer l\'exercice';

  // Nettoyer le tableau
  document.getElementById('unified-thead-row').innerHTML = `
    <th class="col-num">#</th>
    <th class="col-phrase">Phrase</th>
    <th class="col-connector">Connecteur</th>
    <th class="col-category">Catégorie</th>
  `;
  document.getElementById('unified-tbody').innerHTML = '';
  document.getElementById('unified-tfoot-row').innerHTML = '<td colspan="4" style="text-align:right;font-weight:700">Score</td>';
  document.getElementById('unified-tfoot').classList.add('hidden');
  document.getElementById('submissions-empty').classList.remove('hidden');
}
