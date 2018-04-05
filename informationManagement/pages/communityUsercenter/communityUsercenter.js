
var app = getApp()
var util = require('../../../utils/util.js')

Page({
  data: {
    communityId: '',
    tabActive : 'publish' ,
    myArticleCount : 0 ,
    myArticleList : [],
    getMyArticleData : {
      page : 1 ,
      loading : false ,
      nomore : false
    },
    imgData : {} ,
    myCommentData : {
      page : 1 ,
      loading : false ,
      nomore : false
    },
    myCommentList : [],
    myCommentCount : 0,
    theme_color : '#00b6f8',
    appealReason: '',
    showAppeal: false,
    appealId: '',
    showMoreIdx: '',
    showActionSheet: false,
    showAppealBtn: false
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

    this.getMyArticle();
    this.getMyComment();
    app.globalData.communityUsercenterRefresh = false;
  },
  onShow : function() {
    if(app.globalData.communityUsercenterRefresh){
      this.setData({
        myArticleList : [],
        getMyArticleData : {
            page : 1 ,
            loading : false ,
            nomore : false
        },
        myCommentList : [],
        myCommentData : {
          page : 1 ,
          loading : false ,
          nomore : false
        }
      });
      this.getMyArticle();
      this.getMyComment();
      app.globalData.communityUsercenterRefresh = false;
    }
  },
  getMyArticle : function() {
    var that = this,
        sdata = that.data.getMyArticleData ;

    if(sdata.loading || sdata.nomore){
      return ;
    }
    sdata.loading = true;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetArticleByPage',
      data: {
          page: sdata.page ,
          section_id : that.data.communityId ,
          only_own_record : 1 ,
          page_size: 10
      } ,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
              oldData = that.data.myArticleList,
              newData = [];

          for (let i = 0; i < res.data.length; i++) {
            let idata = res.data[i];
            idata.title = unescape(idata.title.replace(/\\u/g, "%u"));
            idata.content_text = idata.content.text.replace(/\n|\\n/g , '\n');

            newData.push(idata);
          }

          newData = oldData.concat(newData);
          if(sdata.page == 1){
            that.setData({
              myArticleCount : res.count
            });
          }
          that.setData({
            myArticleList: newData ,
            'getMyArticleData.page' : sdata.page + 1
          });

        }
        that.setData({
          'getMyArticleData.loading': false ,
          'getMyArticleData.nomore' : res.is_more == 0 ? true : false
        });
      },
      fail: function(res){
        that.setData({
          'getMyArticleData.loading': false
        });
      }
    });
  },
  getMyComment : function() {
    var that = this,
        sdata = that.data.myCommentData ;

    if(sdata.loading || sdata.nomore){
      return ;
    }
    sdata.loading = true;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetCommentByPage',
      data: {
          page: sdata.page ,
          section_id : that.data.communityId ,
          only_own_record : 1 ,
          page_size: 10
      } ,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
              oldData = that.data.myCommentList,
              newData = [];

          for (let i = 0; i < res.data.length; i++) {
            let idata = res.data[i];
            idata.content_text = idata.content.text.replace(/\n|\\n/g , '\n');

            newData.push(idata);
          }

          newData = oldData.concat(newData);
          if(sdata.page == 1){
            that.setData({
              myCommentCount : res.count
            });
          }
          that.setData({
            myCommentList: newData ,
            'myCommentData.page' : sdata.page + 1
          });

        }
        that.setData({
          'myCommentData.loading': false ,
          'myCommentData.nomore' : res.is_more == 0 ? true : false
        });
      },
      fail: function(res){
        that.setData({
          'myCommentData.loading': false
        });
      }
    });
  },
  imgLoad : function(event,) {
    let owidth = event.detail.width,
        oheight = event.detail.height,
        oscale = owidth / oheight,
        cwidth = 290 ,
        cheight = 120,
        ewidth , eheight,
        index = event.currentTarget.dataset.index,
        newData = {};

    if( oscale > cwidth / cheight ){
      ewidth = cwidth;
      eheight = cwidth / oscale;
    }else{
      ewidth = cheight * oscale;
      eheight = cheight;
    }

    newData['imgData.' + index] = {
      imgWidth : ewidth * 2.34,
      imgHeight : eheight * 2.34
    }
    this.setData(newData);
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
  myArticleScroll : function(event) {
    this.getMyArticle();
  },
  myCommentScroll : function(event) {
    this.getMyComment();
  },
  turnBack : function(){
    app.turnBack();
  },
  turnToDetail : function(event) {
    let aId = event.currentTarget.dataset.id,
        sId = event.currentTarget.dataset.sid,
        verify = event.currentTarget.dataset.verify;
    this.verifyArticleExist(aId, sId, function (res) {
      if ((res == 1) || (verify == 0)) {
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
  turnToFailpass : function(event) {
    let id = event.currentTarget.dataset.id,
      audit = event.currentTarget.dataset.audit;
    if (audit != 2) {
      return;
    }
    app.turnToPage('/informationManagement/pages/communityFailpass/communityFailpass?detail=' + id);
  },
  // 跳到编辑页面
  turnToCommunityPublish : function(event) {
    let index = this.data.showMoreIdx,
        id = this.data.myArticleList[index].id;

        this.setData({ showActionSheet: false });

    app.turnToPage('/informationManagement/pages/communityPublish/communityPublish?detail=' + this.data.communityId + '&articleId=' + id);

  },
  // 展示更多选项
  showMore : function(event) {
    let that = this,
        index = event.currentTarget.dataset.index,
        id = event.currentTarget.dataset.id;

    let needAppeal = that.data.myArticleList[index].article_status == 2 ? true : false;// 话题是否屏闭

        that.setData({
          showActionSheet: true,
          showMoreIdx: index,
          showAppealBtn: needAppeal
        })

        if (needAppeal) {
          that.setData({ appealId: id });
        }

  },
  // 删除文章
  deleteArticle : function( event ) {
    let that = this,
        index = that.data.showMoreIdx,
        id = that.data.myArticleList[index].id;

    that.setData({ showActionSheet: false });

    app.showModal({
      content : '是否删除这个话题？',
      showCancel : true ,
      confirm : function(){
        app.sendRequest({
          url: '/index.php?r=AppSNS/DeleteArticle',
          data: {
            article_id : id ,
            section_id : that.data.communityId
          },
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let newData = {},
                  list = that.data.myArticleList;

              list.splice(index , 1);
              newData.myArticleList = list;
              newData.myArticleCount = that.data.myArticleCount - 1;

              that.setData(newData);
              app.globalData.communityPageRefresh = true;
            }
          }
        });
      }
    })
  },
  // 删除评论
  deleteComment : function( event ) {
    let that = this,
        id = event.currentTarget.dataset.id,
        index = event.currentTarget.dataset.index,
        article_id = event.currentTarget.dataset.obj_id;

    app.showModal({
      content : '是否删除这个评论？',
      showCancel : true ,
      confirm : function(){
        app.sendRequest({
          url: '/index.php?r=AppSNS/DeleteComment',
          data: {
            article_id : article_id ,
            section_id : that.data.communityId,
            comment_id : id // 评论id
          },
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let newData = {},
                  list = that.data.myCommentList;

              list.splice(index , 1);
              newData.myCommentList = list;
              newData.myCommentCount = that.data.myCommentCount - 1;

              that.setData(newData);
              app.globalData.communityPageRefresh = true;
            }
          }
        });
      }
    })
  },
  changeAppealState: function (event) {
    // 关闭,开启申诉窗口
    var showAppeal = this.data.showAppeal;
    this.setData({ showAppeal: !showAppeal, showActionSheet: false});
  },
  appealInput: function (event) {
    let val = event.detail.value;
    this.setData({appealReason: val});
  },
  submitAppeal: function (event) {
    let that = this,
        appealReason = this.data.appealReason;
    if (!appealReason) {
      app.showModal({content: '请输入申诉原因'});
      return;
    }
    app.sendRequest({
      url: '/index.php?r=AppSNS/AddExplain',
      data: {
        section_id: this.data.communityId,
        article_id: this.data.appealId,
        content: appealReason
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          app.showModal({ content: '提交成功' });
          let showMoreIdx = that.data.showMoreIdx,
              newData = {},
              list = that.data.myArticleList;
          newData['myArticleList[' + showMoreIdx +'].article_status'] = 3;
          newData.appealReason = '';
          that.setData(newData);
          that.changeAppealState();
        }else {
          app.showModal({ content: '提交失败' });
        }
      }

    })
  },
  closeActionSheet: function (event) {
    this.setData({showActionSheet: false});
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
