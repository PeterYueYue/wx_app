const request = require("../../../utils/request.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
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
  getBagCount(){
    let data ={ type:"ropeBundle"}
    request.post("user/rest/user/typeRemainingNumber",data).then(res => {
      this.setData({bagCount:res.data.data.number})
    })
  },
  goMember(){

    let userInfoMore = wx.getStorageSync('userInfoMore');
    if(userInfoMore && userInfoMore.hasSendDoorVoucher){
      wx.showToast({
        icon: "none",
        title: "你已经是会员",
        duration: 1500,
      });
      return
    }
    wx.navigateTo({
      url: '/pages/member/dnActivity/dnActivity',
    })
  },
  goMdActivety(){

    let data ={ type:"ropeBundle"}
    request.post("user/rest/user/typeRemainingNumber",data).then(res => {
      if(res.data.data.number){
        wx.navigateTo({
          url: '/pages/member/mdActivity/mdActivity',
        })
      }else{
        wx.showToast({
          icon: "none",
          title: "活动已结束",
          duration: 1500,
        });
      }
    })
    
  },
  goDn(){
    wx.navigateToMiniProgram({
      appId: 'wx363c0209532370d2',
    })
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