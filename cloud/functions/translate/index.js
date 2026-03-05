const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// Neuroscience-specific term dictionary for accurate translations
const NEURO_TERMS = {
  'action potential': '动作电位',
  'synaptic plasticity': '突触可塑性',
  'prefrontal cortex': '前额叶皮层',
  'hippocampus': '海马体',
  'amygdala': '杏仁核',
  'long-term potentiation': '长时程增强',
  'long-term depression': '长时程抑制',
  'default mode network': '默认模式网络',
  'working memory': '工作记忆',
  'cognitive load': '认知负荷',
  'executive function': '执行功能',
  'neuroplasticity': '神经可塑性',
  'dopaminergic': '多巴胺能的',
  'serotonergic': '血清素能的',
  'GABAergic': 'GABA能的',
  'glutamatergic': '谷氨酸能的',
  'dorsolateral prefrontal cortex': '背外侧前额叶皮层',
  'ventromedial prefrontal cortex': '腹内侧前额叶皮层',
  'anterior cingulate cortex': '前扣带回皮层',
  'posterior parietal cortex': '后顶叶皮层',
  'superior temporal sulcus': '颞上沟',
  'fusiform face area': '梭状回面孔区',
  'basal ganglia': '基底神经节',
  'thalamus': '丘脑',
  'cerebellum': '小脑',
  'brain stem': '脑干',
  'corpus callosum': '胼胝体',
  'white matter': '白质',
  'gray matter': '灰质',
  'blood-brain barrier': '血脑屏障',
  'neurotransmitter': '神经递质',
  'receptor': '受体',
  'synapse': '突触',
  'dendrite': '树突',
  'axon': '轴突',
  'myelin': '髓鞘',
  'resting potential': '静息电位',
  'depolarization': '去极化',
  'repolarization': '复极化',
  'refractory period': '不应期',
  'functional connectivity': '功能连接',
  'structural connectivity': '结构连接',
  'event-related potential': '事件相关电位',
  'bold signal': 'BOLD信号',
  'theta oscillation': 'θ振荡',
  'gamma oscillation': 'γ振荡',
  'alpha wave': 'α波',
  'beta wave': 'β波',
  'neural coding': '神经编码',
  'population coding': '群体编码',
  'place cell': '位置细胞',
  'grid cell': '网格细胞',
  'mirror neuron': '镜像神经元',
  'optogenetics': '光遗传学',
  'transcranial magnetic stimulation': '经颅磁刺激',
  'electroencephalography': '脑电图',
  'magnetoencephalography': '脑磁图',
  'functional magnetic resonance imaging': '功能性磁共振成像',
  'diffusion tensor imaging': '弥散张量成像',
  'positron emission tomography': '正电子发射断层扫描',
  'cognitive neuroscience': '认知神经科学',
  'computational neuroscience': '计算神经科学',
  'behavioral neuroscience': '行为神经科学',
  'social cognition': '社会认知',
  'theory of mind': '心理理论',
  'metacognition': '元认知',
  'selective attention': '选择性注意',
  'sustained attention': '持续性注意',
  'divided attention': '分配性注意',
  'implicit memory': '内隐记忆',
  'explicit memory': '外显记忆',
  'episodic memory': '情景记忆',
  'semantic memory': '语义记忆',
  'procedural memory': '程序性记忆',
  'memory consolidation': '记忆巩固',
  'memory retrieval': '记忆提取',
  'encoding': '编码',
  'inhibitory control': '抑制控制',
  'task switching': '任务切换',
  'error monitoring': '错误监控',
  'reward prediction error': '奖赏预测误差',
  'reinforcement learning': '强化学习',
  'Hebbian learning': '赫布学习',
  'spike timing dependent plasticity': '脉冲时序依赖可塑性'
};

exports.main = async (event) => {
  const { text, from = 'en', to = 'zh' } = event;

  if (!text || !text.trim()) {
    return { code: -1, message: 'Text is required' };
  }

  try {
    // Step 1: Detect and mark professional terms
    const detectedTerms = detectTerms(text);

    // Step 2: Use WeChat mini-program cloud translation API
    let translatedText;
    try {
      const translateResult = await cloud.openapi.wxacode.translateText({
        text: text,
        from: from,
        to: to
      });
      translatedText = translateResult.result;
    } catch (apiErr) {
      // Fallback: term-based translation with preserved structure
      translatedText = applyTermTranslation(text, detectedTerms);
    }

    // Step 3: Post-process to ensure professional terms are correctly translated
    translatedText = postProcessTranslation(translatedText, detectedTerms);

    return {
      code: 0,
      translatedText,
      detectedTerms: detectedTerms.map(t => ({
        original: t.original,
        translated: t.translated
      }))
    };
  } catch (err) {
    return { code: -1, message: err.message };
  }
};

function detectTerms(text) {
  const detected = [];
  const lowerText = text.toLowerCase();

  // Sort terms by length (longest first) to match multi-word terms first
  const sortedTerms = Object.entries(NEURO_TERMS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [term, translation] of sortedTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      detected.push({
        original: term,
        translated: translation,
        index: lowerText.indexOf(term.toLowerCase())
      });
    }
  }

  return detected;
}

function applyTermTranslation(text, terms) {
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(term.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, term.translated);
  }
  return result;
}

function postProcessTranslation(translatedText, terms) {
  // Ensure critical terms use our dictionary translations
  let result = translatedText;
  for (const term of terms) {
    // Common mistranslations to fix
    const commonMistranslations = {
      '海马': '海马体',
      '杏仁体': '杏仁核',
      '工作内存': '工作记忆'
    };
    for (const [wrong, correct] of Object.entries(commonMistranslations)) {
      result = result.replace(new RegExp(wrong, 'g'), correct);
    }
  }
  return result;
}
