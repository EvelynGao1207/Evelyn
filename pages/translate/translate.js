const { translateText } = require('../../utils/api');

Page({
  data: {
    inputText: '',
    resultText: '',
    translating: false,
    fromLangIndex: 0,
    toLangIndex: 1,
    langOptions: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
      { code: 'ja', name: '日本語' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' }
    ],
    detectedTerms: [],
    history: [],
    quickPhrases: [
      { en: 'action potential', zh: '动作电位' },
      { en: 'synaptic plasticity', zh: '突触可塑性' },
      { en: 'prefrontal cortex', zh: '前额叶皮层' },
      { en: 'hippocampus', zh: '海马体' },
      { en: 'long-term potentiation', zh: '长时程增强' },
      { en: 'default mode network', zh: '默认模式网络' },
      { en: 'working memory', zh: '工作记忆' },
      { en: 'cognitive load', zh: '认知负荷' },
      { en: 'executive function', zh: '执行功能' },
      { en: 'neuroplasticity', zh: '神经可塑性' },
      { en: 'dopaminergic pathway', zh: '多巴胺通路' },
      { en: 'amygdala', zh: '杏仁核' },
      { en: 'Broca\'s area', zh: 'Broca区/布洛卡区' },
      { en: 'blood-brain barrier', zh: '血脑屏障' },
      { en: 'functional connectivity', zh: '功能连接' },
      { en: 'event-related potential', zh: '事件相关电位' }
    ]
  },

  onLoad() {
    const history = wx.getStorageSync('translateHistory') || [];
    this.setData({ history: history.slice(0, 10) });
  },

  onInputChange(e) {
    this.setData({ inputText: e.detail.value });
  },

  onFromLangChange(e) {
    this.setData({ fromLangIndex: Number(e.detail.value) });
  },

  onToLangChange(e) {
    this.setData({ toLangIndex: Number(e.detail.value) });
  },

  onSwapLang() {
    const { fromLangIndex, toLangIndex, inputText, resultText } = this.data;
    this.setData({
      fromLangIndex: toLangIndex,
      toLangIndex: fromLangIndex,
      inputText: resultText || inputText,
      resultText: ''
    });
  },

  async onTranslate() {
    const { inputText, translating, langOptions, fromLangIndex, toLangIndex } = this.data;
    if (!inputText.trim() || translating) return;

    this.setData({ translating: true, resultText: '', detectedTerms: [] });
    try {
      const from = langOptions[fromLangIndex].code;
      const to = langOptions[toLangIndex].code;
      const res = await translateText(inputText, from, to);

      this.setData({
        resultText: res.translatedText,
        detectedTerms: res.detectedTerms || []
      });

      this.saveToHistory(inputText, res.translatedText);
    } catch (err) {
      // Fallback: use local term dictionary for basic translations
      const result = this.localTranslate(inputText);
      this.setData({ resultText: result });
      this.saveToHistory(inputText, result);
    }
    this.setData({ translating: false });
  },

  localTranslate(text) {
    // Simple local fallback using the quick phrases dictionary
    let result = text;
    const detected = [];
    this.data.quickPhrases.forEach(phrase => {
      if (text.toLowerCase().includes(phrase.en.toLowerCase())) {
        result = result.replace(new RegExp(phrase.en, 'gi'), phrase.zh);
        detected.push({ original: phrase.en, translated: phrase.zh });
      }
    });
    if (detected.length > 0) {
      this.setData({ detectedTerms: detected });
    }
    return result;
  },

  saveToHistory(original, translated) {
    const history = [
      { original: original.substring(0, 100), translated: translated.substring(0, 100) },
      ...this.data.history
    ].slice(0, 10);
    this.setData({ history });
    wx.setStorageSync('translateHistory', history);
  },

  onClear() {
    this.setData({ inputText: '', resultText: '', detectedTerms: [] });
  },

  onCopyResult() {
    if (!this.data.resultText) return;
    wx.setClipboardData({
      data: this.data.resultText,
      success: () => wx.showToast({ title: '已复制' })
    });
  },

  onQuickPhrase(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ inputText: text });
  },

  onHistoryTap(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.history[index];
    this.setData({ inputText: item.original, resultText: item.translated });
  }
});
