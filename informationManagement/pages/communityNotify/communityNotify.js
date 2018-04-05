
var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    communityId: '',
    tabActive : 'like' ,
    likeList : [],
    likeListData : {
      page : 1 ,
      loading : false ,
      nomore : false
    },
    commentList : [],
    commentListData : {
      page : 1 ,
      loading : false ,
      nomore : false
    },
    reportList : [],
    reportListData : {
      page : 1 ,
      loading : false ,
      nomore : false
    },
    theme_color : ''
  },
  onLoad: function(options){
    let that = this,
        communityId = options.detail;
    
    app.getStorage({
      key: 'communityThemeColor-' + communityId,
      success: function (res) {
        that.setData({ theme_color: res.data });
      },
      fail: function () {
        that.getThemeColor(communityId);
      }
    })

    this.setData({
      communityId: communityId
    });
    
    this.getlikeLog();
    this.getComment();
    this.getReport();
  },
  getlikeLog : function() {
    var that = this,
        sdata = that.data.likeListData ;

    if(sdata.loading || sdata.nomore){
      return ;
    }
    sdata.loading = true;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetLikeLogByPage',
      data: {
          page: sdata.page ,
          section_id : that.data.communityId ,
          only_receiver_record : 1 ,
      } ,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
              oldData = that.data.likeList,
              newData = [];

          for (let i = 0; i < res.data.length; i++) {
            let idata = res.data[i];

            if( idata.type == 1){
              idata.article_id = idata.obj_id;
              idata.post_text = unescape(idata.obj.title.replace(/\\u/g, "%u"));
            }else if( idata.type == 2 ){
              idata.article_id = idata.obj.obj_id;
              idata.post_text = idata.obj.content.text.replace(/\n|\\n/g , '\n');
            }

            newData.push(idata);
          }

          newData = oldData.concat(newData);

          that.setData({
            likeList: newData ,
            'likeListData.page' : sdata.page + 1
          });

        }
        that.setData({
          'likeListData.loading': false ,
          'likeListData.nomore' : res.is_more == 0 ? true : false
        });
      },
      fail: function(res){
        that.setData({
          'likeListData.loading': false
        });
      }
    });
  },
  getComment : function() {
    var that = this,
        sdata = that.data.commentListData ;

    if(sdata.loading || sdata.nomore){
      return ;
    }
    sdata.loading = true;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetCommentByPage',
      data: {
          page: sdata.page ,
          section_id : that.data.communityId ,
          only_receiver_record : 1
      } ,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
              oldData = that.data.commentList,
              newData = [];

          for (let i = 0; i < res.data.length; i++) {
            let idata = res.data[i];

            if(idata.comment_id != 0 && !!idata.comment_id){
              idata.article_text = unescape(idata.obj.title.replace(/\\u/g, "%u"));
            }
            idata.content_text = idata.content.text.replace(/\n|\\n/g , '\n');

            newData.push(idata);
          }

          newData = oldData.concat(newData);

          that.setData({
            commentList: newData ,
            'commentListData.page' : sdata.page + 1
          });

        }
        that.setData({
          'commentListData.loading': false ,
          'commentListData.nomore' : res.is_more == 0 ? true : false
        });
      },
      fail: function(res){
        that.setData({
          'commentListData.loading': false
        });
      }
    });
  },
  getReport: function () {
    var that = this,
      sdata = that.data.reportListData;

    if (sdata.loading || sdata.nomore) {
      return;
    }
    sdata.loading = true;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetMaskArticleByPage',
      data: {
        page: sdata.page,
        section_id: that.data.communityId,
        only_receiver_record: 1
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
            oldData = that.data.reportList,
            newData = [];

          for (let i = 0; i < res.data.length; i++) {
            let idata = res.data[i];

            if (idata.content.imgs) {
              idata.showImg = idata.content.imgs[0];
            }else {
              if (idata.carousel_img) {
                idata.showImg = idata.carousel_img;
              }else {
                idata.showImg = idata.headimgurl;
              }
            }
            newData.push(idata);
          }

          newData = oldData.concat(newData);

          that.setData({
            reportList: newData,
            'reportListData.page': sdata.page + 1
          });

        }
        that.setData({
          'reportListData.loading': false,
          'reportListData.nomore': res.is_more == 0 ? true : false
        });
      },
      fail: function (res) {
        that.setData({
          'reportListData.loading': false
        });
      }
    });
  },
  getThemeColor : function( section_id ) {
    var that = this;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetSectionByPage',
      data: {
        page:  1 ,
        section_id : section_id
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data[0];

          that.setData({
            theme_color: info.theme_color
          });
        }
      }
    });
  },
  changeTab : function(event) {
    let type = event.currentTarget.dataset.type;
    this.setData({
      tabActive : type
    });
  },
  likeScroll : function(event) {
    this.getlikeLog();
  },
  commentScroll : function(event) {
    this.getComment();
  },
  reportScroll : function(event) {
    this.getReport();
  },
  turnBack : function(){
    app.turnBack();
  },
  turnToDetail : function(event) {
    let aId = event.currentTarget.dataset.id,
        sId = event.currentTarget.dataset.sid;
    this.verifyArticleExist(aId, sId, function (res) {
      if (res == 1) {
        app.turnToPage('/informationManagement/pages/communityDetail/communityDetail?detail=' + aId);
      }
      else {
        if (res == 2) {
          app.showModal({
            title: '提示',
            content: '话题己被屏蔽'
          });
          return;
        }
        app.showModal({
          title: '提示',
          content: '话题己被删除'
        });
      }
    })
  },
  verifyArticleExist: function (aId, sId, cb) {
    app.sendRequest({
      url: '/index.php?r=AppSNS/DoesArticleExist',
      data: {
        article_id: aId,
        section_id: sId
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          if (typeof cb == 'function') {
            cb(res.data);
          }
        }
        else {
          alertTip('查询话题失败');
        }
      }
    })
  }
})
