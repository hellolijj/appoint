// components/shopVipModal/shopVipModal.js
var app = getApp();
Component({

  properties: {
    shopVipModal: {
      type: Object,
      value: {
        showModal: false,
        isUp: true
      }
    }
  },

  data: {
    shopVipModal: {
      showModal: false,
      isUp: false
    },
    cdnUrl: app.getCdnUrl()
  },

  methods: {
    stopPropagation: function () {},
    closeModal: function () {
      this.setData({
        'shopVipModal.showModal': false
      });
      app.shopVipModalCB();
    },
    turnToVipCard: function () {
      app.turnToPage('/eCommerce/pages/vipCard/vipCard');
      this.closeModal();
    }
  }
})
