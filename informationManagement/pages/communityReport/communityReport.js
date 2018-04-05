
var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    articleId: '',
    articleInfo: {},
    cando: false,
    param: null
  },
  onLoad: function(options){

    let that = this,
        articleId = options.detail;

    app.getStorage({
      key: 'communityThemeColor-' + options.sectionid,
      success: function (res) {
        that.setData({ theme_color: res.data });
      },
      fail: function () {
        that.getThemeColor();
      }
    })

    this.setData({
      articleId: articleId
    });

    this.getArticleInfo();
  },
  getArticleInfo: function () {
    var that = this;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetArticleByPage',
      data: {
        article_id: that.data.articleId,
        page: 1,
        page_size: 100
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data[0];

          let newData = {
            section_id: info.section_id,
            article_id: info.id,
            obj_user_token: info.user_token,
            complaint_id: 100,
            additional_text: ''
          };

          that.setData({
            param: newData
          });

        }
      }
    });
  },
  changeOption: function (event) {
    let val = event.detail.value;
    this.setData({'param.complaint_id': val});
    this.setData({cando: true});
  },
  getInput: function (event) {
    this.setData({ 'param.complaint_id': 5 });
    this.setData({ cando: true });
  },
  inputReason: function (event) {
    let val = event.detail.value;
    if (!val) {
      this.setData({ cando: false });
      return;
    }
    this.setData({ 'param.additional_text': val, cando: true});
  },
  handleReport: function (event) {
    let that = this,
        complaintId = this.data.param.complaint_id;
    if (complaintId == 5) {
      let additionalText = this.data.param.additional_text;
      if (!additionalText) {
        app.showModal({content: '请输入举报理由'});
        this.setData({ cando: false });
        return;
      }
    }else {
      if (complaintId == 100) {
        app.showModal({ content: '请选择举报理由' });
        this.setData({ cando: false });
        return;
      }else {
        let newData = this.data.param;
        delete newData.additional_text;
        this.setData({ param: newData });
      }
    }

    app.sendRequest({
      url: '/index.php?r=AppSNS/AddComplaint',
      data: this.data.param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          app.showModal({ content: '提交成功' });
          if (complaintId == 5) {
            that.setData({'param.additional_text': '', cando: false});
          };
          // 提交成功自动返回上一个页面
          setTimeout(function () {
            wx.navigateBack();
          }, 1000);
        }else {
          app.showModal({ content: res.data });
        }
      },
      error: function (res) {
        app.showModal({ content: res.data });
      }
    });
  },
  getThemeColor: function (section_id) {
    if (this.data.theme_color) {
      return;
    };
    var that = this;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetSectionByPage',
      data: {
        page: 1,
        section_id: section_id,
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data[0];

          that.setData({
            theme_color: info.theme_color,
          });
        }
      }
    });
  }
})
