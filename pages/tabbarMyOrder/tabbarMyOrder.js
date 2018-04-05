
var app = getApp()

Page({
  data: {
    orderLists: [],
    pages: 1,
    types: {      // 只有一种商品订单时，types保存商品订单的五个分类
      // 订单状态   0待付款 1待发货 2待收货 3待评价 4退款审核 5退款中 6成功 7关闭
      0: [undefined, 0, 1, 2, 3],     // 电商
      1: [undefined, 0, 1, 2, 3],     // 预约
      2: [undefined, 0, 6, 7],     // 外卖
      3: [undefined, 0, 1, 2, 3, 'refund_status', 7],     // 到店
      5: [undefined, 0, 6, 7]      // 当面付
    },
    noMore: false,
    currentTabIndex: 0,
    currentGoodsType: '',                
    goodsTypeList: [],
    isFromBack: false
  },
  onLoad: function(options){
    if (options.goodsType && options.currentIndex){
      this.setData({
        currentGoodsType: options.goodsType,
        currentTabIndex: options.currentIndex
      })
    }
    this.dataInitial();
  },
  onShow: function(){
    if (this.data.isFromBack) {
      this.setData({
        pages:1,
        currentTabIndex: this.data.currentTabIndex,
        noMore: false
      });
      this.getOrderList({ tabIndex: this.data.currentTabIndex});
    } else {
      this.setData({
        isFromBack: true
      })
    }
  },
  dataInitial: function(){
    var that = this;
    this.getOrderList({
      tabIndex: that.data.currentTabIndex,
      firstLoad: true
    });
  },
  getOrderList: function(param){
    var that = this,
        data = {
          page: that.data.pages,
          page_size: 50
        },
        type;

    if ( this.data.currentGoodsType != ""){
      type = this.data.types[this.data.currentGoodsType][param.tabIndex];

      if(type != undefined){
        data.idx_arr = {
          idx: 'status',
          idx_value: type
        }
      }
      
      data.goods_type = this.data.currentGoodsType
    }

    data.parent_shop_app_id = app.getAppId(); // 获取订单列表时 传parent_shop_app_id获取本店以及所有子店的订单

    if(param.firstLoad && this.data.currentGoodsType == ""){
    // 进入页面首次请求列表时 没有goodsType值 传入use_default_goods_type
      data.use_default_goods_type = 1;
    }
    app.sendRequest({
      url: '/index.php?r=AppShop/orderList',
      method: 'post',
      data: data,
      success: function(res){
        var data = {},
            orders = res.data;

        for (var i = orders.length - 1; i >= 0; i--) {
          var formData = orders[i].form_data;

          if(formData.tostore_data && formData.tostore_data.appointed_time){
            formData.tostore_data.appointed_time = formData.tostore_data.appointed_time.substr(11, 5);
          }
          orders[i] = formData;
        }

        if(param.scrollLoad){
          orders = that.data.orderLists.concat(orders);
        }
        data['orderLists'] = orders;
        data['takeoutInfo'] = res.take_out_info;
        data['pages'] = that.data.pages + 1;
        data['noMore'] = res.is_more == 0 ? true : false;
        data['currentGoodsType'] = res.current_goods_type;
        // 判断goods_type_list里面是否存在当前需要展示的列表
        data['goodsTypeList'] = res.goods_type_list;
        if (data['goodsTypeList'].indexOf(data['currentGoodsType'].toString()) < 0){
          data['goodsTypeList'].push(data['currentGoodsType']);
        }
        that.setData(data);
      }
    })
  },
  clickOrderTab: function(e){
    var dataset = e.target.dataset,
        index = dataset.index,
        data = {};

    data.currentTabIndex = index;
    data['pages'] = 1;
    data['orderLists'] = [];
    data['noMore'] = false;

    this.setData(data);
    this.getOrderList({tabIndex : index});
  },
  clickMeanTab: function(e){
    var dataset = e.target.dataset,
      index = dataset.index,
      data = {};

    data.currentTabIndex = 0;
    data['pages'] = 1;
    data['orderLists'] = [];
    data['noMore'] = false;
    data.currentGoodsType = dataset.goodsType;

    this.setData(data);
    this.getOrderList({ tabIndex: 0 });
  },
  // 多种商品下面的子菜单
  clickSubmenuTab: function(e){
    var dataset = e.target.dataset,
        index = dataset.index,
        data = {};

    data.currentTabIndex = index;
    data['pages'] = 1;
    data['orderLists'] = [];
    data['noMore'] = false;
    data.currentGoodsType = e.currentTarget.dataset.goodsType;

    this.setData(data);
    this.getOrderList({ tabIndex: index });
  },
  goToOrderDetail: function(e){
    var dataset = e.currentTarget.dataset,
        orderId = dataset.id,
        type = dataset.type,
        franchiseeId = dataset.franchisee,
        queryStr = franchiseeId === app.getAppId() ? '' : '&franchisee='+franchiseeId,
        router;
    if(type === 'transfer'){
      router = '/eCommerce/pages/transferOrderDetail/transferOrderDetail';
    }else if(type === 'tostore'){
      router = '/orderMeal/pages/tostoreOrderDetail/tostoreOrderDetail';
    } else if(type === 'eBusiness') {
      router = '/eCommerce/pages/goodsOrderDetail/goodsOrderDetail';
    } else if (type === 'takeout'){
      router = '/orderMeal/pages/takeoutOrderDetail/takeoutOrderDetail';
    } else {
      router = '/eCommerce/pages/appointmentOrderDetail/appointmentOrderDetail';
    }
    app.turnToPage(router+'?detail='+orderId+queryStr);
  },
  cancelOrder: function(e){
    var orderId = e.target.dataset.id,
        franchisee = e.target.dataset.franchisee,
        subShopId = franchisee == app.getAppId() ? '' : franchisee,
        that = this;

    app.showModal({
      content: '确定要取消订单？',
      showCancel: true,
      cancelText: '否',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/cancelOrder',
          data: {
            order_id: orderId,
            sub_shop_app_id: subShopId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList({tabIndex : index});
          }
        })
      }
    })
  },
  applyDrawback: function(e){
    var orderId = e.target.dataset.id,
        franchisee = e.target.dataset.franchisee,
        subShopId = franchisee == app.getAppId() ? '' : franchisee,
        that = this;

    app.showModal({
      content: '确定要申请退款？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/applyRefund',
          data: {
            order_id: orderId,
            sub_shop_app_id: subShopId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList({tabIndex : index});
          }
        })
      }
    })
  },
  checkLogistics: function(e){
    var orderId = e.target.dataset.id;
    app.turnToPage('/eCommerce/pages/logisticsPage/logisticsPage?detail='+orderId);
  },
  sureReceipt: function(e){
    var orderId = e.target.dataset.id,
        franchisee = e.target.dataset.franchisee,
        subShopId = franchisee == app.getAppId() ? '' : franchisee,
        that = this,
        content = this.data.currentGoodsType == '1'? '确认已消费?':'确认已收到货物?';

    app.showModal({
      content: content,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      confirm: function(){
        app.sendRequest({
          url: '/index.php?r=AppShop/comfirmOrder',
          data: {
            order_id: orderId,
            sub_shop_app_id: subShopId
          },
          success: function(res){
            var index = that.data.currentTabIndex,
                data = {};

            data['pages'] = 1;
            that.setData(data);
            that.getOrderList({tabIndex : index});
          }
        })
      }
    })
  },
  makeComment: function(e){
    var orderId = e.target.dataset.id,
        franchiseeId = e.target.dataset.franchisee,
        queryStr = franchiseeId === app.getAppId() ? '' : '&franchisee='+franchiseeId;
    app.turnToPage('/eCommerce/pages/makeComment/makeComment?detail='+orderId+queryStr);
  },
  takeoutMakeComment:function(e){
    var orderId = e.target.dataset.id,
      franchiseeId = e.target.dataset.franchisee,
      queryStr = franchiseeId === app.getAppId() ? '' : '&franchisee=' + franchiseeId;
    app.turnToPage('/orderMeal/pages/takeoutMakeComment/takeoutMakeComment?detail=' + orderId + queryStr);
  },
  verificationCode: function(e){
    var orderId = e.target.dataset.id;
    var franchiseeId = e.target.dataset.franchisee;
    app.turnToPage('/eCommerce/pages/verificationCodePage/verificationCodePage?detail=' + orderId + '&sub_shop_app_id=' + franchiseeId);
  },
  scrollToListBottom: function(){
    var currentTabIndex = this.data.currentTabIndex;
    if(this.data.noMore){
      return;
    }
    this.getOrderList({
      tabIndex: currentTabIndex,
      scrollLoad: true
    });
  }
})
