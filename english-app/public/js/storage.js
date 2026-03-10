// localStorage wrapper for English Practice App

const Storage = {
  // Collection (saved expressions)
  getCollection() {
    const data = localStorage.getItem('speakNow_collection');
    return data ? JSON.parse(data) : [];
  },

  saveToCollection(item) {
    const collection = this.getCollection();
    item.id = item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    item.savedAt = new Date().toISOString();
    collection.unshift(item);
    localStorage.setItem('speakNow_collection', JSON.stringify(collection));
    return item;
  },

  removeFromCollection(id) {
    const collection = this.getCollection().filter(item => item.id !== id);
    localStorage.setItem('speakNow_collection', JSON.stringify(collection));
  },

  isInCollection(expression) {
    return this.getCollection().some(item => item.expression === expression);
  },

  // Chat history
  getChatHistory(scenarioKey) {
    const data = localStorage.getItem(`speakNow_chat_${scenarioKey}`);
    return data ? JSON.parse(data) : [];
  },

  saveChatHistory(scenarioKey, messages) {
    localStorage.setItem(`speakNow_chat_${scenarioKey}`, JSON.stringify(messages));
  },

  clearChatHistory(scenarioKey) {
    localStorage.removeItem(`speakNow_chat_${scenarioKey}`);
  },

  // Translate history
  getTranslateHistory() {
    const data = localStorage.getItem('speakNow_translate');
    return data ? JSON.parse(data) : [];
  },

  saveTranslateHistory(item) {
    const history = this.getTranslateHistory();
    item.id = Date.now().toString(36);
    item.translatedAt = new Date().toISOString();
    history.unshift(item);
    if (history.length > 50) history.pop();
    localStorage.setItem('speakNow_translate', JSON.stringify(history));
  }
};
