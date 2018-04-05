var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    type: -1,
    loadData: {
      currentPage: 1,
      isMore: 0,
      loading: false
    },
    couponList: [],
    rechargeSuccess: 0
  },
  onShow: function() {
    let _this = this;
    _this.getTabData();
  }, 
  changeTab: function(event){
    let _this = this;
    let type = event.target.dataset.type;
    _this.setData({
      type: type,
      couponList: [],
      loadData: {
        currentPage: 1,
        isMore: 0,
        loading: false
      }
    });
    _this.getTabData();
  },
  getTabData: function(event) {
    let _this = this;
    app.sendRequest({
      url: '/index.php?r=AppShop/getMyCoupons',
      data: {
        type: _this.data.type,
        page: 1,
        page_size: 10
      },
      hideLoading: true,
      success: function(res) {
        _this.setData({
          'couponList': res.data,
          'loadData.isMore': res.is_more
        })
      }
    });
  },
  getMoreTabData: function(){
    let _this = this;
    if(_this.data.loadData.isMore == 0 || _this.data.loadData.loading) {
      return false;
    }
    _this.setData({
      'loadData.loading': true,
    })
    app.sendRequest({
      url: '/index.php?r=AppShop/getMyCoupons',
      data: {
        type: _this.data.type,
        page: _this.data.loadData.currentPage + 1,
        page_size: 10
      },
      hideLoading: true,
      success: function(res) {
        _this.setData({
          'couponList': _this.data.couponList.concat(res.data),
          'loadData.currentPage': res.current_page,
          'loadData.isMore': res.is_more,
          'loadData.loading': false,
        })
      }
    });
  },
  // 跳转优惠券详情(使用状态)
  gotoCouponDetail: function(event){
    let url = '/pages/couponDetail/couponDetail?status=use&detail=' + event.currentTarget.dataset.id;
    app.turnToPage(url, false);
  },
  // 满减券、打折券、代金券使用
  gotoTransferPage: function(){
    let url = '/eCommerce/pages/transferPage/transferPage';
    app.turnToPage(url, false);
  },
  // 储值券使用
  gotoRecharge: function(event){
    let _this = this;
    let userCouponId = event.currentTarget.dataset.id;
    app.sendRequest({
      url: '/index.php?r=AppShop/useCoupon',
      data: {
        user_coupon_id: userCouponId
      },
      hideLoading: true,
      success: function(res) {
        _this.setData({
          rechargeSuccess: 1
        });
        setTimeout(function() {
          _this.hideToast();
        }, 3000);
        let couponList = _this.data.couponList;
        for(var i = 0; i < couponList.length; i++){
          if(couponList[i]['id'] == userCouponId){
            let newData = {};
            newData['couponList['+i+'].status'] = 2;
            _this.setData(newData); 
          }
        }
      }
    })
  },
  // 关闭toast
  hideToast: function(){
    this.setData({
      rechargeSuccess: 0
    });
  }
})
