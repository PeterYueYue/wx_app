// import {
//   rawCitiesData
// } from './cityData'; // 导入城市数据
const request = require("../../utils/request.js");

var app = getApp();
Page({
  data: {
    id: '',
    items: {
      name: 'defaultAddress',
      value: '默认地址'
    }, //默认地址
    checked: true,
    name: '', //姓名
    phone: '', //手机号
    site: '', //地址
    imgUrl: app.globalData.imgUrl, //图片路径
    selectValue: '', // 选择的值
    // selectShow: false, // 是否显示级联组件
    // rawCitiesData: rawCitiesData, // mock的级联数据
    loading: false,
    //测试
    show: true,
    columns: [
      {
        values: ["上海市"],
        className: 'column1'
      },
      {
        values: [
          { text: '杭州'},
          { text: '宁波' },
          { text: '温州' }
        ],
        className: 'column2'
      },
      {
        values: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '闵行区', '宝山区', '嘉定区', '浦东新区', '金山区', '松江区', '青浦区', '奉贤区','崇明区'],
        className: 'column3',
        defaultIndex: 1
      }
    ]
  },
  onLoad(e) {
    if (e.data) {
      let data = JSON.parse(e.data)
      this.setData({
        checked: data.isDefault == 0 ? false : true,
        name: data.userName,
        phone: data.userMobile,
        id: data.id,
        site: data.address,
        selectValue: data.provinceName + ' ' + data.cityName + ' ' + data.areaName
      })
    }
    wx.setNavigationBarTitle({
      title: e.title
    })
  },
  onReady(){
    this.initData()
  },
  initData(){
    this.getProvince(0)

  },
  // 获取省份
  getProvince(){
    request.get("user/rest/address/tarea?parentId=0").then((res) => {
      let p = res.data.data
      this.setData({ province: p })
      let arr1 = []
      p.map(e => {
        e.text = e.areaName
        arr1.push(e)
      })
      this.setData({ ['columns[0]' + 'values']: arr1 })
      this.getCitys(res.data.data[0].id)
    })
  },
  // 获取城市
  getCitys(id) {
    request.get("user/rest/address/tarea?parentId="+id).then((res) => {
      let c = res.data.data
      this.setData({ citys: c })
      let arr2 = []
      c.map(e => {
        e.text = e.areaName
        arr2.push(e)
      })
      this.setData({ ['columns[1]' + 'values']: arr2 })
      this.getAreas(res.data.data[0].id)
    })
  },
  // 获取行政区
  getAreas(id) {
    request.get("user/rest/address/tarea?parentId=" + id).then((res) => {
      let a = res.data.data
      this.setData({ areas: a })
      let arr3 = []
      a.map(e => {
        e.text = e.areaName
        arr3.push(e)
      })
      this.setData({ ['columns[2]' + 'values']: arr3 })
    })
  },


  onClose() {
    this.setData({
      selectShow: false
    });
  },
  onChange1(event) {
    const { picker, value, index } = event.detail;

    console.log(picker+'/'+value+'/'+index)
    switch (index) {
      case 0:
        this.getCitys(value[0].id)
        break
      case 1:
        this.getAreas(value[1].id)
        break
    }
    // picker.setColumnValues(1,  citys[value[0]]);
  },
  onConfirm(event) {
    const { picker, value, index } = event.detail;
    console.log(`当前值：${value}, 当前索引：${index}`)
    console.log(value)
    let newValue = value[0].areaName +' '+ value[1].areaName+' '+ value[2].areaName
    this.setData({
      selectValue: newValue,
      selectShow:false
    })
  },
  onCancel() {
   this.setData({
     selectShow:false
   })
  },

  //添加or编辑
  push: function() {
    const _this = this
    var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    if (this.data.name == "") {
      wx.showToast({
        icon:'none',
        title: '请填写姓名',
        duration: 1500,
      });
      return false;
    }
    if (this.data.name.length > 20) {
      wx.showToast({
        icon: 'none',
        title: '姓名不能超过20个字符',
        duration: 1500,
      });
      return false;
    }
    if (this.data.phone == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
        duration: 1500,
      });
      return false;
    }
    if (!reg.test(this.data.phone)) {
      wx.showToast({
        icon:'none',
        title: '请填写正确的手机号',
        duration: 1500,
      });
      return false;
    }
    if (this.data.selectValue == "") {
      wx.showToast({
        icon: 'none',
        title: '请选择所在区域',
        duration: 1500,
      });
      return false;
    }
    if (this.data.site == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写详细地址',
        duration: 1500,
      });
      return false;
    }
    if (this.data.site.length > 20) {
      wx.showToast({
        icon: 'none',
        title: '详细地址不能超过20个字符',
        duration: 1500,
      });
      return false;
    }

    this.setData({
      loading: true
    })
    let userInfo = wx.getStorageSync('userInfo');
    let addDetail = this.data.selectValue.split(' ')
    let data = {
      userId: userInfo.id,
      address: this.data.site,
      isDefault: this.data.checked == true ? "1" : "0",
      userMobile: this.data.phone,
      userName: this.data.name,
      provinceName: addDetail[0],
      cityName: addDetail[1],
      areaName: addDetail[2]
    }
    console.log(data)
    if (this.data.id) {
      data.addressId = this.data.id
      request.get("user/rest/address/editAddress", data).then((res) => {
        if (res.data.code == 0) {
          wx.navigateBack()
          _this.setData({
            loading: true
          })
        }
      })
    } else {
      request.get("user/rest/address/addAddress", data).then((res) => {
        if (res.data.code == 0) {
          wx.navigateBack()
          _this.setData({
            loading: true
          })
        }
      })
    }
  },
  //默认按钮的点击事件
  onChange(e) {
    if (e.currentTarget.dataset.checked == true) {
      this.setData({
        checked: false
      })
    } else {
      this.setData({
        checked: true
      })
    }
  },
  change(e) {
    const id = e.target.dataset.id
    switch (id) {
      case "1": //姓名
        this.setData({
          name: e.detail.value
        });
        break;
      case "2": //手机号
        this.setData({
          phone: e.detail.value
        });
        break;
      case "3": //地址
        this.setData({
          site: e.detail.value
        });
        break;
      default:
        break;
    }
  },
  //显示级联选择
  showSelect() {
    this.setData({
      selectShow: true
    })
  }
});