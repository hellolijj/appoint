var app = getApp()
Page({
  data: {
    items: [
      { value: 'stu_certificate', name: '学习证明Study Certificate' },
      { value: 'transcript', name: '成绩单Transcript' },
      { value: 'attendance', name: '到课率Attendance(For transfer, not visa)' },
      { value: 'transfer_letter', name: '转学证明（仅提供给语言生）Transfer Letter(For Chinese Language students only)' },
      { value: 'stu_id_book', name: '学生证（非一卡通，仅提供给语言生，需本人携带一张一寸证件照交予国教515办公室）Student ID Book(not student card, only for Chinese language students,bring 1 inch photo to CIE515)' },
    ],
    remarks: "",
  },
  checkboxChange: function (e) {
    var items = this.data.items, values = e.detail.value;
    for (var i = 0, lenI = items.length; i < lenI; ++i) {
      items[i].checked = false;
      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (items[i].value == values[j]) {
          items[i].checked = true;
          break
        }
      }
    }


    this.setData({
      items: items
    })
  },
  inputRemark: function (e) {
    this.setData({
      'remarks': e.detail.value
    })
  },

  next: function (e) {
    let items = this.data.items
    let param = [];
    param.goods_id = 1241;
    param.appointment_interval = '';
    param.appointment_day = '';
    param.model_id = 0;
    param.num = 1;
    param.is_appointment = 1;

    let document = []
    document.stu_cert = this.valueConvert(items[0].checked)
    document.transcript = this.valueConvert(items[1].checked)
    document.attendance = this.valueConvert(items[2].checked)
    document.transfer_letter = this.valueConvert(items[3].checked)
    document.stu_id_book = this.valueConvert(items[4].checked)
    document.remarks = this.data.remarks
    document.appoint_id = 0

    console.log(items)
    if (items[0].checked == true && items[1].checked == true && items[2].checked == true) {
      wx.showModal({
        title: 'tip',
        content: 'Are you a Chinese language student or Business Chinese major degree student?',
        confirmText: "yes",
        cancelText: "no",
        success: function (res) {
          if (res.confirm) {
          
          } else {
            wx.navigateBack()
          }
        },
      })
    }

    app.sendRequest({
      url: '/index.php?r=AppShop/AddCart',
      data: param,
      success: function (res) {
        let cart_arr = [res.data],
          pagePath = '/eCommerce/pages/previewAppointmentOrder/previewAppointmentOrder?cart_arr=' + cart_arr + '&to_store="12:00"';
        document.appoint_id = res.data
        app.sendRequest({
          url: '/index.php?r=AppShop/AddDocument',
          data: document,
          success: function (res) {
            app.turnToPage(pagePath, true);
          }
        })
      }
    })

    
  },

  valueConvert: function (value) {
    if (value === true) {
      return 1;
    } else {
      return 0;
    }
  }
})