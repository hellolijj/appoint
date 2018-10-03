var app      = getApp();

var pageData = {
  data: {
    "carousel1": { "type": "carousel", "style": "height:304.6875rpx;margin-left:auto;margin-right:auto;margin-top:0;opacity:1;", "content": [{ "customFeature": [], "pic": "/images/banner1.jpg", "content": "", "parentCompid": "carousel1", "style": "" }, { "customFeature": [], "content": "", "parentCompid": "carousel1", "style": "" }], "customFeature": { "autoplay": true, "interval": 2, "carouselgroupId": "1127301" }, "animations": [], "page_form": "", "compId": "carousel1" }, "layout_vessel2": { "type": "layout-vessel", "style": "background-color:rgb(255, 255, 255);opacity:1;height:257.8125rpx;min-height:auto;margin-left:auto;", "content": { "leftEles": [{ "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(51, 51, 51);font-size:29rpx;font-weight:bold;height:44.53125rpx;line-height:44.53125rpx;margin-left:37.5rpx;margin-top:0;opacity:1;text-align:left;", "content": "ZJSU College of International Education", "customFeature": { "boxColor": "rgb(0, 0, 0)", "boxR": "5", "boxStyle": false, "boxX": "0", "boxY": "0", "action": "inner-link", "inner-page-link": "o9j42s2GS3_page10015" }, "animations": [], "compId": "data.content.leftEles[0]", "parentCompid": "layout_vessel2", "markColor": "", "mode": 0, "itemType": "text", "itemParentType": "layout-vessel", "itemIndex": 0, "eventParams": "{\"inner_page_link\":\"o9j42s2GS3_page10015\",\"is_redirect\":0}", "eventHandler": "" }, { "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:32.8125rpx;height:44.53125rpx;line-height:44.53125rpx;margin-left:37.5rpx;margin-top:23.4375rpx;opacity:1;text-align:left;", "content":"address: office","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0","action":"none","inner-page-link":"o9j42s2GS3_page10015"},"animations":[],"compId":"data.content.leftEles[1]","parentCompid":"layout_vessel2","markColor":"","mode":0},{"type":"text","style":"background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:32.8125rpx;height:44.53125rpx;line-height:23.4375rpx;margin-left:0;opacity:1;text-align:left;","content":"  ","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0"},"animations":[],"compId":"data.content.leftEles[2]","parentCompid":"layout_vessel2","markColor":"","mode":0}],"rightEles":[{"type":"picture","style":"opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-radius:14.0625rpx;border-style:none;height:93.75rpx;width:93.75rpx;margin-left:auto;margin-right:auto;margin-top:11.71875rpx;","content":"/images/call.png","customFeature":{"boxShadow":"('#000','0','0','5')","boxColor":"#000","boxX":"0","boxY":"0","boxR":"5","action":"call","inner-page-link":"prePage","phone-num":"0571-28877777"},"animations":[],"compId":"data.content.rightEles[0]","parentCompid":"layout_vessel2","itemType":"picture","itemParentType":"layout-vessel","itemIndex":0,"eventParams":"{\"phone_num\":\"0571-28877777\"}","eventHandler":"tapPhoneCallHandler"}]},"customFeature":{"CellBorderColor":"rgb(218, 218, 218)","CellBorderStyle":"solid","CellBorderWidth":"1px","action":"none","cellWidth":80,"page-link":"prePage","phone-num":"","inner-page-link":"prePage"},"animations":[],"page_form":"","compId":"layout_vessel2","cell_style_1":"width:80%;margin-left:auto;","cell_style_2":"width:20%;border-left-style:solid;border-left-width:2.34375rpx;border-color:rgb(218, 218, 218);margin-left:auto;"},"free_vessel3":{"type":"free-vessel","style":"width:750rpx;height:2.34375rpx;background-color:rgb(249, 249, 249);margin-bottom:auto;margin-right:auto;opacity:1;margin-left:auto;","content":[],"customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":5,"boxStyle":false,"boxX":0,"boxY":0},"animations":[],"page_form":"","compId":"free_vessel3"},"free_vessel4":{"type":"free-vessel","style":"width:750rpx;height:2.34375rpx;background-color:rgb(249, 249, 249);margin-bottom:auto;margin-right:auto;opacity:1;margin-left:auto;","content":[],"customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":5,"boxStyle":false,"boxX":0,"boxY":0},"animations":[],"page_form":"","compId":"free_vessel4"},
  
  
    "free_vessel5": {
      "type": "free-vessel",
      "style": "width:750rpx;height:222.65625rpx;background-color:rgb(255, 255, 255);margin-bottom:auto;margin-right:auto;margin-top:11.71875rpx;opacity:1;margin-left:auto;",
      "content": [
        {
          "type": "picture",
          "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:93.75rpx;width:93.75rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:93.75rpx;top:46.875rpx;",
          "content": "/images/kaoshi.png",
          "customFeature": {
            "boxShadow": "5",
            "boxColor": "#000",
            "boxX": "0",
            "boxY": "0",
            "boxR": "5",
            "action": "none",
            "inner-page-link": "page10004"
          },
          "animations": [],
          "compId": "data.content[0]",
          "parentCompid": "free_vessel5",
          "mode": 0,
          "itemType": "text",
          "itemParentType": "free-vessel",
          "itemIndex": 1,
          "eventParams": "{\"inner_page_link\":\"../answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":0}",
          "eventHandler": "tapInnerLinkHandler"
        },
        {
          "type": "picture",
          "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:93.75rpx;width:93.75rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:328.125rpx;top:46.875rpx;",
          "content": "/images/yuyuexia.png",
          "customFeature": {
            "boxShadow": "5",
            "boxColor": "#000",
            "boxX": "0",
            "boxY": "0",
            "boxR": "5",
            "action": "none",
            "inner-page-link": "page10005"
            
          },
          "animations": [],
          "compId": "data.content[1]",
          "parentCompid": "free_vessel5",

          "itemIndex": 1,
          "eventParams": "{\"inner_page_link\":\"../answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":0}",
          "eventHandler": "tapAppointLinkHandler"
        },
        {
          "type": "picture",
          "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:93.75rpx;width:93.75rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:562.5rpx;top:46.875rpx;",
          "content": "/images/gonggao.png",
          "customFeature": {
            "boxShadow": "5",
            "boxColor": "#000",
            "boxX": "0",
            "boxY": "0",
            "boxR": "5",
            "action": "none",
            "inner-page-link": "page10006"
          },
          "animations": [],
          "compId": "data.content[2]",
          "parentCompid": "free_vessel5",
          "eventParams": "{\"inner_page_link\":\"../answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":0}",
          "eventHandler": "tapAnnouncementLinkHandler"
          // 这里是annuonce 图标
        },
        {
          "type": "text",
          "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(81, 81, 81);font-size:14px;height:44.53125rpx;line-height:16px;margin-left:0;margin-top:0;opacity:1;text-align:center;position:absolute;left:56rpx;top:152.34375rpx;margin-right:0;",
          "content": "entrance\nexamination",
          "customFeature": {
            "boxColor": "rgb(0, 0, 0)",
            "boxR": "5",
            "boxStyle": false,
            "boxX": "0",
            "boxY": "0",
            "action": "none",
            "inner-page-link": "page10004"
          },
          "animations": [],
          "compId": "data.content[3]",
          "parentCompid": "free_vessel5",
          "markColor": "",
          "mode": 0,
          "itemType": "text",
          "itemParentType": "free-vessel",
          "itemIndex": 1,
          "eventParams": "{\"inner_page_link\":\"../answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":1}",
          "eventHandler": "tapInnerLinkHandler"
        },
        {
          "type": "text",
          "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(81, 81, 81);font-size:14px;height:44.53125rpx;line-height:46.875rpx;margin-left:0;margin-top:0;opacity:1;text-align:left;position:absolute;left:308rpx;top:160rpx;margin-right:0;",
          "content": "reservation",
          "customFeature": {
            "boxColor": "rgb(0, 0, 0)",
            "boxR": "5",
            "boxStyle": false,
            "boxX": "0",
            "boxY": "0",
            "action": "none",
            "inner-page-link": "page10005",
            "mode": 0,
            "itemType": "text",
            "itemParentType": "free-vessel",
            "itemIndex": 1,
            "eventParams": "", 
            "eventHandler": "tapAppointLinkHandler"
          },
          "animations": [],
          "compId": "data.content[4]",
          "parentCompid": "free_vessel5",
          "markColor": "",
          "mode": 0,
          "itemType": "text",
          "itemParentType": "free-vessel",
          "itemIndex": 1,
          "eventParams": "{\"inner_page_link\":\"/answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":0}",
          "eventHandler": "tapAppointLinkHandler"
        },
        {
          "type": "text",
          "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(81, 81, 81);font-size:14px;height:44.53125rpx;line-height:46.875rpx;margin-left:0;margin-top:0;opacity:1;text-align:left;position:absolute;left:514rpx;top:160rpx;margin-right:0;",
          "content": "announcement",
          "customFeature": {
            "boxColor": "rgb(0, 0, 0)",
            "boxR": "5",
            "boxStyle": false,
            "boxX": "0",
            "boxY": "0",
            "action": "none",
            // "inner-page-link": "page10006",
            "mode": 0,
            "itemType": "text",
            "itemParentType": "free-vessel",
            "itemIndex": 1,
            "eventParams": "{\"inner_page_link\":\"/answer/answer_simulate_tip/simulate_tip\",\"is_redirect\":0}",
            "eventHandler": "appoint"
          },
          "animations": [],
          "compId": "data.content[5]",
          "parentCompid": "free_vessel5",
          "markColor": "",
          "mode": 0
        }
      ],
      "customFeature": {
        "boxColor": "rgb(0, 0, 0)",
        "boxR": 5,
        "boxStyle": false,
        "boxX": 0,
        "boxY": 0
      },
      "animations": [],
      "page_form": "",
      "compId": "free_vessel5"
    },
  
    "free_vessel6": {
      "type": "free-vessel", "style": "width:750rpx;height:229.6875rpx;background-color:rgb(255, 255, 255);margin-bottom:auto;margin-right:auto;opacity:1;margin-left:auto;", "content": [{ "type": "picture", "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:84.375rpx;width:84.375rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:70.3125rpx;top:46.875rpx;", "content": "/images/qianzheng.png", "customFeature": { "boxShadow": "('#000','0','0','5')", "boxColor": "#000", "boxX": "0", "boxY": "0", "boxR": "5", "action": "inner-link", "inner-page-link": "page10026" }, "animations": [], "compId": "data.content[0]", "parentCompid": "free_vessel6", "itemType": "picture", "itemParentType": "free-vessel", "itemIndex": 0, "eventParams": "{\"inner_page_link\":\"page10026\",\"is_redirect\":0}", "eventHandler":"appoint_via"},
 
   { "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:14px;height:44.53125rpx;line-height:16px;margin-left:0;margin-top:0;opacity:1;text-align:center;position:absolute;left:30rpx;top:145.3125rpx;margin-right:0;", "content":"visa\nappointment","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0","action":"inner-link","inner-page-link":"page10026"},"animations":[],"compId":"data.content[1]","parentCompid":"free_vessel6","markColor":"","mode":0,"itemType":"text","itemParentType":"free-vessel","itemIndex":1,"eventParams":"{\"inner_page_link\":\"page10026\",\"is_redirect\":0}","eventHandler":"appoint_via"},
 
   { "type": "picture", "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:84.375rpx;width:84.375rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:241.40625rpx;top:46.875rpx;", "content": "/images/jiaofei.png", "customFeature": { "boxShadow": "('#000','0','0','5')", "boxColor": "#000", "boxX": "0", "boxY": "0", "boxR": "5", "action": "inner-link", "inner-page-link": "page10028" }, "animations": [], "compId": "data.content[2]", "parentCompid": "free_vessel6", "itemType": "picture", "itemParentType": "free-vessel", "itemIndex": 2, "eventParams": "{\"inner_page_link\":\"page10028\",\"is_redirect\":0}", "eventHandler":"appoint_pay"},
   { "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:14px;height:44.53125rpx;line-height:16px;margin-left:0;margin-top:0;opacity:1;text-align:center;position:absolute;left:200rpx;top:145.3125rpx;margin-right:0;", "content": "reimbursement\nappointment", "customFeature": { "boxColor": "rgb(0, 0, 0)", "boxR": "5", "boxStyle": false, "boxX": "0", "boxY": "0", "action": "inner-link", "inner-page-link": "page10028" }, "animations": [], "compId": "data.content[3]", "parentCompid": "free_vessel6", "markColor": "", "mode": 0, "itemType": "text", "itemParentType": "free-vessel", "itemIndex": 3, "eventParams": "{\"inner_page_link\":\"page10028\",\"is_redirect\":0}", "eventHandler": "appoint_pay" }, { "type": "picture", "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:84.375rpx;width:84.375rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:421.875rpx;top:46.875rpx;", "content": "/images/jiedai.png", "customFeature": { "boxShadow": "('#000','0','0','5')", "boxColor": "#000", "boxX": "0", "boxY": "0", "boxR": "5", "action": "inner-link", "inner-page-link": "page10029" }, "animations": [], "compId": "data.content[4]", "parentCompid": "free_vessel6", "itemType": "picture", "itemParentType": "free-vessel", "itemIndex": 4, "eventParams": "{\"inner_page_link\":\"page10029\",\"is_redirect\":0}", "eventHandler": "appoint_reservation" }, { "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:14px;height:44.53125rpx;line-height:16rpx;margin-left:0;margin-top:0;opacity:1;text-align:center;position:absolute;left:396rpx;top:160rpx;margin-right:0;", "content": "reception day", "customFeature": { "boxColor": "rgb(0, 0, 0)", "boxR": "5", "boxStyle": false, "boxX": "0", "boxY": "0", "action": "inner-link", "inner-page-link": "page10029" }, "animations": [], "compId": "data.content[5]", "parentCompid": "free_vessel6", "markColor": "", "mode": 0, "itemType": "text", "itemParentType": "free-vessel", "itemIndex": 5, "eventParams": "{\"inner_page_link\":\"page10029\",\"is_redirect\":0}", "eventHandler": "appoint_reservation" }, { "type": "picture", "style": "opacity:1;background-color:transparent;border-color:rgb(34, 34, 34);border-style:none;height:84.375rpx;width:84.375rpx;margin-left:0;margin-right:0;margin-top:0;position:absolute;left:592.96875rpx;top:46.875rpx;", "content": "/images/sushe.png", "customFeature": { "boxShadow": "('#000','0','0','5')", "boxColor": "#000", "boxX": "0", "boxY": "0", "boxR": "5", "action": "inner-link", "inner-page-link": "page10027" }, "animations": [], "compId": "data.content[6]", "parentCompid": "free_vessel6", "itemType": "picture", "itemParentType": "free-vessel", "itemIndex": 6, "eventParams": "{\"inner_page_link\":\"page10027\",\"is_redirect\":0}", "eventHandler": "appoint_refund" }, { "type": "text", "style": "background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:14px;height:44.53125rpx;line-height:16px;margin-left:0;margin-top:0;opacity:1;text-align:center;position:absolute;left:562rpx;top:145.3125rpx;margin-right:0;", "content":"dormitory\nexchange","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0","action":"inner-link","inner-page-link":"page10027"},"animations":[],"compId":"data.content[7]","parentCompid":"free_vessel6","markColor":"","mode":0,"itemType":"text","itemParentType":"free-vessel","itemIndex":7,"eventParams":"{\"inner_page_link\":\"page10027\",\"is_redirect\":0}","eventHandler":"appoint_refund"}],"customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":5,"boxStyle":false,"boxX":0,"boxY":0},"animations":[],"page_form":"","compId":"free_vessel6"},"has_tabbar":1,"page_hidden":true,"page_form":"","top_nav":{"navigationBarTitleText":"\u9996\u9875"}},
    need_login: false,
    page_router: 'o9j42s2GS3_page10000',
    page_form: 'none',
      list_compids_params: [],
      user_center_compids_params: [],
      goods_compids_params: [],
  prevPage:0,
      tostoreComps: [],
      carouselGroupidsParams: [{"compid":"carousel1","carouselgroupId":"1127301"}],
      relobj_auto: [],
      bbsCompIds: [],
      dynamicVesselComps: [],
      communityComps: [],
      franchiseeComps: [],
      cityLocationComps: [],
      seckillOnLoadCompidParam: [],
      dynamicClassifyGroupidsParams: [],
      newClassifyGroupidsParams: [],
      videoListComps: [],
      videoProjectComps: [],
      newsComps: [],
      popupWindowComps: [],
      returnToVersionFlag: true,
  requesting: false,
  requestNum: 1,
  modelChoose: [],
  modelChooseId: '',
  modelChooseName: [],
  onLoad: function (e) {
    app.onPageLoad(e);
    app.isNeedRewardModal();
  },
  dataInitial: function () {
    app.pageDataInitial();
  },
  onShareAppMessage: function (e) {
    return app.onPageShareAppMessage(e);
  },
  onShow: function () {
    app.onPageShow();
  },
  reachBottomFuc: [],
  onReachBottom: function () {
    app.onPageReachBottom( this.reachBottomFuc );
  },
  onUnload: function () {
    app.onPageUnload();
  },
  connectWifiHandler:function(e){
    app.connectWifiHandler(e)
  },
  tapPrevewPictureHandler: function (e) {
    app.tapPrevewPictureHandler(e);
  },
  suspensionBottom: function () {
    app.suspensionBottom();
  },
  pageScrollFunc: function (e) {
    app.pageScrollFunc(e);
  },
  dynamicVesselScrollFunc: function (e) {
    app.dynamicVesselScrollFunc(e);
  },
  goodsScrollFunc: function (e) {
    app.goodsScrollFunc(e);
  },
  takeoutStyleScrollFunc: function(e){
    app.takeoutStyleScrollFunc(e);
  },
  franchiseeScrollFunc: function (e) {
    app.franchiseeScrollFunc(e);
  },
  seckillScrollFunc: function (e) {
    app.seckillScrollFunc(e);
  },
  videoScrollFunc: function (e) {
    app.videoScrollFunc(e);
  },
  carouselVideoClose: function(e) {
    app.carouselVideoClose(e);
  },
  changeCount: function (e) {
    app.changeCount(e);
  },
  inputChange: function (e) {
    app.inputChange(e);
  },
  bindDateChange: function (e) {
    app.bindDateChange(e);
  },
  bindTimeChange: function (e) {
    app.bindTimeChange(e);
  },
  bindSelectChange: function (e) {
    app.bindSelectChange(e);
  },
  bindScoreChange: function (e) {
    app.bindScoreChange(e);
  },
  submitForm: function (e) {
    app.submitForm(e);
  },
  udpateVideoSrc: function (e) {
    app.udpateVideoSrc(e);
  },
  tapMapDetail: function (e) {
    app.tapMapDetail(e);
  },
  uploadFormImg: function (e) {
    app.uploadFormImg(e);
  },
  deleteUploadImg: function (e) {
    app.deleteUploadImg(e);
  },
  listVesselTurnToPage: function (e) {
    app.listVesselTurnToPage(e);
  },
  dynamicVesselTurnToPage: function (e) {
    app.dynamicVesselTurnToPage(e);
  },
  userCenterTurnToPage: function (e) {
    app.userCenterTurnToPage(e);
  },
  turnToGoodsDetail: function (e) {
    app.turnToGoodsDetail(e);
  },
  turnToFranchiseeDetail: function (e) {
    app.turnToFranchiseeDetail(e);
  },
  turnToSeckillDetail: function (e) {
    app.turnToSeckillDetail(e);
  },
  sortListFunc: function (e) {
    app.sortListFunc(e);
  },
  bbsInputComment: function (e) {
    app.bbsInputComment(e);
  },
  bbsInputReply: function (e) {
    app.bbsInputReply(e);
  },
  uploadBbsCommentImage: function (e) {
    app.uploadBbsCommentImage(e);
  },
  uploadBbsReplyImage: function (e) {
    app.uploadBbsReplyImage(e);
  },
  deleteCommentImage: function (e) {
    app.deleteCommentImage(e);
  },
  deleteReplyImage: function (e) {
    app.deleteReplyImage(e);
  },
  bbsPublishComment: function (e) {
    app.bbsPublishComment(e);
  },
  clickBbsReplyBtn: function (e) {
    app.clickBbsReplyBtn(e);
  },
  bbsPublishReply: function (e) {
    app.bbsPublishReply(e);
  },
  searchList: function (e) {
    app.searchList(e);
  },
  selectLocal: function (e) {
    app.selectLocal(e);
  },
  cancelCity: function (e) {
    app.cancelCity(e);
  },
  bindCityChange: function (e) {
    app.bindCityChange(e);
  },
  submitCity: function (e) {
    app.submitCity(e);
  },
  openTakeoutLocation: function (e) {
    app.openTakeoutLocation(e);
  },
  callTakeout: function (e) {
    app.callTakeout(e);
  },
  getMoreAssess: function (e) {
    app.getMoreAssess(e);
  },
  changeEvaluate: function (e) {
    app.changeEvaluate(e)
  },
  deleteAllCarts: function (e) {
    app.deleteAllCarts(e);
  },
  clickCategory: function (e) {
    app.clickCategory(e);
  },
  goodsListMinus: function (e) {
    app.goodsListMinus(e);
  },
  goodsListPlus: function (e) {
    app.goodsListPlus(e);
  },
  cartListMinus: function (e) {
    app.cartListMinus(e);
  },
  cartListPlus: function (e) {
    app.cartListPlus(e);
  },
  changeAssessType: function (e) {
    app.changeAssessType(e);
  },
  showShoppingCartPop: function (e) {
    app.showShoppingCartPop(e);
  },
  hideShoppingCart: function (e) {
    app.hideShoppingCart(e);
  },
  showGoodsDetail: function (e) {
    app.showGoodsDetail(e);
  },
  hideDetailPop: function (e) {
    app.hideDetailPop(e);
  },
  hideModelPop: function (e) {
    app.hideModelPop(e);
  },
  chooseModel: function (e) {
    app.chooseModel(e);
  },
  sureChooseModel: function (e) {
    app.sureChooseModel(e);
  },
  clickChooseComplete: function (e) {
    app.clickChooseComplete(e);
  },
  reLocalAddress: function(e){
    app.reLocalAddress(e);
  },
  tapGoodsTradeHandler: function (e) {
    app.tapGoodsTradeHandler(e);
  },
  tapVideoHandler: function(e){
    app.tapVideoHandler(e);
  },
  tapVideoPlayHandler: function(e){
    app.tapVideoPlayHandler(e);
  },
  tapToPluginHandler: function (e) {
    app.tapToPluginHandler(e);
  },
  tapPhoneCallHandler: function (e) {
    app.tapPhoneCallHandler(e);
  },
  tapNewClassifyShowSubClassify: function(e){
    app.tapNewClassifyShowSubClassify(e);
  },
  tapNewClassifyRefreshHandler: function(e){
    app.tapNewClassifyRefreshHandler(e);
  },
  tapRefreshListHandler: function (e) {
    app.tapRefreshListHandler(e);
  },
  tapGetCouponHandler: function (e) {
    app.tapGetCouponHandler(e);
  },
  tapCommunityHandler: function (e) {
    app.tapCommunityHandler(e);
  },
  tapPageShareHandler:function(e) {
    app.tapPageShareHandler(e);
  },
  turnToCommunityPage: function (e) {
    app.turnToCommunityPage(e);
  },
  tapToFranchiseeHandler: function (e) {
    app.tapToFranchiseeHandler(e);
  },
  tapToTransferPageHandler: function () {
    app.tapToTransferPageHandler();
  },
  tapToSeckillHandler: function (e) {
    app.tapToSeckillHandler(e);
  },
  tapToPromotionHandler: function () {
    app.tapToPromotionHandler();
  },
  tapToCouponReceiveListHandler: function () {
    app.tapToCouponReceiveListHandler();
  },
  tapToRechargeHandler: function () {
    app.tapToRechargeHandler();
  },
  tapToXcx: function (e) {
    app.tapToXcx(e);
  },
  tapFranchiseeLocation: function (e) {
    app.tapFranchiseeLocation(e);
  },
  showAddShoppingcart: function (e) {
    app.showAddShoppingcart(e);
  },
  hideAddShoppingcart: function () {
    app.hideAddShoppingcart();
  },
  selectGoodsSubModel: function (e) {
    app.selectGoodsSubModel(e);
  },
  resetSelectCountPrice: function () {
    app.resetSelectCountPrice();
  },
  inputBuyCount: function(e){
    app.inputBuyCount(e)
  },
  clickGoodsMinusButton: function (e) {
    app.clickGoodsMinusButton();
  },
  clickGoodsPlusButton: function (e) {
    app.clickGoodsPlusButton();
  },
  sureAddToShoppingCart: function () {
    app.sureAddToShoppingCart();
  },
  sureAddToBuyNow: function () {
    app.sureAddToBuyNow();
  },
  clickTostoreMinusButton: function (e) {
    app.clickTostoreMinusButton(e);
  },
  clickTostorePlusButton: function (e) {
    app.clickTostorePlusButton(e);
  },
  readyToPay: function () {
    app.readyToTostorePay();
  },
  getValidateTostore: function () {
    app.getValidateTostore();
  },
  goToShoppingCart: function () {
    app.goToShoppingCart();
  },
  getCartList: function () {
    app.getTostoreCartList();
  },
  stopPropagation: function () {
  },
  turnToSearchPage:function (e) {
    app.turnToSearchPage(e);
  },
  previewImage: function (e) {
    var dataset = e.currentTarget.dataset;
    app.previewImage({
      current : dataset.src,
      urls: dataset.previewImgarr,
    });
  },
  scrollPageTop: function () {
    app.pageScrollTo(0);
  },
  suspensionTurnToPage: function (e) {
    app.suspensionTurnToPage(e);
  },
  tapToLuckyWheel: function (e) {
    app.tapToLuckyWheel(e);
  },
  tapToGoldenEggs: function (e) {
    app.tapToGoldenEggs(e);
  },
  tapToScratchCard: function (e) {
    app.tapToScratchCard(e);
  },
  tapToLuckyWheel: function (e) {
    app.tapToLuckyWheel(e);
  },
  keywordList:{},
  bindSearchTextChange: function (e) {
    this.keywordList[e.currentTarget.dataset.compid] = e.detail.value;
  },
  // 文字组件跳到地图
  textToMap: function(e) {
    app.textToMap(e);
  },
  tapDynamicClassifyFunc: function(e){
    app.tapDynamicClassifyFunc(e);
  },
  // 跳转到视频详情
  turnToVideoDetail : function(e) {
    app.turnToVideoDetail(e);
  },
  // 单个视频组件播放视频
  startPlayVideo : function(e) {
    app.startPlayVideo(e);
  },
  // 视频播放报错
  videoError: function(e) {
    app.showModal({
      content: e.detail.errMsg
    });
  },
  // 视频项目播放事件
  videoProjectPlay: function(e){
    app.videoProjectPlay(e);
  },
  // 视频项目暂停事件
  videoProjectPause: function(e) {
    app.videoProjectPause(e);
  },
  // 跳转到资讯详情
  turnToNewsDetail: function (e) {
    app.turnToNewsDetail(e)
  },
  //切换资讯分类
  getNewsCateList: function (e) {
    app.getNewsCateList(e);
  },
  showBbsReplyDialog: function(e){
    app.showBbsReplyDialog(e);
  },
  hideBbsReplyDialog: function(e){
    app.hideBbsReplyDialog(e);
  },
  popupWindowControlHandler: function(e){
    app.popupWindowControlHandler(e);
  },
  tapMaskClosePopupWindow: function(e){
    app.tapMaskClosePopupWindow(e);
  },
  // 点击预约
  appoint: function(e) {
    wx.showModal({
      title: 'tip',
      content: 'this function is in developing...',
      cancelText:'cancel',
      confirmText:'confirm'
    })
  },
  tapAppointLinkHandler: function (e) {
    wx.navigateTo({
      url: '/pages/o9j42s2GS3_page10016/o9j42s2GS3_page10016',
    })
  },
  // 通知入口
  tapAnnouncementLinkHandler: function(e) {
    wx.navigateTo({
      url: '/pages/userCenter/newpages',
      // url: '/pages/userCenter/userLogin',
    })
  },
  tapInnerLinkHandler: function (e) {
    wx.navigateTo({
      url: '/pages/answer/answer_simulate_tip/simulate_tip',
    })
  },
  appoint_via: function (e) {
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?detail=1234&contact=true&hidestock=',
    })
  },
  appoint_pay: function (e) {
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?detail=1235&contact=true&hidestock=',
    })
  },
  appoint_reservation: function (e) {
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?detail=1236&contact=true&hidestock=',
    })
  },
  appoint_refund: function (e) {
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?detail=1237&contact=true&hidestock=',
    })
  },
};
Page(pageData);
