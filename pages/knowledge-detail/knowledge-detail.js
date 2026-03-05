const { getKnowledgeDetail, translateText } = require('../../utils/api');

Page({
  data: {
    article: null,
    loading: true,
    quizAnswers: {},
    readingProgress: 0,
    sectionTranslations: {}
  },

  onLoad(options) {
    if (options.id) {
      this.fetchArticle(options.id);
    }
  },

  onPageScroll(e) {
    wx.createSelectorQuery().select('.content-sections').boundingClientRect(rect => {
      if (!rect) return;
      const scrolled = Math.min(100, Math.max(0, Math.round((e.scrollTop / (rect.height - 500)) * 100)));
      if (scrolled !== this.data.readingProgress) {
        this.setData({ readingProgress: scrolled });
      }
    }).exec();
  },

  async fetchArticle(id) {
    this.setData({ loading: true });
    try {
      const res = await getKnowledgeDetail(id);
      this.setData({ article: res.data || res });
    } catch (err) {
      this.setData({ article: this.getDemoArticle(id) });
    }
    this.setData({ loading: false });
  },

  onTocTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.pageScrollTo({ selector: `#section-${index}`, duration: 300 });
  },

  onQuizAnswer(e) {
    const { question, option } = e.currentTarget.dataset;
    if (this.data.quizAnswers[question] !== undefined) return;
    this.setData({ [`quizAnswers[${question}]`]: option });
  },

  async onLongPressParagraph(e) {
    const { section, para } = e.currentTarget.dataset;
    const key = `${section}-${para}`;
    if (this.data.sectionTranslations[key]) {
      this.setData({ [`sectionTranslations[${key}]`]: '' });
      return;
    }
    const text = this.data.article.sections[section].paragraphs[para];
    wx.showLoading({ title: '翻译中...' });
    try {
      const res = await translateText(text);
      this.setData({ [`sectionTranslations[${key}]`]: res.translatedText });
    } catch (err) {
      wx.showToast({ title: '翻译失败', icon: 'none' });
    }
    wx.hideLoading();
  },

  getDemoArticle(id) {
    return {
      _id: id,
      title: '神经元的结构与功能',
      difficulty: 'beginner',
      difficultyLabel: '入门',
      readingTime: 8,
      sections: [
        {
          heading: '什么是神经元',
          paragraphs: [
            '神经元(neuron)是神经系统的基本结构和功能单位。人脑大约包含860亿个神经元，它们通过复杂的网络连接形成了我们思维、感知和行为的物质基础。',
            '神经元与普通细胞不同的是，它们具有高度特化的结构，使其能够接收、处理和传递电化学信号。这种信号传递能力是所有神经功能的基础。'
          ],
          keyTerms: [
            { term: '神经元 (Neuron)', definition: '神经系统的基本功能单位，能够接收和传递电化学信号' },
            { term: '神经胶质细胞 (Glia)', definition: '为神经元提供支持、营养和保护的非神经元细胞' }
          ]
        },
        {
          heading: '神经元的基本结构',
          paragraphs: [
            '一个典型的神经元由三个主要部分组成：细胞体(soma)、树突(dendrites)和轴突(axon)。',
            '细胞体是神经元的代谢中心，包含细胞核和大部分细胞器。它负责维持细胞的基本生命活动，同时也参与信号的整合处理。',
            '树突从细胞体向外延伸，形成复杂的分支结构。树突上密布着突触后受体，是接收来自其他神经元信号的主要部位。树突的分支模式因神经元类型而异。',
            '轴突是从细胞体延伸出的单一长突起，负责将信号从细胞体传递到远端的突触终末。轴突的长度可以从不到1毫米到超过1米（如运动神经元）。'
          ],
          keyTerms: [
            { term: '细胞体 (Soma)', definition: '神经元的代谢中心，包含细胞核' },
            { term: '树突 (Dendrite)', definition: '接收来自其他神经元信号的分支结构' },
            { term: '轴突 (Axon)', definition: '传递信号到远端靶细胞的长突起' },
            { term: '突触终末 (Synaptic Terminal)', definition: '轴突末端释放神经递质的结构' }
          ]
        },
        {
          heading: '神经元的类型',
          paragraphs: [
            '根据功能，神经元可分为三大类：感觉神经元(sensory neurons)、运动神经元(motor neurons)和中间神经元(interneurons)。',
            '感觉神经元将来自感受器的信号传入中枢神经系统。运动神经元将中枢的指令传递到肌肉和腺体。中间神经元在中枢神经系统内连接不同的神经元，构成了大脑中最大数量的神经元群体。',
            '根据形态，神经元可分为多极神经元、双极神经元和假单极神经元。大脑皮层中的锥体细胞(pyramidal cells)是最常见的多极神经元类型。'
          ],
          keyTerms: [
            { term: '感觉神经元 (Sensory Neuron)', definition: '将外界刺激信号传入中枢神经系统' },
            { term: '运动神经元 (Motor Neuron)', definition: '将中枢指令传递到效应器' },
            { term: '中间神经元 (Interneuron)', definition: '在中枢内连接不同神经元的局部回路神经元' }
          ]
        },
        {
          heading: '静息电位与膜电位',
          paragraphs: [
            '在未受到刺激时，神经元内外存在约-70mV的电位差，称为静息电位(resting potential)。这个电位差由钠钾泵(Na+/K+ ATPase)维持。',
            '钠钾泵每消耗一个ATP分子，将3个Na+泵出细胞，同时将2个K+泵入细胞。加上细胞膜对K+的高通透性，使得细胞内部相对于外部带负电。',
            '静息电位是神经元能够产生和传递电信号的基础。当膜电位变化达到阈值(-55mV左右)时，就会触发动作电位。'
          ],
          keyTerms: [
            { term: '静息电位 (Resting Potential)', definition: '神经元未受刺激时的膜电位，约-70mV' },
            { term: '钠钾泵 (Na+/K+ ATPase)', definition: '维持离子浓度梯度的跨膜蛋白' },
            { term: '阈值 (Threshold)', definition: '触发动作电位所需的最小去极化程度' }
          ]
        }
      ],
      quiz: [
        {
          question: '神经元的哪个结构主要负责接收来自其他神经元的信号？',
          options: ['轴突', '树突', '细胞体', '髓鞘'],
          correctAnswer: 1,
          explanation: '树突(dendrites)上密布着突触后受体，是接收来自其他神经元信号的主要部位。轴突负责传出信号，细胞体负责信号整合，髓鞘是轴突外的绝缘层。'
        },
        {
          question: '人脑大约包含多少个神经元？',
          options: ['86亿', '860亿', '8600亿', '86万亿'],
          correctAnswer: 1,
          explanation: '人脑大约包含860亿(86 billion)个神经元。这个数字来自2009年Azevedo等人的研究，使用isotropic fractionator技术得出。'
        },
        {
          question: '神经元的静息电位大约为多少？',
          options: ['-30mV', '-55mV', '-70mV', '-90mV'],
          correctAnswer: 2,
          explanation: '大多数神经元的静息电位约为-70mV。这个电位由钠钾泵和细胞膜对不同离子的选择性通透性共同维持。'
        }
      ]
    };
  }
});
