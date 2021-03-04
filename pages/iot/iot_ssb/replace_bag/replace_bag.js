const request = require("../../../../utils/request.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
    is_scan:false,
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  toBind() {
    const _this = this
    let userInfo = wx.getStorageSync("userInfo");
    wx.scanCode({
      scanType: 'qrCode',
      success: (res) => {
        let data = {
          userId:userInfo.id,
          bagCode: res.result.split('code=')[1],
        }
        request.post('user/rest/userSsb/userScanBag', data).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              icon: 'none',
              title: "绑定成功",
              duration: 1500,
              success: (res) => {
                wx.reLaunch({
                  url: '/pages/index/index',
                })
              },
            });
          }
        })
      }
    })
  },
  changeIsScan(){
    this.setData({is_scan:true})
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})