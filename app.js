// var WxParse = require('components/wxParse/wxParse.js');
var util    = require('utils/util.js');
const check3RdUrl = ''
App({
  onLaunch: function () {
    let userInfo;
    wx.clearStorageSync()
    this._login();
    this.appInitial();
  },
  
  appInitial: function () {
    let that = this;
    this._getSystemInfo({
      success: function (res) {
        that.setSystemInfoData(res);
      }
    });
  },
  
  onShow: function (options) {
    this.globalData.appOptions = options
    if( options && options.scene && (options.scene == 1011 || options.scene == 1012 || options.scene == 1013 || options.scene == 1007 || options.scene == 1008)){
      if(options.query.location_id){
        this.globalData.urlLocationId = options.query.location_id;
      }
      if (options.query.user_token) {
        this._getPromotionUserToken({
          user_token: options.query.user_token
        });
      }
      if (options.query.leader_user_token) {
        var that = this;      
        that.showModal({
          content: '是否要成为推广人员的团员',
          showCancel: true,
          confirm: function () {
            that._getPromotionUserToken({
              leader_user_token: options.query.leader_user_token
            });
          }
        })
      }
      if (options.query.needStatistics == 1 && options.query.statisticsType) {
        let that = this;
        let detail = options.query.detail;
        let param = "";
        let params = {};
        let objId = (options.query.statisticsType != 9 && options.query.statisticsType != 10) ? (options.query.statisticsType == 11 ? options.path.split('/')[2] : detail) : options.query.statisticsType
        if (options.query.statisticsType == 9 || options.query.statisticsType == 10) {
          params = {
            obj_id: options.query.statisticsType,
            type: options.query.statisticsType
          }
        } else if (options.query.statisticsType == 11) {
          let newOption = Object.assign({}, options.query)
          delete newOption.needStatistics;
          delete newOption.statisticsType;
          for (let i in newOption) {
            param += '&' + i + '=' + newOption[i]
          }
          params = {
            obj_id: objId,
            type: 11,
            params: param
          }
        }
        that.sendRequest({
          hideLoading: true,
          url: '/index.php?r=AppShop/AddQRCodeStat',
          method: 'POST',
          data: params
        })
      }
    }
  },
  _getPromotionUserToken: function (param) {
    let that = this;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppDistribution/userBind',
      method: 'post',
      data: param,
      success: function (res) {
        that.setPageTitle(res.data.nickname);
      },
      successStatusAbnormal: function (res) {
        if(res.status == 99){
          let homepageRouter = that.getHomepageRouter();
          that.turnToPage('/pages/' + homepageRouter + '/' + homepageRouter, true);
        }
        if (res.status == 100){
          that.turnToPage('/promotion/pages/promotionApply/promotionApply', true);
        }
      }
    });
  },




  _getSystemInfo: function (options) {
    wx.getSystemInfo({
      success: function (res) {
        typeof options.success === 'function' && options.success(res);
      },
      fail: function (res) {
        typeof options.fail === 'function' && options.fail(res);
      },
      complete: function (res) {
        typeof options.complete === 'function' && options.complete(res);
      }
    });
  },
  sendRequest: function (param, customSiteUrl) {
    let that   = this;
    let data   = param.data || {};
    let header = param.header;
    let requestUrl;

    if(data.app_id){
      data._app_id = data.app_id;
    } else {
      data._app_id = data.app_id = this.getAppId();
    }

    if(!this.globalData.notBindXcxAppId){
      let storage_session_key = wx.getStorageSync('session_key');
      let global_session_key = this.getSessionKey();
      data.session_key = global_session_key ? global_session_key : storage_session_key;

    }

    if(customSiteUrl) {
      requestUrl = customSiteUrl + param.url;
    } else {
      requestUrl = this.globalData.siteBaseUrl + param.url;
    }

    if(param.method){
      if(param.method.toLowerCase() == 'post'){
        data = this._modifyPostParam(data);
        header = header || {
          //'content-type': 'application/json',
          'content-type': 'application/x-www-form-urlencoded;',
        }
      }
      param.method = param.method.toUpperCase();
    }

    if(!param.hideLoading){
      this.showToast({
        title: '请求中...',
        icon: 'loading'
      });
    }
    wx.request({
      url: requestUrl,
      data: data,
      method: param.method || 'GET',
      header: header || {
        'content-type': 'application/json',
      },
      success: function (res) {
        if (res.statusCode && res.statusCode != 200) {
          that.hideToast();
          that.showModal({
            content: ''+res.errMsg
          });
          typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
          return;
        }
        if (res.data.status) {
          if (res.data.status == 2 || res.data.status == 401) {
            that.goLogin({
              success: function () {
                that.sendRequest(param, customSiteUrl);
              },
              fail: function () {
                typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
              }
            });
            return;
          }
          if (res.data.status != 0) {
            that.hideToast();
            that.showModal({
              content: ''+res.data.data,
              confirm : function() {
                typeof param.successShowModalConfirm == 'function' && param.successShowModalConfirm(res.data);
              }
            });
            typeof param.successStatusAbnormal == 'function' && param.successStatusAbnormal(res.data);
            return;
          }
        }
        typeof param.success == 'function' && param.success(res.data);
      },
      fail: function (res) {
        that.hideToast();
        switch(res.errMsg){
          case 'request:fail url not in domain list': res.errMsg = '请配置正确的请求域名'; break;
          default: break;
        }
        that.showModal({
          content: '请求失败 '+res.errMsg
        })
        typeof param.fail == 'function' && param.fail(res.data);
      },
      complete: function (res) {
        param.hideLoading || that.hideToast();
        typeof param.complete == 'function' && param.complete(res.data);
      }
    });
  },
  _modifyPostParam: function (obj) {
    let query = '';
    let name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += this._modifyPostParam(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  },
  turnToPage: function (url, isRedirect) {
    let tabBarPagePathArr = this.getTabPagePathArr();
    if (this.globalData.turnToPageFlag)return;
    this.globalData.turnToPageFlag = true;
    setTimeout(() => {
      this.globalData.turnToPageFlag = false;
    }, 1000)
    if(tabBarPagePathArr.indexOf(url) != -1) {
      this.switchToTab(url);
      return;
    }
    if(!isRedirect){
      wx.navigateTo({
        url: url
      });
    } else {
      wx.redirectTo({
        url: url
      });
    }
  },
  reLaunch: function (options) {
    wx.reLaunch({
      url: options.url,
      success: options.success,
      fail: options.fail,
      complete: options.complete
    })
  },
  switchToTab: function (url) {
    wx.switchTab({
      url: url
    });
  },
  turnBack: function (options) {
    options = options || {};
    wx.navigateBack({
      delta: options.delta || 1
    });
  },
  navigateToXcx: function (param = {}) {
    let that = this;
    if (wx.navigateToMiniProgram) {
      wx.navigateToMiniProgram({
        appId: param.appId,
        path: param.path,
        fail: function (res) {
        if (res.errMsg != 'chooseImage:fail cancel'){
          that.showModal({
            content: '' + res.errMsg
          })
        }
      }
      });
    } else {
      this.showUpdateTip();
    }
  },
  setPageTitle: function (title) {
    wx.setNavigationBarTitle({
      title: title
    });
  },
  showToast: function (param) {
    wx.showToast({
      title: param.title,
      icon: param.icon,
      duration: param.duration || 1500,
      success: function (res) {
        typeof param.success == 'function' && param.success(res);
      },
      fail: function (res) {
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },
  hideToast: function () {
    wx.hideToast();
  },
  showModal: function (param) {
    wx.showModal({
      title: param.title || 'alert',
      content: param.content,
      showCancel: param.showCancel || false,
      cancelText: param.cancelText || '取消',
      cancelColor: param.cancelColor || '#000000',
      confirmText: param.confirmText || '确定',
      confirmColor: param.confirmColor || '#3CC51F',
      success: function (res) {
        if (res.confirm) {
          typeof param.confirm == 'function' && param.confirm(res);
        } else {
          typeof param.cancel == 'function' && param.cancel(res);
        }
      },
      fail: function (res) {
        typeof param.fail == 'function' && param.fail(res);
      },
      complete: function (res) {
        typeof param.complete == 'function' && param.complete(res);
      }
    })
  },
  chooseVideo: function (callback, maxDuration) {
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: maxDuration || 60,
      camera: ['front', 'back'],
      success: function (res) {
        typeof callback == 'function' && callback(res.tempFilePaths[0]);
      }
    })
  },
  chooseImage: function (callback, count) {
    let that = this;
    wx.chooseImage({
      count: count || 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let tempFilePaths = res.tempFilePaths,
            imageUrls = [];

        that.showToast({
          title: '提交中...',
          icon: 'loading',
          duration: 10000
        });
        for (let i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url : that.globalData.siteBaseUrl+ '/index.php?r=AppData/uploadImg',
            filePath: tempFilePaths[i],
            name: 'img_data',
            success: function (res) {
              let data = JSON.parse(res.data);
              if (data.status == 0) {
                imageUrls.push(data.data);
                if (imageUrls.length == tempFilePaths.length) {
                  that.hideToast();
                  typeof callback == 'function' && callback(imageUrls);
                }
              } else {
                that.hideToast();
                that.showModal({
                  content: data.data
                })
              }
            },
            fail: function (res) {
              that.hideToast();
              that.showModal({
                content: '' + res.errMsg
              });
            }
          })
        }
      },
      fail: function (res) {
        if (res.errMsg != 'chooseImage:fail cancel'){
          that.showModal({
            content: '' + res.errMsg
          })
        }
      }
    })
  },
  previewImage: function (options) {
    wx.previewImage({
      current: options.current || '',
      urls: options.urls || [options.current]
    })
  },
  playVoice: function (filePath) {
    wx.playVoice({
      filePath: filePath
    });
  },
  pauseVoice: function () {
    wx.pauseVoice();
  },
  countUserShareApp: function (callback) {
    let addTime = Date.now();
    this.sendRequest({
      url: '/index.php?r=AppShop/UserShareApp',
      complete: function (res) {
        if (res.status == 0) {
          typeof callback === 'function' && callback(addTime);
        }
      }
    });
  },
  shareAppMessage: function (options) {
    let that = this,
        pageInstance = this.getAppCurrentPage();
    return {
      title: options.title || this.getAppTitle() || '即速应用',
      desc: options.desc || this.getAppDescription() || '即速应用，拖拽生成app，无需编辑代码，一键打包微信小程序',
      path: options.path,
      success: function () {
        that.countUserShareApp(options.success);
      },
      complete:function(res){
        if (pageInstance.data.needbackToHomePage){
          pageInstance.setData({
            backToHomePage: {
              showButton: true
            },
            needbackToHomePage: false
          })
        }
      }
    }
  },

  wxPay: function (param) {
    let _this = this;
    wx.requestPayment({
      'timeStamp': param.timeStamp,
      'nonceStr': param.nonceStr,
      'package': param.package,
      'signType': 'MD5',
      'paySign': param.paySign,
      success: function(res){
        _this.wxPaySuccess(param);
        typeof param.success === 'function' && param.success();
      },
      fail: function(res){
        if(res.errMsg === 'requestPayment:fail cancel'){
          typeof param.fail === 'function' && param.fail();
          return;
        }
        if(res.errMsg === 'requestPayment:fail'){
          res.errMsg = '支付失败';
        }
        _this.showModal({
          content: res.errMsg
        })
        _this.wxPayFail(param, res.errMsg);
        typeof param.fail === 'function' && param.fail();
      }
    })
  },
  wxPaySuccess: function (param) {
    let orderId = param.orderId,
        goodsType = param.goodsType,
        formId = param.package.substr(10),
        t_num = goodsType == 1 ? 'AT0104':'AT0009';

    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppShop/SendXcxOrderCompleteMsg',
      data: {
        formId: formId,
        t_num: t_num,
        order_id: orderId
      }
    })
  },
  wxPayFail: function (param, errMsg) {
    let orderId = param.orderId,
        formId = param.package.substr(10);

    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppShop/SendXcxOrderCompleteMsg',
      data: {
        formId: formId,
        t_num: 'AT0010',
        order_id: orderId,
        fail_reason: errMsg
      }
    })
  },
  makePhoneCall: function (number, callback) {
    if(number.currentTarget){
      let dataset = number.currentTarget.dataset;

      number = dataset.number;
    }
    wx.makePhoneCall({
      phoneNumber: number,
      success: callback
    })
  },
  getLocation: function (options) {
    wx.getLocation({
      type: options.type || 'wgs84',
      success: options.success,
      fail: options.fail
    })
  },
  chooseLocation: function (options) {
    let that = this;
    wx.chooseLocation({
      success: function(res){
        console.log(res);
        typeof options.success === 'function' && options.success(res);
      },
      cancel: options.cancel,
      fail: function(res){
        if (res.errMsg === 'chooseLocation:fail auth deny'){
          that.showModal({
            content: '您之前拒绝授权我们使用您的定位，致使我们无法定位，是否重新授权定位？',
            showCancel: true,
            cancelText: "否",
            confirmText: "是",
            confirm: function () {
              wx.openSetting({
                success: function (res) {
                  console.log(res);
                  if (res.authSetting['scope.userLocation'] === true) {
                    that.chooseLocation(options);
                  }
                }
              })
            },
            cancel : function(){
              typeof options.fail === 'function' && options.fail();
            }
          })
        }else{
          typeof options.fail === 'function' && options.fail();
        }
      }
    });
  },
  openLocation: function (options) {
    wx.openLocation(options);
  },
  setClipboardData: function (options) {
    wx.setClipboardData({
      data: options.data || '',
      success: options.success,
      fail: options.fail,
      complete: options.complete
    })
  },
  getClipboardData: function (options) {
    wx.getClipboardData({
      success: options.success,
      fail: options.fail,
      complete: options.complete
    })
  },
  showShareMenu: function (options) {
    options = options || {};
    wx.showShareMenu({
      withShareTicket: options.withShareTicket || false,
      success: options.success,
      fail: options.fail,
      complete: options.complete
    });
  },
  scanCode: function (options) {
    options = options || {};
    wx.scanCode({
      onlyFromCamera: options.onlyFromCamera || false,
      success: options.success,
      fail: options.fail,
      complete: options.complete
    })
  },
  pageScrollTo: function (scrollTop) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: scrollTop
      });
    } else {
      this.showUpdateTip();
    }
  },
  getAuthSetting: function () {
    wx.getSetting({
      success: function (res) {
        return res.authSetting;
      },
      fail: function () {
        return {};
      }
    })
  },
  getStorage: function (options) {
    options = options || {};
    wx.getStorage({
      key: options.key || '',
      success: function (res) {
        typeof options.success === 'function' && options.success(res);
      },
      fail: function () {
        typeof options.fail === 'function' && options.fail();
      },
      complete: function () {
        typeof options.complete === 'function' && options.complete();
      }
    })
  },
  setStorage: function (options) {
    options = options || {};
    wx.setStorage({
      key: options.key || '',
      data: options.data || '',
      success: function () {
        typeof options.success === 'function' && options.success();
      },
      fail: function () {
        typeof options.fail === 'function' && options.fail();
      },
      complete: function () {
        typeof options.complete === 'function' && options.complete();
      }
    })
  },
  removeStorage: function (options) {
    options = options || {};
    wx.removeStorage({
      key: options.key || '',
      success: function () {
        typeof options.success === 'function' && options.success();
      },
      fail: function () {
        typeof options.fail === 'function' && options.fail();
      },
      complete: function () {
        typeof options.complete === 'function' && options.complete();
      }
    })
  },
  createAnimation: function (options) {
    options = options || {};
    return wx.createAnimation({
      duration: options.duration,
      timingFunction: options.timingFunction,
      transformOrigin: options.transformOrigin,
      delay: options.delay
    });
  },
  chooseAddress: function (options) {
    let that = this;
    options = options || {};
    wx.chooseAddress({
      success: function (res) {
        typeof options.success === 'function' && options.success(res);
      },
      fail: function () {
        typeof options.fail === 'function' && options.fail();
      },
      complete: function (res) {     
        if (res && res.errMsg === 'chooseAddress:fail auth deny') {
          wx.showModal({
            title: 'alert',
            content: '获取通信地址失败，这将影响您使用小程序，是否重新设置授权？',
            showCancel: true,
            cancelText: "否",
            confirmText: "是",
            success: function (res) {
              if (res.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if(res.authSetting['scope.address'] === true){
                      that.chooseAddress(options)
                    }
                  }
                })
              } else if (res.cancel) {
                typeof options.fail == 'function' && options.fail();
              }
            }
          })
        }
        typeof options.complete === 'function' && options.complete();
      }
    })
  },
  downloadFile : function(url, successfn){
    wx.downloadFile({
      url: url, 
      success: function(res) {
        successfn && successfn(res);
      }
    })
  },
  connectWifi:function(option){
    wx.connectWifi({
      SSID: option.SSID || '',
      BSSID: option.BSSID || '',
      password: option.password || '',
      success: function(res){
        option.success && option.success(res)
      },
      fail:function(res){
        option.fail && option.fail(res)
      },
      complete:function(res){
        option.complete && option.complete(res);
      }
    })
  },
  startWifi:function(option){
    wx.startWifi({
      success:function(res){
        option.success && option.success(res);
      },
      fail:function(res){
        option.fail && option.fail(res);
      },
      complete:function (res) {
        option.complete && option.complete(res);
      }
    })
  },
  wifiErrCode:function(code){
    switch(code){
      case 12000:
        return '未初始化Wi-Fi模块';
        break;
      case 12001:
        return '系统暂不支持连接 Wi-Fi';
        break;
      case 12002:
        return 'Wi-Fi 密码错误';
        break;
      case 12003:
        return '连接超时';
        break;
      case 12004:
        return '重复连接 Wi-Fi';
        break;
      case 12005:
        return '未打开 Wi-Fi 开关';
        break;
      case 12006:
        return '未打开 GPS 定位开关';
        break;
      case 12007:
        return '已拒绝授权链接 Wi-Fi';
        break;
      case 12008:
        return 'Wi-Fi名称无效';
        break;
      case 12009:
        return '运营商配置拒绝连接 Wi-Fi';
        break;
      case 12010:
        return '系统错误';
        break;
      case 12011:
        return '无法配置 Wi-Fi';
        break;
    }
  },
  goLogin: function (options) {
    this._sendSessionKey(options);
  },
  isLogin: function () {
    return this.getIsLogin();
  },
  _sendSessionKey: function (options) {
    let that = this, key;
    try {
      key = wx.getStorageSync('session_key');
    } catch(e) {
      console.log('wx.getStorageSync session_key error');
      console.log(e);
    }

    if (!key) {
      console.log("check login key=====");
      this._login(options);

    } else {
      this.globalData.sessionKey = key;
      let addTime = Date.now();
      this.sendRequest({
        hideLoading: true,
        url: '/index.php?r=AppUser/onLogin',
        success: function (res) {
          if (!res.is_login) {
            that._login(options);
            return;
          } else if (res.is_login == 2) {
            that.globalData.notBindXcxAppId = true;
          }
          that._requestUserInfo(res.is_login, options);
          that.loginForRewardPoint(addTime);
        },
        fail: function (res) {
          console.log('_sendSessionKey fail');
          typeof options.fail == 'function' && options.fail();
        }
      });
    }
  },
  _login: function (options) {
    let that = this;

    wx.login({
      success: function (res) {
        if (res.code) {
          that._sendCode(res.code, options);
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function (res) {
        console.log('login fail: ' + res.errMsg);
      }
    })
  },
  _sendCode: function (code, options) {

    let that = this;
    let addTime = Date.now();
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppUser/onLogin',
      data: {
        code: code
      },
      success: function (res) {

        console.log(res)

        // if (res.is_login == 2) {
        //   that.globalData.notBindXcxAppId = true;
        // }
        that.setSessionKey(res.data);
        that._requestUserInfo(res.is_login, options);
        that.loginForRewardPoint(addTime);


        // 2表示没有注册
        if (res.is_register != 3) {
          wx.showModal({
            title: 'alert',
            content: '使用“国教预约”先完成绑定',
            showCancel: false,
            confirmText: "ok",
            success: function (res) {
              wx.navigateTo({
                url: '/pages/userCenter/userLogin',
              })
            }
          })
        }
      },
      fail: function (res) {
        console.log('_sendCode fail');
      }
    })
  },
  _requestUserInfo: function (is_login, options) {
    if (is_login == 1) {
      this._requestUserXcxInfo(options);
    } else {
      this._requestUserWxInfo(options);
    }
  },
  _requestUserXcxInfo: function (options) {
    let that = this;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppData/getXcxUserInfo',
      success: function (res) {
        if (res.data) {
          that.setUserInfoStorage(res.data);
        }
        that.setIsLogin(true);
        // typeof options.success === 'function' && options.success();
      },
      fail: function (res) {
        console.log('_requestUserXcxInfo fail');
      }
    })
  },
  _requestUserWxInfo: function (options) {
    let that = this;
    console.log(that)

    wx.getUserInfo({
      success: function (res) {
        that._sendUserInfo(res.userInfo, options);
      },
      fail: function (res) {
        wx.showModal({
          title: 'alert',
          content: '授权“国教预约”应用获取用户信息？',
          showCancel: true,
          cancelText: "否",
          confirmText: "是",
          success: function (res) {
            if (res.confirm) {
              wx.openSetting({
                success: function (res) {
                  if(res.authSetting['scope.userInfo'] === true){
                    that._requestUserWxInfo(options);
                  }
                  wx.navigateTo({
                    url: '/pages/userCenter/userLogin',
                  })
                }
              })
            } else if (res.cancel) {
              console.log('用户取消授权个人信息');
              wx.navigateTo({
                url: '/pages/userCenter/userLogin',
              })
            }
          }
        })
      }
    })
  },
  _sendUserInfo: function (userInfo, options) {
    let that = this;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppUser/LoginUser',
      method: 'post',
      data: {
        nickname: userInfo['nickName'],
        gender: userInfo['gender'],
        city: userInfo['city'],
        province: userInfo['province'],
        country: userInfo['country'],
        avatarUrl: userInfo['avatarUrl']
      },
      success: function (res) {
        that.setUserInfoStorage(res.data.user_info);
        //typeof options.success === 'function' && options.success();
        that.setIsLogin(true);
      },
      fail: function (res) {
        console.log('_requestUserXcxInfo fail');
        //typeof options.fail == 'function' && options.fail(res);
      }
    })
  },

  onPageLoad: function (event) {
    let pageInstance  = this.getAppCurrentPage();
    let detail        = event.detail || '';
    let promotionName = event.promotionName;
    let that = this;
    pageInstance.sharePageParams = event;

    if (this.globalData.appOptions.path.split('/')[1] != this.globalData.homepageRouter && this.getTabPagePathArr().indexOf('/' + this.globalData.appOptions.path) == -1 && this.globalData.appOptions.path == pageInstance.route && !pageInstance.isbackHome) {
      pageInstance.isbackHome = true;
      pageInstance.setData({
        'backToHomePage': {
          showButton: true,
          showTip: true
        }
      })
    } else {
      pageInstance.setData({
        'backToHomePage': {
          showButton: false,
          showTip: false
        }
      })
    }
    pageInstance.setData({
      dataId: detail,
      addShoppingCartShow: false,
      addTostoreShoppingCartShow: false
    });
    this.setPageUserInfo();
    if (detail) {
      pageInstance.dataId = detail;
    }
    if (promotionName) {
      let userInfo = this.getUserInfo();
      this.setPageTitle(promotionName);
    }
    if (!!pageInstance.carouselGroupidsParams) {
      for(let i in pageInstance.carouselGroupidsParams){
        let compid = pageInstance.carouselGroupidsParams[i].compid;
        let deletePic = {};
        deletePic[compid + '.content'] = [];
        pageInstance.setData(deletePic);
      }
    }
    for(let i in pageInstance.data){ 
      if(/^bbs[\d]+$/.test(i)){
        pageInstance.reachBottomFuc = [{
          param :  {
            compId : i
          },
          triggerFuc : function(param) {
            that._bbsScrollFuc(param.compId);
          }
        }];
      }
      if(/^list_vessel[\d]+$/.test(i)){
        let component = pageInstance.data[i];
        if(component.customFeature.vesselAutoheight == 1 && component.customFeature.loadingMethod == 0){
          pageInstance.reachBottomFuc = [{
            param :  component,
            triggerFuc : function(param) {
              that.pageScrollFunc(param.compId);
            }
          }];
        }
      }
      if(/^goods_list[\d]+$/.test(i)){
        let component = pageInstance.data[i];
        if(component.customFeature.vesselAutoheight == 1 && component.customFeature.loadingMethod == 0){
          pageInstance.reachBottomFuc = [{
            param :  component,
            triggerFuc : function(param) {
              that.goodsScrollFunc(param.compId);
            }
          }];
        }
      }
      if(/^seckill[\d]+$/.test(i)){
        let component = pageInstance.data[i];
        if(component.customFeature.vesselAutoheight == 1 && component.customFeature.loadingMethod == 0){
          pageInstance.reachBottomFuc = [{
            param :  component,
            triggerFuc : function(param) {
              that.seckillScrollFunc(param.compId);
            }
          }];
        }
      }
      if(/^video_list[\d]+$/.test(i)){
        let component = pageInstance.data[i];
        if(component.customFeature.vesselAutoheight == 1 && component.customFeature.loadingMethod == 0){
          pageInstance.reachBottomFuc = [{
            param :  component,
            triggerFuc : function(param) {
              that.videoScrollFunc(param.compId);
            }
          }];
        }
      }
      if(/^news[\d]+$/.test(i)){ //资讯列表滚动到底部加载数据,只能有一个
        let component = pageInstance.data[i];
        pageInstance.reachBottomFuc = [{
          param: component,
          triggerFuc: function (param) {
            that._getNewsList({ compid: param.compId });
          }
        }]
      }
    }

    pageInstance.dataInitial();
    pageInstance.suspensionBottom();
  },
  needParseRichText: function(data) {
    if (typeof data == 'string' || typeof data == 'number'){
      if (!/^http:\/\/img/g.test(data)) {
        return true;
      }
    }
    return false;
  },

  pageDataInitial: function () {
    let _this          = this;
    let pageInstance   = this.getAppCurrentPage();
    let pageRequestNum = pageInstance.requestNum;
    let newdata        = {};

    if (!!pageInstance.dataId && !!pageInstance.page_form) {
      let dataid = parseInt(pageInstance.dataId);
      let param = {};

      param.data_id = dataid;
      param.form = pageInstance.page_form;

      pageInstance.requestNum = pageRequestNum + 1;
      _this.sendRequest({
        hideLoading: pageRequestNum++ == 1 ? false : true,   
        url: '/index.php?r=AppData/getFormData',
        data: param,
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            let newdata = {};
            let formdata = res.data[0].form_data;

            for (let i in formdata) {
              if (i == 'category') {
                continue;
              }
              if(/region/.test(i)){
                continue;
              }

              let description = formdata[i];
              if (_this.needParseRichText(description)) {
                formdata[i] = _this.getWxParseResult(description);
              }
            }
            newdata['detail_data'] = formdata;
            pageInstance.setData(newdata);

            if (!!pageInstance.dynamicVesselComps) {
              for (let i in pageInstance.dynamicVesselComps) {
                let vessel_param = pageInstance.dynamicVesselComps[i].param;
                let compid = pageInstance.dynamicVesselComps[i].compid;
                if (vessel_param.param_segment === 'id') {
                  vessel_param.idx = vessel_param.search_segment;
                  vessel_param.idx_value = pageInstance.dataId;
                } else if (!!newdata.detail_data[vessel_param.param_segment]) {
                  vessel_param.idx = vessel_param.search_segment;
                  vessel_param.idx_value = newdata.detail_data[vessel_param.param_segment];
                } else {
                  continue;
                }
                pageInstance.requestNum = pageRequestNum + 1;
                _this.sendRequest({
                  hideLoading: pageRequestNum++ == 1 ? false : true,
                  url: '/index.php?r=AppData/getFormDataList',
                  data: {
                    app_id: vessel_param.app_id,
                    form: vessel_param.form,
                    page: 1,
                    idx_arr: {
                      idx: vessel_param.idx,
                      idx_value: vessel_param.idx_value
                    }
                  },
                  method: 'post',
                  success: function (res) {
                    let newDynamicData = {};

                    if (!res.data.length) {
                      return;
                    }

                    if (param.form !== 'form') {
                      for (let j in res.data) {
                        for (let k in res.data[j].form_data) {
                          if (k == 'category') {
                            continue;
                          }
                          if(/region/.test(k)){
                            continue;
                          }

                          let description = res.data[j].form_data[k];

                          if (_this.needParseRichText(description)) {
                            res.data[j].form_data[k] = _this.getWxParseResult(description);
                          }
                        }
                      }
                    }

                    newDynamicData[compid + '.list_data'] = res.data;
                    newDynamicData[compid + '.is_more'] = res.is_more;
                    newDynamicData[compid + '.curpage'] = res.current_page;
                    pageInstance.setData(newDynamicData);
                  },
                  fail: function () {
                    console.log("[fail info]dynamic-vessel data request  failed");
                  }
                });
              }
            }
          }
        },
        complete: function () {
          pageInstance.setData({
            page_hidden: false
          });
        }
      })
    } else {
      pageInstance.setData({
        page_hidden: false
      });
    }

    if (!!pageInstance.carouselGroupidsParams) {
      for (let i in pageInstance.carouselGroupidsParams) {
        let compid = pageInstance.carouselGroupidsParams[i].compid;
        let carouselgroupId = pageInstance.data[compid].customFeature.carouselgroupId;
        let url = '/index.php?r=AppExtensionInfo/carouselPhotoProjiect';
        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: url,
          data: {
            type: carouselgroupId,
          },
          method: 'post',
          success: function (res) {
            newdata = {};
            if (res.data.length) {
              let content = [];
              for (let j in res.data) {
                let form_data = JSON.parse(res.data[j].form_data);
                if (form_data.isShow == 1) {
                  let eventParams = {};
                  let eventHandler = "";
                  switch (form_data.action) {
                    case "goods-trade":
                      eventHandler = "tapGoodsTradeHandler";
                      eventParams = '{"goods_id":"' + form_data['goods-id'] + '","goods_type":"' + form_data['goods-type'] + '"}'
                      break;
                    case "to-seckill":
                      eventHandler = "tapToSeckillHandler";
                      eventParams = '{"seckill_id":"' + form_data['seckill-id'] + '","seckill_type":"' + form_data['seckill-type'] + '"}'
                      break;
                    case "inner-link":
                      eventHandler = "tapInnerLinkHandler";
                      let pageLink = form_data['inner-page-link'] || form_data['page-link'];
                      // let pageLinkPath = '/pages/'+pageLink+'/'+pageLink;
                      eventParams = '{"inner_page_link":"' + pageLink+'","is_redirect":0}'
                      break;
                    case "call":
                      eventHandler = "tapPhoneCallHandler";
                      eventParams = '{"phone_num":"' + form_data['phone-num'] + '"}';
                      break;
                    case "get-coupon":
                      eventHandler = "tapGetCouponHandler";
                      eventParams = '{"coupon_id":"' + form_data['coupon-id'] + '"}';
                      break;
                    case "community":
                      eventHandler = "tapCommunityHandler";
                      eventParams = '{"community_id":"' + form_data['community-id'] + '"}';
                      break;
                    case "to-franchisee":
                      eventHandler = "tapToFranchiseeHandler";
                      eventParams = '{"franchisee_id":"' + form_data['franchisee-id'] + '"}';
                      break;
                    case "to-promotion":
                      eventHandler = "tapToPromotionHandler";
                      eventParams = "{}";
                      break;
                    case "coupon-receive-list":
                      eventHandler = "tapToCouponReceiveListHandler";
                      eventParams = "{}";
                      break;
                    case "recharge":
                      eventHandler = "tapToRechargeHandler";
                      eventParams = "{}";
                      break;
                    case 'lucky-wheel':
                      eventHandler = "tapToLuckyWheel";
                      eventParams = "{}";
                      break;
                    case 'golden-eggs':
                      eventHandler = "tapToGoldenEggs";
                      eventParams = "{}";
                      break;
                    case 'scratch-card':
                      eventHandler = "tapToScratchCard";
                      eventParams = "{}";
                      break;  
                    case "video":
                      eventHandler = "tapVideoHandler";
                      eventParams = '{"video_id":"' + form_data['video-id'] + '","video_name":"' + form_data['video-name'] + '"}'
                      break;
                    case 'video-play':
                      eventHandler = "tapVideoPlayHandler";
                      eventParams = '{"video_id":"' + form_data['video-id'] + '","video_name":"' + form_data['video-name'] + '","compid":"' + compid+'"}'
                      break;
                    case 'transfer':
                      eventHandler = "tapToTransferPageHandler";
                      eventParams = '{}';
                      break;
                    case 'transfer':
                      eventHandler = "tapToTransferPageHandler";
                      eventParams = '{}';
                      break;
                    default:
                      eventHandler = "";
                      eventParams = "{}";
                  }
                  content.push({
                    "customFeature": [],
                    'page-link': form_data['page-link'],
                    'pic': form_data.pic,
                    "content": "",
                    "parentCompid": "carousel1",
                    "style": "",
                    eventHandler: eventHandler,
                    eventParams: eventParams
                  })
                }
              }
              newdata[compid+'.content'] = content;
              pageInstance.setData(newdata);
            }
          }
        });
      }
    }


    if (!!pageInstance.list_compids_params) {
      for (let i in pageInstance.list_compids_params) {
        let compid = pageInstance.list_compids_params[i].compid;
        let param = pageInstance.list_compids_params[i].param;
        let compData = pageInstance.data[compid];
        let url = '/index.php?r=AppData/getFormDataList';
        let customFeature = compData.customFeature;

        pageInstance.requestNum = pageRequestNum + 1;
        if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
          param.page_size = customFeature.loadingNum || 10;
        }
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: url,
          data: param,
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              newdata = {};

              if (param.form !== 'form') {
                for (let j in res.data) {
                  for (let k in res.data[j].form_data) {
                    if (k == 'category') {
                      continue;
                    }
                    if(/region/.test(k)){
                      continue;
                    }
                    if (k == 'goods_model') {
                      let modelVP = [];
                      for (let l in res.data[j].form_data[k]) {
                        modelVP.push(res.data[j].form_data[k][l].virtual_price == '' ? 0 : Number(res.data[j].form_data[k][l].virtual_price))
                      }
                      if (Math.min(...modelVP) == Math.max(...modelVP)) {

                        res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2)
                      } else {
                        res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);

                      }
                    }
                    let description = res.data[j].form_data[k];

                    if (_this.needParseRichText(description)) {
                      res.data[j].form_data[k] = _this.getWxParseResult(description);
                    }
                  }
                }
              }

              newdata[compid + '.list_data'] = res.data;
              newdata[compid + '.is_more'] = res.is_more;
              newdata[compid + '.curpage'] = 1;

              pageInstance.setData(newdata);
            }
          }
        });
      }
    }

    if (!!pageInstance.goods_compids_params) {
      for (let i in pageInstance.goods_compids_params) {
        let compid = pageInstance.goods_compids_params[i].compid;
        let param = pageInstance.goods_compids_params[i].param;
        let compData = pageInstance.data[compid];
        let customFeature = compData.customFeature;
        let newWaimaiData = {};
        newWaimaiData[compid + '.goodsDetailShow'] = false;
        newWaimaiData[compid + '.goodsModelShow'] = false;
        pageInstance.setData(newWaimaiData);
        if (param.form === 'takeout') {
          _this.getLocation({
            type: 'gcj02',
            success: function (res) {
              _this._getAddressByLatLng({ lat: (_this.globalData.takeoutLocate.lat || res.latitude), lng: (_this.globalData.takeoutLocate.lng || res.longitude) }, function(res){
                let newdata = {};
                newdata[compid + '.addressInfo'] = res.data;
                newdata[compid + '.location_address'] = res.data.address.replace(res.data.ad_info.province + res.data.ad_info.city, '')
                pageInstance.setData(newdata);
              });
              param.longitude = _this.globalData.takeoutLocate.lng || res.longitude;
              param.latitude = _this.globalData.takeoutLocate.lat || res.latitude;
              param.page = 1;
              param.page_size = 50;
              let newWaimaiData = {};
              for(let j in compData.content){
                newWaimaiData[compid + '.pagination.category'+compData.content[j].source] = {};
                newWaimaiData[compid + '.pagination.category'+compData.content[j].source].param = {},
                Object.assign(newWaimaiData[compid + '.pagination.category'+compData.content[j].source].param ,param)
                newWaimaiData[compid + '.pagination.category'+compData.content[j].source].param.idx_arr = {
                  idx: 'category',
                  idx_value: compData.content[j].source == 'all' ? '' : compData.content[j].source
                };
              }
              pageInstance.setData(newWaimaiData);
              param.idx_arr = {
                idx: 'category',
                idx_value: compData.content[0].source == 'all' ? '' : compData.content[0].source
              }
              pageInstance.requestNum = pageRequestNum + 1;
              _this._getTakeoutShopInfo(function(data){
                let _data = pageInstance.data;
                let newdata = {};
                data.data.description = data.data.description ? data.data.description.replace(/\n|\\n/g, '\n') : data.data.description;
                newdata[compid + '.shopInfo'] = data.data;
                _this.globalData.takeoutShopInfo = data.data;
                newdata[compid + '.assessScore'] = (data.data.commont_stat.average_score).toFixed(2);
                newdata[compid + '.goodsScore'] = Math.round(data.data.commont_stat.score);
                newdata[compid + '.serviceScore'] = Math.round(data.data.commont_stat.logistic_score);
                newdata[compid + '.heightPx'] = _this._returnListHeight(pageInstance.data[compid].customFeature.showShopInfo, 1);
                newdata[compid + '.route'] = pageInstance.route;
                pageInstance.setData(newdata)
                let length = data.data.coupon_list ? data.data.coupon_list.length : 0;
                if (length > 1) {
                  _this._horseRaceLampUp(pageInstance, compid, length);
                  _this.takeoutAniUp = setTimeout(function () {
                    _this._horseRaceLampDown(pageInstance, compid, length);
                  }, length * 2500)
                  _this.takeoutAniDown = setInterval(function () {
                    if (_this.getAppCurrentPage().route != pageInstance.data[compid].route) {
                      clearTimeout(_this.takeoutAniUp)
                      clearTimeout(_this.takeoutAniUp2)
                      clearInterval(_this.takeoutAniDown)
                      _this.downAnima && clearInterval(_this.downAnima)
                      _this.upAnima && clearInterval(_this.upAnima)
                    } else {
                      _this._horseRaceLampUp(pageInstance, compid, length);
                      _this.takeoutAniUp2 = setTimeout(function () {
                        _this._horseRaceLampDown(pageInstance, compid, length);
                      }, length * 2500)
                    }
                  }, length * 5000)
                }
              })
              pageInstance.requestNum = pageRequestNum + 1;
              _this._getTakeoutStyleGoodsList(param, pageInstance, compid, 1);
              _this.sendRequest({
                hideLoading: true,
                url: '/index.php?r=AppShop/getAssessList&idx_arr[idx]=goods_type&idx_arr[idx_value]=2',
                data: { page: 1, page_size: 10, obj_name: 'app_id' },
                success: function (res) {
                  let newdata = {},
                    showAssess = [],
                    hasImgAssessList = 0,
                    goodAssess = 0,
                    normalAssess = 0,
                    badAssess = 0;
                  for (let i = 0; i < res.data.length; i++) {
                    res.data[i].assess_info.has_img == 1 ? (hasImgAssessList++ , showAssess.push(res.data[i])) : null;
                    res.data[i].assess_info.level == 3 ? goodAssess++ : (res.data[i].assess_info.level == 1 ? badAssess++ : normalAssess++ )
                  }
                  for (let j = 0; j < res.num.length;j++) {
                    res.num[j] = parseInt(res.num[j])
                  }
                  newdata[compid + '.assessActive'] = 0;
                  newdata[compid + '.assessList'] = res.data;
                  newdata[compid + '.showAssess'] = showAssess;
                  newdata[compid + '.assessNum'] = res.num;
                  newdata[compid + '.moreAssess'] = res.is_more;
                  newdata[compid + '.assessCurrentPage'] = res.current_page || 1;
                  pageInstance.setData(newdata);
                }
              })
            }
          });
        }else if(param.form === 'tostore'){
          _this.getTostoreCartList();

          if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
            param.page_size = customFeature.loadingNum || 20;
          }
          pageInstance.requestNum = pageRequestNum + 1;
          _this.sendRequest({
            hideLoading: pageRequestNum++ == 1 ? false : true,
            url: '/index.php?r=AppShop/GetGoodsList',
            data: param,
            method: 'post',
            success: function (res) {
              if (res.status == 0) {
                newdata = {};
                let arr = [];
                for (let i = 0; i < res.data.length; i++) {
                  let data = res.data[i],
                    maxMinArr = [],
                    pri = '';
                  if (data.form_data.goods_model && (data.form_data.goods_model.length >= 2)) {
                    for (let j = 0; j < data.form_data.goods_model.length; j++) {
                      maxMinArr.push(data.form_data.goods_model[j].price);
                    }
                    if (Math.min.apply(null, maxMinArr) != Math.max.apply(null, maxMinArr)) {
                      pri = Math.min.apply(null, maxMinArr).toFixed(2) + '-' + Math.max.apply(null, maxMinArr).toFixed(2);
                      data.form_data.price = pri;
                    }
                  }
                  arr.push(data);
                }
                if (_this.getHomepageRouter() == pageInstance.page_router) {
                  let second = new Date().getMinutes().toString();
                  if (second.length <= 1) {
                    second = '0' + second;
                  }
                  let currentTime = new Date().getHours().toString() + second,
                      showFlag = true,
                      showTime = '';

                  pageInstance.requestNum = pageRequestNum + 1;
                  _this.sendRequest({
                    hideLoading: pageRequestNum++ == 1 ? false : true,
                    url: '/index.php?r=AppShop/getBusinessTime',
                    method: 'post',
                    data: {
                      app_id: _this.getAppId()
                    },
                    success: function (res) {
                      let businessTime = res.data.business_time;
                      for (let i = 0; i < businessTime.length; i++) {
                        showTime += businessTime[i].start_time.substring(0, 2) + ':' + businessTime[i].start_time.substring(2, 4) + '-' + businessTime[i].end_time.substring(0, 2) + ':' + businessTime[i].end_time.substring(2, 4) + (businessTime.length == 1 ? '' : (i <= businessTime.length - 1 ? ' / ' : ''));
                        if (+currentTime > +businessTime[i].start_time && +currentTime < +businessTime[i].end_time) {
                          showFlag = false;
                        }
                      }
                      if (showFlag) {
                        _this.showModal({
                          content: '店铺休息中,暂时无法接单。营业时间为：' + showTime
                        })
                      }
                    }
                  });
                }
                newdata[compid + '.goods_data'] = arr;
                newdata[compid + '.is_more'] = res.is_more;
                newdata[compid + '.curpage'] = 1;
                pageInstance.setData(newdata);
              }
            }
          });
        }else {
          if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
            param.page_size = customFeature.loadingNum || 20;
          }
          pageInstance.requestNum = pageRequestNum + 1;
          _this.sendRequest({
            hideLoading: pageRequestNum++ == 1 ? false : true,
            url: '/index.php?r=AppShop/GetGoodsList',
            data: param,
            method: 'post',
            success: function (res) {
              if (res.status == 0) {
                for(let i in res.data){
                  if (res.data[i].form_data.goods_model) {
                    let modelVP = [];
                    for (let j in res.data[i].form_data.goods_model){
                      modelVP.push(res.data[i].form_data.goods_model[j].virtual_price == '' ? 0 : Number(res.data[i].form_data.goods_model[j].virtual_price))
                    }
                    Math.min(...modelVP) == Math.max(...modelVP) ? res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) :
                    res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);
                  }
                }
                newdata = {};
                newdata[compid + '.goods_data'] = res.data;
                newdata[compid + '.is_more'] = res.is_more;
                newdata[compid + '.curpage'] = 1;
                pageInstance.setData(newdata);
              }
            }
          });
        }
      }
    }
    if (!!pageInstance.franchiseeComps) {
      for (let i in pageInstance.franchiseeComps) {
        let compid = pageInstance.franchiseeComps[i].compid;
        let param = pageInstance.franchiseeComps[i].param;
        _this.getLocation({
          success: function(res){
            let latitude = res.latitude,
                longitude = res.longitude;

            pageInstance.requestNum = pageRequestNum + 1;
            _this.sendRequest({
              hideLoading: pageRequestNum++ == 1 ? false : true,
              url: '/index.php?r=Region/GetAreaInfoByLatAndLng',
              data: {
                latitude: latitude,
                longitude: longitude
              },
              success: function(res){
                newdata = {};
                newdata[compid + '.location_address'] = res.data.addressComponent.street + res.data.sematic_description;
                pageInstance.setData(newdata);

                param.latitude = latitude;
                param.longitude = longitude;
                param.page = -1;
                _this.setLocationInfo({
                  latitude: latitude,
                  longitude: longitude,
                  address: res.data.addressComponent.street + res.data.sematic_description
                });
                pageInstance.requestNum = pageRequestNum + 1;
                _this.sendRequest({
                  hideLoading: pageRequestNum++ == 1 ? false : true,
                  url: '/index.php?r=AppShop/GetAppShopByPage',
                  data: param,
                  method: 'post',
                  success: function (res) {
                    for(let index in res.data){
                      let distance = res.data[index].distance;
                      res.data[index].distance = util.formatDistance(distance);
                    }

                    newdata = {};
                    newdata[compid + '.franchisee_data'] = res.data;
                    newdata[compid + '.is_more'] = res.is_more;
                    newdata[compid + '.curpage'] = 1;

                    pageInstance.setData(newdata);
                  }
                });
              }
            });
          }
        });
      }
    }
    

    if (!!pageInstance.relobj_auto) {
      for (let i in pageInstance.relobj_auto) {
        let obj = pageInstance.relobj_auto[i],
            objrel = obj.obj_rel,
            AutoAddCount = obj.auto_add_count,
            compid = obj.compid,
            hasCounted = obj.has_counted,
            parentcompid = obj.parentcompid;

        if (parentcompid != '' && parentcompid != null) {
          if (compid.search('data.') !== -1) {
            compid = compid.substr(5);
          }
          compid = parentcompid + '.' + compid;
        }

        if(!!pageInstance.dataId && !!pageInstance.page_form){
          objrel = pageInstance.page_form + '_' + pageInstance.dataId;

          if(AutoAddCount){
            objrel = objrel + '_view';
          }
        }

        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: '/index.php?r=AppData/getCount',
          data: {
            obj_rel: objrel
          },
          success: function (res) {
            if (res.status == 0) {
              if (AutoAddCount == 1) {
                if (hasCounted == 0) {
                  pageInstance.requestNum = pageRequestNum + 1;
                  _this.sendRequest({
                    hideLoading: pageRequestNum++ == 1 ? false : true,
                    url: '/index.php?r=AppData/addCount',
                    data: {
                      obj_rel: objrel
                    },
                    success: function (newres) {
                      if (newres.status == 0) {
                        newdata = {};
                        newdata[compid + '.count_data.count_num'] = parseInt(newres.data.count_num);
                        newdata[compid + '.count_data.has_count'] = parseInt(newres.data.has_count);
                        pageInstance.setData(newdata);
                      }
                    },
                    fail: function () {
                    }
                  });
                }
              } else {
                newdata = {};
                newdata[compid + '.count_data.count_num'] = parseInt(res.data.count_num);
                newdata[compid + '.count_data.has_count'] = parseInt(res.data.has_count);
                pageInstance.setData(newdata);
              }
            }
          }
        });
      }
    }

    if(pageInstance.bbsCompIds.length){
      for (let i in pageInstance.bbsCompIds) {
        let compid = pageInstance.bbsCompIds[i],
            bbsData = pageInstance.data[compid],
            bbs_idx_value = '';

        if(bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false'){
          if(pageInstance.page_form && pageInstance.page_form != 'none'){
            bbs_idx_value = pageInstance.page_form + '_' + pageInstance.dataId;
          }else{
            bbs_idx_value = pageInstance.page_router;
          }
        }else{
          bbs_idx_value = _this.getAppId();
        }
        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: '/index.php?r=AppData/getFormDataList',
          method: 'post',
          data: {
            form: 'bbs',
            is_count: bbsData.customFeature.ifLike ? 1 : 0,
            page: 1,
            idx_arr: {
              idx: 'rel_obj',
              idx_value: bbs_idx_value
            }
          },
          success: function(res){
            let data = {};

            res.isloading = false;
            for(let i in res.data){
              res.data[i].form_data.content.addTime = res.data[i].form_data.content.addTime.slice(2, 19);
            }
            if (res.count > 99){
              res.count = '99+'
            } else if (res.count > 999) {
              res.count = '999+'
            } else if (res.count > 10000) {
              res.count = '1w+'
            }
            data[compid+'.content'] = res;
            data[compid+'.comment'] = {};
            pageInstance.setData(data);
          }
        });
      }
    }
    if (!!pageInstance.communityComps) {
      for (let i in pageInstance.communityComps) {
        let compid = pageInstance.communityComps[i].compid,
            dataId = [],
            content = pageInstance.data[compid].content,
            customFeature = pageInstance.data[compid].customFeature,
            styleData = {},
            imgStyle = [],
            liStyle = [],
            secStyle = [];

        secStyle = [
              'color:'+ customFeature.secColor ,
              'text-decoration:' + (customFeature.secTextDecoration || 'none'),
              'text-align:' + (customFeature.secTextAlign || 'left'),
              'font-size:' + customFeature.secFontSize,
              'font-style:' + (customFeature.secFontStyle || 'normal'),
              'font-weight:' + (customFeature.secFontWeight || 'normal')
          ].join(";");

        imgStyle = [
                'width :'+ (customFeature.imgWidth * 2.34) + 'rpx',
                'height :'+ (customFeature.imgHeight * 2.34) + 'rpx'
          ].join(";");
        liStyle = [
              'height :'+ (customFeature.lineHeight * 2.34) + 'rpx',
              'margin-bottom :'+ (customFeature.margin * 2.34) +'rpx'
          ];
        customFeature['lineBackgroundColor'] && (liStyle.push('background-color:' + customFeature['lineBackgroundColor']));
        customFeature['lineBackgroundImage'] && (liStyle.push('background-image:' + customFeature['lineBackgroundImage']));
        liStyle = liStyle.join(";");

        styleData[compid + '.secStyle'] = secStyle;
        styleData[compid + '.imgStyle'] = imgStyle;
        styleData[compid + '.liStyle']  = liStyle;
        pageInstance.setData(styleData);

        for (let j in content) {
          dataId.push(content[j]['community-id']);
        }

        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: '/index.php?r=AppSNS/GetSectionByPage',
          data: {
            section_ids : dataId ,
            page: 1 ,
            page_size: 100
          },
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let ddata = {},
                  lastdata = [],
                  newdata = {};

              for (let x = 0; x < res.data.length; x++) {
                let val = res.data[x];
                ddata[val.id] =val;
              }
              for (let y = 0; y < dataId.length; y++) {
                let val = ddata[dataId[y]];
                if(val){
                  lastdata.push(val);
                }
              }
              newdata[compid + '.community_data'] = lastdata;

              pageInstance.setData(newdata);
            }
          }
        });
      }
    }

    if (pageInstance.cityLocationComps.length){
      for (let i in pageInstance.cityLocationComps){
        let form = pageInstance.goods_compids_params.length == 0 ? '' : pageInstance.goods_compids_params[i].param.form;
        pageInstance.data[pageInstance.cityLocationComps[i]].hidden = false;
        _this.getLocation({
          success: function (res) {
            let latitude = res.latitude,
                longitude = res.longitude;

            pageInstance.requestNum = pageRequestNum + 1;
            _this.sendRequest({
              hideLoading: pageRequestNum++ == 1 ? false : true,
              url: '/index.php?r=Region/GetAreaInfoByLatAndLng',
              data: {
                latitude: latitude,
                longitude: longitude
              },
              success: function (res) {
                let newdata = pageInstance.data,
                    id =  pageInstance.cityLocationComps[i];

                newdata[id].provinces = [];
                newdata[id].provinces_ids = [];
                newdata[id].province = '';
                newdata[id].citys = [];
                newdata[id].city_ids = [];
                newdata[id].city = '';
                newdata[id].districts = [];
                newdata[id].district_ids = [];
                newdata[id].district = '';
                newdata[id].value = [0,0,0];
                newdata[id].local = res.data.addressComponent.province+' '+res.data.addressComponent.city + ' ' +res.data.addressComponent.district + ' >';
                pageInstance.setData(newdata);
              }
            })
          }
        });
        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
          url: '/index.php?r=AppRegion/getAllExistedDataRegionList&is_xcx=1&form=' + form,
          success: function (data) {
            let newdata = pageInstance.data,
                id =  pageInstance.cityLocationComps[i];
            newdata[id].areaList = data.data;
            pageInstance.setData(newdata);
          },
        });
      }
    }

    if (!!pageInstance.seckillOnLoadCompidParam) {
      for (let i in pageInstance.seckillOnLoadCompidParam) {
        let compid = pageInstance.seckillOnLoadCompidParam[i].compid;
        let param = pageInstance.seckillOnLoadCompidParam[i].param;
        let compData = pageInstance.data[compid];
        let customFeature = compData.customFeature;

        param.page_size = 10;
        if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
          param.page_size = customFeature.loadingNum || 10;
        }

        param.is_seckill = 1;
        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,
          url: '/index.php?r=AppShop/GetGoodsList',
          data: param,
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let rdata = res.data,
                  newdata = {},
                  downcountArr = pageInstance.data.downcountArr || [];

              for (let i = 0; i < rdata.length; i++) {
                let f = rdata[i].form_data,
                    dc ;

                f.downCount = {
                  hours : '00' ,
                  minutes : '00' ,
                  seconds : '00'
                };
                if(f.seckill_start_state == 0){
                  dc = _this.beforeSeckillDownCount(f , pageInstance , compid + '.goods_data[' + i + '].form_data');
                }else if(f.seckill_start_state == 1){
                  dc = _this.duringSeckillDownCount(f , pageInstance , compid + '.goods_data[' + i + '].form_data');
                }
                downcountArr.push(dc);
              }
              newdata[compid + '.goods_data'] = res.data;
              newdata[compid + '.is_more'] = res.is_more;
              newdata[compid + '.curpage'] = 1;
              newdata.downcountArr = downcountArr;
              pageInstance.setData(newdata);
            }
          }
        });
      }
    }
    if (!!pageInstance.newClassifyGroupidsParams) {
      let params = pageInstance.newClassifyGroupidsParams;
      for(let i = 0; i < params.length; i++){
        let compId = params[i]['compid'];
        let compData = pageInstance.data[compId];
        let customFeature = compData.customFeature;
        _this.sendRequest({
          hideLoading: true,
          url: '/index.php?r=appData/getCategoryByGroup',
          data: {
            group_id: customFeature.classifyGroupId
          },
          success: function(res){
            let classifyData  = res.data.item;
            let classifyLevel = 1;
            let newData = {};
            let selectedIndex = customFeature.selected || 0;
            let categoryId = classifyData[selectedIndex] ? classifyData[selectedIndex].category_id : '';
            
            for(let classify of classifyData){
              if(classify.subclass.length){
                classifyLevel = 2;
                break;
              }
            }
            newData[compId + '.classifyData'] = classifyData;
            newData[compId + '.classifyGroupForm'] = res.data.form;
            newData[compId + '.selectedIndex'] = selectedIndex;
            newData[compId + '.selectedCateId'] = categoryId;
            newData[compId + '.classifyLevel'] = classifyLevel;
            newData[compId + '.showSubClassify'] = false;
            pageInstance.setData(newData);
            _this.tapNewClassifyRefreshHandler(null, compId, categoryId);
          }
        });
      }
    }
    if (!!pageInstance.dynamicClassifyGroupidsParams) {
      let params = pageInstance.dynamicClassifyGroupidsParams;
      for(let i = 0; i < params.length; i++){
        let compId = params[i]['compid'];
        let groupId = params[i]['dynamicClassifyGroupId'];
        let compData = pageInstance.data[compId];
        let classifyLevel = compData.classifyType.charAt(5);
        let customFeature = compData.customFeature;
        _this.sendRequest({
          hideLoading: true,
          url: '/index.php?r=appData/getCategoryByGroup',
          data: {
            group_id: groupId
          },
          success: function(res){
            let classifyData  = res.data.item;
            let newData = {};
            let currentCategory = [];
            if(classifyLevel == 1 && classifyData[0]){
              currentCategory.push(classifyData[0]['category_id']);
            } else if (classifyLevel == 2 && classifyData[0]){
              if(compData.classifyType == 'level2-vertical-withpic'){
                 classifyData = classifyData.filter(function(item){
                  return item.category_id != '';
                })
              }
              if(classifyData[0]) {
                currentCategory.push(classifyData[0]['category_id']);
                if(classifyData[0]['subclass'][0]){
                  currentCategory.push(classifyData[0]['subclass'][0]['category_id']);
                }
              }
            }
            newData[compId + '.classifyData'] = classifyData;
            newData[compId + '.classifyGroupForm'] = res.data.form;
            newData[compId + '.currentCategory'] = currentCategory;
            pageInstance.setData(newData);
            if (classifyLevel == 1 && currentCategory.length < 1) {
              return;
            } else if (classifyLevel == 2 && currentCategory.length < 2) {
              if (currentCategory.length == 1){
                currentCategory[1] = currentCategory[0];
              } else {
                return;
              }
            }
            if(compData.classifyType == 'level2-vertical-withpic'){
              return;
            }
            let param = {
              page: 1,
              form: res.data.form,
              idx_arr: {
                idx: 'category',
                idx_value: currentCategory[classifyLevel-1]
              }
            };
            if (customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1) {
              param.page_size = customFeature.loadingNum || 20;
            }
            _this.sendRequest({
              hideLoading: true,
              url: '/index.php?r=AppData/getFormDataList',
              data: param,
              method: 'post',
              success: function (res) {
                if (res.status == 0) {
                  newdata = {};
                  if (param.form !== 'form') {
                    for (let j in res.data) {
                      for (let k in res.data[j].form_data) {
                        if (k == 'category') {
                          continue;
                        }
                        if(/region/.test(k)){
                          continue;
                        }
                        if (k == 'goods_model') {
                          let modelVP = [];
                          for (let l in res.data[j].form_data[k]) {
                            modelVP.push(res.data[j].form_data[k][l].virtual_price == '' ? 0 : Number(res.data[j].form_data[k][l].virtual_price))
                          }
                          if (Math.min(...modelVP) == Math.max(...modelVP)) {
                            
                            res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2)
                          }else{
                            res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);
                            
                          }
                        }
                        let description = res.data[j].form_data[k];
                        if (_this.needParseRichText(description)) {
                          res.data[j].form_data[k] = _this.getWxParseResult(description);
                        }
                      }
                    }
                  }
                  newdata[compId + '.list_data'] = res.data;
                  newdata[compId + '.is_more'] = res.is_more;
                  newdata[compId + '.curpage'] = 1;
                  pageInstance.setData(newdata);
                }
              }
            });
          }
        });
      }
    }
    if (!!pageInstance.videoListComps.length) {
      for (let i in pageInstance.videoListComps) {
        let compid = pageInstance.videoListComps[i].compid;
        let param = pageInstance.videoListComps[i].param;
        let compData = pageInstance.data[compid];
        let customFeature = compData.customFeature;

        if (customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1) {
          param.page_size = customFeature.loadingNum || 10;
        }

        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true,   // 页面第一个请求才展示loading
          url: '/index.php?r=AppVideo/GetVideoList',
          data: param,
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let rdata = res.data,
                  newdata = {};

              for (let i = 0; i < rdata.length; i++) {
                rdata[i].video_view = _this.handlingNumber(rdata[i].video_view);
              }

              newdata[compid + '.video_data'] = rdata;

              newdata[compid + '.is_more'] = res.is_more;
              newdata[compid + '.curpage'] = 1;

              pageInstance.setData(newdata);
            }
          }
        });
      }
    }
    if (!!pageInstance.videoProjectComps.length) {
      for (let i in pageInstance.videoProjectComps) {
        let compid = pageInstance.videoProjectComps[i].compid;
        let videoProjectId = pageInstance.videoProjectComps[i].videoProjectId;

        pageInstance.requestNum = pageRequestNum + 1;
        _this.sendRequest({
          hideLoading: pageRequestNum++ == 1 ? false : true, 
          url: '/index.php?r=AppVideo/GetProjectInfo',
          data: {
            id : videoProjectId
          },
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let rdata = res.data,
                  newdata = {};

              newdata[compid + '.videoInfo'] = rdata;
              newdata[compid + '.videoPoster'] = true;

              pageInstance.setData(newdata);
            }
          }
        });
      }
    }
    // 资讯组件
    if (pageInstance.newsComps && pageInstance.newsComps.length) {
      for (let i in pageInstance.newsComps) {
        let compid = pageInstance.newsComps[i].compid,
            conStyle = pageInstance.data[compid].style,
            customFeature = pageInstance.data[compid].customFeature,
            tabStyle = "color:"+ customFeature.tabTextColor + ";background:" + customFeature.backgroundColor +";",
            selectedStyle = "color:" + customFeature.tabTextSelectColor + ";background:" + customFeature.backgroundSelectColor +";font-size: 17px;font-weight: bold;",
            initData = {};
        initData[compid + '.conStyle'] = conStyle;
        initData[compid + '.tabStyle'] = tabStyle;
        initData[compid + '.selectedStyle'] = selectedStyle;
        initData[compid + '.pageObj'] = {
          isLoading: false,
          noMore: false,
          page: 1
        };
        pageInstance.setData(initData);

        // 请求资讯分类
        _this.sendRequest({
          hideLoading: true,
          url: '/index.php?r=AppNews/GetCategoryByPage',
          data: {page: -1},
          method: 'post',
          success: function (res) {
            if (res.status == 0) {
              let cateArr = [],
                  newData = {};

              for (let i = 0; i < res.data.length; i++) {
                let val = res.data[i];
                cateArr.push({
                  compid: compid,
                  id: val.id,
                  articleType: val.article_type,
                  name: val.name
                });
              }

              newData[compid + '.cateData'] = cateArr;
              pageInstance.setData(newData);

              _this._getNewsList({ compid: compid });
            }
          }
        });
      }
    }
    if (pageInstance.popupWindowComps.length) {
      this.controlAutoPopupWindow(pageInstance);
    }

    if (pageInstance.tostoreComps.length){
      this.tostoreCompsInit();
    }
    if (pageInstance.user_center_compids_params.length) {
      this.userCenterOrderCount();
    }
  },
  controlAutoPopupWindow: function (pageInstance) {
    let _this = this;

    for (let windowConfig of pageInstance.popupWindowComps) {
      let newData = {};
      let windowCompId = windowConfig.compid;
      let customFeature = pageInstance.data[windowCompId].customFeature;
      if (customFeature.autoPopup === true) {
        if (customFeature.popupScene === 'everyDay' || customFeature.popupScene === 'firstAuthorize'){
          if (this.globalData.firstAuthorize === undefined) {
            this.sendRequest({
              hideLoading: true,
              url: '/index.php?r=AppData/CheckFirstLoginApp',
              success: function(data){
                _this.globalData.firstAuthorize = data.data.isAppFirstLogin;
                _this.globalData.dailyFirstLogin = data.data.isDailyFirstLogin;
                _this.controlAutoPopupWindow(pageInstance);
              }
            })
            break;
          }
          if((this.globalData.firstAuthorize && customFeature.popupScene === 'firstAuthorize') || (this.globalData.dailyFirstLogin && customFeature.popupScene === 'everyDay')){
            newData[windowCompId+'.showPopupWindow'] = true;
            pageInstance.setData(newData);
          }

        } else if (customFeature.popupScene === 'everyTime'){
          newData[windowCompId+'.showPopupWindow'] = true;
          pageInstance.setData(newData);
        }

        if(customFeature.autoClose === true){
          setTimeout(()=>{
            newData[windowCompId+'.showPopupWindow'] = false;
            pageInstance.setData(newData);
          }, +customFeature.closeDelay*1000);
        }
      }
    }
  },
  getNewsCateList: function (event) {

    let that = this;
    let pageInstance = this.getAppCurrentPage(),
      dataset = event.currentTarget.dataset,
      compid = dataset.compid,
      cateId = dataset.id,
      pageObj = {
        isLoading: false,
        noMore: false,
        page: 1
      };

    this.sendRequest({
      url: '/index.php?r=AppNews/GetCategoryByPage',
      data: { page: -1 },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let cateArr = [],
            newData = {};

          for (let i = 0; i < res.data.length; i++) {
            let val = res.data[i];
            cateArr.push({
              compid: compid,
              id: val.id,
              articleType: val.article_type,
              name: val.name
            });
          }

          newData[compid + '.cateData'] = cateArr;
          newData[compid + '.pageObj'] = pageObj;
          newData[compid + '.selectedCateId'] = cateId;
          pageInstance.setData(newData);

          that._getNewsList({ compid: compid, category_id: cateId });
        }
      }
    });
  },
  _getNewsList: function (component_params) {
    if (!component_params) {
      component_params = {};
    }
    let that = this;
    let pageInstance = this.getAppCurrentPage(),
        compid = component_params.compid ? component_params.compid : pageInstance.newsComps[0].compid,
        newsData = pageInstance.data[compid],
        cateId = component_params.category_id || newsData.selectedCateId,
        pageObj = newsData.pageObj,
        newsList = newsData.newslist || [];
    if (pageObj.isLoading || pageObj.noMore) {
      return;
    }
    pageObj.isLoading = true;

    // 请求资讯列表
    this.sendRequest({
      url: '/index.php?r=AppNews/GetArticleByPage',
      data: {
        category_id: cateId ,
        orderby: 'add_time',
        page: pageObj.page,
        page_size: 10
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let newData = {};

          if (pageObj.page == 1) {
            newsList = res.data;
          }else {
            newsList = newsList.concat(res.data);
          }

          newData[compid + '.newslist'] = newsList;
          pageInstance.setData(newData);

          if (res.is_more == 0) {
            pageObj.noMore = true;
          }
          pageObj.isLoading = false;
          pageObj.page++;
        }
      },
      complete: function () {
        pageObj.isLoading = false;
        let newPageObj = {};
        newPageObj[compid + '.pageObj'] = pageObj;
        pageInstance.setData(newPageObj);
      }
    });
  },
  _horseRaceLampUp: function (pageInstance, compid, delay) {
    let that = this;
    let takeoutAmination = this.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '0 0'
    });
    let count = 0;
    if (pageInstance.data[compid].route != that.getAppCurrentPage().route) {
      clearInterval(that.upAnima)
      clearInterval(that.downAnima)
      clearTimeout(that.takeoutAniUp)
      clearTimeout(that.takeoutAniUp2)
      clearInterval(that.takeoutAniDown)
      return;
    }else{
      that.upAnima = setInterval(function () {
      let animationData = {}
      if (count < delay) {
        takeoutAmination.translateY(-21 * count).step()
        count ++ 
      }
      animationData[compid + '.takeoutAmination'] = takeoutAmination.export()
      pageInstance.setData(animationData)
    }, 2500)
    }
    setTimeout(function(){
      clearInterval(that.upAnima)
    }, delay * 2500)
  },
  _horseRaceLampDown: function (pageInstance, compid, delay){
    let that = this;
    let takeoutAmination = this.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '0 0'
    });
    let count = delay - 1;
    if (pageInstance.data[compid].route != that.getAppCurrentPage().route) {
      clearInterval(that.downAnima)
      clearInterval(that.upAnima)
      clearTimeout(that.takeoutAniUp)
      clearTimeout(that.takeoutAniUp2)
      clearInterval(that.takeoutAniDown)
      return
    }else{
      that.downAnima = setInterval(function () {
        let animationData = {}
        if (count >= 0) {
          takeoutAmination.translateY(-21 * count).step();
          count--
        }
        animationData[compid + '.takeoutAmination'] = takeoutAmination.export()
        pageInstance.setData(animationData)
      }, 2500)
      setTimeout(function () {
        clearInterval(that.downAnima)
      }, delay * 2500)
    }
  },
  _getTakeoutStyleGoodsList:function(param, pageInstance, compid, isOnShow){
    let _this = this;
    this.sendRequest({
      hideLoading: true,   // 页面第一个请求才展示loading
      url: '/index.php?r=AppShop/GetGoodsList',
      data: param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          pageInstance.requesting = false;
          let categoryId = param.idx_arr.idx_value == '' ? 'all' : param.idx_arr.idx_value;
          let data = pageInstance.data,
              newdata = {},
              isRequireing = {},
              categoryList = {},
              takeoutGoodsModelData = {};
          isRequireing[compid + '.pagination.category' + categoryId] = data[compid].pagination['category' + categoryId];
          isRequireing[compid + '.pagination.category' + categoryId].requesting = false;
          pageInstance.setData(isRequireing);
          if (!data[compid].show_goods_data || (data[compid].show_goods_data && !data[compid].show_goods_data['category' + categoryId]) || isOnShow) {
            categoryList['category'+categoryId] = []
          }else {
            categoryList['category'+categoryId] = data[compid].show_goods_data['category'+categoryId]
          }
          for(let i in res.data){
            let form_data = res.data[i].form_data
            categoryList['category'+categoryId].push({
              app_id: form_data.app_id,
              cover: form_data.cover,
              description: form_data.description,
              goods_model: form_data.goods_model,
              id : form_data.id,
              model: form_data.model,
              price: form_data.price,
              sales: form_data.sales,
              title: form_data.title,
              business_time: form_data.business_time,
              is_in_business_time: form_data.goods_in_business_time
            });
            newdata[compid + '.goods_model_list.goods'+form_data.id] = {};
            newdata[compid + '.goods_data_list.goods'+form_data.id] = {
              totalNum : 0,
              stock: form_data.stock,
              goods_model:{},
              name: form_data.title,
              price: form_data.price
            }
            if (form_data.goods_model) {
              let new_goods_model = {}
              for(let i in form_data.goods_model){
                new_goods_model[form_data.goods_model[i].id] = {
                  model: form_data.goods_model[i].model,
                  stock: form_data.goods_model[i].stock,
                  price: form_data.goods_model[i].price,
                  goods_id: form_data.goods_model[i].goods_id,
                  totalNum: 0
                }
              }
              newdata[compid + '.goods_model_list.goods'+form_data.id] = {
                modelData: [],
                name: form_data.title,
                goods_model : new_goods_model
              }
              for(let k in form_data.model){
                newdata[compid + '.goods_model_list.goods'+form_data.id]['modelData'].push({
                  name: form_data.model[k].name,
                  subModelName: form_data.model[k].subModelName,
                  subModelId : form_data.model[k].subModelId
                })
              }
            } else {
              newdata[compid + '.goods_model_list.goods'+form_data.id][0] = {
                price: form_data.price,
                num: 0,
                stock: form_data.stock,
                price: form_data.price
              }
            }
          }
          newdata[compid + '.show_goods_data.category' + categoryId] = categoryList['category'+categoryId];
          if (/waimai/.test(compid)) {
            newdata[compid + '.in_distance'] = res.in_distance;
          }
          newdata[compid + '.in_business_time'] = res.in_business_time;
          if (data[compid].TotalNum == undefined) {
            newdata[compid + '.TotalNum'] = 0;
            newdata[compid + '.TotalPrice'] = 0.00;
          }
          newdata[compid + '.selected'] = 1;
          newdata[compid + '.cartList'] = {};
          newdata[compid + '.pagination.category' + categoryId] = data[compid].pagination['category' + categoryId];
          newdata[compid + '.pagination.category' + categoryId].param = param;
          newdata[compid + '.pagination.category' + categoryId].is_more= res.is_more;
          newdata[compid + '.pagination.category' + categoryId].current_page = res.current_page;
          newdata[compid + '.modelChoose'] = [];
          newdata[compid + '.modelChooseId'] = [];
          pageInstance.setData(newdata);
          if (pageInstance.data[compid].cartTakeoutStyleList) {
            _this._parseTakeoutCartListData(pageInstance.data[compid].cartlistData, pageInstance, compid)
          }else{
            _this._getTakeoutStyleCartList(pageInstance, compid)
          }
        }
      }
    });
  },
  _getTakeoutShopInfo:function(successFun){
    this.sendRequest({
      hideLoading: true,   // 页面第一个请求才展示loading
      url: '/index.php?r=AppShop/getTakeOutInfo',
      data: {},
      success: function (data) {
        successFun(data)
      }
    });
  },
  _getAddressByLatLng: function (params, callback) {
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=Map/getAreaInfoByLatAndLng',
      data: {
        latitude: params.lat,
        longitude: params.lng
      },
      success: function(res){
        callback(res)
      }
    })
  },
  _getTakeoutStyleCartList: function(pageInstance, compid){
    let _this = this;
    this.sendRequest({
      hideLoading: true,   // 页面第一个请求才展示loading
      url: '/index.php?r=AppShop/cartList',
      data: { page: -1, page_size: 1000, sub_shop_app_id: '', parent_shop_app_id: '' },
      success: function (cartlist) {
        if (cartlist.status == 0) {
          _this._parseTakeoutCartListData(cartlist, pageInstance, compid)
        }
      }
    })
  },
  _parseTakeoutCartListData: function(cartlist, pageInstance, compid){
    let newdata = {},
        data = pageInstance.data,
        totalNum = 0,
        totalPrice = 0.00;
    for(let i in cartlist.data){
      let item = cartlist.data[i];
      newdata[compid + '.cartlistData'] = [];
      newdata[compid + '.cartlistData'].push(item)
      if (item.goods_type == 2 && /waimai/.test(compid)) {
        if (data[compid].goods_data_list['goods'+item.goods_id] && !data[compid].cartList['goods' + item.goods_id]) {
          newdata[compid + '.goods_data_list.goods'+item.goods_id+'.totalNum'] = (newdata[compid + '.goods_data_list.goods'+item.goods_id+'.totalNum'] || 0) + +item.num;
          newdata[compid + '.goods_model_list.goods'+ item.goods_id] = data[compid].goods_model_list['goods'+item.goods_id];
          if (newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model) {
            newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model[item.model_id].totalNum += +item.num
          }else{
            newdata[compid + '.goods_model_list.goods' + item.goods_id][0].num += +item.num
          }
        }
        if (!newdata[compid + '.cartList.goods'+item.goods_id]) {
        newdata[compid + '.cartList.goods'+item.goods_id] = {};
        }
        newdata[compid + '.cartList.goods'+item.goods_id][item.model_id] = {
          modelName: item.model_value ? item.model_value.join(' | ') : '',
          modelId: item.model_id,
          num: +item.num,
          price: +item.price,
          gooodsName: item.title,
          totalPrice: +(Number(item.num * item.price).toFixed(2)),
          stock: item.stock,
          cart_id: item.id
        }
        totalNum += Number(item.num);
        totalPrice += +((Number(item.price) * item.num).toFixed(2));
      }else if (item.goods_type == 3 && /tostore/.test(compid)) {
        if (data[compid].goods_data_list['goods'+item.goods_id] && !data[compid].cartList['goods' + item.goods_id]) {
          newdata[compid + '.goods_data_list.goods'+item.goods_id+'.totalNum'] = (newdata[compid + '.goods_data_list.goods'+item.goods_id+'.totalNum'] || 0)+ +item.num;
          newdata[compid + '.goods_model_list.goods'+ item.goods_id] = data[compid].goods_model_list['goods'+item.goods_id];
          if (newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model) {
            newdata[compid + '.goods_model_list.goods' + item.goods_id].goods_model[item.model_id].totalNum += +item.num
          }else{
            newdata[compid + '.goods_model_list.goods' + item.goods_id][0].num += +item.num
          }
        }
        if (!newdata[compid + '.cartList.goods'+item.goods_id]) {
          newdata[compid + '.cartList.goods'+item.goods_id] = {};
        }
        newdata[compid + '.cartList.goods'+item.goods_id][item.model_id] = {
          modelName: item.model_value ? item.model_value.join(' | ') : '',
          modelId: item.model_id,
          num: +item.num,
          price: +item.price,
          gooodsName: item.title,
          totalPrice: +(Number(item.num * item.price).toFixed(2)),
          stock: item.stock,
          cart_id: item.id
        }
        totalNum += Number(item.num);
        totalPrice += +((Number(item.price) * item.num).toFixed(2));
      }
    }
    newdata[compid + '.TotalNum'] = totalNum;
    newdata[compid + '.TotalPrice'] = +(totalPrice.toFixed(2));
    pageInstance.setData(newdata)
  },
  onPageShareAppMessage: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let pageRouter   = pageInstance.page_router;
    let pagePath     = '/pages/' + pageRouter + '/' + pageRouter;
    let desc         = event.target ? event.target.dataset.desc : this.getAppDescription();
    
    pageInstance.setData({
      pageQRCodeData: {
        shareDialogShow: "100%",
        shareMenuShow: false,
      },
      backToHomePage: {
        showButton: false
      },
      needbackToHomePage: pageInstance.data.backToHomePage.showButton
    })
    pagePath += pageInstance.dataId ? '?detail=' + pageInstance.dataId : '';
    if (this.globalData.PromotionUserToken){
      if (pagePath.indexOf('?') < 0){
        pagePath += '?user_token=' + this.globalData.PromotionUserToken;
      }else{
        pagePath += '&user_token=' + this.globalData.PromotionUserToken;
      }
    }
    return this.shareAppMessage({path: pagePath, desc: desc});
  },
  onPageShow: function () {
    let pageInstance = this.getAppCurrentPage();
    let that         = this;
    if (this.globalData.takeoutRefresh) {
      this.pageDataInitial();
      this.globalData.takeoutRefresh = false;
    } else if (this.globalData.tostoreRefresh){
      this.pageDataInitial();
      this.globalData.tostoreRefresh = false;
    } else {
      setTimeout(function () {
        that.setPageUserInfo();
      });
    }

    if (pageInstance.need_login && !this.getUserInfo().phone) {
      this.isLogin() 
      ? this.turnToPage('/default/pages/bindCellphone/bindCellphone', 1)
      : this.goLogin({
          success: function () {
            !that.getUserInfo().phone && that.turnToPage('/default/pages/bindCellphone/bindCellphone', 1);
          }
        });
    }
    if (pageInstance.user_center_compids_params.length) {
      this.userCenterOrderCount();
    }
    if (pageInstance.tostoreComps.length && pageInstance.returnToVersionFlag) {
      this.tostoreCompsInit();
    }
  },
  tostoreCompsInit:function(){
    let pageInstance = this.getAppCurrentPage(),
        that = this;
    pageInstance.returnToVersionFlag = false;
    for (let i in pageInstance.tostoreComps) {
      let compid = pageInstance.tostoreComps[i].compid;
      let param = pageInstance.tostoreComps[i].param;
      let data = pageInstance.data;
      let newTostoreData = {};
      newTostoreData[compid + '.goodsDetailShow'] = false;
      newTostoreData[compid + '.goodsModelShow'] = false;
      newTostoreData[compid + '.heightPx'] = that._returnListHeight(data[compid].customFeature.showShopInfo)
      newTostoreData[compid + '.selected'] = 1;
      pageInstance.setData(newTostoreData);
      param.page = 1;
      param.page_size = 50;
      param.take_out_style = 1;
      let newWaimaiData = {};
      for (let j in data[compid].content) {
        newWaimaiData[compid + '.pagination.category' + data[compid].content[j].source] = {};
        newWaimaiData[compid + '.pagination.category' + data[compid].content[j].source].param = {},
          Object.assign(newWaimaiData[compid + '.pagination.category' + data[compid].content[j].source].param, param)
        newWaimaiData[compid + '.pagination.category' + data[compid].content[j].source].param.idx_arr = {
          idx: 'category',
          idx_value: data[compid].content[j].source == 'all' ? '' : data[compid].content[j].source
        };
      }
      pageInstance.setData(newWaimaiData);
      param.idx_arr = {
        idx: 'category',
        idx_value: data[compid].content[0].source == 'all' ? '' : data[compid].content[0].source
      }
        that._getTakeoutStyleGoodsList(param, pageInstance, compid, 1);
      that.sendRequest({
        url: '/index.php?r=AppShop/GetTostoreWaitingRule',
        method: 'get',
        success: function (res) {
          let newdata = {};
          res.data.description = res.data.description ? res.data.description.replace(/\n|\\n/g, '\n') : res.data.description;
          newdata[compid + '.shopInfo'] = res.data;
          pageInstance.setData(newdata);
        }
      });
      that.sendRequest({
        url: '/index.php?r=AppShop/getAssessList&idx_arr[idx]=goods_type&idx_arr[idx_value]=3',
        method: 'get',
        data: { page: 1, page_size: 10, obj_name: 'app_id' },
        success: function (res) {
          let newdata = {},
            showAssess = [],
            hasImgAssessList = 0,
            goodAssess = 0,
            normalAssess = 0,
            badAssess = 0;
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].assess_info.has_img == 1 ? (hasImgAssessList++ , showAssess.push(res.data[i])) : null;
            res.data[i].assess_info.level == 3 ? goodAssess++ : (res.data[i].assess_info.level == 1 ? badAssess++ : normalAssess++)
          }
          for (let j = 0; j < res.num.length; j++) {
            res.num[j] = parseInt(res.num[j])
          }
          newdata[compid + '.assessActive'] = 0;
          newdata[compid + '.assessList'] = res.data;
          newdata[compid + '.showAssess'] = showAssess;
          newdata[compid + '.assessNum'] = res.num;
          newdata[compid + '.moreAssess'] = res.is_more;
          newdata[compid + '.assessCurrentPage'] = res.current_page || 0;
          pageInstance.setData(newdata);
        }
      })
    }
  },
  userCenterOrderCount: function () {
    let pageInstance = this.getAppCurrentPage();
    for (let i in pageInstance.user_center_compids_params) {
      let compid = pageInstance.user_center_compids_params[i].compid;
      let param = pageInstance.data[compid];
      let goodsType = param.customFeature.orderType;
      if (!goodsType && goodsType != 0){
        return;
      }
      this.sendRequest({
        hideLoading: true,
        url: '/index.php?r=AppShop/countStatusOrder',
        data: {
          parent_shop_app_id: this.getAppId(),
          goods_type: goodsType
        },
        method: 'post',
        success: function (res) {
          if (res.status == 0) {
            let rdata = res.data,
              newdata = {};
            newdata[compid + '.countStatusOrder'] = res.data;
            pageInstance.setData(newdata);
          }
        }
      });
    }
  },
  _returnListHeight:function(isshow, takeout){
    if (!isshow) {
      return wx.getSystemInfoSync().windowHeight - 43;
    } else {
      if(takeout){
        return wx.getSystemInfoSync().windowHeight - 163;
      }else{
        return wx.getSystemInfoSync().windowHeight - 138;
      }
    }
  },
  onPageReachBottom: function ( reachBottomFuc ) {
    for (let i = 0; i < reachBottomFuc.length; i++) {
      let e = reachBottomFuc[i];
      e.triggerFuc(e.param);
    }
  },
  _bbsScrollFuc: function (compid) {
    let _this         = this;
    let pageInstance  = this.getAppCurrentPage();
    let bbsData       = pageInstance.data[compid];
    let bbs_idx_value = '';

    if (bbsData.content.isloading || bbsData.content.is_more == 0) {
      return ;
    }
    bbsData.content instanceof Object ? bbsData.content.isloading = true : bbsData.content = { isloading: true};

    if (bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false') {
      if (pageInstance.page_form && pageInstance.page_form != 'none') {
        bbs_idx_value = pageInstance.page_form + '_' + pageInstance.dataId;
      } else {
        bbs_idx_value = pageInstance.page_router;
      }
    } else {
      bbs_idx_value = _this.getAppId();
    }
    _this.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      method: 'post',
      data: {
        form: 'bbs',
        is_count: bbsData.customFeature.ifLike ? 1 : 0,
        page: bbsData.content.current_page + 1,
        idx_arr: {
          idx: 'rel_obj',
          idx_value: bbs_idx_value
        }
      },
      success: function (res) {
        let data = {},
            newData = {};
        data = res;

        data.data = bbsData.content.data.concat(res.data);
        data.isloading = false;

        newData[compid+'.content'] = data;
        pageInstance.setData(newData);
      },
      complete: function () {
        let newData = {};
        newData[compid+'.content.isloading'] = false;
        pageInstance.setData(newData);
      }
    });
  },
  onPageUnload: function () {
    let pageInstance = this.getAppCurrentPage();
    let downcountArr = pageInstance.downcountArr;
    if(downcountArr && downcountArr.length){
      for (let i = 0; i < downcountArr.length; i++) {
        downcountArr[i].clear();
      }
    }
  },
  connectWifiHandler: function (e) {
    let that = this;
    let param = JSON.parse(e.currentTarget.dataset.eventParams);
    this.startWifi({
      success: function (res) {
        if (/ios/i.test(wx.getSystemInfoSync().system)) {
          wx.showLoading({
            title: '连接中'
          })
        }
        that.connectWifi({
          SSID: param.wifi_name,
          BSSID: param.wifi_address,
          password: param.wifi_password,
          success: function (res) {
            setTimeout(function () {
              that.showToast({
                title: '连接成功',
                icon: 'success',
                duration: 3000
              });
            }, 1000)
          },
          fail: function (res) {
            that.showModal({
              content: that.wifiErrCode(res.errCode)
            })
          },
          complete: function (res) {
            wx.hideLoading();
            res.errCode && that.wifiErrCode(res.errCode)
          }
        })
      },
      fail: function (res) {
        that.showModal({
          content: res.errMsg
        })
      }
    })
  },
  tapPrevewPictureHandler: function (event) {
    this.previewImage({
      urls: event.currentTarget.dataset.imgarr instanceof Array ? event.currentTarget.dataset.imgarr : [event.currentTarget.dataset.imgarr],
    })
  },
  suspensionBottom: function () {
    let pageInstance = this.getAppCurrentPage();
    for (let i in pageInstance.data) {
      if(/suspension/.test(i)){
        let suspension = pageInstance.data[i],
            newdata = {};

        if(pageInstance.data.has_tabbar == 1){
          newdata[i + '.suspension_bottom'] = (+suspension.suspension_bottom - 56)*2.34;
        }else{
          newdata[i + '.suspension_bottom'] = (+suspension.suspension_bottom)*2.34;
        }
        pageInstance.setData(newdata);
      }
    }
  },
  pageScrollFunc : function(event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];

    if(compData.is_search){
      this.searchList( compData.searchEle ,compData.compId);
    }else{
      this._pageScrollFunc(event);
    }
  },
  _pageScrollFunc: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let curpage      = compData.curpage + 1;
    let newdata      = {};
    let param        = {};
    let _this        = this;
    let customFeature = compData.customFeature;

    if(!compData.is_more && typeof event == 'object' && event.type == 'tap'){
      _this.showModal({
        content: '已经加载到最后了'
      });
    }
    if (pageInstance.requesting || !compData.is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.list_compids_params) {
      for (let index in pageInstance.list_compids_params) {
        if (pageInstance.list_compids_params[index].compid === compid) {
          param = pageInstance.list_compids_params[index].param;
          break;
        }
      }
    }
    if (pageInstance.dynamicClassifyGroupidsParams.length != 0) {
      param = {
        form: compData.classifyGroupForm,
        idx_arr: {
          idx: 'category',
          idx_value: compData.currentCategory[compData.currentCategory.length-1]
        }
      }
    }
    if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
      param.page_size = customFeature.loadingNum || 10;
    }
    param.page = curpage;
    _this.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      data: param,
      method: 'post',
      success: function (res) {
        newdata = {};

        for (let j in res.data) {
          for (let k in res.data[j].form_data) {
            if (k == 'category') {
              continue;
            }
            if(/region/.test(k)){
              continue;
            }

            let description = res.data[j].form_data[k];

            if (_this.needParseRichText(description)) {
              res.data[j].form_data[k] = _this.getWxParseResult(description);
            }
          }
        }

        newdata[compid + '.list_data'] = compData.list_data.concat(res.data);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  dynamicVesselScrollFunc: function (event) {
    let pageInstance  = this.getAppCurrentPage();
    let compid        = event.target.dataset.compid;
    let compData      = pageInstance.data[compid];
    let curpage       = compData.curpage + 1;
    let newdata       = {};
    let param         = {};
    let _this         = this;

    if (pageInstance.requesting || !compData.is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.dynamicVesselComps) {
      for (let index in pageInstance.dynamicVesselComps) {
        if (pageInstance.dynamicVesselComps[index].compid === compid) {
          param = pageInstance.dynamicVesselComps[index].param;
          break;
        }
      }
    }
    if (param.param_segment === 'id') {
      param.idx = param.search_segment;
      param.idx_value = pageInstance.dataId;
    } else if (!!pageInstance.data.detail_data[param.param_segment]) {
      param.idx = param.search_segment;
      param.idx_value = pageInstance.data.detail_data[param.param_segment];
    }
      
    _this.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      data: {
        form: param.form,
        page: curpage,
        idx_arr: {
          idx: param.idx,
          idx_value: param.idx_value
        }
      },
      method: 'post',
      success: function (res) {
        newdata = {};
        for (let j in res.data) {
          for (let k in res.data[j].form_data) {
            if (k == 'category') {
              continue;
            }
            if(/region/.test(k)){
              continue;
            }

            let description = res.data[j].form_data[k];

            if (_this.needParseRichText(description)) {
              res.data[j].form_data[k] = _this.getWxParseResult(description);
            }
          }
        }
        newdata[compid + '.list_data'] = compData.list_data.concat(res.data);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  goodsScrollFunc : function(event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let that         = this;

    if(compData.is_search){
      this.searchList( compData.searchEle ,compData.compId);
    }else{
      this._goodsScrollFunc(event);
    }
  },
  _goodsScrollFunc: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let curpage      = compData.curpage + 1;
    let customFeature = compData.customFeature;
    let newdata      = {};
    let param        = {};

    if(!compData.is_more && typeof event == 'object' && event.type == 'tap'){
      this.showModal({
        content: '已经加载到最后了'
      });
    }
    if (pageInstance.requesting || !compData.is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.goods_compids_params) {
      for (let index in pageInstance.goods_compids_params) {
        if (pageInstance.goods_compids_params[index].compid === compid) {
          param = pageInstance.goods_compids_params[index].param;
          break;
        }
      }
    }
    if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
      param.page_size = customFeature.loadingNum || 20;
    }
    param.page = curpage;
    this.sendRequest({
      url: '/index.php?r=AppShop/GetGoodsList',
      data: param,
      method: 'post',
      success: function (res) {
        newdata = {};
        for (let i in res.data) {
          if (res.data[i].form_data.goods_model) {
            let modelVP = [];
            for (let j in res.data[i].form_data.goods_model) {
              modelVP.push(res.data[i].form_data.goods_model[j].virtual_price == '' ? 0 : Number(res.data[i].form_data.goods_model[j].virtual_price))
            }
            Math.min(...modelVP) == Math.max(...modelVP) ? res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) :
              res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);
          }
        }
        newdata[compid + '.goods_data'] = compData.goods_data.concat(res.data);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  takeoutStyleScrollFunc:function(event){
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let curpage      = parseInt(dataset.curpage) + 1;
    let param        = dataset.param;
    let newdata      = {};
    let categoryId = param.idx_arr.idx_value == '' ? 'all' : param.idx_arr.idx_value;
    param.page++
    if (pageInstance.data[compid].pagination['category'+categoryId].requesting || pageInstance.data[compid].pagination['category'+categoryId].is_more != 1) {
      return;
    }
    newdata[compid + '.pagination.category'+categoryId + '.requesting'] = true;
    pageInstance.setData(newdata)
    this._getTakeoutStyleGoodsList(param, pageInstance, compid, 0);
  },
  franchiseeScrollFunc: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = event.target.dataset.compid;
    let curpage      = parseInt(event.target.dataset.curpage) + 1;
    let newdata      = {};
    let param        = {};

    if (pageInstance.requesting || !pageInstance.data[compid].is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.franchiseeComps) {
      for (let index in pageInstance.franchiseeComps) {
        if (pageInstance.franchiseeComps[index].compid === compid) {
          param = pageInstance.franchiseeComps[index].param;
          break;
        }
      }
    }
    param.page = curpage;
    this.sendRequest({
      url: '/index.php?r=AppShop/GetAppShopByPage',
      data: param,
      method: 'post',
      success: function (res) {
        for(let index in res.data){
          let distance = res.data[index].distance;
          res.data[index].distance = util.formatDistance(distance);
        }
        newdata = {};
        newdata[compid + '.franchisee_data'] = pageInstance.data[compid].franchisee_data.concat(res.data);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  seckillScrollFunc: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let curpage      = compData.curpage + 1;
    let customFeature = compData.customFeature;
    let _this        = this;
    let newdata      = {};
    let param        = {};

    if(!compData.is_more && typeof event == 'object' && event.type == 'tap'){
      _this.showModal({
        content: '已经加载到最后了'
      });
    }
    if (pageInstance.requesting || !compData.is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.seckillOnLoadCompidParam) {
      for (let index in pageInstance.seckillOnLoadCompidParam) {
        if (pageInstance.seckillOnLoadCompidParam[index].compid === compid) {
          param = pageInstance.seckillOnLoadCompidParam[index].param;
          break;
        }
      }
    }
    param.page_size = 10;
    if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
      param.page_size = +customFeature.loadingNum || 10;
    }
    param.page = curpage;
    _this.sendRequest({
      url: '/index.php?r=AppShop/GetGoodsList',
      data: param,
      method: 'post',
      success: function (res) {
        newdata = {};
        let rdata = res.data,
            downcountArr = pageInstance.data.downcountArr || [];

        for (let i = 0; i < rdata.length; i++) {
          let f = rdata[i].form_data,
              dc ,
              idx = (curpage-1) * param.page_size + i;

          f.downCount = {
            hours : '00' ,
            minutes : '00' ,
            seconds : '00'
          };
          if(f.seckill_start_state == 0){
            dc = _this.beforeSeckillDownCount(f , pageInstance , compid + '.goods_data[' + idx + '].form_data');
          }else if(f.seckill_start_state == 1){
            dc = _this.duringSeckillDownCount(f , pageInstance , compid + '.goods_data[' + idx + '].form_data');
          }
          downcountArr.push(dc);
        }
        newdata[compid + '.goods_data'] = compData.goods_data.concat(res.data);
        newdata[compid + '.is_more']    = res.is_more;
        newdata[compid + '.curpage']    = res.current_page;
        newdata.downcountArr = downcountArr;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  videoScrollFunc : function(event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let that         = this;

    if(compData.is_search){
      this.searchList( compData.searchEle ,compData.compId);
    }else{
      this._videoScrollFunc(event);
    }
  },
  _videoScrollFunc: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let compid       = typeof event == 'object' ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let curpage      = compData.curpage + 1;
    let customFeature = compData.customFeature;
    let newdata      = {};
    let param        = {};
    let that         = this;

    if(!compData.is_more && typeof event == 'object' && event.type == 'tap'){
      this.showModal({
        content: '已经加载到最后了'
      });
    }
    if (pageInstance.requesting || !compData.is_more) {
      return;
    }
    pageInstance.requesting = true;

    if (pageInstance.videoListComps) {
      for (let index in pageInstance.videoListComps) {
        if (pageInstance.videoListComps[index].compid === compid) {
          param = pageInstance.videoListComps[index].param;
          break;
        }
      }
    }
    if(customFeature.vesselAutoheight == 1 && customFeature.loadingMethod == 1){
      param.page_size = customFeature.loadingNum || 20;
    }
    param.page = curpage;
    this.sendRequest({
      url: '/index.php?r=AppVideo/GetVideoList',
      data: param,
      method: 'post',
      success: function (res) {
        let rdata = res.data;

        for (let i = 0; i < rdata.length; i++) {
          rdata[i].video_view = that.handlingNumber(rdata[i].video_view);
        }

        newdata = {};
        newdata[compid + '.video_data'] = compData.video_data.concat(rdata);
        newdata[compid + '.is_more'] = res.is_more;
        newdata[compid + '.curpage'] = res.current_page;

        pageInstance.setData(newdata);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  carouselVideoClose:function(event){
    let pageInstance = this.getAppCurrentPage(),
        compid = event.currentTarget.dataset.compid ;
    let newdata = {};

    newdata[compid + '.videoUrl'] = '';
    pageInstance.setData(newdata);
  },
  // 点赞 取消点赞
  changeCountRequert : {},
  changeCount: function (event) {
    let dataset      = event.currentTarget.dataset;
    let that         = this;
    let pageInstance = this.getAppCurrentPage();
    let newdata      = {};
    let counted      = dataset.counted;
    let compid       = dataset.compid;
    let objrel       = dataset.objrel;
    let form         = dataset.form;
    let dataIndex    = dataset.index;
    let parentcompid = dataset.parentcompid;
    let parentType   = dataset.parenttype;
    let url;
    let objIndex     = compid + '_' + objrel;

    if(counted == 1){
      url = '/index.php?r=AppData/delCount';
    } else {
      url = '/index.php?r=AppData/addCount';
    }

    if(that.changeCountRequert[objIndex]){
      return ;
    }
    that.changeCountRequert[objIndex] = true;

    that.sendRequest({
      url: url,
      data: { obj_rel: objrel },
      success: function (res) {
        newdata = {};

        if (parentcompid) {
          if (parentcompid.indexOf('list_vessel') === 0) {
            newdata[parentcompid + '.list_data[' + dataIndex + '].count_num'] = counted == 1
              ? parseInt(pageInstance.data[parentcompid].list_data[dataIndex].count_num) - 1
              : parseInt(res.data.count_num);
            newdata[parentcompid + '.list_data[' + dataIndex + '].has_count'] = counted == 1
              ? 0 : parseInt(res.data.has_count);
          } else if (parentcompid.indexOf('bbs') === 0) {
            newdata[parentcompid + '.content.data[' + dataIndex + '].count_num'] = counted == 1
              ? parseInt(pageInstance.data[parentcompid].content.data[dataIndex].count_num) - 1
              : parseInt(res.data.count_num);
            newdata[parentcompid + '.content.data[' + dataIndex + '].has_count'] = counted == 1
              ? 0 : parseInt(res.data.has_count);
          } else if (parentcompid.indexOf('free_vessel') === 0 || parentcompid.indexOf('popup_window') === 0 || parentcompid.indexOf('dynamic_vessel') === 0) {
            let path = compid
            if (compid.search('data.') !== -1) {
              path = compid.substr(5);
            }
            path = parentcompid + '.' + path;
            newdata[path + '.count_data.count_num'] = parseInt(res.data.count_num);
            newdata[path + '.count_data.has_count'] = parseInt(res.data.has_count);
          } else if (parentType && parentType.indexOf('list_vessel') === 0) {
            newdata[parentType + '.list_data[' + dataIndex + '].count_num'] = parseInt(res.data.count_num);
            newdata[parentType + '.list_data[' + dataIndex + '].has_count'] = parseInt(res.data.has_count);
          }
        } else {
          if (parentcompid != '' && parentcompid != null) {
            if (compid.search('data.') !== -1) {
              compid = compid.substr(5);
            }
            compid = parentcompid + '.' + compid;
          }
          newdata[compid + '.count_data.count_num'] = parseInt(res.data.count_num);
          newdata[compid + '.count_data.has_count'] = parseInt(res.data.has_count);
          pageInstance.setData(newdata);
        }

        pageInstance.setData(newdata);
        that.changeCountRequert[objIndex] = false;
      },
      complete : function () {
        that.changeCountRequert[objIndex] = false;
      }
    });
  },
  inputChange: function (event) {
    let dataset      = event.currentTarget.dataset;
    let value        = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let datakey      = dataset.datakey;
    let segment      = dataset.segment;

    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    let newdata = {};
    newdata[datakey] = value;
    let selectKey ={}
    for(let i in value){
      selectKey[value[i]] = 1;
    } 
    selectKey.itemLength = value.length
    newdata[dataset.compid + '.selectedData'] = selectKey
    pageInstance.setData(newdata);
  },
  bindDateChange: function (event) {
    let dataset      = event.currentTarget.dataset;
    let value        = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let datakey      = dataset.datakey;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;
    let newdata      = {};

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }

    let obj = pageInstance.data[formcompid]['form_data'];
    if (util.isPlainObject(obj)) {
      obj = pageInstance.data[formcompid]['form_data'] = {};
    }
    obj = obj[segment];

    if (!!obj) {
      let date = obj.substr(0, 10);
      let time = obj.substr(11);

      if (obj.length == 16) {
        newdata[datakey] = value + ' ' + time;
      } else if (obj.length == 10) {  
        newdata[datakey] = value;
      } else if (obj.length == 5) {  
        newdata[datakey] = value + ' ' + obj;
      } else if (obj.length == 0) {
        newdata[datakey] = value;
      }
    } else {
      newdata[datakey] = value;
    }
    newdata[compid + '.date'] = value;
    pageInstance.setData(newdata);
  },
  bindTimeChange: function (event) {
    let dataset      = event.currentTarget.dataset;
    let value        = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let datakey      = dataset.datakey;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;
    let newdata      = {};

    compid = formcompid + compid.substr(4);
    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }

    let obj = pageInstance.data[formcompid]['form_data'];
    if (util.isPlainObject(obj)) {
      obj = pageInstance.data[formcompid]['form_data'] = {};
    }
    obj = obj[segment];

    if (!!obj) {
      let date = obj.substr(0, 10);
      let time = obj.substr(11);

      if (obj.length == 16) {
        newdata[datakey] = date + ' ' + value;
      } else if (obj.length == 10) {
        newdata[datakey] = obj + ' ' + value;
      } else if (obj.length == 5) {
        newdata[datakey] = value;
      } else if (obj.length == 0) {
        newdata[datakey] = value;
      }
    } else {
      newdata[datakey] = value;
    }
    newdata[compid + '.time'] = value;
    pageInstance.setData(newdata);
  },
  bindSelectChange: function (event) {
    let dataset      = event.currentTarget.dataset;
    let value        = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let datakey      = dataset.datakey;
    let segment      = dataset.segment;

    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    let newdata = {};
    newdata[datakey] = value;
    let selectKey ={}
    for(let i in value){
      selectKey[value[i]] = 1;
    } 
    selectKey.itemLength = value.length
    newdata[dataset.compid + '.selectedData'] = selectKey
    pageInstance.setData(newdata);
  },
  bindScoreChange: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let datakey      = dataset.datakey;
    let value        = dataset.score;
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let segment      = dataset.segment;

    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      });
      return;
    }
    let newdata = {};
    newdata[datakey] = value;
    newdata[compid + '.editScore'] = value;
    pageInstance.setData(newdata);
  },
  submitForm: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let _this        = this;
    let compid       = dataset.compid;
    let form         = dataset.form;
    let form_data    = pageInstance.data[compid].form_data;
    let field_info   = pageInstance.data[compid].field_info;
    let content      = pageInstance.data[compid].content;
    let formEleType  = ['input-ele', 'textarea-ele', 'grade-ele', 'select-ele', 'upload-img', 'time-ele'];

    if (!util.isPlainObject(form_data)) {
      for(let index = 0; index < content.length; index++){
        if(formEleType.indexOf(content[index].type) == -1){
          continue;
        }
        let customFeature = content[index].customFeature,
            segment = customFeature.segment,
            ifMust = content[index].segment_required;

        if ((!form_data[segment] || form_data[segment].length == 0) && ifMust == 1) {
          _this.showModal({
            content: field_info[segment].title + ' 没有填写'
          });
          return;
        }
      }

      if(pageInstance.data[compid].submitting) return;
      let newdata = {};
      newdata[compid + '.submitting'] = true;
      pageInstance.setData(newdata);

      _this.sendRequest({
        hideLoading: true,
        url: '/index.php?r=AppData/addData',
        data: {
          form: form,
          form_data: form_data
        },
        method: 'POST',
        success: function (res) {
          _this.showToast({
            title: '提交成功',
            icon: 'success'
          });
        },
        complete: function () {
          let newdata = {};
          newdata[compid + '.submitting'] = false;
          pageInstance.setData(newdata);
        }
      })
    } else {
      _this.showModal({
        content: '这个表单什么都没填写哦！'
      });
    }
  },
  udpateVideoSrc: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;

    this.chooseVideo(function(filePath){
      let newdata = {};
      newdata[compid + '.src'] = filePath;
      pageInstance.setData(newdata);
    });
  },
  tapMapDetail: function (event) {
    let dataset = event.currentTarget.dataset;
    let params  = dataset.eventParams;
    if(!params) return;

    params = JSON.parse(params)[0];
    this.openLocation({
      latitude: +params.latitude,
      longitude: +params.longitude,
      name: params.desc,
      address: params.name
    });
  },
  uploadFormImg: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let formcompid   = dataset.formcompid;
    let datakey      = dataset.datakey;
    let segment      = dataset.segment;
    let data = pageInstance.data;
    compid = formcompid + compid.substr(4);

    if (!segment) {
      this.showModal({
        content: '该组件未绑定字段 请在电脑编辑页绑定后使用'
      })
      console.log('segment empty 请绑定数据对象字段');
      return;
    }
    this.chooseImage((res) => {
      let img_src = res;
      let newdata = pageInstance.data;
      typeof (newdata[compid + '.content']) == 'object' ? '' : newdata[compid + '.content'] = [];
      typeof (newdata[datakey]) == 'object' ? '' : newdata[datakey] = [];
      newdata[datakey] = img_src;
      newdata[compid + '.display_upload'] = false;
      newdata[compid + '.content'] = img_src;
      pageInstance.setData(newdata);
    }, 9);
  },
  deleteUploadImg: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let formcompid   = dataset.formcompid;
    let index        = dataset.index;
    let compid       = dataset.compid;
    let datakey      = dataset.datakey;
    let newdata      = pageInstance.data;
    compid = formcompid + compid.substr(4);
    this.showModal({
      content: '确定删除该图片？',
      confirm: function () {
        newdata[compid + '.content'].splice(index,1);
        newdata[datakey].splice(index, 1);
        pageInstance.setData(newdata);
      }
    })
  },
  listVesselTurnToPage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let data_id      = dataset.dataid;
    let router       = dataset.router;
    let page_form    = pageInstance.page_form;
    let isseckill    = dataset.isseckill; // 是否是商品秒杀

    // if (router == '') {
    //   this.showModal({
    //     content: '请在电脑端绑定跳转页面'
    //   });
    //   return;
    // }
    if (router == -1 || router == '-1') {
      return;
    }
    if (page_form != '') {
      if(router == 'tostoreDetail'){
        this.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + data_id);
      }else if(router == 'goodsDetail' && isseckill == 1){
        this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + data_id + '&goodsType=seckill');
      }else if (router == 'goodsDetail') {
        this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + data_id );
      }else if (router == 'videoDetail') {
        this.turnToPage('/video/pages/videoDetail/videoDetail?detail=' + data_id );
      } else if (router == 'franchiseeDetail') {
        this.turnToPage('/franchisee/pages/franchiseeDetail/franchiseeDetail?detail=' + data_id);
      }else{
        this.turnToPage('/pages/' + router + '/' + router + '?detail=' + data_id);
      }
    }
  },
  dynamicVesselTurnToPage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let data_id      = dataset.dataid;
    let router       = dataset.router;
    let page_form    = pageInstance.page_form;
    let isGroup      = dataset.isGroup;
    let isSeckill    = dataset.isSeckill;
    if (router == '') {
      this.showModal({
        content: '请在电脑端绑定跳转页面'
      });
      return;
    }
    if (router == -1 || router == '-1') {
      return;
    }
    if (isGroup && isGroup == 1) {
      this.turnToPage('/pages/groupGoodsDetail/groupGoodsDetail?detail=' + data_id);
      return;
    }
    if (isSeckill && isSeckill == 1) {
      this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + data_id +'&goodsType=seckill');
      return;
    }
    if (page_form != '') {
      if(router == 'tostoreDetail'){
        this.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + data_id);
      }else if (router == 'goodsDetail'){
        this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + data_id);
      }else if (router == 'videoDetail') {
        this.turnToPage('/video/pages/videoDetail/videoDetail?detail=' + data_id );
      } else if (router == 'franchiseeDetail') {
        this.turnToPage('/franchisee/pages/franchiseeDetail/franchiseeDetail?detail=' + data_id);
      }else{
        this.turnToPage('/pages/' + router + '/' + router + '?detail=' + data_id);
      }
    }
  },
  userCenterTurnToPage: function (event) {
    let that = this;
    if (this.isLogin()) {
      this._userCenterToPage(event);
    } else {
      this.goLogin({
        success: function () {
          that._userCenterToPage(event);
        }
      });
    }
  },
  _userCenterToPage: function (event) {
    let dataset         = event.currentTarget.dataset;
    let router          = dataset.router;
    let openVerifyPhone = dataset.openVerifyPhone;
    let that            = this;
    let goodsType       = dataset.goodsType;
    let currentIndex    = event.target.dataset.index;

    if (router === '/pages/userCenter/userCenter' && this.isLogin() !== true) {
      this.goLogin({
        success: function () {
          that.turnToPage('/pages/userCenter/userCenter?from=userCenterEle');
        }
      })
      return;
    }
    if (openVerifyPhone) {
      if (!this.getUserInfo().phone) {
        this.turnToPage('/default/pages/bindCellphone/bindCellphone');
      } else {
        if (router === 'myPromotion') {
          that._isOpenPromotion();
          return;
        }
        if (router === '/eCommerce/pages/myOrder/myOrder' && goodsType != undefined) {
          this.turnToPage('/eCommerce/pages/myOrder/myOrder?from=userCenterEle&goodsType=' + goodsType + '&currentIndex=' + currentIndex);
          return;
        }
        this.turnToPage(router + '?from=userCenterEle');
      }
    } else {
      if (router === 'myPromotion') {
        that._isOpenPromotion();
        return;
      }
      if (router === '/eCommerce/pages/myOrder/myOrder' && goodsType != undefined) {
        this.turnToPage('/eCommerce/pages/myOrder/myOrder?from=userCenterEle&goodsType=' + goodsType + '&currentIndex=' + currentIndex);
        return;
      }
      this.turnToPage(router+'?from=userCenterEle');
    }
  },
  turnToGoodsDetail: function (event) {
    let dataset   = event.currentTarget.dataset;
    let id        = dataset.id;
    let contact   = dataset.contact;
    let goodsType = dataset.goodsType;
    let group     = dataset.group;
    let hidestock = dataset.hidestock;
    let isShowVirtualPrice = dataset.isshowvirtualprice;

    if (group && group == 1) {
      this.turnToPage('/pages/groupGoodsDetail/groupGoodsDetail?detail=' + id + '&contact=' + contact);
      return;
    }
    switch (+goodsType) {
      case 0: this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + id + '&contact=' + contact + '&hidestock=' + hidestock + '&isShowVirtualPrice=' + isShowVirtualPrice);
        break;
      case 1: this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + id +'&contact=' + contact +'&hidestock=' + hidestock);
        break;
      case 3: this.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + id);
        break;
    }
  },
  turnToFranchiseeDetail: function (event) {
    let id = event.currentTarget.dataset.id;
    let mode = event.currentTarget.dataset.mode;
      this.turnToPage('/franchisee/pages/franchiseeDetail/franchiseeDetail?detail=' + id);
  },
  turnToSeckillDetail: function (event) {
    let id      = event.currentTarget.dataset.id;
    let contact = event.currentTarget.dataset.contact;
    this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + id +'&goodsType=seckill&contact=' + contact);
  },
  turnToNewsDetail: function (event) {
    let id = event.currentTarget.dataset.id;
    this.turnToPage('/informationManagement/pages/newsDetail/newsDetail?detail=' + id);
  },
  sortListFunc: function (event) {
    let dataset       = event.currentTarget.dataset;
    let pageInstance  = this.getAppCurrentPage();
    let listid        = dataset.listid;
    let idx           = dataset.idx;
    let listParams    = {
      'list-vessel': pageInstance.list_compids_params,
      'goods-list': pageInstance.goods_compids_params,
      'franchisee-list': pageInstance.franchiseeComps,
      'video-list' : pageInstance.videoListComps
    };
    let component_params, listType;

    for (let key in listParams) {
      if(listType !== undefined) break;
      component_params = listParams[key];
      if(component_params.length){
        for (let j = 0; j < component_params.length; j++) {
          if(component_params[j].param.id === listid){
            listType = key;
            component_params = component_params[j];
          }
        }
      }
    }

    if(!component_params) return;
    component_params.param.page = 1;

    if (idx != 0) {
      component_params.param.sort_key       = dataset.sortkey;
      component_params.param.sort_direction = dataset.sortdirection;
    } else {
      component_params.param.sort_key       = '';
      component_params.param.sort_direction = 0;
    }

    switch (listType) {
      case 'list-vessel': this._sortListVessel(component_params, dataset); break;
      case 'goods-list': this._sortGoodsList(component_params, dataset); break;
      case 'franchisee-list': this._sortFranchiseeList(component_params, dataset); break;
      case 'video-list': this._sortVideoList(component_params, dataset); break;
    }
  },
  _sortListVessel: function (component_params, dataset) {
    let that = this;
    let pageInstance  = this.getAppCurrentPage();
    this.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      data: component_params.param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let newdata = {};
          let compid  = component_params['compid'];

          for (let j in res.data) {
            for (let k in res.data[j].form_data) {
              if (k == 'category') continue;

              if(/region/.test(k)){
                continue;
              }

              let description = res.data[j].form_data[k];

              if (that.needParseRichText(description)) {
                res.data[j].form_data[k] = that.getWxParseResult(description);
              }
            }
          }

          newdata[compid + '.list_data'] = res.data;
          newdata[compid + '.is_more']   = res.is_more;
          newdata[compid + '.curpage']   = 1;

          that._updateSortStatus(dataset);
          pageInstance.setData(newdata);
        }
      }
    });
  },
  _sortGoodsList: function (component_params, dataset) {
    let that = this;
    let pageInstance  = this.getAppCurrentPage();
    this.sendRequest({
      url: '/index.php?r=AppShop/GetGoodsList',
      data: component_params.param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let newdata = {};
          let compid  = component_params['compid'];

          newdata[compid + '.goods_data'] = res.data;
          newdata[compid + '.is_more'] = res.is_more;
          newdata[compid + '.curpage'] = 1;

          that._updateSortStatus(dataset);
          pageInstance.setData(newdata);
        }
      }
    });
  },
  _sortFranchiseeList: function (component_params, dataset) {
    let that = this;
    let pageInstance  = this.getAppCurrentPage();

    component_params.param.page = -1;

    this.sendRequest({
      url: '/index.php?r=AppShop/GetAppShopByPage',
      data: component_params.param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let newdata = {};
          let compid  = component_params['compid'];

          for(let index in res.data){
            let distance = res.data[index].distance;
            res.data[index].distance = util.formatDistance(distance);
          }
          newdata[compid + '.franchisee_data'] = res.data;
          newdata[compid + '.is_more'] = res.is_more;
          newdata[compid + '.curpage'] = 1;

          that._updateSortStatus(dataset);
          pageInstance.setData(newdata);
        }
      }
    });
  },
  _sortVideoList : function(component_params, dataset) {
    let that = this;
    let pageInstance  = this.getAppCurrentPage();
    this.sendRequest({
      url: '/index.php?r=AppVideo/GetVideoList',
      data: component_params.param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {

          let rdata = res.data;
          let newdata = {};
          let compid  = component_params['compid'];

          for (let i = 0; i < rdata.length; i++) {
            rdata[i].video_view = that.handlingNumber(rdata[i].video_view);
          }

          newdata[compid + '.video_data'] = rdata;
          newdata[compid + '.is_more'] = res.is_more;
          newdata[compid + '.curpage'] = res.current_page;

          that._updateSortStatus(dataset);
          pageInstance.setData(newdata);

        }
      }
    });
  },
  _updateSortStatus: function (dataset) {
    let pageInstance  = this.getAppCurrentPage();
    let sortCompid = dataset.compid;
    let selectSortIndex = dataset.idx;
    let newdata = {};

    newdata[sortCompid + '.customFeature.selected'] = selectSortIndex;
    if (selectSortIndex != 0 && dataset.sortdirection == 1) {
      newdata[sortCompid + '.content[' + selectSortIndex + '].customFeature.sort_direction'] = 0;
    } else if (selectSortIndex != 0) {
      newdata[sortCompid + '.content[' + selectSortIndex + '].customFeature.sort_direction'] = 1;
    } else if (selectSortIndex == 0) {
      newdata[sortCompid + '.content[' + selectSortIndex + '].customFeature.sort_direction'] = 0;
    }

    pageInstance.setData(newdata);
  },
  bbsInputComment: function (event) {
    let dataset      = event.target.dataset;
    let comment      = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let data         = {};

    data[compid+'.comment.text'] = comment;
    pageInstance.setData(data);
  },
  bbsInputReply: function (event) {
    let dataset      = event.target.dataset;
    let comment      = event.detail.value;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = dataset.index;
    let data         = {};

    data[compid+'.content.data['+index+'].replyText'] = comment;
    pageInstance.setData(data);
  },
  uploadBbsCommentImage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let data         = {};

    this.chooseImage(function(res){
      data[compid+'.comment.img'] = res;
      pageInstance.setData(data);
    }, 3);
  },
  uploadBbsReplyImage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = dataset.index;
    let data         = {};

    this.chooseImage(function(res){
      data[compid+'.content.data['+index+'].replyImg'] = res;
      pageInstance.setData(data);
    }, 3);
  },
  deleteCommentImage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = dataset.index;
    let oldData = pageInstance.data[compid].comment.img
    let data         = {};
    oldData.splice(index, 1)
    data[compid + '.comment.img'] = oldData;
    pageInstance.setData(data);
  },
  deleteReplyImage: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = dataset.index;
    let data         = {};

    data[compid+'.content.data['+index+'].replyImg'] = '';
    pageInstance.setData(data);
  },
  bbsPublishComment: function (event) {
    let dataset      = event.currentTarget.dataset;
    let _this        = this;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let bbsData      = pageInstance.data[compid];
    let comment      = bbsData.comment;
    let param;

    if (!comment.text || !comment.text.trim()) {
      this.showModal({
        content: '请输入评论内容'
      })
      return;
    }

    comment.text = encodeURIComponent(comment.text);

    delete comment.showReply;
    comment.addTime = util.formatTime();

    param = {};
    param.nickname = _this.globalData.userInfo.nickname;
    param.cover_thumb = _this.globalData.userInfo.cover_thumb;
    param.user_token = _this.globalData.userInfo.user_token;
    param.page_url = pageInstance.page_router;
    param.content = comment;
    param.rel_obj = '';
    if (bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false') {
      if (pageInstance.page_form && pageInstance.page_form != 'none') {
        param.rel_obj = pageInstance.page_form + '_' + pageInstance.dataId;
      } else {
        param.rel_obj = pageInstance.page_router;
      }
    } else {
      param.rel_obj = _this.getAppId();
    }

    this.sendRequest({
      url: '/index.php?r=AppData/addData',
      method: 'post',
      data: {
        form: 'bbs',
        form_data: param
      },
      success: function (res) {
        let commentList = pageInstance.data[compid].content.data || [],
            newdata = {};

        param.id = res.data;
        param.content.text = decodeURIComponent(param.content.text)
        newdata[compid+'.content.data'] = [{
          form_data: param,
          count_num: 0
        }].concat(commentList);
        let count = '';
        if (+pageInstance.data[compid].content.count + 1 <= 99){
          count = +pageInstance.data[compid].content.count + 1
        }else if (+pageInstance.data[compid].content.count + 1 > 99) {
          count = '99+'
        } else if (+pageInstance.data[compid].content.count + 1 > 999) {
          count = '999+'
        } else if (+pageInstance.data[compid].content.count + 1 > 10000) {
          count = '1w+'
        }
        newdata[compid + '.content.count'] = count;
        newdata[compid+'.comment'] = {};
        newdata[compid + '.isShowReplyDialog'] = false;
        newdata[compid + '.bbsFocus'] = false;
        newdata[compid + '.replyIndex'] = 'undefined';
        pageInstance.setData(newdata);
      }
    })
  },
  clickBbsReplyBtn: function (event) {
    let dataset      = event.currentTarget.dataset;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = dataset.index;
    let data         = {};
    data[compid+'.replyIndex'] = index;
    data[compid + '.bbsFocus'] = true;
    data[compid + '.isShowReplyDialog'] = true;
    pageInstance.setData(data);
  },
  bbsPublishReply: function (event) {
    let dataset      = event.currentTarget.dataset;
    let _this        = this;
    let pageInstance = this.getAppCurrentPage();
    let compid       = dataset.compid;
    let index        = pageInstance.data[compid].replyIndex;
    let bbsData      = pageInstance.data[compid];
    let form_data    = bbsData.content.data[index].form_data;
    let comment      = bbsData.comment;
    let param;
    if (!comment.text || !comment.text.trim()) {
      this.showModal({
        content: '请输入回复内容'
      })
      return;
    }

    comment.text = encodeURIComponent(comment.text);

    comment.addTime = util.formatTime();
    comment.reply = {
      nickname: form_data.nickname,
      text: form_data.content.text,
      img: form_data.content.img,
      user_token: form_data.user_token,
      reply: form_data.content.reply
    };

    param = {};
    param.nickname = _this.globalData.userInfo.nickname;
    param.cover_thumb = _this.globalData.userInfo.cover_thumb;
    param.user_token = _this.globalData.userInfo.user_token;
    param.page_url = pageInstance.page_router;
    param.content = comment;
    param.rel_obj = '';
    if (bbsData.customFeature.ifBindPage && bbsData.customFeature.ifBindPage !== 'false') {
      if (pageInstance.page_form && pageInstance.page_form != 'none') {
        param.rel_obj = pageInstance.page_form + '_' + pageInstance.dataId;
      } else {
        param.rel_obj = pageInstance.page_router;
      }
    } else {
      param.rel_obj = _this.getAppId();
    }

    this.sendRequest({
      url: '/index.php?r=AppData/addData',
      method: 'post',
      data: {
        form: 'bbs',
        form_data: param,
      },
      success: function(res){
        let commentList = pageInstance.data[compid].content.data || [],
            newdata = {};

        param.id = res.data;
        param.content.text = decodeURIComponent(param.content.text)
        if(commentList.length){
          delete commentList[index].replyText;
          delete commentList[index].showReply;
        }
        newdata[compid+'.content.data'] = [{
          form_data: param,
          count_num: 0
        }].concat(commentList);
        let count = '';
        if (+pageInstance.data[compid].content.count+1<=99){
          count = +pageInstance.data[compid].content.count + 1;
        }else if (+pageInstance.data[compid].content.count + 1 > 99) {
          count = '99+'
        } else if (+pageInstance.data[compid].content.count + 1 > 999) {
          count = '999+'
        } else if (+pageInstance.data[compid].content.count + 1 > 10000) {
          count = '1w+'
        }
        newdata[compid + '.content.count'] = count;
        newdata[compid+'.comment'] = {};
        newdata[compid + '.isShowReplyDialog'] = false;
        newdata[compid + '.bbsFocus'] = false;
        newdata[compid + '.replyIndex'] = 'undefined';
        pageInstance.setData(newdata);
      }
    })
  },
  showBbsReplyDialog: function(e){
    let compid = e.currentTarget.dataset.compid,
        pageInstance = this.getAppCurrentPage(),
        newdata = {};
    newdata[compid + '.isShowReplyDialog'] = true;
    newdata[compid +'.bbsFocus'] = true;
    pageInstance.setData(newdata);
  },
  hideBbsReplyDialog: function(e){
    let compid = e.currentTarget.dataset.compid,
      pageInstance = this.getAppCurrentPage(),
      newdata = {};
    newdata[compid + '.isShowReplyDialog'] = false;
    newdata[compid + '.bbsFocus'] = false;
    newdata[compid + '.replyIndex'] = 'undefined';
    pageInstance.setData(newdata);
  },
  searchList: function (event, scompid) {
    let pageInstance = this.getAppCurrentPage();
    let that         = this;
    let compid       = !scompid ? event.currentTarget.dataset.compid : event;
    let compData     = pageInstance.data[compid];
    let customFeature = compData.customFeature;
    let listid       = customFeature.searchObject.customFeature.id;
    let listType     = customFeature.searchObject.type;
    let form         = customFeature.searchObject.customFeature.form;
    let keyword      = pageInstance.keywordList[compid];
    let search_compid = '';
    let search_compData = {};
    let search_customFeature = {};
    let page         = '';

    if( scompid ){
      search_compid = scompid;
      search_compData = pageInstance.data[search_compid];
      search_customFeature = search_compData.customFeature;

      page = search_compData.curpage + 1;

      if(!search_compData.is_more && typeof event == 'object' && event.type == 'tap'){
        that.showModal({
          content: '已经加载到最后了'
        });
      }

      if (pageInstance.requesting || !search_compData.is_more) {
        return;
      }
      pageInstance.requesting = true;

    }else{

      page = 1;

      if(listType === 'list-vessel'){
        for (let index in pageInstance.list_compids_params) {
          let params = pageInstance.list_compids_params[index];
          if (params.param.id === listid) {
            search_compid = params.compid;
            form = params.param.form;
            break;
          }
        }
      }else if(listType === 'goods-list'){
        for (let index in pageInstance.goods_compids_params) {
          let params = pageInstance.goods_compids_params[index];
          if (params.param.id === listid) {
            search_compid = params.compid;
            form = params.param.form;
            break;
          }
        }
      }else if(listType === 'franchisee-list'){
        for (let index in pageInstance.franchiseeComps) {
          let params = pageInstance.franchiseeComps[index];
          if (params.param.id === listid) {
            search_compid = params.compid;
            form = params.param.form;
            break;
          }
        }
      }else if(listType === 'video-list'){
        for (let index in pageInstance.videoListComps) {
          let params = pageInstance.videoListComps[index];
          if (params.param.id === listid) {
            search_compid = params.compid;
            form = params.param.form;
            break;
          }
        }
      }

      search_compData = pageInstance.data[search_compid];
      search_customFeature = search_compData.customFeature;
    }


    let url = '/index.php?r=appData/search';
    let param = {
      "search":{
          "data":[{"_allkey":keyword,"form": form}],
          "app_id": that.getAppId()
        },
      page_size : 20,
      page: page
    };
    if(search_customFeature.vesselAutoheight == 1 && search_customFeature.loadingMethod == 1){
      param.page_size = search_customFeature.loadingNum || 20;
    }

    if(listType === 'franchisee-list'){
      let info = this.getLocationInfo();
      param.search.longitude = info.longitude;
      param.search.latitude = info.latitude;
    }

    this.sendRequest({
      url: url,
      data: param,
      success: function (res) {
        if(res.data.length == 0){
          setTimeout(function () {
            that.showModal({
              content: '没有找到与“'+keyword+'”相关的内容'
            });
          },0)
          return;
        }
        if (res.status == 0) {
          let newdata = {};
          if (listType === "goods-list") {
            newdata[search_compid + '.goods_data'] = page == 1 ? res.data : search_compData.goods_data.concat(res.data);
          } else if (listType === 'list-vessel') {
            for (let j in res.data) {
              for (let k in res.data[j].form_data) {
                if (k == 'category') {
                  continue;
                }
                if (/region/.test(k)) {
                  continue;
                }
                if (k == 'goods_model') {
                  let modelVP = [];
                  for (let l in res.data[j].form_data[k]) {
                    modelVP.push(res.data[j].form_data[k][l].virtual_price == '' ? 0 : Number(res.data[j].form_data[k][l].virtual_price))
                  }
                  if (Math.min(...modelVP) == Math.max(...modelVP)) {
                            
                    res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2)
                  }else{
                    res.data[j].form_data.virtual_price instanceof Object ? res.data[j].form_data.virtual_price[0].text = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2) : res.data[j].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);
                            
                  }
                }
                let description = res.data[j].form_data[k];

                if (that.needParseRichText(description)) {
                  res.data[j].form_data[k] = that.getWxParseResult(description);
                }
              }
            }
            newdata[search_compid + '.list_data'] = page == 1 ? res.data : search_compData.list_data.concat(res.data);
          } else if (listType === 'franchisee-list') {
            for(let index in res.data){
              let distance = res.data[index].distance;
              res.data[index].distance = util.formatDistance(distance);
            }
            newdata[search_compid + '.franchisee_data'] = page == 1 ? res.data : search_compData.franchisee_data.concat(res.data);
          }else if(listType == 'video-list'){
            let rdata = res.data;

            for (let i = 0; i < rdata.length; i++) {
              rdata[i].video_view = that.handlingNumber(rdata[i].video_view);
            }
            newdata[search_compid + '.video_data'] = page == 1 ? rdata : search_compData.video_data.concat(rdata);

          }

          newdata[search_compid + '.is_search'] = true;
          newdata[search_compid + '.searchEle'] = compid;
          newdata[search_compid + '.is_more']   = res.is_more;
          newdata[search_compid + '.curpage']   = res.current_page;

          pageInstance.setData(newdata);
        }
      },
      fail: function (err) {
        console.log(err);
      },
      complete: function () {
        setTimeout(function () {
          pageInstance.requesting = false;
        }, 300);
      }
    })
  },
  selectLocal: function (event) {
    let id           = event.currentTarget.dataset.id;
    let pageInstance = this.getAppCurrentPage();
    let newdata      = pageInstance.data;

    newdata[id].hidden = typeof(pageInstance.data[id].hidden) == undefined ? false : !pageInstance.data[id].hidden;
    newdata[id].provinces = ['请选择'];  newdata[id].citys =['请选择']; newdata[id].districts = ['请选择']
    newdata[id].provinces_ids =[null]; newdata[id].city_ids =[null]; newdata[id].district_ids = [null];
    for(let i in newdata[id].areaList){
      newdata[id].provinces.push(newdata[id].areaList[i].name);
      newdata[id].provinces_ids.push(newdata[id].areaList[i].region_id);
    }
    newdata[id].newlocal = '';
    pageInstance.setData(newdata);
  },
  cancelCity: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let id           = event.currentTarget.dataset.id;
    let newdata      = pageInstance.data;
    newdata[id].hidden = !pageInstance.data[id].hidden;
    newdata[id].province = '';
    newdata[id].city = '';
    newdata[id].district = '';
    pageInstance.setData(newdata);
  },
  bindCityChange: function (event) {
    let val          = event.detail.value;
    let id           = event.currentTarget.dataset.id;
    let pageInstance = this.getAppCurrentPage();
    let newdata      = pageInstance.data;
    let cityList     = newdata[id].areaList;
    if(!newdata[id].newlocal){
      if(newdata[id].value[0] == val[0]){
        newdata[id].province = pageInstance.data[id].provinces[val[0]] == '请选择' ? '' : pageInstance.data[id].provinces[val[0]];
        newdata[id].citys = newdata[id].province == '' ? ['请选择'] : this._getCityList(cityList[val[0] - 1].cities);
        newdata[id].city_ids = newdata[id].province == '' ? [null] : this._getCityList(cityList[val[0] - 1].cities, 1);
        newdata[id].city = newdata[id].province == '' ? '' : newdata[id].citys[val[1]];
        newdata[id].districts = newdata[id].city == '' ? ['请选择'] : this._getCityList(cityList[val[0] - 1].cities[val[1]].towns);
        newdata[id].district_ids = newdata[id].city == '' ? [null] : this._getCityList(cityList[val[0] - 1].cities[val[1]].towns, 1);
        newdata[id].region_id = newdata[id].district_ids[val[2]];
        newdata[id].district = newdata[id].city == '' ? '' : newdata[id].districts[val[2]];
        newdata[id].value = val;
      }else{
        newdata[id].province = pageInstance.data[id].provinces[val[0]] == '请选择' ? '' : pageInstance.data[id].provinces[val[0]];
        newdata[id].citys = newdata[id].province == '' ? ['请选择'] : this._getCityList(cityList[val[0] - 1].cities);
        newdata[id].city_ids = newdata[id].province == '' ? [null] : this._getCityList(cityList[val[0] - 1].cities, 1);
        newdata[id].city = newdata[id].province == '' ? '' : newdata[id].citys[0];
        newdata[id].districts = newdata[id].city == '' ? ['请选择'] : this._getCityList(cityList[val[0] - 1].cities[0].towns);
        newdata[id].district_ids = newdata[id].city == '' ? [null] : this._getCityList(cityList[val[0] - 1].cities[0].towns, 1);
        newdata[id].region_id = newdata[id].district_ids[val[2]];
        newdata[id].district = newdata[id].city == '' ? '' : newdata[id].districts[val[2]];
        newdata[id].value = val;
      }
      pageInstance.setData(newdata)
    }
  },
  _getCityList:function (province, id) {
    let cityList = [];
    let cityList_id = [];
    for(let i in province){
      if(typeof(province[i]) == 'object'){
        cityList.push(province[i].name)
        cityList_id.push(province[i].region_id);
      }else{
        cityList[1] = province.name;
        cityList_id[1]=province.region_id;
      }
    }
    if(id){
      return cityList_id;
    }else{
      return cityList;
    }
  },
  submitCity: function (event) {
    let id = event.currentTarget.dataset.id;
    let pageInstance = this.getAppCurrentPage();
    let newdata = pageInstance.data;
    if (!newdata[id].districts) {
      this.showModal({content: '您未选择城市!'});
      newdata[id].province = '';
      newdata[id].city = '';
      newdata[id].district = '';
    } else {
      newdata[id].hidden = !pageInstance.data[id].hidden;
      newdata[id].newlocal = newdata[id].province + ' ' + newdata[id].city + ' ' +      newdata[id].district;
      newdata[id].value = [0,0,0];
      this._citylocationList(event.currentTarget.dataset, newdata[id].region_id);
    }
    pageInstance.setData(newdata);
  },
  _citylocationList: function (dataset, region_id) {
    let compid       = dataset.id;
    let listid       = dataset.listid;
    let listType     = dataset.listtype;
    let form         = dataset.form;
    let index        = '';
    let targetList   = '';
    let that         = this;
    let pageInstance = this.getAppCurrentPage();

    if (listType === 'list-vessel') {
      for (index in pageInstance.list_compids_params) {
        if (pageInstance.list_compids_params[index].param.id === listid) {
          pageInstance.list_compids_params[index].param.page = 1;
          targetList = pageInstance.list_compids_params[index];
          break;
        }
      }
    }

    if (listType === 'goods-list') {
      for (index in pageInstance.goods_compids_params) {
        if (pageInstance.goods_compids_params[index].param.id === listid) {
          pageInstance.goods_compids_params[index].param.page = 1;
          targetList = pageInstance.goods_compids_params[index];
          break;
        }
      }
    }

    if (listType === 'franchisee-list') {
      for (index in pageInstance.franchiseeComps) {
        if (pageInstance.franchiseeComps[index].param.id === listid) {
          pageInstance.franchiseeComps[index].param.page = 1;
          targetList = pageInstance.franchiseeComps[index];
          break;
        }
      }
    }
    let url = '/index.php?r=AppData/GetFormDataList&idx_arr[idx]=region_id&idx_arr[idx_value]='+region_id+'&extra_cond_arr[latitude]='+this.globalData.locationInfo.latitude+'&extra_cond_arr[longitude]='+this.globalData.locationInfo.longitude + '&extra_cond_arr[county_id]='+region_id,
        param = {'form':form};
    this.sendRequest({
      url: url,
      data: param,
      success: function (res) {
        if(res.data.length == 0){
          setTimeout(function () {
            that.showModal({
              content: '没有找到与所选区域的相关的内容'
            });
          },0)
          return;
        }
        if (res.status == 0) {
          let newdata = {};

          if (listType === "goods-list") {
            newdata[targetList.compid + '.goods_data'] = res.data;
          } else if (listType === 'list-vessel') {
            if(param.form !== 'form'){
              for (let j in res.data) {
                for (let k in res.data[j].form_data) {
                  if (k == 'category') {
                    continue;
                  }
                  if(/region/.test(k)){
                    continue;
                  }

                  let description = res.data[j].form_data[k];

                  if (that.needParseRichText(description)) {
                    res.data[j].form_data[k] = that.getWxParseResult(description);
                  }
                }
              }
            }
            newdata[targetList.compid + '.list_data'] = res.data;
          } else if (listType === 'franchisee-list') {
            for(let index in res.data){
              let distance = res.data[index].distance;
              res.data[index].distance = util.formatDistance(distance);
            }
            newdata[targetList.compid + '.franchisee_data'] = res.data;
          }

          newdata[targetList.compid + '.is_more']   = res.is_more;
          newdata[targetList.compid + '.curpage']   = 1;

          pageInstance.setData(newdata);
        }
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  openTakeoutLocation: function (event) {
    let dataset = event.currentTarget.dataset;
    this.openLocation({
      latitude: +dataset.lat,
      longitude: +dataset.lng,
      name: dataset.name,
      address: dataset.address
    })
  },
  callTakeout: function (event) {
    let phone = event.currentTarget.dataset.phone;
    this.makePhoneCall(phone);
  },
  getMoreAssess: function (event) {
    let dataset      = event.currentTarget.dataset;
    let page         = dataset.nextpage;
    let compid       = dataset.compid;
    let pageInstance = this.getAppCurrentPage();
    let newdata      = pageInstance.data;
    let assessIndex  = newdata[compid].assessActive;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppShop/getAssessList',
      method: 'post',
      data: {
        idx_arr: {
          idx: 'goods_type',
          idx_value: 2
        },
        page: page,
        page_size: 10,
        obj_name: 'app_id'
      },
      success: function (res) {
        for(let i in res.data){
          newdata[compid].assessList.push(res.data[i]);
        }
        let commentNums = [],
            showAssess = [],
            hasImgAssessList = 0,
            goodAssess = 0,
            normalAssess = 0,
            badAssess = 0;
        for (let i = 0; i < newdata[compid].assessList.length; i++) {
          newdata[compid].assessList[i].assess_info.has_img == 1 ? hasImgAssessList++ : null;
          newdata[compid].assessList[i].assess_info.level == 3 ? goodAssess++ : (newdata[compid].assessList[i].assess_info.level == 1 ? badAssess++ : normalAssess++)
          if (newdata[compid].assessList[i].assess_info.has_img == 1 && newdata[compid].assessActive == 0) {
            showAssess.push(newdata[compid].assessList[i]);
          } else if (newdata[compid].assessList[i].assess_info.level == 3 && newdata[compid].assessActive == 1) {
            showAssess.push(newdata[compid].assessList[i]);
          } else if (newdata[compid].assessList[i].assess_info.level == 1 && newdata[compid].assessActive == 3) {
            showAssess.push(newdata[compid].assessList[i]);
          } else if (newdata[compid].assessList[i].assess_info.level == 2 && newdata[compid].assessActive == 2) {
            showAssess.push(newdata[compid].assessList[i]);
          }
        }
        commentNums = [hasImgAssessList, goodAssess, normalAssess, badAssess]
        newdata[compid].commentNums = commentNums;
        newdata[compid].assessCurrentPage = page;
        newdata[compid].showAssess = showAssess;
        newdata[compid].moreAssess = res.is_more;
        pageInstance.setData(newdata);
      }
    })
  },
  changeEvaluate: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let newdata = {};
    let compid = event.currentTarget.dataset.compid;
    if (event.currentTarget.dataset.index == 2 && !pageInstance.hasRequireAssess && /tostore/.test(compid)) {
      pageInstance.hasRequireAssess = true;
      this._getAssessList(pageInstance, compid);
    }
    newdata[compid + '.selected'] = event.currentTarget.dataset.index;
    pageInstance.setData(newdata);
  },
  _getAssessList: function(pageInstance, compid){
    this.sendRequest({
      hideLoading: true,   // 页面第一个请求才展示loading
      url: '/index.php?r=AppShop/getAssessList&idx_arr[idx]=goods_type&idx_arr[idx_value]=3',
      data: { page: 1, page_size: 10, obj_name: 'app_id' },
      success: function (res) {
        let newdata = {},
          showAssess = [],
          hasImgAssessList = 0,
          goodAssess = 0,
          normalAssess = 0,
          badAssess = 0;
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].assess_info.has_img == 1 ? (hasImgAssessList++ , showAssess.push(res.data[i])) : null;
          res.data[i].assess_info.level == 3 ? goodAssess++ : (res.data[i].assess_info.level == 1 ? badAssess++ : normalAssess++ )
        }
        for (let j = 0; j < res.num.length;j++) {
          res.num[j] = parseInt(res.num[j])
        }
        newdata[compid + '.assessActive'] = 0;
        newdata[compid + '.assessList'] = res.data;
        newdata[compid + '.showAssess'] = showAssess;
        newdata[compid + '.assessNum'] = res.num;
        newdata[compid + '.moreAssess'] = res.is_more;
        newdata[compid + '.assessCurrentPage'] = res.current_page;
        pageInstance.setData(newdata);
      }
    })
  },
  deleteAllCarts: function (event) {
    let compid          = event.currentTarget.dataset.compid;
    let pageInstance    = this.getAppCurrentPage();
    let data            = pageInstance.data;
    let newdata         = {};
    let cartList        = data[compid].cartList;
    let that            = this;
    let goods_data_list = data[compid].goods_data_list;
    let goods_model_list= data[compid].goods_model_list;
    let cartIds         = [];
    for (let i in cartList) {
      for (let j in cartList[i]){
        cartIds.push(cartList[i][j].cart_id)
      }
    }
    if (cartIds.length == 0) {
      this.showModal({
        content: '请先添加商品'
      });
      return;
    }
    this.sendRequest({
      url: '/index.php?r=AppShop/deleteCart',
      method: 'post',
      data: {
        cart_id_arr: cartIds
      },
      success: function (res) {
        newdata[compid + '.cartList'] = {};
        for(let i in goods_data_list){
          goods_data_list[i].totalNum = 0;
        }
        for(let i in goods_model_list){
          for(let j in goods_model_list[i].goods_model){
            goods_model_list[i].goods_model[j].totalNum = 0
          }
        }
        newdata[compid + '.goods_model_list'] = goods_model_list;
        newdata[compid + '.goods_data_list'] = goods_data_list;
        newdata[compid + '.TotalNum'] = 0;
        newdata[compid + '.TotalPrice'] = 0;
        newdata[compid + '.shoppingCartShow'] = true;
        pageInstance.setData(newdata);
      },
      fail: function () {
        that.showModal({
          content: '修改失败'
        })
      }
    });
  },
  clickCategory: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let index        = dataset.index;
    let id           = dataset.id;
    let newdata      = {};
    let param        = dataset.param;
    if (!pageInstance.data[compid].show_goods_data['category'+id]) {
      this._getTakeoutStyleGoodsList(param, pageInstance, compid, 0);
    }
    newdata[compid +'.customFeature.selected'] = index;
    pageInstance.setData(newdata);
  },
  goodsListPlus: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.target.dataset;
    let data         = pageInstance.data;
    let goodsid      = dataset.goodsid;
    let compid       = dataset.compid;
    let model        = dataset.model;
    let goodsInfo    = data[compid].goods_data_list['goods'+goodsid];
    let totalNum     = data[compid].TotalNum;
    let totalPrice   = +data[compid].TotalPrice;
    let is_in_business = dataset.isInBusiness;
    let modelLength  = [];
    let newdata      = {};
    let that         = this;
    newdata[compid + '.modelPrice'] = 0;
    
    if (!data[compid].in_business_time) {
      this.showModal({ content: '店铺休息中,暂时无法接单' })
      return;
    }
    if (/waimai/.test(compid)) {
      if (!data[compid].in_distance) {
        this.showModal({ content: '不在配送范围内' })
        return;
      }
    }
    if (is_in_business == 0){
      this.showModal({ content: '该商品不在出售时间' })
      return;
    }
    if (model) {
      newdata[compid + '.goodsModelShow'] = true;
      newdata[compid + '.modalTakeoutHasSelectedId'] = goodsid;
      newdata[compid + '.modelChooseId'] = [];
      pageInstance.setData(newdata);
    } else {
      newdata[compid + '.goods_data_list.goods'+goodsid] = goodsInfo;
      newdata[compid + '.cartList.goods' + goodsid] = data[compid].cartList['goods' + goodsid] || {};
      if (goodsInfo.totalNum >= goodsInfo.stock){
        this.showModal({ content: '该商品库存不足'});
        return;
      }
      if (data[compid].is_disabled) {return}
      newdata[compid + '.is_disabled'] = true;
      pageInstance.setData(newdata);
      let newNum = goodsInfo.totalNum + 1
      this._changeOrderCount(goodsid, newNum, undefined, function(cart_id){

        newdata[compid + '.TotalNum'] = +totalNum + 1;
        newdata[compid + '.TotalPrice'] = +(Number(+totalPrice + +goodsInfo.price).toFixed(2));
        newdata[compid + '.goods_data_list.goods'+goodsid].totalNum ++;
        if (newdata[compid + '.cartList.goods' + goodsid][0]) {
          newdata[compid + '.cartList.goods' + goodsid][0].cart_id = cart_id;
          newdata[compid + '.cartList.goods' + goodsid][0].num ++
          newdata[compid + '.cartList.goods' + goodsid][0].totalPrice = +(Number(newdata[compid + '.cartList.goods'+goodsid][0].num * goodsInfo.price).toFixed(2))
        } else {
          newdata[compid + '.cartList.goods' + goodsid][0] = {
            modelId: 0,
            num: newNum,
            price: goodsInfo.price,
            gooodsName: goodsInfo.name,
            totalPrice: +((newNum * goodsInfo.price).toFixed(2)),
            stock: goodsInfo.stock ,
            cart_id: cart_id
          };
        }
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      }, function () {
        let newdata = {};
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      });
    }
  },
  goodsListMinus: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let data         = pageInstance.data;
    let dataset      = event.target.dataset;
    let goodsid      = dataset.goodsid;
    let compid       = dataset.compid;
    let that         = this;
    let totalNum     = +data[compid].TotalNum;
    let totalPrice   = +data[compid].TotalPrice;
    let newdata      = {};
    let model        = dataset.model;
    if (model) {
      this.showModal({
        content: '多规格商品只能去购物车操作',
      });
      return;
    }
    if (pageInstance.data[compid].is_disabled || totalNum == 0) {return}
    newdata[compid + '.is_disabled'] = true;
    pageInstance.setData(newdata);
    newdata[compid + '.goods_data_list.goods'+goodsid] = data[compid].goods_data_list['goods' + goodsid];
    newdata[compid + '.cartList.goods' + goodsid] = data[compid].cartList['goods' + goodsid];
    if (newdata[compid + '.goods_data_list.goods'+goodsid].totalNum == 1) {
      this._removeFromCart(newdata[compid + '.cartList.goods' + goodsid][0].cart_id, function () {
        newdata[compid + '.TotalNum']  = --totalNum;
        newdata[compid + '.TotalPrice'] = +((+totalPrice - Number(newdata[compid + '.goods_data_list.goods'+goodsid].price)).toFixed(2))
        newdata[compid + '.goods_data_list.goods'+goodsid].totalNum = 0;
        newdata[compid + '.cartList.goods' + goodsid][0].num = 0;
        newdata[compid + '.cartList.goods' + goodsid][0].totalPrice = 0;
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      }, function () {
        let newdata = {};
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      });
    } else if (newdata[compid + '.goods_data_list.goods'+goodsid].totalNum > 1) {
      this._changeOrderCount(goodsid, newdata[compid + '.cartList.goods' + goodsid][0].num - 1, undefined, function(cart_id){
        newdata[compid + '.TotalNum']  = --totalNum;
        newdata[compid + '.TotalPrice'] = +((+totalPrice - Number(newdata[compid + '.goods_data_list.goods'+goodsid].price)).toFixed(2));
        newdata[compid + '.goods_data_list.goods'+goodsid].totalNum--;
        newdata[compid + '.cartList.goods' + goodsid][0].num--;
        newdata[compid + '.cartList.goods' + goodsid][0].totalPrice = +(Number(newdata[compid + '.cartList.goods' + goodsid][0].num * newdata[compid + '.cartList.goods' + goodsid][0].price).toFixed(2));
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      }, function () {
        let newdata = {};
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      })
    }
  },
  cartListPlus: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let data         = pageInstance.data;
    let newdata      = {};
    let dataset      = event.currentTarget.dataset;
    let goodsid      = dataset.goodsid;
    let modelid      = dataset.modelid;
    let num          = dataset.num;
    let stock        = dataset.stock;
    let that         = this;
    let compid       = dataset.compid;
    if (data[compid].is_disabled) {return}
    if (num == stock){
      this.showModal({ content: '该商品库存不足' });
      return;
    }
    newdata[compid + '.is_disabled'] = true;
    pageInstance.setData(newdata)
    newdata[compid + '.goods_data_list.'+goodsid] = data[compid].goods_data_list[goodsid]
    newdata[compid + '.cartList.' + goodsid] = data[compid].cartList[goodsid];
    newdata[compid + '.goods_model_list.' + goodsid] = data[compid].goods_model_list[ goodsid];
    if (+modelid) {
      this._changeOrderCount(goodsid, newdata[compid + '.cartList.' + goodsid][modelid].num + 1, modelid, function (cart_id) {
        newdata[compid + '.TotalNum'] = data[compid].TotalNum + 1;
        newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) + Number(data[compid].cartList[goodsid][modelid].price)).toFixed(2));
        newdata[compid + '.goods_data_list.'+goodsid].totalNum = ++data[compid].goods_data_list[goodsid].totalNum
        newdata[compid + '.cartList.' + goodsid][modelid].num = ++data[compid].cartList[goodsid][modelid].num;
        newdata[compid + '.cartList.' + goodsid][modelid].totalPrice = +(Number(newdata[compid + '.cartList.' + goodsid][modelid].num * data[compid].cartList[goodsid][modelid].price).toFixed(2));
        newdata[compid + '.cartList.' + goodsid][modelid].cart_id = cart_id;
        newdata[compid + '.goods_model_list.' + goodsid].goods_model[modelid].totalNum ++;
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      }, function (res) {
        let newdata = {};
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      });
    } else {
      this._changeOrderCount(goodsid, newdata[compid + '.goods_data_list.'+goodsid].totalNum + 1, undefined, function(cart_id){
        newdata[compid + '.TotalNum'] = data[compid].TotalNum + 1;
        newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) + Number(data[compid].cartList[goodsid][modelid].price)).toFixed(2));
        newdata[compid + '.goods_data_list.'+goodsid].totalNum = ++data[compid].goods_data_list[goodsid].totalNum
        newdata[compid + '.cartList.' + goodsid][0].cart_id = cart_id;
        newdata[compid + '.cartList.' + goodsid][0].num = newdata[compid + '.goods_data_list.'+goodsid].totalNum;
        newdata[compid + '.cartList.' + goodsid][0].totalPrice = +(Number(newdata[compid + '.goods_data_list.'+goodsid].totalNum * newdata[compid + '.cartList.' + goodsid][0].price).toFixed(2));
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      }, function (res) {
        let newdata = {};
        newdata[compid + '.is_disabled'] = false;
        pageInstance.setData(newdata);
      });
    }
  },
  cartListMinus: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let data         = pageInstance.data;
    let newdata      = {};
    let compid       = dataset.compid;
    let goodsid      = dataset.goodsid;
    let price        = dataset.price;
    let num          = dataset.num;
    let cart_id      = dataset.cartid;
    let modelid      = dataset.modelid;
    if (data[compid].cartList[goodsid][modelid].num == 0) {
      return;
    }
    if (data[compid].is_disabled) {return}
    newdata[compid + '.is_disabled'] = true;
    pageInstance.setData(newdata)
    newdata[compid + '.cartList.' + goodsid] = data[compid].cartList[goodsid];
    newdata[compid + '.goods_data_list.'+goodsid] = data[compid].goods_data_list[goodsid];
    newdata[compid + '.goods_model_list.' + goodsid] = data[compid].goods_model_list[goodsid];
    let newNum = num - 1;
    if (modelid != 0) {
      if (newdata[compid + '.cartList.' + goodsid][modelid].num == 1) {
        this._removeFromCart(cart_id, function () {
          newdata[compid + '.TotalNum'] = --data[compid].TotalNum;
          newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) - Number(price)).toFixed(2));
          newdata[compid + '.cartList.' + goodsid][modelid].num = 0;
          newdata[compid + '.cartList.' + goodsid][modelid].totalPrice = +(Number(price * newdata[compid + '.cartList.' + goodsid][modelid].num).toFixed(2));
          newdata[compid + '.goods_data_list.'+goodsid].totalNum--;
          newdata[compid + '.goods_model_list.' + goodsid].goods_model[modelid].totalNum = 0;
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        }, function () {
          let newdata = {};
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        })
      } else if(newdata[compid + '.cartList.' + goodsid][modelid].num > 1) {
        this._changeOrderCount(goodsid, newNum, modelid, function (cart_id) {
          newdata[compid + '.TotalNum'] = --data[compid].TotalNum;
          newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) - Number(price)).toFixed(2));
          newdata[compid + '.cartList.' + goodsid][modelid].num--;
          newdata[compid + '.cartList.' + goodsid][modelid].totalPrice = +(Number(price * newdata[compid + '.cartList.' + goodsid][modelid].num).toFixed(2));
          newdata[compid + '.goods_data_list.'+goodsid].totalNum--;
          newdata[compid + '.goods_model_list.' + goodsid].goods_model[modelid].totalNum--
          newdata[compid + '.cartList.' + goodsid][modelid].cart_id = cart_id;
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        }, function () {
          let newdata = {};
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        })
      }
    } else {
      if (newdata[compid + '.cartList.' + goodsid][modelid].num == 1) {
        this._removeFromCart(cart_id, function () {
          newdata[compid + '.TotalNum'] = --data[compid].TotalNum;
          newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) - Number(price)).toFixed(2));
          newdata[compid + '.cartList.' + goodsid][modelid].num--;
          newdata[compid + '.cartList.' + goodsid][modelid].totalPrice = +(Number(price * newdata[compid + '.cartList.' + goodsid][modelid].num).toFixed(2));
          newdata[compid + '.goods_data_list.'+goodsid].totalNum--;
          newdata[compid + '.goods_model_list.'+goodsid][0].num = 0
          newdata[compid + '.cartList.' + goodsid][modelid].cart_id = cart_id;
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        }, function () {
          let newdata ={};
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        })
      } else if(newdata[compid + '.cartList.' + goodsid][modelid].num > 1) {
        this._changeOrderCount(goodsid, newNum, undefined, function(cart_id){
          newdata[compid + '.TotalNum'] = --data[compid].TotalNum;
          newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) - Number(price)).toFixed(2));
          newdata[compid + '.cartList.' + goodsid][modelid].num--;
          newdata[compid + '.cartList.' + goodsid][modelid].totalPrice = +(Number(price * newdata[compid + '.cartList.' + goodsid][modelid].num).toFixed(2));
          newdata[compid + '.goods_data_list.'+goodsid].totalNum--;
          newdata[compid + '.goods_model_list.'+goodsid][0].num--
          newdata[compid + '.cartList.' + goodsid][modelid].cart_id = cart_id;
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        }, function () {
          let newdata = {};
          newdata[compid + '.is_disabled'] = false;
          pageInstance.setData(newdata);
        })
      }
    }
  },
  _removeFromCart: function (cart_id, callback, failCallback) {
    let that = this;
    this.sendRequest({
      url: '/index.php?r=AppShop/deleteCart',
      method: 'post',
      data: {
        cart_id_arr: [cart_id],
      },
      hideLoading:true,
      success: function (res) {
        callback && callback() 
      },
      fail: function (res) {
        failCallback && failCallback()
        that.showModal({
          content: '清空购物车失败'
        })
      }
    });
  },
  _changeOrderCount: function (id, num, modelid, callback, failCallback) {
    let that = this;
    this.sendRequest({
      url: '/index.php?r=AppShop/addCart',
      data: {
        goods_id: id.toString().replace('goods', ''),
        num: num,
        model_id: modelid || 0,
      },
      hideLoading: true,
      success: function (res) {
        callback && callback(res.data);
      },
      fail: function (res) {
        failCallback && failCallback();
        that.showModal({
          content: res.data
        })
      }
    });
  },
  changeAssessType: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let newdata      = pageInstance.data;
    let assessActive = event.currentTarget.dataset.active;
    let showAssess   = [];
    let compid       = event.currentTarget.dataset.compid;
    newdata[compid].assessActive = assessActive;
    for (let i = 0; i < newdata[compid].assessList.length; i++) {
      if (assessActive == 0) {
        newdata[compid].assessList[i].assess_info.has_img == 1 ? showAssess.push(newdata[compid].assessList[i]) : null;
      } else if (newdata[compid].assessList[i].assess_info.level == assessActive) {
        showAssess.push(newdata[compid].assessList[i]);
      }
    }
    newdata[compid].showAssess = showAssess;
    pageInstance.setData(newdata)
  },
  showShoppingCartPop: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let newdata      = {};
    newdata[compid + '.shoppingCartShow'] = true;
    pageInstance.setData(newdata);
  },
  hideShoppingCart: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let newdata      = {};
    newdata[compid + '.shoppingCartShow'] = false;
    pageInstance.setData(newdata);
  },
  showGoodsDetail: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let data         = pageInstance.data;
    let dataset      = event.currentTarget.dataset;
    let newdata      = {};
    let id           = dataset.id;
    let index        = dataset.index;
    let compid       = dataset.compid;
    let category     = dataset.category;
    if (/tostore/.test(compid)) {
      let businessTime = data[compid].show_goods_data['category' + category][index].business_time.business_time;
      if(businessTime){
        let business_time = '';
        for (let key in businessTime){
          business_time += businessTime[key].start_time.slice(0, 2) + ':' + businessTime[key].start_time.slice(2, 4) + '-' + businessTime[key].end_time.slice(0, 2) + ':' + businessTime[key].end_time.slice(2, 4) + ' ';
        }
        data[compid].show_goods_data['category' + category][index].businessTime = business_time;
      }
      data[compid].show_goods_data['category' + category][index].description = this.getWxParseResult(data[compid].show_goods_data['category' + category][index].description)
    }
    newdata[compid + '.goodsDetailShow'] = true;
    newdata[compid + '.goodsDetail'] = data[compid].show_goods_data['category'+category][index];
    pageInstance.setData(newdata)
  },
  hideDetailPop: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let newdata      = {};
    newdata[compid + '.goodsDetailShow'] = false;
    pageInstance.setData(newdata);
  },
  hideModelPop: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let compid       = dataset.compid;
    let newdata      = {};
    newdata[compid + '.goodsModelShow'] = false;
    newdata[compid + '.modelPrice'] = 0;
    newdata[compid + '.modelChoose'] = [];
    newdata[compid + '.modelChooseId'] = [];
    pageInstance.modelChoose = [];
    pageInstance.modelChooseId = '';
    pageInstance.setData(newdata);
  },
  chooseModel: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let parentIndex  = dataset.parentindex;
    let index        = dataset.index;
    let compid       = dataset.compid;
    let goodsid      = dataset.goodsid;
    let data         = pageInstance.data;
    let newdata      = {};
    data[compid].modelChoose[parentIndex] = data[compid].goods_model_list['goods'+goodsid].modelData[parentIndex].subModelName[index]
    data[compid].modelChooseId[parentIndex] = data[compid].goods_model_list['goods' + goodsid].modelData[parentIndex].subModelId[index]
    newdata[compid + '.modelChoose'] = data[compid].modelChoose;
    pageInstance.modelChoose[parentIndex] = data[compid].goods_model_list['goods'+goodsid].modelData[parentIndex].subModelId[index];
    newdata[compid + '.modelChooseId'] = [].concat(pageInstance.modelChoose);
    pageInstance.setData(newdata);
    this._ModelPirce(dataset, pageInstance.modelChoose.concat());
  },
  _ModelPirce: function (dataset, modelNameArr) {
    let pageInstance = this.getAppCurrentPage(),
        data = pageInstance.data,
        newdata = {},
        compid = dataset.compid,
        index = dataset.index,
        goods_model = data[compid].goods_model_list['goods'+dataset.goodsid].goods_model,
        price = '';
    pageInstance.modelChooseName[dataset.parentindex] = dataset.modelname;
    for(let j = 0; j<pageInstance.modelChoose.length; j++){
      if (!pageInstance.modelChoose[j]){pageInstance.modelChoose[j] = ''}
    }
    for(let i in goods_model){
      if (goods_model[i].model.split(',').sort().join(',') == modelNameArr.sort().join(',')) {
        pageInstance.modelChooseId = i;
        newdata[compid + '.modelPrice'] = goods_model[i].price;
      }
    }
    pageInstance.setData(newdata)
  },
  sureChooseModel: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let data         = pageInstance.data;
    let newdata      = {};
    let compid       = dataset.compid;
    let goodsid      = data[compid].modalTakeoutHasSelectedId;
    let price        = +data[compid].modelPrice;
    let thisModelInfo = data[compid].goods_model_list['goods'+goodsid].goods_model[pageInstance.modelChooseId];
    if (!data[compid].modelPrice) {
      this.showModal({
        content: '请选择规格'
      });
      return;
    }
    if (thisModelInfo.stock <= thisModelInfo.totalNum) {
      this.showModal({
        content: '该规格库存不足'
      });
      return
    }
    let goods_num = thisModelInfo.totalNum + 1;
    newdata[compid + '.goods_data_list.goods'+goodsid] = data[compid].goods_data_list['goods'+goodsid];
    newdata[compid + '.goods_data_list.goods'+goodsid].totalNum = data[compid].goods_data_list['goods'+goodsid].totalNum + 1;
    newdata[compid + '.goods_data_list.goods'+goodsid].goods_model[pageInstance.modelChooseId] = thisModelInfo
    newdata[compid + '.goods_data_list.goods'+goodsid].goods_model[pageInstance.modelChooseId].totalNum++
    newdata[compid + '.TotalPrice'] = +((Number(data[compid].TotalPrice) + Number(price)).toFixed(2));
    newdata[compid + '.TotalNum'] = ++data[compid].TotalNum;
    newdata[compid + '.goodsModelShow'] = false;
    newdata[compid + '.modelPrice'] = 0;
    newdata[compid + '.cartList.goods'+ goodsid] = data[compid].cartList['goods'+ goodsid] || {};
    this._changeOrderCount(goodsid, goods_num, pageInstance.modelChooseId, function (cart_id) {
      newdata[compid + '.cartList.goods'+ goodsid][pageInstance.modelChooseId] = {
        modelName : pageInstance.modelChooseName.join(' | '),
        modelId: pageInstance.modelChooseId,
        num: goods_num,
        price: price,
        gooodsName: data[compid].goods_data_list['goods'+goodsid].name,
        totalPrice: +((data[compid].goods_model_list['goods'+goodsid].goods_model[pageInstance.modelChooseId].totalNum * price).toFixed(2)),
        stock: data[compid].goods_model_list['goods'+goodsid].goods_model[pageInstance.modelChooseId].stock,
        cart_id: cart_id
      } 
      newdata[compid + '.is_disabled'] = false;
      newdata[compid + '.modelPrice'] = 0;
      newdata[compid + '.modelChoose'] = [];
      pageInstance.setData(newdata);
      pageInstance.modelChoose = [];
      pageInstance.modelChooseId = '';
    }, function () {
      let data={};
      data[compid + '.is_disabled'] = false;
      pageInstance.setData(data);
    });
  },
  clickChooseComplete: function (event) {
    let pageInstance    = this.getAppCurrentPage();
    let compid          = event.target.dataset.compid;
    let newData         = pageInstance.data;
    let takeoutGoodsArr = newData[compid].cartList;
    let idArr           = [];
    if (!newData[compid].TotalNum) {
      return;
    }
    if (/waimai/.test(compid)) {
      if (+newData[compid].shopInfo.min_deliver_price > +newData[compid].TotalPrice) {
        this.showModal({
          content: '还没达到起送价哦'
        });
        return;
      }
    }
    for (let i in takeoutGoodsArr) {
      for (let j in takeoutGoodsArr[i]) {
        idArr.push(takeoutGoodsArr[i][j].cart_id)
      }
    }
    if (/waimai/.test(compid)) {
      this.turnToPage('/orderMeal/pages/previewTakeoutOrder/previewTakeoutOrder?cart_arr=' + idArr)
    }else if (/tostore/.test(compid)) {
      pageInstance.returnToVersionFlag = true;
      this.turnToPage('/orderMeal/pages/previewOrderDetail/previewOrderDetail?cart_arr=' + idArr)
    }
  },
  reLocalAddress: function (event) {
    let dataset = event.currentTarget.dataset;
    this.globalData.takeoutRefresh = true;
    this.globalData.takeoutAddressInfoByLatLng = dataset.latlng;
    this.turnToPage('/eCommerce/pages/searchAddress/searchAddress?from=takeout&locateAddress=' + dataset.address);
  },
  tapGoodsTradeHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let goods = JSON.parse(event.currentTarget.dataset.eventParams),
          goods_id = goods['goods_id'],
          goods_type = goods['goods_type'];
      if (!!goods_id) {
        goods_type == 3 ? this.turnToPage('/pages/toStoreDetail/toStoreDetail?detail=' + goods_id)
          : this.turnToPage('/pages/goodsDetail/goodsDetail?detail=' + goods_id);
      }
    }
  },
  tapVideoHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let video = JSON.parse(event.currentTarget.dataset.eventParams),
        video_id = video['video_id'];
      this.turnToPage('/video/pages/videoDetail/videoDetail?detail=' + video_id);
    }
  },
  tapVideoPlayHandler:function(event){
    let pageInstance  = this.getAppCurrentPage(),
        video = JSON.parse(event.currentTarget.dataset.eventParams),
        compid = video.compid,
        video_id = video['video_id'];
    this.sendRequest({
      url: '/index.php?r=AppVideo/GetVideoLibURL',
      method: 'get',
      data: {id:video_id},
      success: function (res) {
        let newdata ={}
        newdata[compid +'.videoUrl'] = res.data;
        pageInstance.setData(newdata);
      }
    })
  },
  tapInnerLinkHandler: function (event) {
    
    let param = event.currentTarget.dataset.eventParams,
        pageRoot = {
          'groupCenter': '/eCommerce/pages/groupCenter/groupCenter',
          'shoppingCart': '/eCommerce/pages/shoppingCart/shoppingCart',
          'myOrder': '/eCommerce/pages/myOrder/myOrder',
        };
    param = JSON.parse(param);
    let pageLink = param.inner_page_link;
    console.log(pageLink)
    wx.redirectTo({
      url: '/pages/answer/answer_simulate_tip/simulate_tip',
    })
    
    /*if (param) {
      param = JSON.parse(param);
      let pageLink = param.inner_page_link;
      let url = pageRoot[pageLink] ? pageRoot[pageLink] : '/pages/' + pageLink + '/' + pageLink ;
      if (url.indexOf('/prePage/') >= 0) {
        this.turnBack();
      } else if (url) {
        let is_redirect = param.is_redirect == 1 ? true : false;
        this.turnToPage(url, is_redirect);
      }
    }*/
  },

  tapToPluginHandler: function (event) {
    let param = event.currentTarget.dataset.eventParams;
    if (param) {
      param = JSON.parse(param);
      let url = param.plugin_page;
      if (url) {
        let is_redirect = param.is_redirect == 1 ? true : false;
        this.turnToPage(url, is_redirect);
      }
    }
  },
  tapPhoneCallHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let phone_num = JSON.parse(event.currentTarget.dataset.eventParams)['phone_num'];
      this.makePhoneCall(phone_num);
    }
  },
  tapNewClassifyShowSubClassify: function(event){
    let pageInstance = this.getAppCurrentPage();
    let compid       = event.currentTarget.dataset.compid;
    let compData     = pageInstance.data[compid];
    let index        = event.currentTarget.dataset.index;
    let newdata      = {};
    newdata[compid + '.selectedIndex'] = index;
    if (compData.selectedIndex === index){
      newdata[compid + '.showSubClassify'] = !compData.showSubClassify;
    } else {
      newdata[compid + '.showSubClassify'] = true;
    }
    pageInstance.setData(newdata);
  },
  tapNewClassifyRefreshHandler: function(event, componentId, categoryId){
    let pageInstance = this.getAppCurrentPage();
    let compid       = componentId || event.currentTarget.dataset.compid;
    let compData     = pageInstance.data[compid];
    let newData      = {};
    let eventParams  = {
      refresh_object: compData.customFeature.refresh_object,
      index_segment: 'category',
      index_value: categoryId === undefined ? event.currentTarget.dataset.categoryId : categoryId
    };
    if(event && event.currentTarget && event.currentTarget.dataset.index !== undefined){
      newData[compid + '.selectedIndex'] = event.currentTarget.dataset.index;
    }
    newData[compid + '.selectedCateId'] = eventParams.index_value;
    newData[compid + '.showSubClassify'] = false;
    pageInstance.setData(newData);
    this.tapRefreshListHandler(null, eventParams);
  },
  tapRefreshListHandler: function (event, params) {
    let pageInstance  = this.getAppCurrentPage();
    let eventParams   = params || JSON.parse(event.currentTarget.dataset.eventParams);
    let refreshObject = eventParams.refresh_object;
    let compids_params;
    if (eventParams.parent_type == 'classify') {
      var classify_selected_index = {};
      classify_selected_index[eventParams.parent_comp_id + '.customFeature.selected'] = eventParams.item_index;
      pageInstance.setData(classify_selected_index);
    }

    if ((compids_params = pageInstance.goods_compids_params).length) {
      for (let index in compids_params) {
        if (compids_params[index].param.id === refreshObject) {
          this._refreshPageList('goods-list', eventParams, compids_params[index], pageInstance);
          return;
        }
      }
    }
    if ((compids_params = pageInstance.list_compids_params).length) {
      for (let index in compids_params) {
        if (compids_params[index].param.id === refreshObject) {
          this._refreshPageList('list-vessel', eventParams, compids_params[index], pageInstance);
          return;
        }
      }
    }
    if ((compids_params = pageInstance.franchiseeComps).length) {
      for (let index in compids_params) {
        if (compids_params[index].param.id === refreshObject) {
          this._refreshPageList('franchisee-list', eventParams, compids_params[index], pageInstance);
          return;
        }
      }
    }
  },
  _refreshPageList: function (eleType, eventParams, compids_params, pageInstance) {
    let requestData = {
      page: 1,
      form: compids_params.param.form,
      is_count: compids_params.param.form.is_count ? 1 : 0,
      idx_arr: {
        idx: eventParams.index_segment,
        idx_value: eventParams.index_value
      }
    };

    compids_params.param.idx_arr = requestData.idx_arr;

    switch (eleType) {
      case 'goods-list': this._refreshGoodsList(compids_params['compid'], requestData, pageInstance); break;
      case 'list-vessel': this._refreshListVessel(compids_params['compid'], requestData, pageInstance); break;
      case 'franchisee-list': this._refreshFranchiseeList(compids_params['compid'], requestData, pageInstance); break;
    }
  },
  _refreshGoodsList: function (targetCompId, requestData, pageInstance) {
    let _this = this;

    this.sendRequest({
      url: '/index.php?r=AppShop/GetGoodsList',
      method: 'post',
      data: requestData,
      success: function(res){
        let newData = {};
        for (let i in res.data) {
          if (res.data[i].form_data.goods_model) {
            let modelVP = [];
            for (let j in res.data[i].form_data.goods_model) {
              modelVP.push(res.data[i].form_data.goods_model[j].virtual_price == '' ? 0 : Number(res.data[i].form_data.goods_model[j].virtual_price))
            }
            Math.min(...modelVP) == Math.max(...modelVP) ? res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) :
              res.data[i].form_data.virtual_price = Math.min(...modelVP).toFixed(2) + '~' + Math.max(...modelVP).toFixed(2);
          }
        }
        newData[targetCompId + '.goods_data'] = res.data;
        newData[targetCompId + '.is_more'] = res.is_more;
        newData[targetCompId + '.curpage'] = 1;
        newData[targetCompId + '.scrollTop'] = 0;
        pageInstance.setData(newData);
      }
    })
  },
  _refreshListVessel: function (targetCompId, requestData, pageInstance) {
    let _this = this;

    this.sendRequest({
      url: '/index.php?r=AppData/getFormDataList',
      method: 'post',
      data: requestData,
      success: function (res) {
        let newData = {};
        for (let j in res.data) {
          for (let k in res.data[j].form_data) {
            if (k == 'category') {
              continue;
            }
            if(/region/.test(k)){
              continue;
            }
            let description = res.data[j].form_data[k];

            if (_this.needParseRichText(description)) {
              res.data[j].form_data[k] = _this.getWxParseResult(description);
            }
          }
        }
        newData[targetCompId + '.list_data'] = res.data;
        newData[targetCompId + '.is_more'] = res.is_more;
        newData[targetCompId + '.curpage'] = 1;
        newData[targetCompId + '.scrollTop'] = 0;
        pageInstance.setData(newData);
      }
    })
  },
  _refreshFranchiseeList: function (targetCompId, requestData, pageInstance) {
    let _this = this;

    requestData.page = -1; 

    requestData.latitude = _this.globalData.locationInfo.latitude;
    requestData.longitude = _this.globalData.locationInfo.longitude;

    this.sendRequest({
      url: '/index.php?r=AppShop/GetAppShopByPage',
      method: 'post',
      data: requestData,
      success: function (res) {
        let newData = {};

        for(let index in res.data){
          let distance = res.data[index].distance;
          res.data[index].distance = util.formatDistance(distance);
        }
        newData[targetCompId + '.franchisee_data'] = res.data;
        newData[targetCompId + '.is_more'] = res.is_more;
        newData[targetCompId + '.curpage'] = 1;
        newData[targetCompId + '.scrollTop'] = 0;
        pageInstance.setData(newData);
      }
    })
  },
  tapGetCouponHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let coupon_id = JSON.parse(event.currentTarget.dataset.eventParams)['coupon_id'];
      this.turnToPage('/pages/couponDetail/couponDetail?detail=' + coupon_id);
    }
  },
  tapCommunityHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let community_id = JSON.parse(event.currentTarget.dataset.eventParams)['community_id'];
      this.turnToPage('/informationManagement/pages/communityPage/communityPage?detail=' + community_id);
    }
  },
  tapPageShareHandler: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let eventParams = JSON.parse(event.currentTarget.dataset.eventParams);
    let animation = wx.createAnimation({
      timingFunction: "ease",
      duration: 400,
    })
    let params = '';
    for (let i in pageInstance.sharePageParams){
      params += '&' + i + '=' + pageInstance.sharePageParams[i]
    }
    this.sendRequest({
      url: '/index.php?r=AppShop/ShareQRCode',
      data: {
        obj_id: pageInstance.route.split('/')[2],
        type: 11,
        text: eventParams.pageShareCustomText,
        goods_img: eventParams.pageShareImgUrl,
        params: params
      },
      success: function (res) {
        animation.bottom("0").step();
        pageInstance.setData({
          "pageQRCodeData.shareDialogShow": 0,
          "pageQRCodeData.shareMenuShow": true,
          "pageQRCodeData.page": pageInstance,
          "pageQRCodeData.imageUrl": res.data,
          "pageQRCodeData.animation": animation.export()
        })
      }
    })
  },
  turnToCommunityPage: function (event) {
    let id = event.currentTarget.dataset.id;
    this.turnToPage('/informationManagement/pages/communityPage/communityPage?detail=' + id);
  },
  tapToFranchiseeHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let franchisee_id = JSON.parse(event.currentTarget.dataset.eventParams)['franchisee_id'];
      this.turnToPage('/franchisee/pages/franchiseeDetail/franchiseeDetail?detail=' + franchisee_id);
    }
  },
  tapToTransferPageHandler: function () {
    this.turnToPage('/eCommerce/pages/transferPage/transferPage');
  },
  tapToSeckillHandler: function (event) {
    if (event.currentTarget.dataset.eventParams) {
      let goods = JSON.parse(event.currentTarget.dataset.eventParams),
          seckill_id = goods['seckill_id'],
          seckill_type = goods['seckill_type'];
      if (!!seckill_id) {
        this.turnToPage('/pages/goodsDetail/goodsDetail?goodsType=seckill&detail=' + seckill_id);
      }
    }
  },
  tapToPromotionHandler: function (event) {
    this._isOpenPromotion();
  },
  _isOpenPromotion: function () {
    let that = this;
    this.sendRequest({
      url: '/index.php?r=AppDistribution/getDistributionInfo',
      success: function (res) {
        if(res.data){
          that._isPromotionPerson();
          that.globalData.getDistributionInfo = res.data;
        }else{
          that.showModal({
            content: '暂未开启推广'
          })
        }
      }
    })
  },
  _isPromotionPerson: function () {
    let that = this;
    this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppDistribution/getDistributorInfo',
      success: function (res) {
        if (res.data){
          that.turnToPage('/promotion/pages/promotionUserCenter/promotionUserCenter');
          that.globalData.getDistributorInfo = res.data;
        }else{
          that.turnToPage('/promotion/pages/promotionApply/promotionApply');
        }
      }
    })
  },
  tapToCouponReceiveListHandler: function () {
    this.turnToPage('/eCommerce/pages/couponReceiveListPage/couponReceiveListPage');
  },
  tapToRechargeHandler: function () {
    this.turnToPage('/eCommerce/pages/recharge/recharge');
  },
  tapToXcx: function (event) {
    if(event.currentTarget.dataset.eventParams){
      let params = JSON.parse(event.currentTarget.dataset.eventParams);
      this.navigateToXcx({
        appId: params['xcx_appid'],
        path: params['xcx_page_url']
      });
    }
  },
  tapFranchiseeLocation: function (event) {
    let _this        = this;
    let compid       = event.currentTarget.dataset.compid;
    let pageInstance = this.getAppCurrentPage();

    function success(res) {
      let name    = res.name;
      let lat     = res.latitude;
      let lng     = res.longitude;
      let newdata = {};
      let param, requestData;

      newdata[compid +'.location_address'] = name;
      pageInstance.setData(newdata);

      for (let index in pageInstance.franchiseeComps) {
        if (pageInstance.franchiseeComps[index].compid == compid) {
          param = pageInstance.franchiseeComps[index].param;
          param.latitude = lat;
          param.longitude = lng;
        }
      }
      requestData = {
        id: compid,
        form: 'app_shop',
        page: 1,
        sort_key: param.sort_key,
        sort_direction: param.sort_direction,
        latitude: param.latitude,
        longitude: param.longitude,
        idx_arr: param.idx_arr
      }
      _this._refreshFranchiseeList(compid, requestData, pageInstance);
    }

    function cancel() {
      console.log('cancel');
    }

    function fail() {
      console.log('fail');
    }
    this.chooseLocation({
      success: success,
      fail: fail,
      cancel: cancel
    });
  },
  popupWindowControlHandler: function(event){
    let pageInstance = this.getAppCurrentPage();
    let windowControl = JSON.parse(event.currentTarget.dataset.eventParams).windowControl;
    let newData = {};
    let windowCompId, windowCustomFeature;

    for (let windowConfig of pageInstance.popupWindowComps) {
      if (windowConfig.id === windowControl.popupWindowId) {
        windowCompId = windowConfig.compid;
        windowCustomFeature = pageInstance.data[windowCompId].customFeature;
      }
    }
    if (windowControl.action === 'show') {
      newData[windowCompId+'.showPopupWindow'] = true;
    } else if (windowControl.action === 'hide') {
      newData[windowCompId+'.showPopupWindow'] = false;
    }
    pageInstance.setData(newData);

    if (windowCustomFeature.autoClose === true) {
      setTimeout(() => {
        newData[windowCompId+'.showPopupWindow'] = false;
        pageInstance.setData(newData);
      }, +windowCustomFeature.closeDelay*1000);
    }
  },
  tapMaskClosePopupWindow: function(event){
    let pageInstance = this.getAppCurrentPage();
    let compdata = event.currentTarget.dataset.compdata;
    let newData = {};
    
    if(compdata.customFeature.tapMaskClose === true){
      newData[compdata.compId+'.showPopupWindow'] = false;
      pageInstance.setData(newData);
    }
  },
  showAddShoppingcart: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let dataset      = event.currentTarget.dataset;
    let goods_id     = dataset.id;
    let buynow       = dataset.buynow;
    let ShowVirtualPrice = dataset.isshowvirtualprice;
    this.sendRequest({
      url: '/index.php?r=AppShop/getGoods',
      data: {
        data_id: goods_id
      },
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let goods         = res.data[0].form_data;
          let defaultSelect = goods.model_items[0];
          let goodsModel    = [];
          let selectModels  = [];
          let goodprice     = 0;
          let goodstock     = 0;
          let goodid;
          let selectText    = '';
          let goodimgurl    = '';
          let virtual_price = '';
          goods.showVirtualPrice = ShowVirtualPrice;
          if (goods.model_items.length) {
            goodprice = defaultSelect.price;
            goodstock = defaultSelect.stock;
            goodid = defaultSelect.id;
            goodimgurl = defaultSelect.img_url;
            virtual_price = defaultSelect.virtual_price;
          } else {
            goodprice = goods.price;
            goodstock = goods.stock;
            goodimgurl = goods.cover;
            virtual_price = goods.virtual_price;
          }
          for (let key in goods.model) {
            if (key) {
              let model = goods.model[key];
              goodsModel.push(model);
              selectModels.push(model.subModelId[0]);
              selectText += '“' + model.subModelName[0] + '” ';
            }
          }
          goods.model = goodsModel;
          if (goods.goods_type == 3) {
            let businesssTimeString = '';
            if (goods.business_time && goods.business_time.business_time) {
              let goodBusinesssTime = goods.business_time.business_time;
              for (let i = 0; i < goodBusinesssTime.length; i++) {
                businesssTimeString += goodBusinesssTime[i].start_time.substring(0, 2) + ':' + goodBusinesssTime[i].start_time.substring(2, 4) + '-' + goodBusinesssTime[i].end_time.substring(0, 2) + ':' + goodBusinesssTime[i].end_time.substring(2, 4) + '/';
              }
              businesssTimeString = '出售时间：' + businesssTimeString.substring(0, businesssTimeString.length - 1);
              pageInstance.setData({

              })
            }
            pageInstance.getCartList();
            pageInstance.setData({
              'addTostoreShoppingCartShow': true,
              businesssTimeString: businesssTimeString
            })
          } else {
            pageInstance.setData({
              'addShoppingCartShow': true,
              isBuyNow : buynow
            })
          }
          pageInstance.setData({
            goodsInfo: goods ,
            'selectGoodsModelInfo.price': goodprice,
            'selectGoodsModelInfo.stock': goodstock,
            'selectGoodsModelInfo.buyCount': 1,
            'selectGoodsModelInfo.buyTostoreCount': 0,
            'selectGoodsModelInfo.cart_id':'',
            'selectGoodsModelInfo.models': selectModels,
            'selectGoodsModelInfo.modelId': goodid || '',
            'selectGoodsModelInfo.models_text' : selectText,
            'selectGoodsModelInfo.imgurl' : goodimgurl,
            'selectGoodsModelInfo.virtual_price' : virtual_price
          });
        }
      }
    });
  },
  hideAddShoppingcart: function () {
    let pageInstance = this.getAppCurrentPage();
    pageInstance.setData({
      addShoppingCartShow: false,
      addTostoreShoppingCartShow:false
    });
  },
  selectGoodsSubModel: function (event) {
    let pageInstance  = this.getAppCurrentPage();
    let dataset       = event.target.dataset;
    let modelIndex    = dataset.modelIndex;
    let submodelIndex = dataset.submodelIndex;
    let data          = {};
    let selectModels  = pageInstance.data.selectGoodsModelInfo.models;
    let model         = pageInstance.data.goodsInfo.model;
    let text          = '';

    selectModels[modelIndex] = model[modelIndex].subModelId[submodelIndex];

    for (let i = 0; i < selectModels.length; i++) {
      let selectSubModelId = model[i].subModelId;
      for (let j = 0; j < selectSubModelId.length; j++) {
        if( selectModels[i] == selectSubModelId[j] ){
          text += '“' + model[i].subModelName[j] + '” ';
        }
      }
    }
    data['selectGoodsModelInfo.models'] = selectModels;
    data['selectGoodsModelInfo.models_text'] = text;

    pageInstance.setData(data);
    pageInstance.resetSelectCountPrice();
  },
  resetSelectCountPrice: function () {
    let pageInstance   = this.getAppCurrentPage();
    let selectModelIds = pageInstance.data.selectGoodsModelInfo.models.join(',');
    let modelItems     = pageInstance.data.goodsInfo.model_items;
    let data           = {};
    let cover          = pageInstance.data.goodsInfo.cover;

    data['selectGoodsModelInfo.buyCount'] = 1;
    data['selectGoodsModelInfo.buyTostoreCount'] = 0;
    for (let i = modelItems.length - 1; i >= 0; i--) {
      if(modelItems[i].model == selectModelIds){
        data['selectGoodsModelInfo.stock'] = modelItems[i].stock;
        data['selectGoodsModelInfo.price'] = modelItems[i].price;
        data['selectGoodsModelInfo.modelId'] = modelItems[i].id || '';
        data['selectGoodsModelInfo.imgurl'] = modelItems[i].img_url || cover;
        data['selectGoodsModelInfo.virtual_price'] = modelItems[i].virtual_price
        break;
      }
    }
    pageInstance.setData(data);
  },
  // 电商
  inputBuyCount:function(e){
    let pageInstance = this.getAppCurrentPage();
    pageInstance.setData({
      'selectGoodsModelInfo.buyCount': e.detail.value
    })
  },
  clickGoodsMinusButton: function (event) {
    let pageInstance = this.getAppCurrentPage();
    let count        = pageInstance.data.selectGoodsModelInfo.buyCount;
    if(count <= 1){
      return;
    }
    pageInstance.setData({
      'selectGoodsModelInfo.buyCount': count - 1
    });
  },
  clickGoodsPlusButton: function (event) {
    let pageInstance         = this.getAppCurrentPage();
    let selectGoodsModelInfo = pageInstance.data.selectGoodsModelInfo;
    let count                = selectGoodsModelInfo.buyCount;
    let stock                = selectGoodsModelInfo.stock;

    if(count >= stock) {
      return;
    }
    pageInstance.setData({
      'selectGoodsModelInfo.buyCount': count + 1
    });
  },
  sureAddToShoppingCart: function () {
    let pageInstance = this.getAppCurrentPage();
    let that         = this;
    let param        = {
      goods_id: pageInstance.data.goodsInfo.id,
      model_id: pageInstance.data.selectGoodsModelInfo.modelId || '',
      num: pageInstance.data.selectGoodsModelInfo.buyCount,
      sub_shop_app_id : '',
      is_seckill : ''
    };

    this.sendRequest({
      url: '/index.php?r=AppShop/addCart',
      data: param,
      success: function (res) {
        setTimeout(function () {
          that.showToast({
            title:'添加成功',
            icon:'success'
          });
        } , 50);
        pageInstance.hideAddShoppingcart();
      }
    })
  },
  sureAddToBuyNow: function () {
    let pageInstance = this.getAppCurrentPage();
    let param        = {
      goods_id: pageInstance.data.goodsInfo.id,
      model_id: pageInstance.data.selectGoodsModelInfo.modelId || '',
      num: pageInstance.data.selectGoodsModelInfo.buyCount,
      sub_shop_app_id: '',
      is_seckill : ''
    };
    let that = this;

    this.sendRequest({
      url: '/index.php?r=AppShop/addCart',
      data: param,
      success: function (res) {
        let cart_arr = [res.data],
          pagePath = '/eCommerce/pages/previewGoodsOrder/previewGoodsOrder?cart_arr='+ encodeURIComponent(cart_arr);

        pageInstance.hideAddShoppingcart();
        that.turnToPage(pagePath);
      }
    })
  },
  clickTostoreMinusButton: function () {
    let pageInstance = this.getAppCurrentPage();
    let count        = pageInstance.data.selectGoodsModelInfo.buyTostoreCount;
    if (count <= 0) {
      return;
    }
    if (count <= 1) {
      this.sendRequest({
        hideLoading: true,
        url: '/index.php?r=AppShop/deleteCart',
        method: 'post',
        data: {
          cart_id_arr: [pageInstance.data.selectGoodsModelInfo.cart_id],
          sub_shop_app_id: pageInstance.franchiseeId || ''
        }
      });
      pageInstance.setData({
        'selectGoodsModelInfo.buyTostoreCount': count - 1
      });
      this.getTostoreCartList();
      return;
    }
    pageInstance.setData({
      'selectGoodsModelInfo.buyTostoreCount': count
    });
    this._sureAddTostoreShoppingCart('mins');
  },
  clickTostorePlusButton: function () {
    let pageInstance         = this.getAppCurrentPage();
    let selectGoodsModelInfo = pageInstance.data.selectGoodsModelInfo;
    let count                = selectGoodsModelInfo.buyTostoreCount;
    let stock                = selectGoodsModelInfo.stock;

    if (count >= stock) {
      this.showModal({
        content: '库存不足'
      });
      return;
    }
    pageInstance.setData({
      'selectGoodsModelInfo.buyTostoreCount': count
    });
    this._sureAddTostoreShoppingCart('plus');
  },
  _sureAddTostoreShoppingCart: function (type) {
    let pageInstance = this.getAppCurrentPage();
    let that         = this;
    let goodsNum     = pageInstance.data.selectGoodsModelInfo.buyTostoreCount;
    if (type == 'plus') {
      goodsNum = goodsNum + 1;
    } else {
      goodsNum = goodsNum - 1;
    }
    let param = {
      goods_id: pageInstance.data.goodsInfo.id,
      model_id: pageInstance.data.selectGoodsModelInfo.modelId || '',
      num: goodsNum,
      sub_shop_app_id: ''
    };

    that.sendRequest({
      url: '/index.php?r=AppShop/addCart',
      data: param,
      success: function (res) {
        let data = res.data;
        pageInstance.setData({
          'selectGoodsModelInfo.cart_id': data,
          'selectGoodsModelInfo.buyTostoreCount': goodsNum
        });
        that.getTostoreCartList();
      },
      successStatusAbnormal: function (res) {
        pageInstance.setData({
          'selectGoodsModelInfo.buyTostoreCount': 0
        });
        that.showModal({
          content: res.data
        })
      }
    })
  },
  readyToTostorePay: function () {
    let pageInstance = this.getAppCurrentPage();
    let franchiseeId = pageInstance.franchiseeId;
    let pagePath = '/orderMeal/pages/previewOrderDetail/previewOrderDetail' + (franchiseeId ? '?franchisee=' + franchiseeId : '');
    if (pageInstance.data.cartGoodsNum <= 0 || !pageInstance.data.tostoreTypeFlag) {
      return;
    }
    this.turnToPage(pagePath);
    pageInstance.hideAddShoppingcart();
  },
  getValidateTostore: function () {
    let pageInstance = this.getAppCurrentPage();
    let that         = this;
    this.sendRequest({
      url: '/index.php?r=AppShop/precheckShoppingCart',
      data: {
        sub_shop_app_id: pageInstance.franchiseeId || '',
        parent_shop_app_id: pageInstance.franchiseeId ? that.getAppId() : ''
      },
      success: function (res) {
        that.readyToTostorePay();
      },
      successStatusAbnormal: function (res) {
        that.showModal({
          content: res.data,
          confirm: function () {
            res.status === 1 && that.goToShoppingCart();
          }
        })
      }
    })
  },
  goToShoppingCart: function () {
    let pageInstance = this.getAppCurrentPage();
    let franchiseeId = pageInstance.franchiseeId;
    let pagePath = '/eCommerce/pages/shoppingCart/shoppingCart' + (franchiseeId ? '?franchisee=' + franchiseeId : '');
    pageInstance.hideAddShoppingcart();
    this.turnToPage(pagePath);
  },
  getTostoreCartList: function () {
    let pageInstance = this.getAppCurrentPage();
    this.sendRequest({
      url: '/index.php?r=AppShop/cartList',
      data: {
        page: 1,
        page_size: 100,
        sub_shop_app_id: pageInstance.franchiseeId || ''
      },
      success: function (res) {
        let price = 0,
          num = 0,
          addToShoppingCartCount = 0,
          tostoreTypeFlag = false;

        for (let i = res.data.length - 1; i >= 0; i--) {
          let data = res.data[i];
          price += +data.num * +data.price;
          num += +data.num;
          if (data.goods_type == 3) {
            tostoreTypeFlag = true;
          }
          if (pageInstance.goodsId == data.goods_id) {
            addToShoppingCartCount = data.num;
            pageInstance.cart_id = data.id;
          }
        }
        pageInstance.setData({
          tostoreTypeFlag: tostoreTypeFlag,
          cartGoodsNum: num,
          cartGoodsTotalPrice: price.toFixed(2),
          addToShoppingCartCount: addToShoppingCartCount,

        });
      }
    })
  },
  turnToSearchPage: function (event) {
    if (event.target.dataset.param) {
      this.turnToPage('/default/pages/advanceSearch/advanceSearch?param=' + event.target.dataset.param);
    }else{
      this.turnToPage('/default/pages/advanceSearch/advanceSearch?form=' + event.target.dataset.form);
    }
  },
  suspensionTurnToPage: function (event) {
    let router = event.currentTarget.dataset.router,
      pageRoot = {
        'groupCenter': '/eCommerce/pages/groupCenter/groupCenter',
        'shoppingCart': '/eCommerce/pages/shoppingCart/shoppingCart',
        'myOrder': '/eCommerce/pages/myOrder/myOrder',
      };
    this.turnToPage(pageRoot[router] || '/pages/' + router + '/' + router + '?from=suspension');
  },
  // 跳转大转盘
  tapToLuckyWheel: function (event) {
    this.turnToPage('/awardManagement/pages/luckyWheelDetail/luckyWheelDetail');
  },
  // 跳转大转盘
  tapToGoldenEggs: function (event) {
    this.turnToPage('/awardManagement/pages/goldenEggs/goldenEggs');
  },
  // 跳转刮刮乐
  tapToScratchCard: function (event) {
    this.turnToPage('/awardManagement/pages/scratch/scratch');
  },
  // 动态分类: 点击不同分类对应的数据
  tapDynamicClassifyFunc: function (event) {
    let _this = this;
    let pageInstance = this.getAppCurrentPage();
    let compId = event.currentTarget.dataset.compid;
    let level = event.currentTarget.dataset.level;
    let categoryId = event.currentTarget.dataset.categoryId;
    let hideSubclass = event.currentTarget.dataset.hideSubclass;
    let compData = pageInstance.data[compId];
    let currentClassifyLevel = compData.classifyType.charAt(5);
    let newData = {};
    if (hideSubclass == 1) {
      newData[compId + '.classifyAreaLevel2Show'] = false;
      pageInstance.setData(newData);
      return;
    }
    if (currentClassifyLevel == 2) {
      if (categoryId == '') {
        compData.currentCategory[0] = categoryId;
        newData[compId + '.classifyAreaLevel2Show'] = false;
      } else if (compData.currentCategory[level - 1] == categoryId) {
        newData[compId + '.classifyAreaLevel2Show'] = !compData['classifyAreaLevel2Show'];
      } else if(level == 1) {
        newData[compId + '.classifyAreaLevel2Show'] = true;
      } else if (level == 2) {
        newData[compId + '.classifyAreaLevel2Show'] = false;
      }
    }
    compData.currentCategory[level - 1] = categoryId;
    newData[compId + '.currentCategory'] = compData.currentCategory;
    pageInstance.setData(newData);
    if(compData.classifyType == 'level2-vertical-withpic'){
      if(level == 2){
        _this.turnToPage('/pages/classifyGoodsListPage/classifyGoodsListPage?form=' + compData.classifyGroupForm + '&category_id=' + categoryId, false);
      }
      return;
    }
    if (currentClassifyLevel != level) { // 点击非最后一级的分类不请求新数据
      return;
    }
    // 根据groupId请求第一个分类绑定的数据
    let param = {
      page: 1,
      form: compData.classifyGroupForm,
      idx_arr: {
        idx: 'category',
        idx_value: categoryId
      }
    };
    if (compData.customFeature.vesselAutoheight == 1 && compData.customFeature.loadingMethod == 1) {
      param.page_size = compData.customFeature.loadingNum || 20;
    }
    _this.sendRequest({
      hideLoading: true,
      url: '/index.php?r=AppData/getFormDataList',
      data: param,
      method: 'post',
      success: function (res) {
        if (res.status == 0) {
          let newdata = {};
          if (param.form !== 'form') { // 动态列表绑定表单则不调用富文本解析
            for (let j in res.data) {
              for (let k in res.data[j].form_data) {
                if (k == 'category') {
                  continue;
                }
                if(/region/.test(k)){
                  continue;
                }

                let description = res.data[j].form_data[k];

                if (_this.needParseRichText(description)) {
                  res.data[j].form_data[k] = _this.getWxParseResult(description);
                }
              }
            }
          }
          newdata[compId + '.list_data'] = res.data;
          newdata[compId + '.is_more'] = res.is_more;
          newdata[compId + '.curpage'] = 1;
          pageInstance.setData(newdata);
        }
      }
    });
  },
  beforeSeckillDownCount: function (formData, page, path) {
    let _this = this,
        downcount ;
    downcount = _this.seckillDownCount({
      startTime : formData.server_time,
      endTime : formData.seckill_start_time,
      callback : function () {
        let newData = {};
        newData[path+'.seckill_start_state'] = 1;
        newData[path+'.server_time'] = formData.seckill_start_time;
        page.setData(newData);
        formData.server_time = formData.seckill_start_time;
        _this.duringSeckillDownCount(formData , page ,path);
      }
    } , page , path + '.downCount');

    return downcount;
  },
  duringSeckillDownCount: function (formData, page, path) {
    let _this = this,
        downcount;
    downcount = _this.seckillDownCount({
      startTime : formData.server_time,
      endTime : formData.seckill_end_time ,
      callback : function () {
        let newData = {};
        newData[path+'.seckill_start_state'] = 2;
        page.setData(newData);
      }
    } , page , path + '.downCount');

    return downcount;
  },
  seckillDownCount: function (opts, page, path) {
    let opt = {
      startTime : opts.startTime || null,
      endTime : opts.endTime || null,
      callback : opts.callback
    };
    let systemInfo = this.getSystemInfoData().system;
    let isiphone = systemInfo.indexOf('iOS') != -1;

    if(isiphone && /\-/g.test(opt.endTime)){
      opt.endTime = opt.endTime.replace(/\-/g , '/');
    }
    if(isiphone && /\-/g.test(opt.startTime)){
      opt.startTime = opt.startTime.replace(/\-/g , '/');
    }
    if(/^\d+$/.test(opt.endTime)){
      opt.endTime = opt.endTime * 1000;
    }
    if(/^\d+$/.test(opt.startTime)){
      opt.startTime = opt.startTime * 1000;
    }

    let target_date = new Date(opt.endTime),
        current_date = new Date(opt.startTime),
        interval ,
        isfirst = true,
        difference = target_date - current_date;

    function countdown () {
      if (difference < 0) {
        clearInterval(interval);
        if (opt.callback && typeof opt.callback === 'function'){opt.callback();};
        return;
      }

      let _second = 1000,
          _minute = _second * 60,
          _hour = _minute * 60,
          time = {};

      let hours = Math.floor(difference / _hour),
          minutes = Math.floor((difference % _hour) / _minute),
          seconds = Math.floor((difference % _minute) / _second);

          hours = (String(hours).length >= 2) ? hours : '0' + hours;
          minutes = (String(minutes).length >= 2) ? minutes : '0' + minutes;
          seconds = (String(seconds).length >= 2) ? seconds : '0' + seconds;
      if(isfirst){
        time[path+'.hours'] = hours;
        time[path + '.minutes'] = minutes;
      }else{
        (minutes == '59' && seconds == '59') && (time[path+'.hours'] = hours);
        (seconds == '59') && (time[path + '.minutes'] = minutes);
      }
      time[path + '.seconds'] = seconds;

      page.setData(time);

      isfirst = false;
      difference -= 1000;
    }
    interval = setInterval(countdown, 1000);

    return {
      interval : interval ,
      clear : function () {
        clearInterval(interval);
      }
    };
  },
  getAssessList: function (param) {
    param.url = '/index.php?r=AppShop/GetAssessList';
    this.sendRequest(param);
  },
  getOrderDetail: function (param) {
    param.url = '/index.php?r=AppShop/getOrder';
    this.sendRequest(param);
  },
  showUpdateTip: function () {
    this.showModal({
      title: 'alert',
      content: '您的微信版本不支持该功能，请升级更新后重试'
    });
  },
  // 文字组件跳到地图
  textToMap: function (event) {
    let dataset = event.currentTarget.dataset;
    let latitude  = +dataset.latitude;
    let longitude = +dataset.longitude;
    let address = dataset.address;

    if(!latitude || !longitude){
      return ;
    }

    this.openLocation({
      latitude: latitude,
      longitude: longitude,
      address: address
    });
  },
  // 跳转到视频详情
  turnToVideoDetail : function(event) {
    let id = event.currentTarget.dataset.id;

    this.turnToPage('/video/pages/videoDetail/videoDetail?detail=' + id);
  },
  // 处理数字
  handlingNumber : function(num) {
    num = +num;
    if(num > 1000000){ //大于百万直接用万表示
      return Math.floor(num / 10000) + '万';
    }else if(num > 10000){ //大于一万小于百万的保留一位小数
      return (num / 10000).toString().replace(/([0-9]+.[0-9]{1})[0-9]*/,"$1") + '万';
    }else{
      return num;
    }
  },
  startPlayVideo: function(event) {
    let compid = event.currentTarget.dataset.compid;
    let id = 'videoele-' + compid;
    let video = wx.createVideoContext(id);
    let pageInstance = this.getAppCurrentPage();
    let newdata = {};

    newdata[compid + '.videoPoster'] = false;
    pageInstance.setData(newdata);

    video.play();
  },
  // 视频项目播放事件
  videoProjectPlay: function(e) {
    let compid = e.currentTarget.dataset.compid;
    let pageInstance = this.getAppCurrentPage();
    for (let i in pageInstance.data) {
      if (/video[\d]/.test(i) && i != compid) {
        let data = pageInstance.data[i];
        let old_id = 'videoele-' + data.compId;
        let old_video = wx.createVideoContext(old_id);
        old_video.pause();
      }
    }
  },
  // 视频项目暂停事件
  videoProjectPause: function(e) {
    // console.log(e);
  },
  needParseRichText: function(data) {
    if (typeof data == 'number') {
      return true;
    }
    if (typeof data == 'string') {
      if (!data) {
        return false;
      }
      if (!/^http:\/\/img/g.test(data)) {
        return true;
      }
    }
    return false;
  },
  calculationDistanceByLatLng: function(lat1, lng1, lat2, lng2){
    const EARTH_RADIUS = 6378137.0;
    const PI = Math.PI;
    let a = (lat1 - lat2) * PI / 180.0;
    let b = (lng1 - lng2) * PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(lat1 * PI / 180.0) * Math.cos(lat2 * PI / 180.0) * Math.pow(Math.sin(b / 2), 2)));
    s  =  s * EARTH_RADIUS;
    s  =  Math.round(s * 10000) / 10000.0;
    return s;
  },
  isNeedRewardModal: function () {
    let that = this;
    that.sendRequest({
      hideLoading: true,
      url: '/index.php?r=appShop/isNeedLogin',
      data: {
        session_key: wx.getStorageSync('session_key'),
      },
      success: function (res) {
        if (res.status == 0 && res.data == 1) {
          that.goLogin({});
        }
      }
    });
  },
  loginForRewardPoint: function (addTime) {
    let that = this;
    that.sendRequest({
      hideLoading: true,
      url: '/index.php?r=appShop/getIntegralLog',
      data: { add_time: addTime, login: 1 },
      success: function (res) {
        if (res.status == 0) {
          let vipLevel = res.vip_level,
            rewardCount = res.data,
            pageInstance = that.getAppCurrentPage(),
            newData = {};
          if (rewardCount > 0 && vipLevel > 0) {
            newData.rewardPointObj = {
              showModal: true,
              count: rewardCount,
              callback: (vipLevel > 1 ? 'showVipUp' : 'showVip')
            }
            pageInstance.setData(newData);
          } else {
            if (rewardCount > 0) {
              newData.rewardPointObj = {
                showModal: true,
                count: rewardCount,
                callback: ''
              }
            }
            if (vipLevel > 0) {
              newData.shopVipModal = {
                showModal: true,
                isUp: vipLevel > 1
              }
            }
            pageInstance.setData(newData);
          }
        }
      }
    });
  },
  // 积分弹窗回调
  rewardPointCB: function (cbTy) {
    let that = this,
        pageInstance = that.getAppCurrentPage();
        pageInstance.setData({
          'rewardPointObj.showModal': false
        });
    switch (cbTy) {
      case 'turnBack'://回到上一个页面
        that.turnBack();
      break;
      case 'showVip'://成为会员
        pageInstance.setData({
          'shopVipModal': {
            showModal: true,
            isUp: false
          }
        });
      break;
      case 'showVipUp'://会员升级
        pageInstance.setData({
          'shopVipModal': {
            showModal: true,
            isUp: true
          }
        });
      break;
      default:
      break;
    }
  },
  shopVipModalCB(cbTy) {
    let that = this,
        pageInstance = that.getAppCurrentPage();
        pageInstance.setData({
          'shopVipModal.showModal': false
        });
  },
  shopVipModalCB(cbTy) {
    let that = this,
        pageInstance = that.getAppCurrentPage();
        pageInstance.setData({
          'shopVipModal.showModal': false
        });
  },





  /**
   *  全局参数get、set部分 start
   *
   */

  // 获取首页router
  getHomepageRouter: function () {
    return this.globalData.homepageRouter;
  },
  getAppId: function () {
    return this.globalData.appId;
  },
  getDefaultPhoto: function () {
    return this.globalData.defaultPhoto;
  },
  getSessionKey: function () {
    return this.globalData.sessionKey;
  },
  setSessionKey: function (session_key) {
    this.globalData.sessionKey = session_key;
    this.setStorage({
      key: 'session_key',
      data: session_key
    })
  },
  getUserInfo: function (key) {
    return key ? this.globalData.userInfo[key] : this.globalData.userInfo;
  },
  setUserInfoStorage: function (info) {
    for (let key in info) {
      this.globalData.userInfo[key] = info[key];
    }
    this.setStorage({
      key: 'userInfo',
      data: this.globalData.userInfo
    })
  },
  setPageUserInfo: function () {
    let currentPage = this.getAppCurrentPage();
    let newdata     = {};

    newdata['userInfo'] = this.getUserInfo();
    currentPage.setData(newdata);
  },
  getAppCurrentPage: function () {
    let pages = getCurrentPages();
    return pages[pages.length - 1];
  },
  getTabPagePathArr: function () {
    return JSON.parse(this.globalData.tabBarPagePathArr);
  },
  getWxParseOldPattern: function () {
    return this.globalData.wxParseOldPattern;
  },
  getWxParseResult: function (data, setDataKey) {
    let page = this.getAppCurrentPage();
    data = typeof data == 'number' ? ''+data : data;
    return WxParse.wxParse(setDataKey || this.getWxParseOldPattern(),'html', data, page);
  },
  getAppTitle: function () {
    return this.globalData.appTitle;
  },
  getAppDescription: function () {
    return this.globalData.appDescription;
  },
  setLocationInfo: function (info) {
    this.globalData.locationInfo = info;
  },
  getLocationInfo: function () {
    return this.globalData.locationInfo;
  },
  getSiteBaseUrl: function () {
    return this.globalData.siteBaseUrl;
  },
  getCdnUrl: function () {
    return this.globalData.cdnUrl;
  },
  getUrlLocationId: function () {
    return this.globalData.urlLocationId;
  },
  getPreviewGoodsInfo: function () {
    return this.globalData.previewGoodsOrderGoodsInfo;
  },
  setPreviewGoodsInfo: function (goodsInfoArr) {
    this.globalData.previewGoodsOrderGoodsInfo = goodsInfoArr;
  },
  getGoodsAdditionalInfo: function () {
    return this.globalData.goodsAdditionalInfo;
  },
  setGoodsAdditionalInfo: function (additionalInfo) {
    this.globalData.goodsAdditionalInfo = additionalInfo;
  },
  getIsLogin: function () {
    return this.globalData.isLogin;
  },
  setIsLogin: function (isLogin) {
    this.globalData.isLogin = isLogin;
  },
  getSystemInfoData: function () {
    let res;
    if (this.globalData.systemInfo) {
      return this.globalData.systemInfo;
    }
    try {
      res = this.getSystemInfoSync();
      this.setSystemInfoData(res);
    } catch (e) {
      this.showModal({
        content: '获取系统信息失败 请稍后再试'
      })
    }
    return res || {};
  },
  setSystemInfoData: function (res) {
    this.globalData.systemInfo = res;
  },

  

  globalData:{
    appId: 'mPxWOXi4p4',
        tabBarPagePathArr: '["/pages/o9j42s2GS3_page10000/o9j42s2GS3_page10000","/pages/o9j42s2GS3_page10006/o9j42s2GS3_page10006","/pages/o9j42s2GS3_page10004/o9j42s2GS3_page10004"]',
        homepageRouter: 'o9j42s2GS3_page10000',
    formData: null,
    userInfo: {},
    systemInfo: null,
    sessionKey: '',
    notBindXcxAppId: false,
    waimaiTotalNum: 0,
    waimaiTotalPrice: 0,
    takeoutLocate:{},
    takeoutRefresh : false,
    isLogin: false,
    locationInfo: {
      latitude: '',
      longitude: '',
      address: ''
    },
    getDistributionInfo: '',
    getDistributorInfo: '',
    PromotionUserToken: '',
    previewGoodsOrderGoodsInfo: [],  
    goodsAdditionalInfo: {},  
    urlLocationId:'',
    turnToPageFlag: false,
    wxParseOldPattern: '_listVesselRichText_',
    cdnUrl: 'http://cdn.jisuapp.cn',
    defaultPhoto: 'http://cdn.jisuapp.cn/zhichi_frontend/static/webapp/images/default_photo.png',
    // siteBaseUrl: 'https://xcx.zhichiweiye.com',
    // siteBaseUrl: 'http://127.0.0.1/appoint',
    // siteBaseUrl: 'http://192.168.1.109/appoint',
  
    siteBaseUrl: 'https://appoint.applinzi.com',
      
    appTitle: '国教预约',
    appDescription: '国教系统预约平台',
    appLogo: 'http://img.zhichiwangluo.com/zcimgdir/album/file_5ac5774ba3fc4.jpg'
  }
})