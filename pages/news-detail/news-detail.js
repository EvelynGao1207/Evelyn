const { getNewsDetail, translateText } = require('../../utils/api');
const { formatDate } = require('../../utils/date');

const categoryClassMap = {
  neuroscience: 'neuro',
  cognitive: 'cognitive',
  neuroimaging: 'imaging',
  computational: 'computational',
  clinical: 'clinical'
};

const categoryNameMap = {
  neuroscience: '神经科学',
  cognitive: '认知心理学',
  neuroimaging: '脑成像',
  computational: '计算神经科学',
  clinical: '临床神经'
};

Page({
  data: {
    article: null,
    loading: true,
    isTranslating: false,
    isTranslated: false,
    translatedTitle: '',
    translatedParagraphs: []
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
      title: article ? article.title : 'NeuroScope - 神经科学前沿',
      path: `/pages/news-detail/news-detail?id=${article._id}`
    };
  }
});
