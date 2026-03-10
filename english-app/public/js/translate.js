// Translate page logic
let direction = 'zh2en';
let lastResult = null;
let lastInput = '';

function swapDirection() {
  direction = direction === 'zh2en' ? 'en2zh' : 'zh2en';
  document.getElementById('fromLabel').textContent = direction === 'zh2en' ? '中文' : 'English';
  document.getElementById('toLabel').textContent = direction === 'zh2en' ? 'English' : '中文';
  document.getElementById('inputText').placeholder =
    direction === 'zh2en' ? '输入要翻译的中文...' : 'Enter English text to translate...';
}

async function doTranslate() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) return;

  const btn = document.getElementById('translateBtn');
  btn.disabled = true;
  btn.textContent = '翻译中...';
  document.getElementById('results').style.display = 'none';

  try {
    const result = await API.translate(text, direction);
    if (result.code === 0) {
      lastResult = result.data;
      lastInput = text;

      document.getElementById('formalResult').textContent = result.data.formal;
      document.getElementById('casualResult').textContent = result.data.casual;
      document.getElementById('slangResult').textContent = result.data.slang;

      let noteText = '';
      if (result.data.note) noteText += result.data.note;
      if (result.data.cultural_context) noteText += (noteText ? '\n\n' : '') + '💡 ' + result.data.cultural_context;
      document.getElementById('resultNote').textContent = noteText;
      document.getElementById('resultNote').style.display = noteText ? 'block' : 'none';

      document.getElementById('results').style.display = 'block';

      // Save to history
      Storage.saveTranslateHistory({
        input: text,
        direction,
        formal: result.data.formal,
        casual: result.data.casual
      });
      renderHistory();

      // Reset save buttons
      document.querySelectorAll('#results .save-btn').forEach(btn => {
        btn.classList.remove('saved');
        btn.textContent = '收藏';
      });
    }
  } catch (e) {
    alert('翻译失败: ' + e.message);
  }

  btn.disabled = false;
  btn.textContent = '翻译';
}

function saveResult(type) {
  if (!lastResult) return;
  const expression = lastResult[type];
  const btn = event.target;

  if (btn.classList.contains('saved')) return;

  Storage.saveToCollection({
    expression: expression,
    meaning: lastInput,
    scenario: '翻译',
    context: `${type}: ${expression}`
  });

  btn.classList.add('saved');
  btn.textContent = '已收藏';
}

function renderHistory() {
  const history = Storage.getTranslateHistory();
  const container = document.getElementById('historyList');
  const section = document.getElementById('historySection');

  if (!history.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  container.innerHTML = history.slice(0, 10).map(item => `
    <div class="history-item" onclick="fillFromHistory('${item.input.replace(/'/g, "\\'")}')">
      <div class="history-original">${item.input}</div>
      <div class="history-translated">${item.casual || item.formal}</div>
    </div>
  `).join('');
}

function fillFromHistory(text) {
  document.getElementById('inputText').value = text;
  document.getElementById('inputText').focus();
}

// Init
renderHistory();
