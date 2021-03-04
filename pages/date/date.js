const request = require("../../utils/request.js");
const util = require("../../utils/util.js");
var app = getApp();
Page({
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
    tabs: [],
    text: '',
    time: {},
    t_index: 0,
    weightId:0,
    isAgree:true,
    isOpen:false
  },
  // back(e) {
  //   let type = e.currentTarget.dataset.type
  //   let data = this.data.tabs[this.data.activeTab]
  //   data.type = type
  //   my.setStorage({
  //     key: 'date', // 缓存数据的key
  //     data: data, // 要缓存的数据
  //     success: (res) => { },
  //   });
  //   my.navigateBack()
  // },
  onLoad(e) {
    
    this.setData({ 
      weightId: e.weightId,
      providerId:e.providerId
    },() => {
      if(e.type == 'appliance'){
        this.getApplianceData(e)
      }else{
        this.getData(e);
      }
      
    })
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    let date = wx.getStorageSync('date');
    console.log(date)
    if (date) {
      this.setData({
        text: date.remark
      })
    }
  },
  changeAgree(){
    this.setData({ isAgree: !this.data.isAgree})

  },
  getApplianceData(e){
    const _this = this
    let add = wx.getStorageSync("add");
    let userInfo = wx.getStorageSync('userInfo');
    let data = {
      providerId:e.providerId,
      userAddressId: add.id,
      userId:userInfo.id
    }
    request.post('order/rest/resserveOrder/getAddressTimeByProviderId', data).then((res) => {
      if (res.data.code == 0) {
        let list = []
        res.data.data.map((v, i) => {
          let num = {}
          num.street = res.data.data.street
          num.year = v.reserveDate
          num.week = "星期" + v.week
          num.title = v.reserveDate + " " + "星期" + v.week
          num.anchor = i
          list.push(num)
        })
        this.setData({
          tabs: list
        })
        if (list.length > 0) {
          this.setData({
            time: list[0]
          })
        }
        this.setData({ isOpen: true })
      } else {
        this.setData({ isOpen:false})
      }
    })
  },
  //初始化数据
  getData(e) {

    let add = wx.getStorageSync("add");
    let userInfo = wx.getStorageSync('userInfo');
    let data = {
      providerId:e.providerId,
      userAddressId: add.id,
      userId:userInfo.id
    }
    
    const _this = this
    request.post('order/rest/resserveOrder/getAddressTime',data).then((res) => {
      console.log(res)
      if (res.data.code == 0) {
        let list = []
        res.data.data.result.map((v, i) => {
          let num = {}
          num.street = res.data.data.street
          num.year = v.reserveDate
          num.week = "星期" + v.week
          num.title = v.reserveDate + " " + "星期" + v.week
          num.anchor = i
          list.push(num)
        })
        this.setData({
          tabs: list

        })
        if (list.length > 0) {
          this.setData({
            time: list[0]
          })
        }

        this.setData({ isOpen: true })
      } else {

        console.log(res,"res")
        this.setData({ isOpen:false})
        return

        wx.navigateBack();
      }
    })
  
  },
  tap(e) {
    this.setData({
      time: e.currentTarget.dataset.item,
      t_index: e.currentTarget.dataset.index
    })
  },
  input(e) {
    this.setData({
      text: e.detail.value
    })
  },
  back(){
    wx.navigateBack();
  },
  btn(e) {
    let that = this
    if (this.data.weightId == 1){
      let data = that.data.time
      data.remark = that.data.text;
      data.isAgree = that.data.isAgree;
      wx.setStorage({
        key: 'date', // 缓存数据的key
        data: data
      });
      wx.navigateBack();
      return
    }
    
    // 执行授权
    wx.requestSubscribeMessage({
      tmplIds: ['mRQms6ATASN57NBdV3c__5Ml2ub2zjhUR5a7MfUUWTQ'],
      success(res) { 
        if (res.mRQms6ATASN57NBdV3c__5Ml2ub2zjhUR5a7MfUUWTQ == 'accept'){
          let data = that.data.time
          data.remark = that.data.text;
          data.isAgree = that.data.isAgree;
          wx.setStorage({
            key: 'date', // 缓存数据的key
            data: data
          });
          wx.navigateBack();

        }else{
          wx.showToast({
            icon: 'none',
            title: '请允许订单完成通知',
            duration: 1500,
          });
        }
      }
    })
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});