var app = getApp();
Page({
  data: {
  
  },
  onLoad: function (options) {
  
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  bindGetUserInfo: function(e) {
    console.log(e.detail.userInfo)
    let that = app;
    if (e.detail.userInfo) {
      that._sendUserInfo(e.detail.userInfo, '');
      wx.navigateTo({
        url: '/pages/userCenter/userCenter',
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: 'alert',
        content: '取消授权将无法使用应用“国教预约”？',
        showCancel: false,
        cancelText: "否",
        confirmText: "是",
      })
    }
  }
})