// Chat page logic
const params = new URLSearchParams(window.location.search);
const scenario = params.get('scenario') || 'General conversation';
const subScenario = params.get('sub') || 'Free talk';
const scenarioName = params.get('name') || scenario;
const subName = params.get('subName') || subScenario;

document.getElementById('scenarioLabel').textContent = `${scenarioName} · ${subName}`;

let conversationMessages = [];
let isStreaming = false;

// Parse correction blocks from AI text
function parseCorrections(text) {
  const parts = [];
  const regex = /\[CORRECTION:\s*original="([^"]*)"\s*corrected="([^"]*)"\s*explanation="([^"]*)"\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'correction',
      original: match[1],
      corrected: match[2],
      explanation: match[3]
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', content: text }];
}

function renderMessageContent(text) {
  const parts = parseCorrections(text);
  let html = '';
  for (const part of parts) {
    if (part.type === 'text') {
      html += part.content.replace(/\n/g, '<br>');
    } else {
      html += `<div class="correction-block">
        <div><span class="correction-original">${part.original}</span> → <span class="correction-fixed">${part.corrected}</span></div>
        <div class="correction-explanation">${part.explanation}</div>
      </div>`;
    }
  }
  return html;
}

function addMessage(role, content) {
  const container = document.getElementById('chatMessages');
  // Remove system "loading" message
  const systemMsg = container.querySelector('.message.system');
  if (systemMsg) systemMsg.remove();

  const div = document.createElement('div');
  div.className = `message ${role}`;

  if (role === 'ai') {
    div.innerHTML = renderMessageContent(content);
  } else {
    div.textContent = content;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function addStreamingMessage() {
  const container = document.getElementById('chatMessages');
  const systemMsg = container.querySelector('.message.system');
  if (systemMsg) systemMsg.remove();

  const div = document.createElement('div');
  div.className = 'message ai';
  div.id = 'streamingMsg';
  div.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function updateStreamingMessage(text) {
  const div = document.getElementById('streamingMsg');
  if (div) {
    div.innerHTML = renderMessageContent(text);
    const container = document.getElementById('chatMessages');
    container.scrollTop = container.scrollHeight;
  }
}

function finalizeStreamingMessage() {
  const div = document.getElementById('streamingMsg');
  if (div) div.removeAttribute('id');
}

async function sendMessage() {
  if (isStreaming) return;
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  addMessage('user', text);
  conversationMessages.push({ role: 'user', content: text });

  isStreaming = true;
  document.getElementById('sendBtn').disabled = true;
  addStreamingMessage();

  let fullResponse = '';

  await API.chat(
    conversationMessages,
    scenario,
    subScenario,
    (chunk) => {
      fullResponse += chunk;
      updateStreamingMessage(fullResponse);
    },
    () => {
      finalizeStreamingMessage();
      conversationMessages.push({ role: 'assistant', content: fullResponse });
      Storage.saveChatHistory(`${scenario}_${subScenario}`, conversationMessages);
      isStreaming = false;
      document.getElementById('sendBtn').disabled = false;
      document.getElementById('chatInput').focus();
    },
    (error) => {
      finalizeStreamingMessage();
      updateStreamingMessage(`Error: ${error}`);
      isStreaming = false;
      document.getElementById('sendBtn').disabled = false;
    }
  );
}

async function startConversation() {
  isStreaming = true;
  addStreamingMessage();

  const initMessage = { role: 'user', content: "Hi! Let's start the conversation. Please set the scene and begin." };
  conversationMessages.push(initMessage);

  let fullResponse = '';

  await API.chat(
    conversationMessages,
    scenario,
    subScenario,
    (chunk) => {
      fullResponse += chunk;
      updateStreamingMessage(fullResponse);
    },
    () => {
      finalizeStreamingMessage();
      conversationMessages.push({ role: 'assistant', content: fullResponse });
      isStreaming = false;
      document.getElementById('sendBtn').disabled = false;
      document.getElementById('chatInput').focus();
    },
    (error) => {
      finalizeStreamingMessage();
      updateStreamingMessage(`Unable to connect. Please check your API key and try again.\n\nError: ${error}`);
      isStreaming = false;
      document.getElementById('sendBtn').disabled = false;
    }
  );
}

async function endAndSummarize() {
  if (conversationMessages.length < 2) return;

  document.getElementById('endBtn').disabled = true;
  document.getElementById('summaryModal').style.display = 'flex';

  try {
    const result = await API.summarize(conversationMessages, `${scenarioName} - ${subName}`);
    if (result.code === 0) {
      renderSummary(result.data);
    } else {
      document.getElementById('summaryContent').innerHTML = '<p>总结生成失败，请重试。</p>';
    }
  } catch (e) {
    document.getElementById('summaryContent').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}

function renderSummary(data) {
  let html = '';

  if (data.key_expressions && data.key_expressions.length) {
    html += '<div class="modal-section"><div class="modal-section-title">🗝️ 关键表达</div>';
    for (const expr of data.key_expressions) {
      const saved = Storage.isInCollection(expr.en);
      html += `<div class="modal-expression">
        <div class="modal-expression-text">
          <div class="expr-en">${expr.en}</div>
          <div class="expr-zh">${expr.zh}</div>
        </div>
        <button class="save-btn ${saved ? 'saved' : ''}"
          onclick="saveExpression(this, '${expr.en.replace(/'/g, "\\'")}', '${(expr.zh || '').replace(/'/g, "\\'")}', '${(expr.example || '').replace(/'/g, "\\'")}')">
          ${saved ? '已收藏' : '收藏'}
        </button>
      </div>`;
    }
    html += '</div>';
  }

  if (data.corrections && data.corrections.length) {
    html += '<div class="modal-section"><div class="modal-section-title">✏️ 纠正记录</div>';
    for (const c of data.corrections) {
      html += `<div class="correction-block">
        <div><span class="correction-original">${c.original}</span> → <span class="correction-fixed">${c.corrected}</span></div>
        <div class="correction-explanation">${c.explanation || ''}</div>
      </div>`;
    }
    html += '</div>';
  }

  if (data.areas_to_improve && data.areas_to_improve.length) {
    html += '<div class="modal-section"><div class="modal-section-title">📈 改进方向</div>';
    for (const area of data.areas_to_improve) {
      html += `<p style="font-size:14px;margin-bottom:6px;">• ${area}</p>`;
    }
    html += '</div>';
  }

  if (data.encouragement) {
    html += `<div class="modal-section"><div class="modal-section-title">💪 鼓励</div><p style="font-size:14px;">${data.encouragement}</p></div>`;
  }

  document.getElementById('summaryContent').innerHTML = html;
}

function saveExpression(btn, en, zh, example) {
  if (btn.classList.contains('saved')) return;
  Storage.saveToCollection({
    expression: en,
    meaning: zh,
    scenario: scenarioName,
    context: example || ''
  });
  btn.classList.add('saved');
  btn.textContent = '已收藏';
}

function closeSummary() {
  document.getElementById('summaryModal').style.display = 'none';
  Storage.clearChatHistory(`${scenario}_${subScenario}`);
  window.location.href = 'index.html';
}

// Start the conversation when page loads
startConversation();
