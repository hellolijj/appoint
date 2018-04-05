var app = getApp();
Page({
  data:{
        currentTabIndex:1,
        myPrizeList:[]
  },
  onShow:function(options){
    var that=this;
    
    that.getMyPrizeCenter(1);
  },
  clickTap:function(e){
    var that=this;
    var index=e.currentTarget.dataset.index,
       data={};
       data.currentTabIndex=index;
       that.setData(data);
       that.getMyPrizeCenter(index);

  },
  getMyPrizeCenter: function (category){
    var that=this;
    app.sendRequest({
      url:'/index.php?r=appLotteryActivity/myPrizeCenter',
      method:'post',
      data:{
        app_id: app.globalData.appId,
        category: category,
        page: 1, 
        page_size: 999
      },
      success:function(res){
        that.setData({
          myPrizeList: res.data
        })
      }
    })
  }
})