//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
   subject:'kemu1',//题目类型
   type:'mnks'//题目类型
  },
  onLoad (params) {
    var that = this;
    this.data.subject = params.subject;
    this.data.type = params.type;
    var userInfo = app.getUserInfo()
    var default_img = 'http://cdn.jisuapp.cn/zhichi_frontend/static/webapp/images/default_photo.png'
      var data = {
        'userInfo.nickname': userInfo.name||'国教',
        'userInfo.cover_thumb': userInfo.cover_thumb || default_img,
        'userInfo.is_bind': userInfo.is_bind||true,
      };
    this.setData(data);   
  }
});