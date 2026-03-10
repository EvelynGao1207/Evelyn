// API client for English Practice App

const API = {
  // Streaming chat with SSE
  async chat(messages, scenario, subScenario, onText, onDone, onError) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, scenario, subScenario }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'text') onText(data.text);
            else if (data.type === 'done') onDone();
            else if (data.type === 'error') onError(data.error);
          } catch (e) {
            // skip malformed data
          }
        }
      }
    } catch (error) {
      onError(error.message);
    }
  },

  // Translation
  async translate(text, direction) {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, direction }),
    });
    return response.json();
  },

  // Conversation summary
  async summarize(messages, scenario) {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, scenario }),
    });
    return response.json();
  },
};
