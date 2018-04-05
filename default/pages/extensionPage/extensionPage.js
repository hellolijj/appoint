var app = getApp();

Page({
  data: {
    appTitle: '',
    appLogo: '',
    extensionId: '',        // 推广页id
    extensionItemData: {},   // 推广页面配置信息
    currentPage: ''
  },
  onLoad: function(options){
    // 默认当前页为 home
    this.setData({
      'appTitle': app.globalData.appTitle,
      'appLogo': app.globalData.appLogo,
      'extensionId': options.extension_id,
      'currentPage': options.current_page || 'home'
    });
    this.dataInitial();
  },
  dataInitial: function(){
    this.getExtensionPageData(this.data.extensionId);
  },
  // 获得推广页数据
  getExtensionPageData(id){
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppExtensionInfo/getOneExtensionInfo',
      data: {
        'id': id
      },
      hideLoading: true,
      success: function(res){
        let configData = JSON.parse(res.data.config_data);
        that.setData({
          'extensionItemData': configData
        });
        app.setPageTitle(that.data.appTitle);
      }
    })
  },
  // 跳转首页
  jumpToHome: function(){
    let router = app.globalData.homepageRouter;
    let url = '/pages/' + router + '/' + router;
    app.turnToPage(url, true);
  },
  // 跳转页面
  jumpToPage: function(event){
    let url = event.currentTarget.dataset.pageUrl;
    app.turnToPage(url, false);
  },
  // 跳转页面(router)
  jumpToRouter: function(event){
    let router = event.currentTarget.dataset.pageUrl;
    let url = '/pages/' + router + '/' + router;
    app.turnToPage(url, false);
  },
  // 复制wifi密码
  copyWifiPassword: function(){
    wx.setClipboardData({
      data: this.data.extensionItemData['wifi']['wifi_password'],
      success: function(res) {
        app.showToast({
            'title': '复制成功',
            'success': function(){
            }
        });
      }
    });
  },
  // 进入wifi页面
  showWifiPage: function(){
    let router = 'extensionPage';
    let url = '/default/pages/extensionPage/extensionPage?extension_id=' + this.data.extensionId + '&current_page=wifi';
    app.turnToPage(url, false);
  }
});