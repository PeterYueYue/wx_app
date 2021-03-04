// pages/shop/signIn/signIn.js
var app = getApp();
const request = require("../../../utils/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    showTop:false,
    animationData:{},
    isShowDoorTips:false,
    signInData:{},
    hotProduct:[]

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
    let userInfo = wx.getStorageSync('userInfo')
    this.setData({userInfo:userInfo},()=>{
      this.getSignInData()
      this.getHotProduct()
    })


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    
  },
  goGetDoor(){
    wx.navigateTo({
      url: '/pages/getDoor/getDoor',
    })
  },
  appointment() { //预约
    if (!this.data.userInfo.id) {
      this.toLogin()
      return false
    }
    let data = { userId: this.data.userInfo.id}
    
    request.get('order/rest/resserveOrder/getShangmenVoucherNum', data).then((res) => {
      if (!res.data.data || res.data.data == 0) {
        this.setData({isShowDoorTips:true})
        return false
      } else {
        wx.navigateTo({
          url: '/pages/appointment/appointment'
        });
      }
    })
    
    
  },
  closeDoorTips(){
    this.setData({isShowDoorTips:false})
  },
  goRule() {
    wx.navigateTo({
      url: `/pages/webView/webView?url=https://miniapp.shishangbag.vip/web_rule/singin/index.html`
    });
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
  getHotProduct(){
    request.get('user/rest/product/hotProducts?qty=20').then((res)=>{
      console.log(res,"hot")
      this.setData({hotProduct:res.data.data})
    })

  },
  getSignInData(){
    request.get('user/rest/signIn/signInfo',{userId:this.data.userInfo.id}).then((res)=>{
      this.setData({signInData:res.data})
    })
  },
  submit(){
    request.get('user/rest/signIn/submit',{userId:this.data.userInfo.id}).then((res)=>{

      setTimeout(() =>{
        this.getSignInData()
      },1000)
      this.setData({point:res.data.point})
    })

  },
  goDetails(e){
    if(e.currentTarget.dataset.item.stock ==0) {
      return;
    }
    wx.navigateTo({
      url: `/pages/shop/productDetail/productDetail?item=${JSON.stringify(e.currentTarget.dataset.item)}`,
    })

  },
  onTopBtnTap() {
    var that = this;
    this.submit()
    var animation  = wx.createAnimation({
        duration:200,
        timingFunction:'linear'
    })
    that.animation = animation
    animation.translateY(-1000).step()
    that.setData({
      animationData: animation.export(),
      showTop: true
    })
    setTimeout(function(){
      animation.translateY(0).step()
      that.setData({
        animationData: animation.export(),
        
      })
    },200)
    
    
  },
  onPopupClose() {
    var that = this;
    var animation  = wx.createAnimation({
        duration:200,
        timingFunction:'linear'
    })
    that.animation = animation
    animation.translateY(-1000).step()
    that.setData({
      animationData: animation.export(),
    })
    setTimeout(function(){
      that.setData({
        showTop: false
      })
    },200)
    
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