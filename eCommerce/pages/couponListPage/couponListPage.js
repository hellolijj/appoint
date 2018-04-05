var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    franchiseeId:'',
    franchiseeInfo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var franchiseeId = options.franchisee,
      that = this;
    this.setData({
      franchiseeId: franchiseeId
    })
    app.sendRequest({
      url:"/index.php?r=AppShop/GetAppShopByPage",
      data: { sub_shop_app_id: franchiseeId},
      success: function (res) {
        console.log(res)
        var data = {};
        data.franchiseeInfo = res.data[0];
        that.setData(data);
      }
    })
  },
  turnToCouponDetail:function(e){
    let id = e.currentTarget.dataset.id;
    app.turnToPage('/pages/couponDetail/couponDetail?detail=' + id + '&franchisee=' + this.data.franchiseeId)
  }
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  
})