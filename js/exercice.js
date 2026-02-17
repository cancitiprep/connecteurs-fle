// ═══════════════════════════════════════════════
// Interface Élève — Logique de l'exercice
// ═══════════════════════════════════════════════

let exerciseData = null; // { id, phrases }
let studentName = '';
let phraseStates = {}; // { phraseId: { selectedWords: Set, selectedCategory: string|null, tokens: [] } }

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const params = new URLSearchParams(window.location.search);
  const exerciseId = params.get('id');

  if (!exerciseId) {
    showError("Aucun exercice spécifié. Vérifiez le lien envoyé par votre professeur.");
    return;
  }

  try {
    const { data, error } = await db
      .from('exercises')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error || !data) throw new Error("Exercice introuvable");

    const phrases = data.phrase_ids
      .map(id => PHRASES.find(p => p.id === id))
      .filter(Boolean);

    if (phrases.length === 0) throw new Error("Aucune phrase trouvée pour cet exercice");

    exerciseData = { id: exerciseId, phrases: shuffle(phrases) };

    // Afficher l'écran d'accueil
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('start-btn').addEventListener('click', startExercise);
    document.getElementById('student-name').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') startExercise();
    });
  } catch (err) {
    showError("Impossible de charger l'exercice : " + err.message);
  }
}

// ── Démarrage ──

function startExercise() {
  const input = document.getElementById('student-name');
  studentName = input.value.trim();

  if (!studentName) {
    input.classList.add('error');
    input.addEventListener('input', () => input.classList.remove('error'), { once: true });
    return;
  }

  document.getElementById('welcome-screen').classList.add('hidden');
  document.getElementById('instructions-screen').classList.remove('hidden');

  document.getElementById('understood-btn').addEventListener('click', beginExercise);
}

function beginExercise() {
  document.getElementById('instructions-screen').classList.add('hidden');
  document.getElementById('exercise-screen').classList.remove('hidden');
  renderExercise();
}

// ── Rendu de l'exercice ──

function renderExercise() {
  const container = document.getElementById('phrases-list');
  container.innerHTML = '';

  exerciseData.phrases.forEach((phrase, index) => {
    const tokens = smartTokenize(phrase.text);
    phraseStates[phrase.id] = { selectedWords: new Set(), selectedCategory: null, tokens };

    const card = document.createElement('div');
    card.className = 'phrase-card';
    card.id = `phrase-${phrase.id}`;

    // Numéro
    const num = document.createElement('div');
    num.className = 'phrase-number';
    num.textContent = `Phrase ${index + 1} / ${exerciseData.phrases.length}`;
    card.appendChild(num);

    // Tokens cliquables
    const textDiv = document.createElement('div');
    textDiv.className = 'phrase-tokens';
    textDiv.id = `tokens-${phrase.id}`;
    renderTokens(textDiv, phrase.id);
    card.appendChild(textDiv);

    // Aperçu connecteur sélectionné
    const preview = document.createElement('div');
    preview.className = 'connector-preview';
    preview.id = `preview-${phrase.id}`;
    card.appendChild(preview);

    // Pastilles catégories
    const pills = document.createElement('div');
    pills.className = 'cat-pills';
    pills.id = `pills-${phrase.id}`;
    for (const cat of CATEGORIES) {
      const colors = CAT_COLORS[cat];
      const pill = document.createElement('button');
      pill.className = 'cat-pill';
      pill.style.background = colors.bg;
      pill.style.color = colors.text;
      pill.style.borderColor = colors.border;
      pill.textContent = cat;
      pill.addEventListener('click', () => onSelectCategory(phrase.id, cat));
      pills.appendChild(pill);
    }
    card.appendChild(pills);

    // Statut
    const status = document.createElement('div');
    status.className = 'phrase-status';
    status.id = `status-${phrase.id}`;
    card.appendChild(status);

    container.appendChild(card);
  });

  updateProgress();
}

// ── Rendu des tokens ──

function renderTokens(container, phraseId) {
  container.innerHTML = '';
  const state = phraseStates[phraseId];
  const highlighted = getHighlightedRange(state.tokens, state.selectedWords);

  for (const token of state.tokens) {
    const span = document.createElement('span');

    if (token.isWord) {
      span.className = 'token-word';
      if (state.selectedWords.has(token.idx)) {
        span.classList.add('selected');
      } else if (highlighted.has(token.idx)) {
        span.classList.add('highlighted');
      }
      span.addEventListener('click', () => toggleWord(phraseId, token.idx));
    } else {
      span.className = 'token-gap';
      if (highlighted.has(token.idx)) {
        span.classList.add('highlighted');
      }
    }

    span.textContent = token.text;
    container.appendChild(span);
  }

  // Bouton effacer
  if (state.selectedWords.size > 0) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = '✕';
    clearBtn.title = 'Effacer la sélection';
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearSelection(phraseId);
    });
    container.appendChild(clearBtn);
  }
}

// ── Interactions tokens ──

function toggleWord(phraseId, tokenIdx) {
  const state = phraseStates[phraseId];
  if (state.selectedWords.has(tokenIdx)) {
    state.selectedWords.delete(tokenIdx);
  } else {
    state.selectedWords.add(tokenIdx);
  }

  renderTokens(document.getElementById(`tokens-${phraseId}`), phraseId);
  updatePreview(phraseId);
  updatePhraseStatus(phraseId);
  updateProgress();
}

function clearSelection(phraseId) {
  phraseStates[phraseId].selectedWords.clear();
  renderTokens(document.getElementById(`tokens-${phraseId}`), phraseId);
  updatePreview(phraseId);
  updatePhraseStatus(phraseId);
  updateProgress();
}

