const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));

// strong -> weak: за что сильная сторона контрит слабость врага, и текст причины
const RULES = [
  {strong:"detection",   weak:"invis",        text:h => `${h.ru} даёт обзор/детект и снимает невидимость`},
  {strong:"silence",     weak:"activeReliant",text:h => `${h.ru} силенсит — враг зависит от активных способностей`},
  {strong:"silence",     weak:"channeling",   text:h => `${h.ru} может сорвать ченнелящийся ульт силенсом/станом`},
  {strong:"breakEffect", weak:"auraPassive",  text:h => `${h.ru} снимает пассивки/ауры через брейк`},
  {strong:"burstPhys",   weak:"squishy",      text:h => `${h.ru} добивает хрупкого героя физическим бурстом`},
  {strong:"burstMagic",  weak:"squishy",      text:h => `${h.ru} убивает магическим бурстом до размена`},
  {strong:"spellImmune", weak:"magicBurst",   text:h => `${h.ru} игнорирует магический урон/контроль`},
  {strong:"armorReduction", weak:"physical",  text:h => `${h.ru} снижает броню, обнуляя физический урон врага`},
  {strong:"evasion",     weak:"physical",     text:h => `${h.ru} даёт уклонение от физических атак`},
  {strong:"tankyStr",    weak:"burstPhys",    text:h => `${h.ru} слишком живуч для бурста этого героя`},
  {strong:"gapCloser",   weak:"immobile",     text:h => `${h.ru} легко догоняет малоподвижного героя`},
  {strong:"longStun",    weak:"immobile",     text:h => `${h.ru} фиксирует героя без побега надолго`},
  {strong:"aoe",         weak:"illusion",     text:h => `${h.ru} убивает иллюзии по площади`},
  {strong:"aoe",         weak:"summons",      text:h => `${h.ru} убивает призывы по площади`},
  {strong:"sustain",     weak:"pokeReliant",  text:h => `${h.ru} перебивает харасс лечением/реген.`},
  {strong:"antiPoke",    weak:"pokeReliant",  text:h => `${h.ru} хорошо переживает харасс`},
  {strong:"trueStrike",  weak:"physical",     text:h => `${h.ru} игнорирует уклонение и добивает точно`}
];

