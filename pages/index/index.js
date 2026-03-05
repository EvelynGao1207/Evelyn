const { getNewsList, translateText } = require('../../utils/api');
const { formatRelativeTime, getToday } = require('../../utils/date');
const app = getApp();

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
    today: getToday(),
    categories: [],
    currentCategory: '',
    newsList: [],
    loading: true,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.setData({ categories: app.globalData.categories });
    this.fetchNews();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.fetchNews().then(() => wx.stopPullDownRefresh());
  },

  async fetchNews() {
    this.setData({ loading: true });
    try {
      const res = await getNewsList(this.data.currentCategory, this.data.page);
      const list = (res.data || []).map(item => ({
        ...item,
        relativeTime: formatRelativeTime(item.publishTime),
        categoryClass: categoryClassMap[item.category] || 'neuro',
        categoryName: categoryNameMap[item.category] || item.category,
        translated: false,
        translatedTitle: '',
        translatedSummary: ''
      }));

      if (this.data.page === 1) {
        this.setData({ newsList: list });
      } else {
        this.setData({ newsList: [...this.data.newsList, ...list] });
      }
      this.setData({ hasMore: list.length >= 10 });
    } catch (err) {
      console.error('Failed to fetch news:', err);
      // Use demo data for preview
      if (this.data.page === 1) {
        this.setData({ newsList: this.getDemoNews() });
      }
    }
    this.setData({ loading: false });
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category, page: 1, hasMore: true });
    this.fetchNews();
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/news-detail/news-detail?id=${id}` });
  },

  async onQuickTranslate(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.newsList[index];
    if (item.translated) return;

    wx.showLoading({ title: '翻译中...' });
    try {
      const [titleRes, summaryRes] = await Promise.all([
        translateText(item.title),
        translateText(item.summary)
      ]);
      const key = `newsList[${index}]`;
      this.setData({
        [`${key}.translated`]: true,
        [`${key}.translatedTitle`]: titleRes.translatedText,
        [`${key}.translatedSummary`]: summaryRes.translatedText
      });
    } catch (err) {
      wx.showToast({ title: '翻译失败，请重试', icon: 'none' });
    }
    wx.hideLoading();
  },

  onLoadMore() {
    this.setData({ page: this.data.page + 1 });
    this.fetchNews();
  },

  getDemoNews() {
    return [
      {
        _id: 'demo1',
        title: 'Prefrontal Cortex Neurons Encode Abstract Rules for Flexible Behavior',
        summary: 'Researchers at MIT discovered a new population of neurons in the prefrontal cortex that encode abstract task rules, enabling rapid behavioral flexibility in primates.',
        source: 'Nature Neuroscience',
        publishTime: new Date().toISOString(),
        category: 'neuroscience',
        relativeTime: '2小时前',
        categoryClass: 'neuro',
        categoryName: '神经科学',
        translated: false, translatedTitle: '', translatedSummary: ''
      },
      {
        _id: 'demo2',
        title: 'Working Memory Capacity Linked to Neural Oscillation Patterns',
        summary: 'A new study using MEG shows that individual differences in working memory capacity correlate with the power and frequency of theta-gamma coupling in parietal cortex.',
        source: 'Cerebral Cortex',
        publishTime: new Date(Date.now() - 7200000).toISOString(),
        category: 'cognitive',
        relativeTime: '4小时前',
        categoryClass: 'cognitive',
        categoryName: '认知心理学',
        translated: false, translatedTitle: '', translatedSummary: ''
      },
      {
        _id: 'demo3',
        title: 'Novel fMRI Technique Reveals Sub-millimeter Brain Activity Patterns',
        summary: 'Scientists have developed a new ultra-high resolution fMRI method capable of detecting neural activity at columnar and laminar scales in awake humans.',
        source: 'Science',
        publishTime: new Date(Date.now() - 18000000).toISOString(),
        category: 'neuroimaging',
        relativeTime: '5小时前',
        categoryClass: 'imaging',
        categoryName: '脑成像',
        translated: false, translatedTitle: '', translatedSummary: ''
      },
      {
        _id: 'demo4',
        title: 'Deep Learning Model Predicts Alzheimer Progression from EEG Signals',
        summary: 'A transformer-based model trained on longitudinal EEG data achieves 92% accuracy in predicting cognitive decline trajectory in early-stage Alzheimer patients.',
        source: 'NeuroImage: Clinical',
        publishTime: new Date(Date.now() - 36000000).toISOString(),
        category: 'computational',
        relativeTime: '10小时前',
        categoryClass: 'computational',
        categoryName: '计算神经科学',
        translated: false, translatedTitle: '', translatedSummary: ''
      },
      {
        _id: 'demo5',
        title: 'Attention Restoration Theory Gets Neural Evidence from Forest Bathing Study',
        summary: 'Researchers found that 30-minute nature exposure significantly reduces default mode network activity and enhances top-down attentional control, providing neural basis for attention restoration theory.',
        source: 'PNAS',
        publishTime: new Date(Date.now() - 86400000).toISOString(),
        category: 'cognitive',
        relativeTime: '1天前',
        categoryClass: 'cognitive',
        categoryName: '认知心理学',
        translated: false, translatedTitle: '', translatedSummary: ''
      }
    ];
  }
});
