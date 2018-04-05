var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    param: {
      coupon_id: '',
      page: 1,
      page_size: 10
    },
    isLoading: false,
    noMore: false,
    goodsList: []
  },
  onLoad: function(options) {
    let that = this;
    if (options.franchisee) {
      that.setData({
        'param.coupon_id': options.detail,
        'param.sub_app_id': options.franchisee
      });
    }else {
      that.setData({ 'param.coupon_id': options.detail });
    }
    that.getGoodsList();
  }, 
  getGoodsList: function () {
    var that = this;
    if (that.data.noMore || that.data.isLoading) {
      return;
    }
    that.setData({'isLoading': true});
    app.sendRequest({
      url: '/index.php?r=appShop/getCouponConditionGoods',
      method: 'post',
      data: that.data.param,
      success: function (res) {
        if (res.status == 0) {
          let newData = {},
              goodsList = that.data.goodsList,
              param = that.data.param;

          if (param.page > 1) {
            goodsList = goodsList.concat( res.data );
          }else {
            goodsList = res.data;
          }

          if (res.is_more == 0) {
            newData.noMore = true;
          }

          param.page = res.current_page + 1;
          newData.goodsList = goodsList;
          newData.param = param;
          newData.isLoading = false;

          that.setData( newData );

        }else {
          app.showModal({"content": res.data});
        }

      },
      fail: function (res) {
        that.setData({ 'isLoading': false });
      }
    })
  },
  turnToGoodsDetail: function (event) {
    let appId = app.globalData.appId,
        dataset = event.currentTarget.dataset,
        id = dataset.id,
        goodsType = dataset.goodsType,
        group = dataset.group,
        subAppId = dataset.subAppId,
        isSeckill = dataset.isSeckill == 1,
        isSelf = appId === subAppId;
    if (group && group == 1) {
      if (isSelf) {
        app.turnToPage('/pages/groupGoodsDetail/groupGoodsDetail?detail=' + id);
      }else {
        app.turnToPage('/pages/groupGoodsDetail/groupGoodsDetail?detail=' + id + "&franchisee=" + subAppId);
      }

      return;
    }
    switch (+goodsType) {
      case 0:
      case 1:
        let url = '/pages/goodsDetail/goodsDetail?detail=' + id;
        if (isSeckill) {
          url += '&goodsType=seckill';
        };
        if (!isSelf) {
          url += '&franchisee=' + subAppId;
        }
        app.turnToPage(url);
        break;
      case 3:
        if (isSelf) {
          app.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + id);
        }else {
          app.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + id + "&franchisee=" + subAppId);
        }
        break;
    }
  }
})
