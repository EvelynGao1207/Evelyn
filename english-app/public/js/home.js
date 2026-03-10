// Home page logic
let scenarioData = null;

async function loadScenarios() {
  try {
    const res = await fetch('data/scenarios.json');
    scenarioData = await res.json();
    renderDailyExpressions();
    renderScenarioGrid();
  } catch (e) {
    console.error('Failed to load scenarios:', e);
  }
}

function renderDailyExpressions() {
  const pool = scenarioData.dailyExpressions;
  // Pick 3 expressions based on date (rotate daily)
  const today = new Date();
  const dayIndex = Math.floor(today.getTime() / 86400000) % pool.length;
  const selected = [];
  for (let i = 0; i < 3; i++) {
    selected.push(pool[(dayIndex + i) % pool.length]);
  }

  const container = document.getElementById('dailyExpressions');
  container.innerHTML = selected.map(expr => `
    <div class="daily-expression">
      <div class="daily-en">${expr.en}</div>
      <div class="daily-zh">${expr.zh}</div>
    </div>
  `).join('');
}

function renderScenarioGrid() {
  const grid = document.getElementById('scenarioGrid');
  grid.innerHTML = scenarioData.categories.map(cat => `
    <div class="scenario-card" onclick="showSubScenarios('${cat.id}')" style="border-top: 3px solid ${cat.color}">
      <div class="scenario-icon">${cat.icon}</div>
      <div class="scenario-name">${cat.name}</div>
    </div>
  `).join('');
}

function showSubScenarios(categoryId) {
  const category = scenarioData.categories.find(c => c.id === categoryId);
  if (!category) return;

  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('dailyCard').style.display = 'none';
  document.getElementById('subPanel').style.display = 'block';
  document.getElementById('subPanelTitle').textContent = `${category.icon} ${category.name}`;

  const list = document.getElementById('subList');
  list.innerHTML = category.subScenarios.map(sub => `
    <div class="sub-scenario-item" onclick="startChat('${category.id}', '${sub.id}', '${category.name}', '${sub.name}', '${sub.desc}')">
      <div>
        <div class="sub-name">${sub.name}</div>
        <div class="sub-desc">${sub.desc}</div>
      </div>
      <span class="sub-arrow">→</span>
    </div>
  `).join('');
}

function showMainGrid() {
  document.getElementById('mainContent').style.display = 'block';
  document.getElementById('dailyCard').style.display = 'block';
  document.getElementById('subPanel').style.display = 'none';
}

function startChat(scenario, sub, scenarioName, subName, subDesc) {
  const url = `chat.html?scenario=${encodeURIComponent(scenario)}&sub=${encodeURIComponent(sub)}&name=${encodeURIComponent(scenarioName)}&subName=${encodeURIComponent(subName)}&subDesc=${encodeURIComponent(subDesc)}`;
  window.location.href = url;
}

loadScenarios();
