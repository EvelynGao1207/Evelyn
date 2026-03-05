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
      { id: 'neuroscience', name: '神经科学', icon: 'brain' },
      { id: 'cognitive', name: '认知心理学', icon: 'mind' },
      { id: 'neuroimaging', name: '脑成像', icon: 'scan' },
      { id: 'computational', name: '计算神经科学', icon: 'compute' },
      { id: 'clinical', name: '临床神经', icon: 'medical' }
    ]
  }
});
