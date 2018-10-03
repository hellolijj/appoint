var app      = getApp();

var pageData = {
  data: {"carousel1":{"type":"carousel","style":"height:351.5625rpx;margin-left:0;margin-right:auto;margin-top:0;opacity:1;","content":[{"customFeature":[],"content":"","parentCompid":"carousel1","style":""},{"customFeature":[],"content":"","parentCompid":"carousel1","style":""}],"customFeature":{"autoplay":true,"interval":2,"carouselgroupId":"1127301"},"animations":[],"page_form":"","compId":"carousel1"},"title_ele2":{"type":"title-ele","style":"opacity:1;line-height:58.59375rpx;background-color:rgb(255, 255, 255);border-color:rgb(34, 34, 34);border-style:none;color:rgb(102, 102, 102);font-size:32.8125rpx;font-weight:bold;margin-left:auto;margin-right:auto;","content":"\u7231\u5c1a\u91cf\u7248KTV","customFeature":{"mode":3,"markColor":"rgb(237, 27, 76)","boxColor":"#000","boxR":"5px","boxStyle":false,"boxX":"0","boxY":"0","action":"none"},"animations":[],"page_form":"","compId":"title_ele2","parentCompid":"title_ele2","markColor":"rgb(237, 27, 76)","mode":3},"free_vessel3":{"type":"free-vessel","style":"width:750rpx;height:119.53125rpx;margin-bottom:auto;margin-right:auto;opacity:1;margin-left:auto;","content":[{"type":"text","style":"background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(136, 136, 136);font-size:28.125rpx;height:44.53125rpx;width:611.71875rpx;line-height:44.53125rpx;margin-left:0;margin-top:0;opacity:1;text-align:left;position:absolute;left:32.8125rpx;top:9.375rpx;margin-right:0;","content":"\u8425\u4e1a\u65f6\u95f4\uff1a\u5468\u4e00\u81f3\u5468\u65e5 11:00-06:00","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0","action":"none","inner-page-link":"prePage"},"animations":[],"compId":"data.content[0]","parentCompid":"free_vessel3","markColor":"","mode":0},{"type":"text","style":"background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(136, 136, 136);font-size:28.125rpx;height:44.53125rpx;width:611.71875rpx;line-height:44.53125rpx;margin-left:0;margin-top:0;opacity:1;text-align:left;position:absolute;left:32.8125rpx;top:58.59375rpx;margin-right:0;","content":"\u95e8\u5e97\u670d\u52a1\uff1a \u652f\u6301WIFI \u63d0\u4f9b\u514d\u8d39\u505c\u8f66\u4f4d","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0","action":"none"},"animations":[],"compId":"data.content[1]","parentCompid":"free_vessel3","markColor":"","mode":0}],"customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":5,"boxStyle":false,"boxX":0,"boxY":0},"animations":[],"page_form":"","compId":"free_vessel3"},"title_ele4":{"type":"title-ele","style":"opacity:1;line-height:58.59375rpx;background-color:rgb(255, 255, 255);border-color:rgb(34, 34, 34);border-style:none;color:#666;font-size:32.8125rpx;font-weight:bold;margin-left:auto;margin-right:auto;","content":"\u5e97\u94fa\u4ecb\u7ecd","customFeature":{"mode":3,"markColor":"rgb(237, 27, 76)","boxColor":"#000","boxR":"5px","boxStyle":false,"boxX":"0","boxY":"0"},"animations":[],"page_form":"","compId":"title_ele4","parentCompid":"title_ele4","markColor":"rgb(237, 27, 76)","mode":3},"free_vessel5":{"type":"free-vessel","style":"width:750rpx;height:778.125rpx;margin-bottom:auto;margin-right:auto;opacity:1;margin-left:auto;","content":[{"type":"text","style":"background-color:rgba(0, 0, 0, 0);border-color:rgb(34, 34, 34);border-style:none;border-width:4.6875rpx;color:rgb(102, 102, 102);font-size:32.8125rpx;height:192.1875rpx;width:684.375rpx;line-height:42.1875rpx;margin-left:0;margin-top:0;opacity:1;text-align:left;position:absolute;left:32.8125rpx;top:9.375rpx;margin-right:0;right:auto;","content":"\u7231\u5c1a\u91cf\u7248KTV\u662f\u7ca4\u4e1c\u8f83\u5927\u578b\u7684\u91cf\u8d29\u5f0fKTV\uff0c\u7b26\u5408\u5e74\u8f7b\u4e00\u65cf\u8ffd\u6c42\u6f6e\u6d41\u7684\u540e\u73b0\u4ee3\u88c5\u4fee\uff0c\u4ee5\u6d3b\u8dc3\u7684\u8272\u8c03\u8fdb\u884c\u642d\u914d\uff0c\u8be0\u91ca\u4e8680\u300190\u540e\u5bf9\u751f\u6d3b\u7684\u6001\u5ea6\u3002\u901a\u8fc7\u8ddf\u5404\u5927\u5531\u7247\u516c\u53f8\u7248\u6743\u7b7e\u7ea6\u4ee5\u6700\u5feb\u7684\u901f\u5ea6\u83b7\u53d6\u65b0\u6b4c\u8bd5\u5531\u4f5c\u4e3a\u8f83\u5927\u5356\u70b9\u3002\u5e76\u4e14\u9996\u521bKTV\u5728\u7ebf\u5f55\u6b4c\uff0c\u53ea\u9700\u8981\u5728\u5305\u623f\u4e2d\u70b9\u4e0b\u5f55\u5236\u6309\u94ae\uff0c\u5c31\u53ef\u4ee5\u628a\u81ea\u5df1\u7684\u6b4c\u58f0\u901a\u8fc7\u4e0a\u4f20\u5230\u7f51\u7ad9\u5206\u4eab\uff0c\u5e76\u4e14\u53ef\u4ee5\u4e0e\u5f02\u5730\u7684K\u53cbPK\uff0c\u8ba9\u7f51\u53cb\u70b9\u51fb\u8bc4\u5206\uff0c\u4e50\u8da3\u65e0\u7a77\u3002\u516c\u53f8\u7279\u9080\u65e5\u672cBMB\u516c\u53f8\u7814\u53d1\u90e8\u95e8\u4e0e\u53f0\u6e7e\u58f0\u5b66\u4e13\u5bb6\u6839\u636e\u56fd\u4eba\u5531\u6b4c\u4e60\u60ef\uff0c\u7cbe\u5fc3\u8c03\u6821\u97f3\u54cd\u7cfb\u7edf\u97f3\u8272\u4e0eMic\u7684\u5e72\u6e7f\u5ea6\uff0c\u5927\u91cf\u4f7f\u7528\u8ba1\u7b97\u673a\u8bbe\u8ba1\u6bcf\u53ea\u97f3\u54cd\u7684\u6446\u653e\u89d2\u5ea6\uff0c\u4f7f\u5f97\u97f3\u54cd\u7cfb\u7edf\u5728\u4e1a\u754c\u72ec\u4e00\u65e0\u4e8c\uff0c\u65e0\u8bba\u4f60\u662f\u4e13\u5bb6\uff0c\u8fd8\u662f\u73a9\u5bb6\uff0c\u62ff\u8d77\u9ea6\u514b\u98ce\u90fd\u4e0d\u4f1a\u820d\u5f97\u653e\u4e0b\u3002KTV\u8fd8\u7279\u522b\u5f15\u5165\u745e\u58eb\u5ba4\u5185\u7a7a\u6c14\u73af\u5883\u51c0\u5316\u6c27\u6c14\u7cfb\u7edf\uff0c\u5373\u4f7f\u5728\u6ca1\u6709\u7a97\u6237\u7684\u5305\u623f\u5185\u5438\u70df\uff0c\u4e5f\u80fd\u611f\u53d7\u5230\u6709\u5982\u963f\u5c14\u5351\u65af\u5c71\u4e0a\u90a3\u6e05\u65b0\u7684\u7a7a\u6c14\u3002","customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":"5","boxStyle":false,"boxX":"0","boxY":"0"},"animations":[],"compId":"data.content[0]","parentCompid":"free_vessel5","markColor":"","mode":0}],"customFeature":{"boxColor":"rgb(0, 0, 0)","boxR":5,"boxStyle":false,"boxX":0,"boxY":0},"animations":[],"page_form":"","compId":"free_vessel5"},"map6":{"type":"map","style":"color:rgb(102, 102, 102);font-size:32.8125rpx;height:703.125rpx;margin-left:0;margin-right:0;margin-top:0;text-align:left;width:750rpx;","content":"\u663e\u793a\u5730\u5740","customFeature":{"address":"\u5e7f\u4e1c\u7701\u6df1\u5733\u5e02\u5357\u5c71\u533a\u5b66\u5e9c\u8def5","type":"withmap","lat":22.5239,"lng":113.93549,"map_height":300,"map_width":320,"markers":[{"latitude":22.5239,"longitude":113.93549,"name":"\u5e7f\u4e1c\u7701\u6df1\u5733\u5e02\u5357\u5c71\u533a\u5b66\u5e9c\u8def5","desc":null}],"markers_json_str":"[{\"latitude\":22.5239,\"longitude\":113.93549,\"name\":\"\\u5e7f\\u4e1c\\u7701\\u6df1\\u5733\\u5e02\\u5357\\u5c71\\u533a\\u5b66\\u5e9c\\u8def5\",\"desc\":null}]"},"animations":[],"page_form":"","compId":"map6","parentCompid":"map6"},"has_tabbar":0,"page_hidden":true,"page_form":"","top_nav":{"navigationBarTitleText":"\u5730\u5740"}},
    need_login: false,
    page_router: 'o9j42s2GS3_page10015',
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
  tapInnerLinkHandler: function (e) {
    app.tapInnerLinkHandler(e);
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
  }
};
Page(pageData);
