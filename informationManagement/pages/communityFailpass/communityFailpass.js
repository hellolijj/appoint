
var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    articleId: '',
    articleInfo: {}
  },
  onLoad: function(options){
    let articleId = options.detail;

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

          info.title = unescape(info.title.replace(/\\u/g, "%u"));
          info.content_text = info.content.text.replace(/\n|\\n/g, '\n');

          that.setData({
            articleInfo: info
          });

        }
      }
    });
  },
  turnToDetail: function (event) {
    let id = this.data.articleId;
    app.turnToPage('/informationManagement/pages/communityDetail/communityDetail?detail=' + id);
  },
})
