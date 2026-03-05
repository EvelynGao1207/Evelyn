const { getNewsDetail, translateText } = require('../../utils/api');
const { formatDate } = require('../../utils/date');

const categoryClassMap = {
  'molecular-cellular': 'neuro',
  'circuits-systems': 'cognitive',
  'cognition-behavior': 'imaging',
  'development-plasticity': 'neuro',
  'emotion-social': 'clinical',
  'computation': 'computational',
  'disorders-clinical': 'clinical',
  'imaging-methods': 'imaging'
};

const categoryNameMap = {
  'molecular-cellular': '分子与细胞',
  'circuits-systems': '环路与系统',
  'cognition-behavior': '认知与行为',
  'development-plasticity': '发育与可塑性',
  'emotion-social': '情绪与社会脑',
  'computation': '计算神经科学',
  'disorders-clinical': '脑疾病与临床',
  'imaging-methods': '成像与技术'
};

Page({
  data: {
    article: null,
    loading: true,
    isTranslating: false,
    isTranslated: false,
    translatedTitle: '',
    translatedParagraphs: [],
    paragraphTranslations: {}
  },

  onLoad(options) {
    if (options.id) {
      this.fetchDetail(options.id);
    }
  },

  async fetchDetail(id) {
    this.setData({ loading: true });
    try {
      const res = await getNewsDetail(id);
      const article = res.data || res;
      article.publishDate = formatDate(article.publishTime);
      article.categoryClass = categoryClassMap[article.category] || 'neuro';
      article.categoryName = categoryNameMap[article.category] || article.category;
      article.contentParagraphs = (article.content || '').split('\n').filter(p => p.trim());
      this.setData({ article });
    } catch (err) {
      console.error('Failed to fetch detail:', err);
      // Demo article for preview
      this.setData({
        article: {
          title: 'Prefrontal Cortex Neurons Encode Abstract Rules for Flexible Behavior',
          source: 'Nature Neuroscience',
          publishDate: formatDate(new Date()),
          category: 'neuroscience',
          categoryClass: 'neuro',
          categoryName: '神经科学',
          tags: ['PFC', 'flexibility', 'primates'],
          contentParagraphs: [
            'Researchers at MIT have identified a new population of neurons in the prefrontal cortex (PFC) that encode abstract task rules, enabling rapid behavioral flexibility in primates.',
            'The study used multi-electrode arrays to record from hundreds of neurons simultaneously in the dorsolateral PFC while monkeys performed a rule-switching task.',
            'They found that a subset of neurons rapidly reconfigured their activity patterns within a single trial when the task rule changed, without requiring extensive relearning.',
            'These "rule neurons" maintained stable representations of abstract rules even when the sensory stimuli and motor responses changed, suggesting they operate at a high level of cognitive abstraction.',
            'The findings provide new insights into how the brain supports flexible cognition and may have implications for understanding disorders like schizophrenia where cognitive flexibility is impaired.'
          ],
          keyFindings: [
            'Identified rule-encoding neurons in dorsolateral PFC',
            'Neurons reconfigure within single trials during rule switches',
            'Abstract rule representations are stimulus-independent',
            'May explain cognitive flexibility deficits in schizophrenia'
          ],
          url: 'https://doi.org/10.1038/s41593-example'
        }
      });
    }
    this.setData({ loading: false });
  },

  async onTranslateAll() {
    if (this.data.isTranslating) return;

    if (this.data.isTranslated) {
      this.setData({ isTranslated: false });
      return;
    }

    this.setData({ isTranslating: true });
    try {
      const article = this.data.article;
      const paragraphs = article.contentParagraphs;

      const [titleRes, ...paragraphResults] = await Promise.all([
        translateText(article.title),
        ...paragraphs.map(p => translateText(p))
      ]);

      this.setData({
        translatedTitle: titleRes.translatedText,
        translatedParagraphs: paragraphResults.map(r => r.translatedText),
        isTranslated: true
      });
    } catch (err) {
      wx.showToast({ title: '翻译失败，请重试', icon: 'none' });
    }
    this.setData({ isTranslating: false });
  },

  async onLongPressTitle() {
    if (this.data.translatedTitle) return;
    wx.showLoading({ title: '翻译中...' });
    try {
      const res = await translateText(this.data.article.title);
      this.setData({ translatedTitle: res.translatedText });
    } catch (err) {
      wx.showToast({ title: '翻译失败', icon: 'none' });
    }
    wx.hideLoading();
  },

  async onLongPressParagraph(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.paragraphTranslations[index]) {
      this.setData({ [`paragraphTranslations[${index}]`]: '' });
      return;
    }
    const text = this.data.article.contentParagraphs[index];
    wx.showLoading({ title: '翻译中...' });
    try {
      const res = await translateText(text);
      this.setData({ [`paragraphTranslations[${index}]`]: res.translatedText });
    } catch (err) {
      wx.showToast({ title: '翻译失败', icon: 'none' });
    }
    wx.hideLoading();
  },

  onCopyLink() {
    if (!this.data.article.url) return;
    wx.setClipboardData({
      data: this.data.article.url,
      success: () => wx.showToast({ title: '链接已复制' })
    });
  },

  onShareAppMessage() {
    const article = this.data.article;
    return {
      title: article ? article.title : '瞬见NeuroScope - 神经科学前沿',
      path: `/pages/news-detail/news-detail?id=${article._id}`
    };
  }
});
