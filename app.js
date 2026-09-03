const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));

// strong -> weak: what the strong side does to exploit the enemy's weakness
const RULES = [
  {strong:"detection",   weak:"invis",        text:h => `${h.en} grants vision/detection and strips invisibility`},
  {strong:"silence",     weak:"activeReliant",text:h => `${h.en} silences — this enemy depends on active abilities`},
  {strong:"silence",     weak:"channeling",   text:h => `${h.en} can interrupt a vulnerable channeled ultimate`},
  {strong:"breakEffect", weak:"auraPassive",  text:h => `${h.en} strips passives/auras with Break`},
  {strong:"burstPhys",   weak:"squishy",      text:h => `${h.en} finishes a fragile hero with physical burst`},
  {strong:"burstMagic",  weak:"squishy",      text:h => `${h.en} kills with magical burst before a trade`},
  {strong:"spellImmune", weak:"magicBurst",   text:h => `${h.en} ignores magic damage/control`},
  {strong:"armorReduction", weak:"physical",  text:h => `${h.en} shreds armor, gutting this enemy's physical damage`},
  {strong:"evasion",     weak:"physical",     text:h => `${h.en} gives evasion against physical attacks`},
  {strong:"tankyStr",    weak:"burstPhys",    text:h => `${h.en} is too tanky for this hero's burst`},
  {strong:"gapCloser",   weak:"immobile",     text:h => `${h.en} easily catches a low-mobility hero`},
  {strong:"longStun",    weak:"immobile",     text:h => `${h.en} locks the hero down with no escape`},
  {strong:"aoe",         weak:"illusion",     text:h => `${h.en} clears illusions with area damage`},
  {strong:"aoe",         weak:"summons",      text:h => `${h.en} clears summons with area damage`},
  {strong:"sustain",     weak:"pokeReliant",  text:h => `${h.en} outheals the poke damage`},
  {strong:"antiPoke",    weak:"pokeReliant",  text:h => `${h.en} shrugs off harass damage`},
  {strong:"trueStrike",  weak:"physical",     text:h => `${h.en} ignores evasion and always connects`}
];

const CURATED_WEIGHT = 5;
const HEURISTIC_WEIGHT = 1;

function computeCounters(enemyIds, poolAttrFilter) {
  const enemies = enemyIds.map(id => HERO_BY_ID[id]).filter(Boolean);
  if (enemies.length === 0) return [];

  const scores = {};
  const reasons = {};
  const curatedHit = {};

  for (const cand of HEROES) {
    if (enemyIds.includes(cand.id)) continue;
    if (poolAttrFilter && poolAttrFilter !== "all" && cand.attr !== poolAttrFilter) continue;
    scores[cand.id] = 0;
    reasons[cand.id] = [];
    curatedHit[cand.id] = false;
  }

  let anyCurated = false;

  for (const enemy of enemies) {
    // curated hard counters (known matchups) — weighted well above the heuristic
    const curated = CURATED_COUNTERS[enemy.id] || [];
    for (const c of curated) {
      if (!(c.id in scores)) continue;
      scores[c.id] += CURATED_WEIGHT;
      curatedHit[c.id] = true;
      anyCurated = true;
      reasons[c.id].push(`vs ${enemy.en}: ${c.reason}`);
    }

    // tag-based heuristic — a lighter-weight fallback signal
    for (const rule of RULES) {
      if (!enemy.weak.includes(rule.weak)) continue;
      for (const cand of HEROES) {
        if (!(cand.id in scores)) continue;
        if (cand.strong.includes(rule.strong)) {
          scores[cand.id] += HEURISTIC_WEIGHT;
          reasons[cand.id].push(`vs ${enemy.en}: ${rule.text(cand)}`);
        }
      }
    }
  }

  let results = Object.keys(scores)
    .map(id => ({ hero: HERO_BY_ID[id], score: scores[id], curated: curatedHit[id], reasons: dedupeReasons(reasons[id]) }))
    .filter(r => r.score > 0);

  // Once we have real curated matchups on the board, drop picks that only
  // scraped together a single generic tag match — that's noise, not a counter.
  if (anyCurated) {
    results = results.filter(r => r.curated || r.score >= HEURISTIC_WEIGHT * 2);
  }

  results.sort((a, b) => b.score - a.score || a.hero.en.localeCompare(b.hero.en));

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
  div.title = hero.en;
  div.innerHTML = `<span class="hero-initials">${heroInitials(hero.en)}</span><span class="hero-name">${hero.en}</span>`;
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
    return h.en.toLowerCase().includes(q);
  });
  for (const h of filtered) {
    enemyGrid.appendChild(heroTile(h, state.enemies.includes(h.id)));
  }
}

function renderEnemyList() {
  enemyList.innerHTML = "";
  if (state.enemies.length === 0) {
    enemyList.innerHTML = `<span class="placeholder">Pick the enemy heroes on the left (up to 5)</span>`;
    return;
  }
  for (const id of state.enemies) {
    const h = HERO_BY_ID[id];
    const chip = document.createElement("div");
    chip.className = "chip attr-" + h.attr;
    chip.innerHTML = `${h.en} <button aria-label="Remove">×</button>`;
    chip.querySelector("button").addEventListener("click", () => toggleEnemy(id));
    enemyList.appendChild(chip);
  }
}

function renderResults() {
  resultsEl.innerHTML = "";
  if (state.enemies.length === 0) {
    resultsEl.innerHTML = `<div class="placeholder">Pick at least one enemy hero and counter picks will show up here.</div>`;
    return;
  }
  const results = computeCounters(state.enemies, state.attrFilterPool);
  if (results.length === 0) {
    resultsEl.innerHTML = `<div class="placeholder">No strong counters found — try clearing the attribute filter.</div>`;
    return;
  }
  results.forEach((r, i) => {
    const card = document.createElement("div");
    card.className = "result-card attr-" + r.hero.attr;
    card.innerHTML = `
      <div class="result-rank">#${i + 1}</div>
      <div class="result-avatar"><span>${heroInitials(r.hero.en)}</span></div>
      <div class="result-body">
        <div class="result-name">${r.hero.en}</div>
        <div class="result-score">COUNTER STRENGTH: ${"★".repeat(Math.min(5, Math.ceil(r.score/2)))}</div>
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
