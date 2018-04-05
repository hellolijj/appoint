
var app = getApp()

Page({
  data: {
    appointmentInfo: {},
    goodsId: '',
    longRangeIndex: 0,
    periodRangeIndex: 0,
    selectedDate: '',
    selectedDateIfBusiness: 0,
    selectedPeriod: '',
    serviceTimeUnit: '',
    unitType: '',
    date: '',
    time:'12:00',
    color:'',
    
  },
  onLoad: function(options){
    var goodsId = options.detail,
        franchiseeId = options.franchisee || '',
        unitType = options.param,
        appointmentInfo ={},
        date = new Date(),
        timeObj;
        timeObj = {
          year: new Date().getFullYear(),
          month: (new Date().getMonth() + 1) >= 10 ? new Date().getMonth() + 1 :'0'+ (new Date().getMonth() + 1),
          date: new Date().getDate() >= 10 ? new Date().getDate() : '0' + new Date().getDate(),
          startHours: (new Date().getHours() + 1) >= 10 ? (new Date().getHours() + 1) : ('0' + (new Date().getHours() + 1)),
          endHours: (new Date().getHours() + 2) >= 10 ? (new Date().getHours() + 2) : ('0' + (new Date().getHours() + 2)), 
        }
        appointmentInfo['appointmentDay'] = '请先选择预约日期';
        appointmentInfo['appointmentStartDateRange'] = '请先选择起始日期';
        appointmentInfo['appointmentEndDateRange'] = '请先选择起始日期';
        appointmentInfo['serviceLongRange'] = ['1小时'];
        appointmentInfo['servicePeriodRange'] = [timeObj.startHours + ':00-当日' + timeObj.endHours + ':00',];
        appointmentInfo['intervalStart'] = [timeObj.year + '-' + timeObj.month + '-' + timeObj.date];
        // appointmentInfo['servicePrice'] = this.data.unitType == 1 || this.data.unitType == 2 ?  '请先选择预约日期' : '请先选择起始日期';
    this.setData({
      goodsId: goodsId,
      franchiseeId: franchiseeId,
      unitType: unitType,
      appointmentInfo:appointmentInfo    
    });
    // this.dataInitial();
    this.dataInitialName();
  },
  dataInitialName:function(){
    var unitType = this.data.unitType,
      serviceTimeUnit,
      servicePrice,
      unitTime;
      switch(unitType){
        case "1":
          unitTime = '请先选择预约日期';
          servicePrice = '请先选择预约日期';
        break;
        case "2":
          unitTime = '请先选择预约日期';
          servicePrice = '请先选择预约日期';          
        break;
        case "3":
          unitTime = '请先选择起始日期';
          servicePrice = '请先选择起始日期';         
          break;
        }
      this.setData({
        'appointmentInfo.serviceLongRange[0]': unitTime,
        'appointmentInfo.servicePrice': servicePrice        
        })
  },
  dataInitial: function(){
    
    this.getAppointmentList({
      app_id: app.getAppId(),
      data_id: this.data.goodsId,
      sub_shop_app_id: this.data.franchiseeId,
      ck_id:eaa3f988dc6905c67674e708d0752fc2,
    }, true);
  },
  getAppointmentList: function(param, initial){
    var that = this;

    app.sendRequest({
      url: '/index.php?r=AppAppointment/getAppointmentList',
      data: param,
      success: function(res){
        var data = {},
            response,
            selectedDay,
            selectedEndDay,
            selectedStartDay,
            serviceTimeUnit,
            response = res.data,
            canSelectTimeLong, 
            appointmentInfo = response.appointment_info;
            data['color'] = '#F05B10';          
            
        if(initial){
          switch(res.unit_type){
              case "1":
                serviceTimeUnit = '分';
                break;
              case "2":
                serviceTimeUnit = '小时';
                break;
              case "3":
                serviceTimeUnit = '天';
                break;
          }
          if(serviceTimeUnit == '天'){
          selectedStartDay = response.selected_start_day.substring(0,4)+'-'+response.selected_start_day.substring(4,6)+'-'+response.selected_start_day.substring(6,8); 
          selectedEndDay = response.selected_end_day.substring(0,4)+'-'+response.selected_end_day.substring(4,6)+'-'+response.selected_end_day.substring(6,8);
          data['appointmentInfo.appointmentStartDateRange'] = selectedStartDay;
          data['appointmentInfo.appointmentEndDateRange'] = selectedEndDay;
          }else{
          selectedDay = response.selected_day.substring(0,4) + '-' + response.selected_day.substring(4,6) + '-' + response.selected_day.substring(6,8);
          canSelectTimeLong = response.can_select_time_long.sort();
          data['appointmentInfo.serviceLongRange'] = canSelectTimeLong;
          for(var index in response.can_select_interval){
            var can_select_interval = response.can_select_interval[index].split('-');                
            if(response.can_select_interval[index].substring(6,8) >= 24){
              var endHours = can_select_interval[1].split(':')[0] - 24 >= 10? (can_select_interval[1].split(':')[0] - 24): '0' +                     (can_select_interval[1].split(':')[0] - 24);
              response.can_select_interval[index] = can_select_interval[0] + '-' + '次日' + endHours + ':' + can_select_interval[1].split(':')[1];
              }else{
              response.can_select_interval[index] = can_select_interval[0] + '-' + '当日' + can_select_interval[1];
              }
            };
              data['appointmentInfo.servicePeriodRange'] = response.can_select_interval;
              data['appointmentInfo.appointmentDateRange'] = selectedDay;
          }
          
          data['selectedDate'] = 1;
          data['selectedDateIfBusiness'] = 1;
          data['serviceTimeUnit'] = serviceTimeUnit;
        }
        for (var index in appointmentInfo) {
          var periodInterval = appointmentInfo[index].interval,
            startHours = periodInterval.split('-')[0].split(':')[0],
            startMin = periodInterval.split('-')[0].split(':')[1],
            endHours = periodInterval.split('-')[1].split(':')[0],
            endMin = periodInterval.split('-')[1].split(':')[1],
            startTime = startHours >= 24 ? '次日' + (startHours * 1 - 24) + ':' + startMin : '当日' + startHours * 1 + ':' + startMin,
            endTime = endHours >= 24 ? (endHours * 1 - 24) + ':' + endMin : (endHours * 1) + ':' + endMin;
            appointmentInfo[index].interval = startTime + '-' + endTime;
        }
        data['appointmentInfo.servicePeriodList'] = appointmentInfo || '';


        data['appointmentInfo.servicePrice'] = response.appointment_price != "0" ? response.appointment_price + '元' : '免费';
        that.setData(data);
      },
      fail:function(res){
        console.log(res)
      }
    })
  },
  serviceLongChange: function(e){
    var value = e.detail.value;
    this.setData({
      longRangeIndex: value
    });
    this.serviceConditionChange();
  },
  setTime: function(appointmentTime,timeNum){
     var  appointmentTimeStr,
              hours,
              sec,
              totalSec,
              totalTime;
          appointmentTimeStr = appointmentTime.split(':');
          hours = appointmentTimeStr[0].replace(/[^0-9]/ig,"");
          sec = appointmentTimeStr[1].replace(/[^0-9]/ig,"");
          totalSec = sec*1 + timeNum*1;
          sec = totalSec> 59? totalSec -60:totalSec;
          sec = sec > 9? sec:'0'+sec;
          hours = totalSec> 59?++hours*1:hours;
          totalTime = hours + ':' + sec;
          return totalTime;
  },
  //预约日期
  bindDateAppointmentChange: function(e) {
    var value = e.detail.value,
      servicePeriodRange = this.data.appointmentInfo.servicePeriodRange[this.data.periodRangeIndex],
      interval,startTime,timeLong;
    this.setData({
      'appointmentInfo.appointmentDay': value
    });
    if (this.data.appointmentInfo.servicePrice != '?' ){
      var str = servicePeriodRange.split('-');
      if (this.data.unitType == 2 && this.data.appointmentInfo.serviceLongRange[0] != '请先选择预约日期'){
        interval = str[1].substring(0, 2) == '当日' ? str[0] + '-' + str[1].substring(2) : str[0] + '-' + (parseInt(str[1].substring(2, 4)) + 24) + str[1].substring(4);
      } else if (this.data.unitType == 1 && this.data.appointmentInfo.serviceLongRange[0] != '请先选择预约日期'){
        startTime = this.data.time;
      }
      if (this.data.appointmentInfo.serviceLongRange[0] != '请先选择预约日期'){
      timeLong = this.data.appointmentInfo.serviceLongRange[this.data.longRangeIndex] 
      }
    }
    this.getAppointmentList({
      day: this.data.appointmentInfo.appointmentDay.split('-').join(''),
      app_id: app.getAppId(),
      data_id: this.data.goodsId,
      interval: interval ? interval : '',
      start_time: startTime ? startTime : '',
      time_long: timeLong ? timeLong : '',
      sub_shop_app_id: this.data.franchiseeId
    }, true);
  },
  //起始日期
  bindStartDateChange: function(e) {
    var value = e.detail.value;
    this.setData({
      'appointmentInfo.appointmentStartDateRange': value,
      'appointmentInfo.appointmentEndDateRange': value
    });
    this.getAppointmentList({
      start_date:value.split('-').join(''),
      end_date: this.data.appointmentInfo.appointmentEndDateRange.split('-').join(''),
      app_id: app.getAppId(),
      data_id: this.data.goodsId,
      sub_shop_app_id: this.data.franchiseeId
    }, true);
  },
  
  //结束日期
  bindEndDateChange: function(e) {
    var value = e.detail.value;
    this.setData({
      'appointmentInfo.appointmentEndDateRange':value
    });
    this.getAppointmentList({
      start_date: this.data.appointmentInfo.appointmentStartDateRange ? this.data.appointmentInfo.appointmentStartDateRange.split('-').join('') : this.data.appointmentInfo.appointmentDay.split('-').join(''),
      end_date: value.split('-').join(''),
      app_id: app.getAppId(),
      data_id: this.data.goodsId,
      sub_shop_app_id: this.data.franchiseeId
    }, true);
  },
  
  bindTimeChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      time: e.detail.value
    })
    this.serviceConditionChange();
    
  },
  servicePeriodSelectChange: function(e){
    var value = e.detail.value;
    this.setData({
      periodRangeIndex: value
    });
    if (this.data.serviceTimeUnit == '小时'){
      this.serviceConditionChange();      
    }
  },
  serviceDateChange: function(e){
    var dataset = e.currentTarget.dataset,
        ifBusinessDay = dataset.ifbusinessday,
        date = dataset.date,
        data = {};

    data['selectedDate'] = date;
    if(!ifBusinessDay){
      data['appointmentInfo.servicePeriodList'] = '';
    }
    this.setData(data);

    if(ifBusinessDay){
      this.serviceConditionChange();
    }
  },
  servicePeriodListChange: function(e){
    var dataset = e.currentTarget.dataset,
        canBuy = dataset.canBuy,
        expired = dataset.expired;

    if(expired == 1 || canBuy == 0){
      return;
    }

    this.setData({
      selectedPeriod: e.currentTarget.dataset.interval
    });
  },
  serviceConditionChange: function(){
    var param = this.getParam();

    this.getAppointmentList(param, false);
    this.setData({
      selectedPeriod: ''
    });
  },
   hiddeAddToShoppingCart: function(){
    this.setData({
      addToShoppingCartHidden: true
    })
  },
  getParam: function(){
    var appointmentInfo = this.data.appointmentInfo;
    if(this.data.appointmentInfo.serviceLongRange){
      var timeNum = this.data.appointmentInfo.serviceLongRange[0];        
    }
    if(appointmentInfo.serviceLongRange){
      var serviceLongRange = appointmentInfo.serviceLongRange[this.data.longRangeIndex];
    }
    var param = {
            app_id: app.getAppId(),
            data_id: this.data.goodsId,
            sub_shop_app_id: this.data.franchiseeId
          };
    if(this.data.unitType == 2){
      var periodsSelected = appointmentInfo.servicePeriodRange[this.data.periodRangeIndex],
          startDay = periodsSelected.substring(6,8) == '当日' ? periodsSelected.split('当日').join(''):periodsSelected.substring(0,6) + (periodsSelected.substring(8,10)*1 + 24) + periodsSelected.substring(10);
      param.interval  = startDay;
      // param.interval  = this.data.selectedPeriod;      
      param.day = this.data.appointmentInfo.appointmentDay.split('-').join('');
      param.time_long = appointmentInfo.serviceLongRange[this.data.longRangeIndex] ;   
    }else if (this.data.unitType == 1){
      param.day = this.data.appointmentInfo.appointmentDay.split('-').join('');
      param.start_time  = this.data.time;
      param.time_long = appointmentInfo.serviceLongRange[this.data.longRangeIndex] ;   
    }else if(this.data.unitType == 3){
      param.start_date = this.data.appointmentInfo.appointmentStartDateRange.split('-').join('');;
      param.end_date = this.data.appointmentInfo.appointmentEndDateRange.split('-').join('');;
    }
    return param;
  },
  getShopParam: function(){
    var appointmentInfo = this.data.appointmentInfo;
    if(this.data.appointmentInfo.serviceLongRange){
      var timeNum = this.data.appointmentInfo.serviceLongRange[0];        
    }
    if(appointmentInfo.serviceLongRange){
      var serviceLongRange = appointmentInfo.serviceLongRange[this.data.longRangeIndex];
    }
    var param = {
            app_id: app.getAppId(),
            goods_id: this.data.goodsId,
            sub_shop_app_id: this.data.franchiseeId
          };
    if(this.data.serviceTimeUnit == '小时'){
      // param.appointment_interval  = appointmentInfo.servicePeriodRange[this.data.periodRangeIndex];
      var startHours = this.data.selectedPeriod.split('-')[0].split(':')[0],
          startHour = startHours.substring(2)*1,
          startMin = this.data.selectedPeriod.split('-')[0].split(':')[1],
          endHours = this.data.selectedPeriod.split('-')[1].split(':')[0] * 1,
          endMin = this.data.selectedPeriod.split('-')[1].split(':')[1],
          startTime = startHours.substring(0, 2) == '当日' ? startHour + ':' + startMin : (startHour + 24) + ':' + startMin,
          endTime = endHours < startHour || startTime.split(':')[0] >= 24 ? (endHours + 24) + ':' + endMin : endHours + ':' + endMin,
          period = startTime + '-' + endTime;

      param.appointment_interval = period;    
      param.appointment_unit_type = 2;
      param.appointment_day = this.data.appointmentInfo.appointmentDay.split('-').join('');
      param.appointment_time_long =  appointmentInfo.serviceLongRange[this.data.longRangeIndex] ;   
    }else if (this.data.serviceTimeUnit == '分'){
      param.appointment_unit_type = 1;      
      param.appointment_day = this.data.appointmentInfo.appointmentDay.split('-').join('');
      param.appointment_time_long = appointmentInfo.serviceLongRange[this.data.longRangeIndex] ;
      param.appointment_interval = this.data.time + '-' + this.setTime(this.data.time,appointmentInfo.serviceLongRange[this.data.longRangeIndex]); 
    }else if(this.data.serviceTimeUnit == '天'){
      param.appointment_unit_type = 3;      
      param.appointment_start_date = this.data.appointmentInfo.appointmentStartDateRange.split('-').join('');
      param.appointment_end_date = this.data.appointmentInfo.appointmentEndDateRange.split('-').join('');
    }
    return param;
  },
  sureMakeAppointment: function(e){
    var selectPeriod = this.data.selectedPeriod,
        franchiseeId = this.data.franchiseeId,
        servicePrice = this.data.appointmentInfo.servicePrice,
        serviceTimeUnit = this.data.serviceTimeUnit,
        param,
        time = this.data.time,
        that = this;
        
    if(!servicePrice){
      app.showModal({
        content: this.data.appointmentInfo.appointmentDay + ' 这一天没有可用的预约或者预约都已经满了'
      });
      return;
    }
    if(serviceTimeUnit=="小时" && !selectPeriod){
      app.showModal({
        content: '请选择具体时间'
      });
      return;
    }
   
    param = this.getShopParam();
    // param.interval = selectPeriod;
    param.model_id = 0;
    param.num = 1;
    param.is_appointment = 1;
   
    app.sendRequest({
      url: '/index.php?r=AppShop/AddCart',
      data: param,
      success: function(res){
        let cart_arr = [res.data],
            pagePath = '/eCommerce/pages/previewAppointmentOrder/previewAppointmentOrder?cart_arr='+ encodeURIComponent(cart_arr) + ('&to_store='+JSON.stringify(time)) ;
        franchiseeId && (pagePath += '&franchisee='+franchiseeId);
        that.hiddeAddToShoppingCart();
        app.turnToPage(pagePath,true);
      }
    })
  }
})
