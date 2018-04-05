var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    detailShow: false,
    status: 'receive', // receive、use 默认为receive，从优惠券列表进入的则为use
    couponId: '',       // receive时为商家设置优惠券id，use时为用户领取优惠券id
    franchiseeId: '',
    couponDetail: {},
    receiveSuccess: 0,  // 领取成功弹窗是否显示
    receiveCount: 0,    // 已领取数量
    receiveLimitNum: 0, // 领取限制数量
    rechargeSuccess: 0, // 充值成功弹窗是否显示
    verifySuccess: false,
    verifyQrcodeUrl: '',
    verifyShow: false,
    verifyData: {
      success: false,
      qrcodeUrl: ''
    }
  },
  onLoad: function (options) {
    let that = this;
    let status = options.status || 'receive'; // receive、use
    let couponId = options.detail || ''; // receive时为优惠券Id, use时为用户领取的优惠券Id
    let franchiseeId = options.franchisee || '';
    that.setData({
      'status': status,
      'couponId': couponId,
      'franchiseeId': franchiseeId
    });
    if(status == 'receive'){
      app.sendRequest({
        url: '/index.php?r=AppShop/GetCouponInfo',
        data: {
          'sub_app_id': franchiseeId,
          'coupon_id': couponId
        },
        hideLoading: true,
        success: function(res){
          that.setCouponData(res.data);
        }
      });
    } else if(status == 'use') {
      app.sendRequest({
        url: '/index.php?r=AppShop/getUserListCouponInfo',
        data: {
          'sub_app_id': franchiseeId,
          'user_coupon_id': couponId
        },
        hideLoading: true,
        success: function(res){
          that.setCouponData(res.data[0]);
        }
      });
    }
  },
  setCouponData: function (data) {
    let that = this;
    let useCondition = '';
    if (data.type == 0) {
      useCondition = '满' + data.condition + '，减' + data.value + '元';
    } else if (data.type == 1) {
      useCondition = '打' + data.value + '折';
    } else if (data.type == 2) {
      useCondition = '可抵扣' + data.value + '元';
    } else if (data.type == 3) {
      if (data.extra_condition == '') {
        useCondition = '直接兑换' + data.coupon_goods_info.title;
      } else if (data.extra_condition.price) {
        useCondition = '消费满' + data.extra_condition.price + '元可兑换' + data.coupon_goods_info.title;
      } else if (data.extra_condition.goods_id) {
        useCondition = '购买' + data.condition_goods_info.title + '可兑换' + data.coupon_goods_info.title;
      }
    } else if (data.type == 4) {
      useCondition = '储值金可充值' + data.value + '元';
    } else if (data.type == 5) {
      useCondition = data.extra_condition;
    }
    let newData = data;
    newData['useCondition'] = useCondition;
    that.setData({
      'couponDetail': newData
    });
    that.setData({
      'detailShow': true
    });
  },
  goToHomepage: function () {
    var homepageRouter = app.getHomepageRouter();
    app.turnToPage('/pages/' + homepageRouter + '/' + homepageRouter, 1);
  },
  // 领取优惠券
  formSubmit: function (event) {
    let that = this,
        formId = event.detail.formId;
    app.sendRequest({
      url: '/index.php?r=AppShop/RecvCoupon',
      data: {
        'coupon_id': that.data.couponId,
        'sub_app_id': that.data.franchiseeId,
        'form_id': formId
      },
      hideLoading: true,
      success: function (res) {
        that.setData({
          'receiveSuccess': 1,
          'receiveCount': res.data.recv_count,
          'receiveLimitNum': res.data.limit_num,
          'couponDetail.is_already_recv': res.data.is_already_recv
        });
        setTimeout(function() {
          that.hideReceiveToast();
        }, 3000);
      }
    });
  },
  // 满减券、打折券、代金券使用
  gotoTransferPage: function(){
    let url = '/eCommerce/pages/transferPage/transferPage';
    app.turnToPage(url, false);
  },
  // 储值券使用
  gotoRecharge: function(event){
    let that = this;
    let userCouponId = event.currentTarget.dataset.id;
    app.sendRequest({
      url: '/index.php?r=AppShop/useCoupon',
      data: {
        user_coupon_id: userCouponId
      },
      hideLoading: true,
      success: function(res) {
        that.setData({
          'rechargeSuccess': 1,
          'couponDetail.status': 2
        });
        setTimeout(function() {
          that.hideRechargeToast();
        }, 3000);
      }
    })
  },
  // 关闭领取成功弹窗
  hideReceiveToast: function(){
    this.setData({
      'receiveSuccess': 0,
      'receiveCount': 0,
      'receiveLimitNum': 0
    });
  },
  // 关闭充值成功弹窗
  hideRechargeToast: function(){
    this.setData({
      'rechargeSuccess': 0
    });
  },
  onShareAppMessage: function(res){
    var that = this;
    var franchiseeId = that.data.franchiseeId
    var couponId = '';
    if(that.data.status == 'receive'){
      couponId = that.data.couponId;
    } else if(that.data.status == 'use'){
      couponId = that.data.couponDetail.coupon_id;
    }
    // if(res.from === 'button'){
    //   console.log(res.target);
    // }
    return {
      title: '速抢！限量优惠券，别说我不爱你~',
      path: '/pages/couponDetail/couponDetail?status=receive&detail=' + couponId + '&franchisee=' + franchiseeId,
      success: function(res){
        // console.log('转发成功');
      },
      fail: function(res){
        // console.log('转发失败');
      }
    }
  },
  // 显示验证码
  showCouponVerify: function(){
    var qrcodeUrl = app.globalData.siteBaseUrl
                  + '/index.php?r=AppShop/couponQrcode&app_id='
                  + app.globalData.appId
                  + '&user_coupon_id='
                  + this.data.couponId;
    this.setData({
      'detailShow': false,
      'verifyShow': true,
      'verifyData.qrcodeUrl': qrcodeUrl
    });
    this.connectSocket();
  },
  // 关闭验证码
  hideCouponVerify: function(){
    this.setData({
      'detailShow': true,
      'verifyShow': false
    });
    clearInterval(this.timeInterval);
    wx.closeSocket();
  },
  timeInterval: '',// 定时器,间断发送消息
  connectSocket: function () {
    var that = this;
    wx.connectSocket({
      url: 'wss://ceshi.zhichiwangluo.com', //线下test
      // url: 'wss://xcx.zhichiwangluo.com', //testonly
      // url: 'wss://xcx.weiye.me', //预上线
      // url: 'wss://xcx.jisuapp.cn', //线上
      header: {
        'content-type': 'application/json'
      },
      method: 'GET'
    });
    wx.onSocketOpen(function (res) {
      let data = {
        'action': 'mark_client',
        'user_token': app.globalData.userInfo.user_token,
        'scenario_name': 'app_coupon_verify',
        'session_key': app.globalData.sessionKey
      };
      wx.sendSocketMessage({
        data: JSON.stringify(data)
      });
      that.timeInterval = setInterval(function () {
        let data = {
          'action': 'heartbeat',
          'user_token': app.globalData.userInfo.user_token,
          'scenario_name': 'app_coupon_verify',
          'session_key': app.globalData.sessionKey
        };
        wx.sendSocketMessage({
          data: JSON.stringify(data)
        })
      }, 30000);
    });
    wx.onSocketMessage(function (res) {
      let data = JSON.parse(res.data);
      if (data.action == 'push_to_client') {
        let msg = JSON.parse(data.msg);
        if ((msg.type == 'app_coupon_verify') && (msg.status == 0)) {
          that.setData({
            'verifyData.success': true,
            'couponDetail.status': 2
          });
          clearInterval(that.timeInterval);
          wx.closeSocket();
        }
      }
    });
  },
  onUnload: function () {
    var that = this;
    clearInterval(that.timeInterval);
    wx.closeSocket();
  },
  //跳转优惠卷可用商品列表
  turnToCouponGoodsList: function (event) {
    let couponId = this.data.status === 'receive' ? this.data.couponId : this.data.couponDetail.coupon_id;
    let franchiseeId = this.data.franchiseeId;
    let url = '/eCommerce/pages/couponGoodsListPage/couponGoodsListPage?detail=' + couponId;
    if (franchiseeId) {
      url += '&franchisee=' + franchiseeId;
    }
    app.turnToPage(url);
  }
})
