var app = getApp()

Page({
  data: {
    userInfo: {
      nickname: '',
      sex: 0,
      cover_thumb: 'http://img.zhichiwangluo.com/zc_app_default_photo.png',
      phone: '',
      passport: '',
      is_bind: '',
    },
    genderArr: ['男', '女'],
    isFromBack: false
  },
  onLoad: function () {
    var userInfo = app.getUserInfo(),
      data = {
        'userInfo.nickname': userInfo.nickname || '国教',
        'userInfo.sex': userInfo.sex || 0,
        'userInfo.cover_thumb': userInfo.cover_thumb || this.data.userInfo.cover_thumb,
        'userInfo.phone': userInfo.phone || '',
        'userInfo.passport': userInfo.passport || '',
        'userInfo.is_bind': userInfo.is_bind || false,
      };

    this.setData(data);
  },
  onShow: function () {
    if (this.data.isFromBack) {
      var phone = app.getUserInfo().phone;
      if (phone) {
        this.setData({
          'userInfo.phone': phone
        })
      }
    } else {
      this.setData({
        isFromBack: true
      });
    }
  },
  choosePhoto: function () {
    var that = this;
    app.chooseImage(function (imgUrl) {
      that.setData({
        'userInfo.cover_thumb': imgUrl[0]
      })
    });
  },
  changeGender: function (e) {
    this.setData({
      'userInfo.sex': e.detail.value
    })
  },
  inputNickname: function (e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    })
  },
  inputPassport: function (e) {
    this.setData({
      'userInfo.passport': e.detail.value
    })
  },
  inputPhone: function (e) {
    this.setData({
      'userInfo.phone': e.detail.value
    })
  },
  saveUserInfo: function (e) {
    console.log('submit获取数据为：' , e.detail.value)
    var data = this.data.userInfo;
    console.log(e.detail.value.passport)
    data['passport'] = e.detail.value.passport;
    data['phone'] = e.detail.value.telephone;
    data['formid'] = e.detail.formId;
    console.log(data)
    app.sendRequest({
      url: '/index.php?r=AppData/saveUserInfo',
      method: 'post',
      data: data,
      success: function (res) {
        if (res.status === 0) {
          app.setUserInfoStorage(res.data);
          wx.showToast({
            title: "绑定成功"
          })
          wx.reLaunch({
            url: '/pages/o9j42s2GS3_page10000/o9j42s2GS3_page10000',
          })
        }
      }
    });
  },
  bindCellphonePage: function () {
    app.turnToPage('/default/pages/bindCellphone/bindCellphone');
  },
  moreUserInfo: function () {
    app.turnToPage('/userCenter/pages/moreInfo/moreInfo');
  },
})
