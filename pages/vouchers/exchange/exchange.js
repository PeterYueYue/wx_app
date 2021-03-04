// pages/vouchers/vouchers/vouchers.js
const request = require("../../../utils/request.js");
Page({
  data: {
    userInfo: {},//用户信息
    code: '',
    click: true,
  },
  onLoad: function (options) {
  },

  onReady: function () {
  },

  onShow: function () {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    }
  },
  change(e) {
    this.setData({
      code: e.detail.value,
    })
  },
  ex() {
    this.setData({
      click: false,
    })
    const data = {
      code: this.data.code,
      userId: this.data.userInfo.id,
    }
    // http://localhost:17201/rest/voucher/exchangeActivityCode?activityCode=4sgeavsn5ufa&userId=1fa4cc4407c645d380e523aa4dc5caa0
    request.post(`user/rest/voucher/exchangeActivityCode?activityCode=`+this.data.code+'&userId=' + this.data.userInfo.id).then(res => {
      this.setData({
        click: true,
      })
      console.log(res)
      if(res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: "兑换成功",
          duration: 2000,
        });
      }
    })
  },
  
  toLogin() {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '../login/login'
          });
        }
      },
    });
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  },
  onShareAppMessage: function (res) {
  }
})