function computeCounters(enemyIds, poolAttrFilter) {
  const enemies = enemyIds.map(id => HERO_BY_ID[id]).filter(Boolean);
  if (enemies.length === 0) return [];

  const scores = {};
  const reasons = {};

  for (const cand of HEROES) {
    if (enemyIds.includes(cand.id)) continue;
    if (poolAttrFilter && poolAttrFilter !== "all" && cand.attr !== poolAttrFilter) continue;
    scores[cand.id] = 0;
    reasons[cand.id] = [];
  }

  for (const enemy of enemies) {
    // curated (более весомые и конкретные)
    const curated = CURATED_COUNTERS[enemy.id] || [];
    for (const c of curated) {
      if (!(c.id in scores)) continue;
      scores[c.id] += 3;
      reasons[c.id].push(`против ${enemy.ru}: ${c.reason}`);
    }

    // эвристика по тегам
    for (const rule of RULES) {
      if (!enemy.weak.includes(rule.weak)) continue;
      for (const cand of HEROES) {
        if (!(cand.id in scores)) continue;
        if (cand.strong.includes(rule.strong)) {
          scores[cand.id] += 1;
          reasons[cand.id].push(`против ${enemy.ru}: ${rule.text(cand)}`);
        }
      }
    }
  }

  const results = Object.keys(scores)
    .map(id => ({ hero: HERO_BY_ID[id], score: scores[id], reasons: dedupeReasons(reasons[id]) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results.slice(0, 12);
}

function dedupeReasons(list) {
  const seen = new Set();
  const out = [];
  for (const r of list) {
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }
  return out.slice(0, 4);
}

// ---------- UI ----------

const state = {
  enemies: [],
  search: "",
  attrFilterEnemy: "all",
  attrFilterPool: "all"
};

const enemyGrid = document.getElementById("enemy-grid");
const enemyList = document.getElementById("enemy-list");
const resultsEl = document.getElementById("results");
const searchInput = document.getElementById("search");
const clearBtn = document.getElementById("clear-btn");
const attrButtons = document.querySelectorAll(".attr-filter[data-target='enemy'] button");
const poolAttrButtons = document.querySelectorAll(".attr-filter[data-target='pool'] button");

function heroInitials(name) {
  return name.split(/[\s']+/).map(w => w[0]).join("").slice(0,2).toUpperCase();
}

function heroTile(hero, selected) {
  const div = document.createElement("div");
  div.className = "hero-tile attr-" + hero.attr + (selected ? " selected" : "");
  div.title = hero.ru;
  div.innerHTML = `<span class="hero-initials">${heroInitials(hero.en)}</span><span class="hero-name">${hero.ru}</span>`;
  div.addEventListener("click", () => toggleEnemy(hero.id));
  return div;
}

function toggleEnemy(id) {
  const idx = state.enemies.indexOf(id);
  if (idx >= 0) {
    state.enemies.splice(idx, 1);
  } else {
    if (state.enemies.length >= 5) return;
    state.enemies.push(id);
  }
  render();
}

function renderEnemyGrid() {
  enemyGrid.innerHTML = "";
  const q = state.search.trim().toLowerCase();
  const filtered = HEROES.filter(h => {
    if (state.attrFilterEnemy !== "all" && h.attr !== state.attrFilterEnemy) return false;
    if (!q) return true;
    return h.ru.toLowerCase().includes(q) || h.en.toLowerCase().includes(q);
  });
  for (const h of filtered) {
    enemyGrid.appendChild(heroTile(h, state.enemies.includes(h.id)));
  }
}

function renderEnemyList() {
  enemyList.innerHTML = "";
  if (state.enemies.length === 0) {
    enemyList.innerHTML = `<span class="placeholder">Выберите героев врага слева (до 5)</span>`;
    return;
  }
  for (const id of state.enemies) {
    const h = HERO_BY_ID[id];
    const chip = document.createElement("div");
    chip.className = "chip attr-" + h.attr;
    chip.innerHTML = `${h.ru} <button aria-label="Убрать">×</button>`;
    chip.querySelector("button").addEventListener("click", () => toggleEnemy(id));
    enemyList.appendChild(chip);
  }
}

function renderResults() {
  resultsEl.innerHTML = "";
  if (state.enemies.length === 0) {
    resultsEl.innerHTML = `<div class="placeholder">Как только выберете хотя бы одного героя врага — здесь появятся рекомендации.</div>`;
    return;
  }
  const results = computeCounters(state.enemies, state.attrFilterPool);
  if (results.length === 0) {
    resultsEl.innerHTML = `<div class="placeholder">Явных контрпиков не найдено — попробуйте снять фильтр по атрибуту.</div>`;
    return;
  }
  results.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card attr-" + r.hero.attr;
    card.innerHTML = `
      <div class="result-rank">#${i + 1}</div>
      <div class="result-avatar"><span>${heroInitials(r.hero.en)}</span></div>
      <div class="result-body">
        <div class="result-name">${r.hero.ru}</div>
        <div class="result-score">Сила контрпика: ${"★".repeat(Math.min(5, Math.ceil(r.score/2)))}</div>
        <ul class="result-reasons">
          ${r.reasons.map(x => `<li>${x}</li>`).join("")}
        </ul>
      </div>
    `;
    resultsEl.appendChild(card);
  });
}

function render() {
  renderEnemyGrid();
  renderEnemyList();
  renderResults();
}

searchInput.addEventListener("input", e => {
  state.search = e.target.value;
  renderEnemyGrid();
});

clearBtn.addEventListener("click", () => {
  state.enemies = [];
  render();
});

attrButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    attrButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.attrFilterEnemy = btn.dataset.attr;
    renderEnemyGrid();
  });
});

poolAttrButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    poolAttrButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.attrFilterPool = btn.dataset.attr;
    renderResults();
  });
});

render();
