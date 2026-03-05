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
        id: 'molecular-cellular',
        name: '分子与细胞',
        icon: '🧬',
        bgColor: '#E8F5E9',
        iconBg: 'rgba(45,154,93,0.15)',
        count: 24
      },
      {
        id: 'circuits-systems',
        name: '环路与系统',
        icon: '🔗',
        bgColor: '#E3F2FD',
        iconBg: 'rgba(33,150,243,0.15)',
        count: 18
      },
      {
        id: 'cognition-behavior',
        name: '认知与行为',
        icon: '🧠',
        bgColor: '#FFF8E1',
        iconBg: 'rgba(245,166,35,0.15)',
        count: 22
      },
      {
        id: 'development-plasticity',
        name: '发育与可塑性',
        icon: '🌱',
        bgColor: '#F1F8E9',
        iconBg: 'rgba(104,159,56,0.15)',
        count: 15
      },
      {
        id: 'emotion-social',
        name: '情绪与社会脑',
        icon: '💡',
        bgColor: '#FCE4EC',
        iconBg: 'rgba(233,30,99,0.15)',
        count: 16
      },
      {
        id: 'computation',
        name: '计算神经科学',
        icon: '📊',
        bgColor: '#EDE7F6',
        iconBg: 'rgba(103,58,183,0.15)',
        count: 12
      },
      {
        id: 'disorders-clinical',
        name: '脑疾病与临床',
        icon: '🏥',
        bgColor: '#FFF3E0',
        iconBg: 'rgba(255,112,67,0.15)',
        count: 20
      },
      {
        id: 'imaging-methods',
        name: '成像与技术',
        icon: '🔬',
        bgColor: '#E0F7FA',
        iconBg: 'rgba(0,150,136,0.15)',
        count: 14
      }
    ];
  },

  getDemoArticles(category) {
    const articles = {
      'molecular-cellular': [
        { _id: 'mc1', title: '离子通道与动作电位的分子机制', preview: '电压门控离子通道是动作电位产生与传播的分子基础。钠通道(Nav)、钾通道(Kv)和钙通道(Cav)各司其职...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 10, progress: 0 },
        { _id: 'mc2', title: '突触可塑性的分子信号通路', preview: 'LTP和LTD依赖于NMDA受体、CaMKII、CREB等关键分子的级联反应。突触后致密区(PSD)的蛋白重组...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 15, progress: 0 },
        { _id: 'mc3', title: '神经递质的合成、释放与再摄取', preview: '神经递质从前体合成到囊泡包装、胞吐释放、受体结合、再摄取或酶降解，构成完整的信号传递周期...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 12, progress: 0 },
        { _id: 'mc4', title: '表观遗传学与神经元基因表达调控', preview: 'DNA甲基化、组蛋白修饰和非编码RNA在神经元分化、突触可塑性和记忆形成中发挥关键调控作用...', difficulty: 'advanced', difficultyLabel: '高级', readingTime: 18, progress: 0 }
      ],
      'circuits-systems': [
        { _id: 'cs1', title: '皮层-基底节-丘脑回路', preview: '皮层-基底节-丘脑环路是运动控制和习惯学习的核心通路。直接通路促进运动，间接通路抑制运动...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 14, progress: 0 },
        { _id: 'cs2', title: '默认模式网络与静息态功能连接', preview: 'DMN包括内侧前额叶、后扣带/楔前叶和角回，在自我参照思维、心理时间旅行和社会认知中活跃...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 },
        { _id: 'cs3', title: '海马-内嗅皮层系统与空间导航', preview: '位置细胞、网格细胞、头方向细胞和边界细胞共同构成大脑的认知地图系统(2014年诺贝尔奖)...', difficulty: 'advanced', difficultyLabel: '高级', readingTime: 16, progress: 0 }
      ],
      'cognition-behavior': [
        { _id: 'cb1', title: '注意力的认知神经科学', preview: '注意力涉及背侧和腹侧注意网络的协调。自上而下的目标导向注意与自下而上的刺激驱动注意相互作用...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 10, progress: 0 },
        { _id: 'cb2', title: '工作记忆的神经机制', preview: '前额叶皮层通过持续性神经活动维持工作记忆表征。theta-gamma耦合和突触短时程可塑性是关键机制...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 13, progress: 0 },
        { _id: 'cb3', title: '决策的神经计算模型', preview: '漂移扩散模型(DDM)和竞争积累模型解释了感知决策中的速度-准确性权衡。眶额叶编码主观价值...', difficulty: 'advanced', difficultyLabel: '高级', readingTime: 15, progress: 0 }
      ],
      'development-plasticity': [
        { _id: 'dp1', title: '关键期与敏感期的神经机制', preview: '关键期是大脑发育中神经环路对经验高度敏感的时间窗口。GABA能抑制的成熟和细胞外基质的形成...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 },
        { _id: 'dp2', title: '成年神经发生：海马齿状回的新生神经元', preview: '海马齿状回的颗粒下层持续产生新神经元。这些新生细胞在模式分离和记忆编码中发挥独特作用...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 11, progress: 0 }
      ],
      'emotion-social': [
        { _id: 'es1', title: '杏仁核与恐惧学习', preview: '杏仁核是恐惧条件反射的关键脑区。基底外侧核接收感觉输入，中央核产生恐惧反应输出...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 9, progress: 0 },
        { _id: 'es2', title: '镜像神经元与共情的神经基础', preview: '镜像神经元系统在观察和执行动作时均激活。前脑岛和前扣带回在情绪共情中发挥核心作用...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 11, progress: 0 }
      ],
      'computation': [
        { _id: 'cp1', title: '预测编码与贝叶斯脑假说', preview: '大脑不断生成对感觉输入的预测，仅编码预测误差。这一框架统一了感知、注意和学习的理论...', difficulty: 'advanced', difficultyLabel: '高级', readingTime: 16, progress: 0 },
        { _id: 'cp2', title: '强化学习与多巴胺信号', preview: '中脑多巴胺神经元编码时间差分(TD)预测误差信号。这一发现连接了计算模型与神经生物学...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 14, progress: 0 }
      ],
      'disorders-clinical': [
        { _id: 'dc1', title: '阿尔茨海默病的分子病理机制', preview: 'A-beta斑块和Tau蛋白缠结是AD的病理标志。突触功能障碍和神经炎症在疾病早期即已出现...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 14, progress: 0 },
        { _id: 'dc2', title: '抑郁症的神经环路与单胺假说的演变', preview: '从经典的单胺假说到谷氨酸/GABA失衡，再到神经炎症和肠脑轴，抑郁症的病理模型不断更新...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 13, progress: 0 }
      ],
      'imaging-methods': [
        { _id: 'im1', title: 'fMRI的原理：BOLD信号与血流动力学', preview: 'fMRI检测的是神经活动引起的局部血氧水平变化(BOLD效应)，而非直接的电活动信号...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 10, progress: 0 },
        { _id: 'im2', title: '光遗传学：用光控制神经元', preview: '光遗传学利用微生物视蛋白(如ChR2、NpHR)实现毫秒级精度的神经元激活或抑制...', difficulty: 'intermediate', difficultyLabel: '进阶', readingTime: 12, progress: 0 }
      ]
    };
    return articles[category] || articles['molecular-cellular'];
  },

  getSearchDemo(keyword) {
    return [
      { _id: 'search1', title: `${keyword}相关：神经可塑性的基本原理`, preview: '神经可塑性是指大脑在结构和功能上随经验改变的能力，包括突触可塑性和结构可塑性...', difficulty: 'beginner', difficultyLabel: '入门', readingTime: 8, progress: 0 }
    ];
  }
});
