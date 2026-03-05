App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云开发能力');
      return;
    }
    wx.cloud.init({
      traceUser: true
    });
    this.globalData.db = wx.cloud.database();
  },

  globalData: {
    db: null,
    categories: [
      { id: 'molecular-cellular', name: '分子与细胞', icon: 'cell' },
      { id: 'circuits-systems', name: '环路与系统', icon: 'circuit' },
      { id: 'cognition-behavior', name: '认知与行为', icon: 'mind' },
      { id: 'development-plasticity', name: '发育与可塑性', icon: 'growth' },
      { id: 'emotion-social', name: '情绪与社会脑', icon: 'emotion' },
      { id: 'computation', name: '计算神经科学', icon: 'compute' },
      { id: 'disorders-clinical', name: '脑疾病与临床', icon: 'clinical' },
      { id: 'imaging-methods', name: '成像与技术', icon: 'imaging' }
    ]
  }
});
