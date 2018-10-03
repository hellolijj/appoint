var app = getApp()
Page({
  data: {
    records: [
      ''
    ],
  },
  onLoad: function (options) {
    let that = this
    app.sendRequest({
      url: '/index.php?r=question/get_submit_list',
      data: '',
      success: function (res) {
        that.setData({ records: res.data })
      }
    })
  },
  record_more_info: function(options) {
    console.log(options)
    let submit_id = options.currentTarget.dataset.current_submit_id
    wx.navigateTo({
      url: `/pages/answer/answer_info/info?subject=kemu1&type=wdct&mid=${submit_id}`,
    })
  }
})