// ── Sélection catégorie ──

function onSelectCategory(phraseId, category) {
  phraseStates[phraseId].selectedCategory = category;

  // Mettre à jour les pastilles
  const pills = document.getElementById(`pills-${phraseId}`);
  pills.querySelectorAll('.cat-pill').forEach(pill => {
    pill.classList.toggle('selected', pill.textContent === category);
  });

  updatePhraseStatus(phraseId);
  updateProgress();
}

// ── Aperçu connecteur ──

function updatePreview(phraseId) {
  const state = phraseStates[phraseId];
  const phrase = exerciseData.phrases.find(p => p.id === phraseId);
  const span = getSelectedSpan(phrase.text, state.tokens, state.selectedWords);

  const preview = document.getElementById(`preview-${phraseId}`);
  if (span) {
    preview.innerHTML = `<span class="preview-label">Connecteur sélectionné :</span> <strong>${span}</strong>`;
    preview.classList.add('visible');
  } else {
    preview.innerHTML = '';
    preview.classList.remove('visible');
  }
}

// ── Statut de chaque phrase ──

function updatePhraseStatus(phraseId) {
  const state = phraseStates[phraseId];
  const status = document.getElementById(`status-${phraseId}`);
  const card = document.getElementById(`phrase-${phraseId}`);

  const hasConnector = state.selectedWords.size > 0;
  const hasCategory = state.selectedCategory !== null;

  if (hasConnector && hasCategory) {
    status.textContent = '✓ Complété';
    status.className = 'phrase-status complete';
    card.classList.add('completed');
  } else if (hasConnector || hasCategory) {
    status.textContent = !hasConnector ? 'Sélectionnez le connecteur' : 'Choisissez la catégorie';
    status.className = 'phrase-status partial';
    card.classList.remove('completed');
  } else {
    status.textContent = '';
    status.className = 'phrase-status';
    card.classList.remove('completed');
  }
}

// ── Progression ──

function updateProgress() {
  const total = exerciseData.phrases.length;
  const completed = exerciseData.phrases.filter(p => {
    const s = phraseStates[p.id];
    return s && s.selectedWords.size > 0 && s.selectedCategory !== null;
  }).length;

  document.getElementById('progress-text').textContent = `${completed} / ${total} phrases complétées`;
  document.getElementById('progress-fill').style.width = `${(completed / total) * 100}%`;
  document.getElementById('submit-btn').disabled = completed < total;
}

// ── Soumission ──

document.addEventListener('click', (e) => {
  if (e.target.id === 'submit-btn' && !e.target.disabled) submitAnswers();
});

async function submitAnswers() {
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Envoi en cours...';

  const answers = [];
  let score = 0;

  for (const phrase of exerciseData.phrases) {
    const state = phraseStates[phrase.id];
    const selectedSpan = getSelectedSpan(phrase.text, state.tokens, state.selectedWords);
    const connectorCorrect = isConnectorMatch(selectedSpan, phrase.connector);
    const categoryCorrect = state.selectedCategory === phrase.category;

    if (connectorCorrect && categoryCorrect) score++;

    answers.push({
      phrase_id: phrase.id,
      selected_connector: selectedSpan,
      selected_category: state.selectedCategory,
      connector_correct: connectorCorrect,
      category_correct: categoryCorrect
    });
  }

  try {
    const { error } = await db
      .from('submissions')
      .insert({
        exercise_id: exerciseData.id,
        student_name: studentName,
        answers,
        score,
        total: exerciseData.phrases.length
      });

    if (error) throw error;

    showResults(answers, score);
  } catch (err) {
    alert("Erreur lors de l'envoi : " + err.message);
    btn.disabled = false;
    btn.textContent = 'Soumettre mes réponses';
  }
}

// ── Affichage résultats ──

function showResults(answers, score) {
  document.getElementById('exercise-screen').classList.add('hidden');
  document.getElementById('results-screen').classList.remove('hidden');

  const total = exerciseData.phrases.length;
  const pct = Math.round((score / total) * 100);
  const level = pct >= 70 ? 'good' : pct >= 40 ? 'medium' : 'poor';

  document.getElementById('score-display').innerHTML = `
    <div class="score-circle ${level}">
      <span class="score-number">${score}</span>
      <span class="score-total">/ ${total}</span>
    </div>
    <p class="score-text">${getScoreMessage(pct)}</p>
  `;

  const list = document.getElementById('results-list');
  list.innerHTML = '';

  exerciseData.phrases.forEach((phrase, i) => {
    const answer = answers[i];
    const ok = answer.connector_correct && answer.category_correct;
    const item = document.createElement('div');
    item.className = `result-item ${ok ? 'correct' : 'incorrect'}`;
    item.innerHTML = `
      <span class="result-icon">${ok ? '✓' : '✗'}</span>
      <span class="result-phrase">${phrase.text}</span>
    `;
    list.appendChild(item);
  });
}

function getScoreMessage(pct) {
  if (pct === 100) return 'Parfait ! Excellent travail !';
  if (pct >= 80) return 'Très bien ! Quelques erreurs mineures.';
  if (pct >= 60) return 'Pas mal ! Continue à travailler.';
  if (pct >= 40) return 'Des progrès à faire. Courage !';
  return 'Difficile cette fois. On en reparlera en classe !';
}

// ── Erreur ──

function showError(msg) {
  document.body.innerHTML = `
    <div class="error-screen">
      <h2>Oups !</h2>
      <p>${msg}</p>
    </div>
  `;
}
