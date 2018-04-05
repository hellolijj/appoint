
var app = getApp();
var util = require('../../../utils/util.js');
var articleData =  {
  title: '',
  text : '',
  imgs : [],
  category_id : '',
  phone: '',
  latitude: '',
  longitude: ''
};

Page({
  data: {
    communityId: '',
    articleData : {
      title : '',
      text : '',
      imgs : [],
      category_id : '',
      phone: '',
      latitude: '',
      longitude: ''
    },
    address: '',
    category : [],
    categoryIndex : 0 ,
    theme_color : '',
    selectedClassify: '',
    require_audit: '',
    require_loc: false,
    require_phone: false,
    showClassifyBox: false
  },
  onLoad: function(options){
    let that = this,
      communityId = options.detail;

    app.getStorage({
      key: 'communityThemeColor-' + communityId,
      success: function (res) {
        that.setData({ theme_color: res.data });
      }
    })
    
    let article_id = options.articleId;

    this.setData({
      communityId: communityId ,
      articleId : article_id || '',
      require_audit: (options.reqAudit == 1)
    });

    this.getThemeColor( communityId );
    this.getCategory();

  },
  submitData : function(event) {
    let that = this,
        title = articleData.title,
        text = articleData.text,
        latitude = that.data.articleData.latitude,
        longitude = that.data.articleData.longitude,
        phone = articleData.phone,
        need_loc = that.data.require_loc,
        need_phone = that.data.require_phone;

    if( !title ){
      app.showModal({content : '请填写标题'});
      return ;
    }
    if( !text ){
      app.showModal({content : '请填写话题内容'});
      return ;
    }
    // if (need_loc && !latitude && !longitude) {
    //   app.showModal({ content: '请获取当前位置' });
    //   return;
    // }
    // if (need_phone && !phone) {
    //   app.showModal({ content: '请输入手机号码' });
    //   return;
    // }

    let url = '/index.php?r=AppSNS/AddArticle';
    let article_id = that.data.articleId;

    if(article_id){
      url = '/index.php?r=AppSNS/UpdateArticle';
    }

    app.sendRequest({
      hideLoading: true,
      url: url,
      data: {
        article_id : article_id,
        section_id : that.data.communityId , //版块id
        category_id : that.data.articleData.category_id, //分类id 可不传
        title : title ,
        text : text ,
        imgs : that.data.articleData.imgs ,
        is_carousel : 0, //是否开启轮播 1为开启 0不开启
        top_flag :  0, //是否置顶 1为置顶 0不置顶
        hot_flag: 0, //是否精品 1是 0否
        phone: phone,
        latitude: latitude,
        longitude: longitude
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let content = that.data.require_audit ? '提交成功，待审核' : '提交成功';

          app.showModal({
            content: content,
            complete: function () {
              app.turnBack();
            }
          });

          app.globalData.communityPageRefresh = true;
          app.globalData.communityUsercenterRefresh = true;
        }
      }
    });
  },
  bindTitleInput : function(event) {
    let val = event.detail.value;
    // this.setData({
    //   'articleData.title' : val
    // });
    articleData.title = val;
  },
  bindTextInput : function(event) {
    let val = event.detail.value;
    // this.setData({
    //   'articleData.text' : val
    // });
    articleData.text = val;
  },
  bindPhoneInput: function (event) {
    let val = event.detail.value;
    // this.setData({
    //   'articleData.phone': val
    // });
    articleData.phone = val;
  },
  changeCategory: function (event) {
    let that = this,
      cateIdx = event.detail.value,
      cateId = that.data.category[cateIdx].id;

    this.setData({
      categoryIndex: cateIdx,
      'articleData.category_id': cateId,
      selectedClassify: this.data.category[cateIdx].name
    });
  },
  uploadImg : function(){
    var that = this,
        imgs = that.data.articleData.imgs;

    app.chooseImage(function(imageUrls){
      imgs = imgs.concat(imageUrls);
      that.setData({
        'articleData.imgs' : imgs
      });
    } , 9);
  },
  deleteImg : function(event){
    var index = event.currentTarget.dataset.index,
        imgs = this.data.articleData.imgs;

    imgs.splice(index , 1);
    this.setData({
      'articleData.imgs' : imgs
    });
  },
  getCategory : function() {
    var that = this;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetCategoryByPage',
      data: {
        section_id : that.data.communityId ,
        page: 1 ,
        page_size: 100
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data,
              newdata = [{id: '' , name: '全部(默认)'}].concat(info);
          that.setData({
            category: newdata
          });
          
          let article_id = that.data.articleId;
          if(article_id){
            that.getArticle(article_id);
          }
        }
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
          let info = res.data[0],
              newData = {
                require_loc: info.require_location == 1,
                require_phone: info.require_phone == 1
              };

          if (!that.data.theme_color) {
            newData.theme_color = info.theme_color;
          }

          that.setData(newData);
        }
      }
    });
  },
  getArticle : function(article_id) {
    var that = this;
    app.sendRequest({
      url: '/index.php?r=AppSNS/GetArticleByPage',
      data: {
        article_id: article_id
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let info = res.data[0],
              newdata = {};

          newdata['articleData.title'] = info.title;
          newdata['articleData.text'] = info.content.text;
          newdata['articleData.imgs'] = info.content.imgs || [];
          newdata['articleData.phone'] = info.phone;
          newdata['articleData.category_id'] = info.category_id;
          newdata['articleData.latitude'] = info.latitude;
          newdata['articleData.longitude'] = info.longitude;

          that.getLocByLatAndLng(info.latitude, info.longitude, function (data) {
            that.setData({ address: data.address });
          })

          let category = that.data.category;
          for (var i = 0; i < category.length; i++) {
            if(category[i].id == info.category_id){
              newdata['categoryIndex'] = i;
              break;
            }
          }

          that.setData(newdata);
        }
      }
    });
  },
  getAddress: function () {
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          'articleData.latitude': res.latitude,
          'articleData.longitude': res.longitude,
          'address': res.address
        });
        if (!res.address) {
          that.getLocByLatAndLng(res.latitude, res.longitude, function (data) {
            that.setData({ address: data.address });
          })
        }
      },
      fail: function () { },
      complete: function () { }
    })
  },
  addressInput: function (event) {
    if (event.detail.value) {
      this.setData({
        'articleData.latitude': '',
        'articleData.longitude': '',
        'address': ''
      });
    }
  },
  getLocByLatAndLng: function (lat, lng, cb) {
    app.sendRequest({
      url: '/index.php?r=Map/GetAreaInfoByLatAndLng',
      data: {
        latitude: lat,
        longitude: lng
      },
      method: 'post',
      success: function (data) {
        if (data.status == 0 && typeof cb == 'function') {
          cb(data.data);
        }
      }
    })
  },
  showClassifyBox: function () {
    let showFlag = this.data.showClassifyBox;
    this.setData({showClassifyBox: !showFlag});
    if (!this.data.articleData.category_id) {
      this.setData({
        'articleData.category_id': 0,
        selectedClassify: '全部（默认）'
      });
    }
  }
})
