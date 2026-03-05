const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action, id, category, page = 1, pageSize = 20 } = event;

  // Get single knowledge article detail
  if (action === 'detail' && id) {
    try {
      const res = await db.collection('knowledge').doc(id).get();
      return { code: 0, data: res.data };
    } catch (err) {
      return { code: 0, data: getDemoKnowledgeDetail(id) };
    }
  }

  // List knowledge articles by category or search
  try {
    const skip = (page - 1) * pageSize;
    let query = db.collection('knowledge');

    if (category) {
      // Check if category is a search keyword
      const isSearch = !['neuron-basics', 'brain-anatomy', 'cognitive-processes', 'perception',
        'learning-memory', 'neurotransmitters', 'methods', 'disorders'].includes(category);

      if (isSearch) {
        query = query.where({
          title: db.RegExp({ regexp: category, options: 'i' })
        });
      } else {
        query = query.where({ category });
      }
    }

    const res = await query
      .orderBy('order', 'asc')
      .skip(skip)
      .limit(pageSize)
      .get();

    return { code: 0, data: res.data };
  } catch (err) {
    return { code: 0, data: getDemoKnowledgeList(category) };
  }
};

function getDemoKnowledgeList(category) {
  const articles = {
    'neuron-basics': [
      { _id: 'kb1', title: '神经元的结构与功能', content: '神经元是神经系统的基本功能单位...', difficulty: 'beginner', readingTime: 8, order: 1 },
      { _id: 'kb2', title: '动作电位：神经信号的传递', content: '动作电位是神经元传递信号的基本方式...', difficulty: 'beginner', readingTime: 10, order: 2 },
      { _id: 'kb3', title: '突触传递与神经递质释放', content: '突触是神经元之间传递信息的结构...', difficulty: 'intermediate', readingTime: 12, order: 3 },
      { _id: 'kb4', title: '髓鞘化与传导速度', content: '髓鞘是包裹在轴突外面的脂质层...', difficulty: 'intermediate', readingTime: 7, order: 4 }
    ],
    'brain-anatomy': [
      { _id: 'kb5', title: '大脑皮层的分区与功能', content: '大脑皮层可以从解剖学上分为四个主要脑叶...', difficulty: 'beginner', readingTime: 15, order: 1 },
      { _id: 'kb6', title: '边缘系统：情绪的神经基础', content: '边缘系统包括杏仁核、海马体等结构...', difficulty: 'intermediate', readingTime: 12, order: 2 },
      { _id: 'kb7', title: '基底神经节与运动控制', content: '基底神经节在运动规划和执行中起重要作用...', difficulty: 'intermediate', readingTime: 10, order: 3 }
    ],
    'cognitive-processes': [
      { _id: 'kb8', title: '注意力的认知神经科学', content: '注意力是认知过程中的核心机制...', difficulty: 'beginner', readingTime: 10, order: 1 },
      { _id: 'kb9', title: '工作记忆：Baddeley模型', content: 'Baddeley的工作记忆模型提出了四个组件...', difficulty: 'intermediate', readingTime: 12, order: 2 },
      { _id: 'kb10', title: '决策的神经经济学', content: '神经经济学研究大脑如何做出决策...', difficulty: 'advanced', readingTime: 15, order: 3 }
    ]
  };

  if (category && articles[category]) {
    return articles[category];
  }

  // Return all for search or default
  return Object.values(articles).flat();
}

function getDemoKnowledgeDetail(id) {
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
          '神经元与普通细胞不同，它们具有高度特化的结构，使其能够接收、处理和传递电化学信号。'
        ],
        keyTerms: [
          { term: '神经元 (Neuron)', definition: '神经系统的基本功能单位' },
          { term: '神经胶质细胞 (Glia)', definition: '为神经元提供支持和保护的细胞' }
        ]
      },
      {
        heading: '神经元的基本结构',
        paragraphs: [
          '一个典型的神经元由三个主要部分组成：细胞体(soma)、树突(dendrites)和轴突(axon)。',
          '细胞体是神经元的代谢中心，包含细胞核和大部分细胞器。',
          '树突从细胞体向外延伸，是接收信号的主要部位。',
          '轴突负责将信号传递到远端的突触终末。'
        ],
        keyTerms: [
          { term: '细胞体 (Soma)', definition: '神经元的代谢中心' },
          { term: '树突 (Dendrite)', definition: '接收信号的分支结构' },
          { term: '轴突 (Axon)', definition: '传递信号的长突起' }
        ]
      }
    ],
    quiz: [
      {
        question: '神经元的哪个结构主要负责接收信号？',
        options: ['轴突', '树突', '细胞体', '髓鞘'],
        correctAnswer: 1,
        explanation: '树突上密布着突触后受体，是接收来自其他神经元信号的主要部位。'
      }
    ]
  };
}
