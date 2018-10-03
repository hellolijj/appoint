//index.js
//获取应用实例
var app = getApp();

Page({
  data: {
    subject: 'kemu1',//题目类型
    score: '',//得分
    passScore: 80,//及格分数
    error: 0,//模拟考错题数
    mid: null,//模拟考ID
    grades: '',//等级
    minutes: '',
    seconds: '00'
  },
  onLoad(params) {
    console.log(params)
    var time = params.time,
      minutes = Math.floor(time / 60),
      seconds = time % 60,
      grades = params.mark;
    this.data.minutes = minutes > 9 ? minutes : '0' + minutes;
    this.data.seconds = seconds > 9 ? seconds : '0' + seconds;
    this.data.subject = params.subject;
    this.data.score = grades;
    this.data.mid = params.mid;
    this.data.error = params.error
    console.log(app)
    this.data.nickName = app.globalData.userInfo.name
    this.data.avatar = app.globalData.userInfo.cover_thumb
    if (grades >= this.data.passScore) {
      this.data.grades = 'active';
      this.data.tip = 'pass examtion'
    } else {
      this.data.tip = 'no poass examtion'
    }
    var that = this;
    that.setData(that.data)
  },
  gotoWDCT() {

    wx.redirectTo({
      url: `/pages/answer/answer_info/info?subject=${this.data.subject}&type=wdct&mid=${this.data.mid}`
    })

  },

  examReStort: function () {
    wx.redirectTo({
      url: '/pages/answer/answer_simulate_tip/simulate_tip',
    })
  }
});