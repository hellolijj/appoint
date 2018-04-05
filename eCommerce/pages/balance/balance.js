
var app = getApp()

Page({
  data: {
    currentBalance: 0, // 当前储值金
    /*
      messageData 对象
      data: 对应分支的数据
      isMore: 是否拥有更多的新的数据
      currentPage: 当前已经加载到页数
      onload: 是否处在数据加载中， true加载中，false加载完毕
    */
    messageData: {
      data: [],
      isMore: 0,
      currentPage: 1,
      onload: false
    }
  },
  onLoad: function(){
    this.getBalanceData();
    this.getMessageData();
  },
  gotoRecharge: function(){
    app.turnToPage('/eCommerce/pages/recharge/recharge', true);
  },
  // 获取当前储值金
  getBalanceData: function(){
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppShop/getAppUserBalance',
      hideLoading: true,
      success: function(res){
        that.setData({
          'currentBalance': res.data.balance
        });
      }
    });
  },
  // 获取对应消息数据
  getMessageData: function(page){
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppShop/getStoredLogByUserToken',
      hideLoading: true,
      data: {
        'page': page || 1
      },
      success: function(res){
          that.setData({
            'messageData.data': (that.data.messageData.data ? that.data.messageData.data.concat(that.parseMessageData(res.data)) : that.parseMessageData(res.data)) || "",
            'messageData.isMore': res.is_more,
            'messageData.currentPage': res.current_page || "",
            'messageData.onload': false,
          });
      }
    });
  },
  // 解析对应消息数据
  parseMessageData: function(data){
    var that = this;
    let array = [];
    let item = {};
    for (var i = 0; i < data.length; i++) {
      let type = data[i].type;
      let content = JSON.parse(data[i].stored_content);
      let num = '';
      if(type == 1 ) {
        num = Number(content.price) + Number(content.g_price);
      } else if(type == 2 || type == 3 || type == 4){
        num = Number(content.price);
      } else if(type == 5){
        num = Number(content.g_price);
      } else if(type == 6){
        num = Number(content.price) + Number(content.g_price);
      } else if(type == 7){
        num = Number(content.price);
      }
      item = {
        type: type,
        num: num.toFixed(2),
        time: data[i].add_time
      }
      array.push(item);
    }
    return array;
  },
  // 底部触发是否获取数据
  checkMoreMessageData: function(){
    let that = this;
    // 有更多数据 并且 不在加载中时 执行
    if ((that.data.messageData.isMore != 0 ) && ( !that.data.messageData.onload)) {
      that.getMessageData(that.data.messageData.currentPage + 1);
      that.setData({
        'messageData.onload': true
      });
    }
  }
})
