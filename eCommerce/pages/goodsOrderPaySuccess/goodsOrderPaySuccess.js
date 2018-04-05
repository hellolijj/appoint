import Scratch from "../../../utils/scratch.js"
var app = getApp()

Page({
  data: {
    status: 0, // 0: 普通页面 1:有集集乐的情况
    orderId: '',
    franchiseeId: '',
    collectBenefitData: {}, // 集集乐数据
    starData: [], //集集乐的星 light:已集样式 dark:未集样式
    isFail:true,//刮刮乐未中奖
    isWinning:true,//刮刮乐中奖
    isComfort:true,//刮刮乐安慰奖
    isWhole:true,//刮奖区域是否显示
    scratchId: '',//活动号
    isShowteam: false,
    winingTitle:'',
    canShow: wx.canIUse('cover-view'),
    isScroll : true, //刮刮乐当在 canvas 中移动时且有绑定手势事件时禁止屏幕滚动以及下拉刷新
  },
  onLoad: function (options) {
    let that = this;
    // 判断是否有集集乐活动
    if(options.collectBenefit == 1){
      that.getCollectBenefitData(options.detail);
      that.setData({
        'status': 1
      });
    }
    that.setData({
      'orderId': options.detail,
      'franchiseeId': options.franchisee || '',
      'is_group': options.is_group,
      'code': options.code || ''
    });
    that.getGoldenData(options.detail);
    let systemInfo = app.globalData.systemInfo;
    let width = 558 * systemInfo.windowWidth / 750;
    let height = 258 * systemInfo.windowWidth / 750;
    that.scratch = new Scratch(that, {
      canvasWidth: width,
      canvasHeight: height,
      imageResource: app.getSiteBaseUrl()+'/index.php?r=Download/DownloadResourceFromUrl&url='+app.getCdnUrl()+'/static/webapp/images/scratchMovie.png',
      maskColor: "red",
      r: 15,
      callback: () => {
        that.setData({
          hideCanvas: true
        })
      },
      imgLoadCallback: () =>{
        setTimeout(function() {
          that.setData({
            isShowteam: true
          });
        }, 150);
      }
    });
  },
  touchStart: function(e){
    // this.scratch.start();
    if (!this.isStart) return
    let pos = this.drawRect(e.touches[0].x, e.touches[0].y)
    this.ctx.clearRect(pos[0], pos[1], pos[2], pos[2])
    this.ctx.draw(true)
  },
  touchMove:function(e){
    if (!this.isStart) return
    let pos = this.drawRect(e.touches[0].x, e.touches[0].y)
    this.ctx.clearRect(pos[0], pos[1], pos[2], pos[2])
    this.ctx.draw(true) 
  },
  touchEnd:function(e){
    if (!this.isStart) return
    //自动清楚采用点范围值方式判断
    let { canvasWidth, canvasHeight, minX, minY, maxX, maxY } = this
    if (maxX - minX > .5 * canvasWidth && maxY - minY > .5 * canvasHeight) {
      this.ctx.draw()
      this.endCallBack && this.endCallBack()
      this.isStart = false
      this.page.setData({
        "isScroll": true
      })
    }
  },
  //砸金蛋
  getGoldenData: function (id) {
    let that = this;
    app.sendRequest({
      url: "/index.php?r=appLotteryActivity/getTimeAfterConsume",
      method: "post",
      data: {
        app_id: app.globalData.appId,
        order_id: id
      },
      success: function (data) {
        if(data.data){
          if(that.data.code){
            that.setData({
              isWhole: true,
            })
          }else{
            that.setData({
              isWhole: false,
              scratchId: data.data
            })
          }
          
        }else{
          that.setData({
            isWhole: true,
          })
        }
        if (data.integral) {//支付获取积分
          that.setData({
            'rewardPointObj': {
              showModal: true,
              count: data.integral,
              callback: ''
            }
          })
        }
      }
    })
  },
  showAreaClick:function(){
    //点击刮奖
    let that=this;
    that.setData({
      isShowteam: false
    })
    app.sendRequest({
      url:"/index.php?r=appLotteryActivity/lottery",
      hideLoading:true,
      data:{
        activity_id: that.data.scratchId,
        app_id: app.globalData.appId
      },
      success:function(res){
        let data=res.data;
        that.scratch.start();
        if(data.title=='谢谢参与'){
          that.setData({
            isFail:false
          })
        }else{
          if (data.is_comfort){
            that.setData({
              isComfort:false
            })
          }else{
            that.setData({
              isWinning:false,
              winingTitle:data.title
            })
          }
        }
      }
    })
  },
  onShareAppMessage: function (res) {
    var that = this;
    return {
      // title: that.data.scratchInfo.title,
      path: '/awardManagement/pages/scratch/scratch?id=' + that.data.scratchId,
      success: function (res) {
        // 转发成功
        app.sendRequest({
          url: "/index.php?r=appLotteryActivity/getTime",
          data: {
            app_id: app.globalData.appId,
            activity_id: that.data.scratchId,
            type: 'share'
          },
          success: function (res) {

          }
        })

      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 获取集集乐数据
  getCollectBenefitData: function(id){
    let that = this;
    app.sendRequest({
      url: '/index.php?r=AppMarketing/CollectmeSendCoupon',
      data: {
        'order_id': id,
      },
      hideLoading: true,
      success: function(res){     
        let starData = [];
        for(var i = 0; i < res.data.star_num; i++){
          starData.push('light');
        }
        for(var i = 0; i < res.data.collect_num - res.data.star_num; i++){
          starData.push('dark');
        }
        that.setData({
          'collectBenefitData': res.data,
          'starData': starData
        });
      }
    });
  },
  goToHomepage: function(){
    let router = app.getHomepageRouter();
    app.reLaunch({
      url:'/pages/' + router + '/' + router
    });
  },
  goToOrderDetail: function(){
    let that = this;
    let groupPath = '/eCommerce/pages/groupOrderDetail/groupOrderDetail?id=' + that.data.orderId + (that.data.franchiseeId ? '&franchisee=' + that.data.franchiseeId : '');
    let pagePath = '/eCommerce/pages/goodsOrderDetail/goodsOrderDetail?detail=' + that.data.orderId  + ( that.data.franchiseeId ? '&franchisee=' + that.data.franchiseeId : '');
    let appointmentPath = '/eCommerce/pages/appointmentOrderDetail/appointmentOrderDetail?detail=' + that.data.orderId + (that.data.franchiseeId ? '&franchisee=' + that.data.franchiseeId : '');
    if(this.data.is_group == 'true'){
      app.turnToPage(groupPath, true);
    }else if(this.data.code){
      app.turnToPage(appointmentPath, true);
    }else{
      app.turnToPage(pagePath, true);
    }
  }
})
