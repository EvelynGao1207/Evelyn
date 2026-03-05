const { getKnowledgeList } = require('../../utils/api');

Page({
  data: {
    searchText: '',
    currentCategory: '',
    currentCategoryName: '',
    knowledgeCategories: [],
    articleList: [],
    loading: false
  },

  onLoad() {
    this.setData({ knowledgeCategories: this.getDefaultCategories() });
  },

  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
  },

  async onSearch() {
    if (!this.data.searchText.trim()) return;
    this.setData({ loading: true, currentCategory: '', currentCategoryName: '' });
    try {
      const res = await getKnowledgeList(this.data.searchText);
      this.setData({ articleList: this.formatArticles(res.data || []) });
    } catch (err) {
      this.setData({ articleList: this.getSearchDemo(this.data.searchText) });
    }
    this.setData({ loading: false });
  },

  async onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    const cat = this.data.knowledgeCategories.find(c => c.id === id);
    this.setData({
      currentCategory: id,
      currentCategoryName: cat ? cat.name : '',
      searchText: '',
      loading: true
    });
    try {
      const res = await getKnowledgeList(id);
      this.setData({ articleList: this.formatArticles(res.data || []) });
    } catch (err) {
      this.setData({ articleList: this.getDemoArticles(id) });
    }
    this.setData({ loading: false });
  },

  onBackToCategories() {
    this.setData({ currentCategory: '', currentCategoryName: '', articleList: [] });
  },

  onArticleTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/knowledge-detail/knowledge-detail?id=${id}` });
  },

  formatArticles(list) {
    const difficultyMap = { beginner: '入门', intermediate: '进阶', advanced: '高级' };
    return list.map(item => ({
      ...item,
      difficultyLabel: difficultyMap[item.difficulty] || '入门',
      readingTime: item.readingTime || 5,
      progress: item.progress || 0,
      preview: (item.content || '').substring(0, 80) + '...'
    }));
  },

  getDefaultCategories() {
    return [
      {
        id: 'neuron-basics',
        name: '神经元基础',
        description: '神经元结构、动作电位、突触传递',
        icon: '🧬',
        color: '#E8F5E9',
        count: 12
      },
      {
        id: 'brain-anatomy',
        name: '脑解剖学',
        description: '大脑皮层、边缘系统、脑干结构',
        icon: '🧠',
        color: '#DCEEF9',
        count: 15
      },
      {
        id: 'cognitive-processes',
        name: '认知过程',
        description: '注意力、记忆、语言、决策',
        icon: '💭',
        color: '#FFF3E0',
        count: 18
      },
      {
        id: 'perception',
        name: '知觉与感觉',
        description: '视觉、听觉、触觉及多感觉整合',
        icon: '👁',
        color: '#FCE4EC',
        count: 10
      },
      {
        id: 'learning-memory',
        name: '学习与记忆',
        description: 'LTP/LTD、海马体、记忆巩固',
        icon: '📚',
        color: '#F3E5F5',
        count: 14
      },
      {
        id: 'neurotransmitters',
        name: '神经递质系统',
        description: '多巴胺、血清素、GABA、谷氨酸',
        icon: '⚗',
        color: '#E0F7FA',
        count: 11
      },
      {
        id: 'methods',
        name: '研究方法',
        description: 'fMRI、EEG、TMS、光遗传学',
        icon: '🔬',
        color: '#F1F8E9',
        count: 9
      },
      {
        id: 'disorders',
        name: '神经与认知障碍',
        description: '抑郁症、焦虑、ADHD、自闭症',
        icon: '🏥',
        color: '#FFF8E1',
        count: 16
      }
    ];
  },

  getDemoArticles(category) {
    const articles = {
      'neuron-basics': [
        { _id: 'kb1', title: '神经元的结构与功能', preview: '神经元是神经系统的基本功能单位。一个典型的神经元由细胞体(soma)、树突(dendrites)和轴突(axon)组成...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 8, progress: 0 },
        { _id: 'kb2', title: '动作电位：神经信号的传递', preview: '动作电位是神经元传递信号的基本方式。当膜电位达到阈值时，电压门控钠离子通道打开...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 10, progress: 0 },
        { _id: 'kb3', title: '突触传递与神经递质释放', preview: '突触是神经元之间或神经元与靶细胞之间传递信息的结构。当动作电位到达突触前末梢...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 },
        { _id: 'kb4', title: '髓鞘化与传导速度', preview: '髓鞘是包裹在轴突外面的脂质层，由少突胶质细胞(CNS)或施旺细胞(PNS)形成...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 7, progress: 0 }
      ],
      'brain-anatomy': [
        { _id: 'kb5', title: '大脑皮层的分区与功能', preview: '大脑皮层可以从解剖学上分为四个主要脑叶：额叶、顶叶、颞叶和枕叶...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 15, progress: 0 },
        { _id: 'kb6', title: '边缘系统：情绪的神经基础', preview: '边缘系统包括杏仁核、海马体、扣带回等结构，是处理情绪和记忆的关键脑区...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 },
        { _id: 'kb7', title: '基底神经节与运动控制', preview: '基底神经节包括尾状核、壳核和苍白球等结构，在运动规划和执行中起重要作用...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 10, progress: 0 }
      ],
      'cognitive-processes': [
        { _id: 'kb8', title: '注意力的认知神经科学', preview: '注意力是认知过程中的核心机制，包括选择性注意、持续性注意和分配性注意...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 10, progress: 0 },
        { _id: 'kb9', title: '工作记忆：Baddeley模型', preview: 'Baddeley的工作记忆模型提出了中央执行系统、语音环路、视空间画板和情景缓冲器...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 },
        { _id: 'kb10', title: '决策的神经经济学', preview: '神经经济学研究大脑如何做出经济和社会决策。前额叶皮层、纹状体等区域在价值评估中起关键作用...', difficulty: 'advanced', difficultyLabel: '高级', readingTime: 15, progress: 0 }
      ]
    };
    return articles[category] || articles['neuron-basics'];
  },

  getSearchDemo(keyword) {
    return [
      { _id: 'search1', title: `${keyword}相关：神经可塑性的基本原理`, preview: '神经可塑性是指大脑在结构和功能上随经验改变的能力...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 8, progress: 0 }
    ];
  }
});
