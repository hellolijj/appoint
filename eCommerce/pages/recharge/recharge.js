
var app = getApp()

Page({
  data: {
    type: '', // 1:购买储值项 ／ 5: 储值券充值 / 6: 自定义金额充值
    itemList: [],
    selectedItem: {
      index: -1,
      id: '',
      description: ''
    },
    customItemInfo: {
      status: 0,
      tip: ''
    },
    customPrice: '',
    couponItemList: [],
    selectedCouponItem: {
      index: -1,
      id: '',
    }
  },
  onLoad: function () {
    this.getItemInfo();
  },
  // 获取储值信息
  getItemInfo: function () {
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppShop/getStoredItems',
      hideLoading: true,
      success: function (res) {
        if (res.data.length != 0) {
          that.setData({
            'type': 1,
            'itemList': that.parseItemData(res.data),
            'selectedItem.index': 0,
            'selectedItem.id': res.data[0].id,
            'selectedItem.description': res.data[0].description
          });
        } else if (res.data.length == 0) {
          that.setData({
            'type': 1,
            'selectedItem.index': -1
          });
        }
        that.setData({
          'customItemInfo': that.parseCustomItemData(res.stored_custom_info),
          'couponItemList': that.parseCouponItemData(res.user_coupon_list)
        })
      }
    });
  },
  // 解析储值项数据
  parseItemData: function (data) {
    let array = [];
    let item = {};
    for (var i = 0; i < data.length; i++) {
      item = {};
      item.id = data[i].id;
      item.rechargeMoney = Number(data[i].price);
      item.giveMoney = Number(data[i].g_price);
      item.description = data[i].description;
      array.push(item);
    }
    return array;
  },
  // 选中储值项
  selectActiveItem: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    that.setData({
      'type': 1,
      'selectedItem.index': index,
      'selectedItem.id': that.data.itemList[index].id,
      'selectedItem.description': that.data.itemList[index].description
    });
  },
  // 解析自定义储值数据
  parseCustomItemData: function (data) {
    return (function(object){
      object = data;
      if(data.type == 1){
        object['tip'] = '按充值金额x' + data.value + '比例赠送储值金';
      } else if(data.type == 2){
        object['tip'] = '每充值' + data.condition + '元，赠送' + data.value + '元' ;
      } else {
        object['tip'] = '';
      }
      return object;
    })({});
  },
  // 选中自定义金额
  selectCustomItem: function () {
    let that = this;
    that.setData({
      'type': 6
    });
  },
  // 确定自定义金额
  confirmCustomPrice: function(e){
    let that = this;
    let price = e.detail.value;
    let customItemInfo = that.data.customItemInfo;
    let tip = '';
    if(price == ''){
      if(customItemInfo.type == 1){
        tip = '按充值金额x' + customItemInfo.value + '比例赠送储值金';
      } else if(customItemInfo.type == 2){
        tip = '每充值' + customItemInfo.condition + '元，赠送' + customItemInfo.value + '元' ;
      } else {
        tip = '';
      }
    } else if(!(/^[0-9]+([.]{1}[0-9]{1,2})?$/.test(price))){
      tip = '充值的金额必须>=0，精确到小数点后2位!';
    } else {
      if(customItemInfo.type == 1){
        tip = '赠送储值金' + ( price*customItemInfo.value ).toFixed(2) + '金';
      } else if(customItemInfo.type == 2){
        tip = '赠送储值金' + ( Math.floor(price/customItemInfo.condition)*customItemInfo.value ).toFixed(2) + '金';
      } else {
        tip = '';
      }
    }
    that.setData({
      'customPrice': e.detail.value,
      'customItemInfo.tip': tip
    });
  },
  // 解析储值券数据
  parseCouponItemData: function (data) {
    return (function(array){
      let item = {};
      for (var i = 0; i < data.length; i++) {
        item = {};
        item.id = data[i].id;
        item.price = Number(data[i].value);
        item.dateDuration = data[i].start_use_date.split('-').join('.') + '-' + data[i].end_use_date.split('-').join('.') ;
        item.otherCase = ( data[i].exclude_holiday == 1 ? '除法定节假日' : '') + ' ' + ( data[i].exclude_weekend == 1 ? '周一至周五' : '' );
        item.timeDuration = data[i].start_use_time + '-' + data[i].end_use_time;
        array.push(item);
      }
      return array;
    })([]);
  },
  // 选中储值券
  selectActiveCouponItem: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    that.setData({
      'type': 5,
      'selectedCouponItem.index': index,
      'selectedCouponItem.id': that.data.couponItemList[index].id
    });
  },
  // 充值按钮
  gotoRecharge: function (event) {
    let that = this;
    let type = that.data.type;
    if (type == 1 && that.data.selectedItem.index == -1) {
      if (that.data.selectedItem.id == '') {
        return false;
      }
      app.showToast({
        'title': '商家尚未建立储值项',
        'icon': 'loading',
        'success': function () {
        }
      });
      return false;
    } else if (type == 6 && that.data.customPrice == '') {
      app.showToast({
        'title': '请输入充值的金额',
        'icon': 'loading',
        'success': function () {
        }
      });
      return false;
    }
    let param = {
      type: type
    }
    if(type == 1){
      param['stored_id'] = that.data.selectedItem.id;
    } else if(type == 5){
      param['user_coupon_id'] = that.data.selectedCouponItem.id;
    } else if(type == 6){
      param['price'] = that.data.customPrice;
    }
    app.sendRequest({
      url: '/index.php?r=AppShop/creatStoredItemOrder',
      data: param,
      hideLoading: true,
      success: function (res) {
        let orderId = res.data;
        if(type == 1 || type == 6){
          app.sendRequest({
            url: '/index.php?r=AppShop/GetWxWebappPaymentCode',
            data: {
              order_id: orderId
            },
            hideLoading: true,
            success: function (res) {
              var param = res.data;
              param.orderId = orderId;
              param.success = function () {
                app.showToast({
                  title: '充值成功',
                  success: function () {
                    setTimeout(function(){
                      app.turnToPage('/eCommerce/pages/balance/balance', true);
                    }, 1500);
                  }
                });
              };
              app.wxPay(param);
            }
          });
        } else if(type == 5){
          app.showToast({
            title: '充值成功',
            success: function () {
              setTimeout(function(){
                app.turnToPage('/eCommerce/pages/balance/balance', true);
              }, 1500);
            }
          });
        }
      }
    });
  }
})
