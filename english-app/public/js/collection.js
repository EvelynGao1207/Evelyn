// Collection page logic
let currentFilter = 'all';
let isReviewMode = false;
let flashcardIndex = 0;
let filteredItems = [];

function getScenarioTags() {
  const collection = Storage.getCollection();
  const tags = new Set();
  collection.forEach(item => {
    if (item.scenario) tags.add(item.scenario);
  });
  return ['all', ...Array.from(tags)];
}

function renderFilterTabs() {
  const tags = getScenarioTags();
  const container = document.getElementById('filterTabs');
  container.innerHTML = tags.map(tag => `
    <button class="filter-tab ${tag === currentFilter ? 'active' : ''}"
            onclick="setFilter('${tag}')">
      ${tag === 'all' ? '全部' : tag}
    </button>
  `).join('');
}

function setFilter(tag) {
  currentFilter = tag;
  renderFilterTabs();
  renderList();
}

function getFilteredCollection() {
  const collection = Storage.getCollection();
  if (currentFilter === 'all') return collection;
  return collection.filter(item => item.scenario === currentFilter);
}

function renderList() {
  filteredItems = getFilteredCollection();
  const container = document.getElementById('listView');
  const emptyState = document.getElementById('emptyState');

  if (!filteredItems.length) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = filteredItems.map(item => `
    <div class="collection-item">
      <div class="collection-en">${item.expression}</div>
      <div class="collection-zh">${item.meaning || ''}</div>
      ${item.context ? `<div class="collection-context">"${item.context}"</div>` : ''}
      <div class="collection-meta">
        <span class="collection-tag">${item.scenario || '未分类'}</span>
        <button class="delete-btn" onclick="deleteItem('${item.id}')">删除</button>
      </div>
    </div>
  `).join('');
}

function deleteItem(id) {
  Storage.removeFromCollection(id);
  renderFilterTabs();
  renderList();
}

function toggleReview() {
  filteredItems = getFilteredCollection();
  if (!filteredItems.length) {
    alert('没有可复习的表达');
    return;
  }

  isReviewMode = !isReviewMode;
  const reviewBtn = document.getElementById('reviewBtn');

  if (isReviewMode) {
    reviewBtn.textContent = '返回列表';
    reviewBtn.classList.add('secondary');
    document.getElementById('listView').style.display = 'none';
    document.getElementById('filterTabs').style.display = 'none';
    document.getElementById('flashcardView').style.display = 'block';
    document.getElementById('emptyState').style.display = 'none';
    flashcardIndex = 0;
    // Shuffle
    filteredItems = filteredItems.sort(() => Math.random() - 0.5);
    showFlashcard();
  } else {
    reviewBtn.textContent = '闪卡复习';
    reviewBtn.classList.remove('secondary');
    document.getElementById('listView').style.display = 'block';
    document.getElementById('filterTabs').style.display = 'flex';
    document.getElementById('flashcardView').style.display = 'none';
    renderList();
  }
}

function showFlashcard() {
  if (!filteredItems.length) return;
  const item = filteredItems[flashcardIndex];
  document.getElementById('fcEn').textContent = item.expression;
  document.getElementById('fcZh').textContent = item.meaning || '';
  document.getElementById('fcExample').textContent = item.context ? `"${item.context}"` : '';
  document.getElementById('fcZh').style.display = 'none';
  document.getElementById('fcExample').style.display = 'none';
  document.querySelector('.flashcard-hint').textContent = '点击翻转';
  document.getElementById('fcProgress').textContent = `${flashcardIndex + 1} / ${filteredItems.length}`;
}

function flipCard() {
  const zhEl = document.getElementById('fcZh');
  const exEl = document.getElementById('fcExample');
  const hint = document.querySelector('.flashcard-hint');

  if (zhEl.style.display === 'none') {
    zhEl.style.display = 'block';
    exEl.style.display = 'block';
    hint.textContent = '再次点击翻回';
  } else {
    zhEl.style.display = 'none';
    exEl.style.display = 'none';
    hint.textContent = '点击翻转';
  }
}

function prevCard() {
  if (flashcardIndex > 0) {
    flashcardIndex--;
    showFlashcard();
  }
}

function nextCard() {
  if (flashcardIndex < filteredItems.length - 1) {
    flashcardIndex++;
    showFlashcard();
  } else {
    flashcardIndex = 0;
    showFlashcard();
  }
}

function exportAll() {
  const collection = getFilteredCollection();
  if (!collection.length) {
    alert('没有可导出的内容');
    return;
  }

  const text = collection.map(item =>
    `${item.expression}\t${item.meaning || ''}\t${item.context || ''}\t${item.scenario || ''}`
  ).join('\n');

  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板！可以粘贴到备忘录或 Excel 中');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('已复制到剪贴板！');
  });
}

// Init
renderFilterTabs();
renderList();
