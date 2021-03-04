const request = require("../../../utils/request.js");
const md5 = require("../../../utils/md5.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    issuccess:false,
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
  onShow() {
   
  },
  toLogin(backPage) {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          if(backPage){
            wx.navigateTo({
              url: '/pages/login/login?backPage='+backPage
            });
          }else{
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
          
        } else {
          this.triggerEvent("switchTab")
        }
      },
    });
  },
  
  goMember(){

    wx.navigateTo({
      url: `/pages/member/member/member`
    });

  },
  goVouList(){
    // wx.navigateTo({
    //   url: '/pages/vouchers/typeList/typeList',
    // })
    wx.openCard({
      cardList: [{
        cardId: this.data.cardId,
        code: this.data.code
      },],
      success (res) { 

      }
    })


  },
  // 领取优惠券
  getCoupons(){
    let userInfoMore = wx.getStorageSync('userInfoMore');

    if(!userInfoMore){
      
      this.toLogin();
      return
    }
    if(!getApp().globalData.obi){
      wx.showToast({
        icon: 'none',
        title: '获取设备码失败',
        duration: 1500,
        success: () => {
          _this.goBack()
        },
      });
      return

    }
    
    let userId = wx.getStorageSync('userId');
    let data = JSON.stringify({
      userId:userId,
      // obi:"YCTEST111_1605235656126",
      obi:getApp().globalData.obi,
      source:"wx"
    })
    wx.showLoading()
    setTimeout(() => {
      wx.hideLoading()
    },5000)
    request.post("user/open/iot/danoneScan", data).then(res => {
      if (res.data.code == 0) {
        console.log(res)
        this.fq(res.data.data)
      }
    })

  },
  fq(data){
    if(!data){
      wx.showToast({
        icon: 'none',
        title: '为获取到全券码信息',
        duration: 1500,
        
      });
      return
    }
    
    let cardExt = {
      code:data.code,
      timestamp: data.timestamp,   //时间戳，以秒为单位
      api_ticket: data.ticket,    //apiticket
      nonce_str: data.nonceStr,     //随机字符串
      card_id:data.cardId,
      signature:data.signature,   //签名
    }
    let that = this;

    wx.addCard({
      cardList: [{
        cardId: data.cardId,
        cardExt:JSON.stringify(cardExt),
      }],
      success (res) {
        wx.hideLoading()

        wx.openCard({
          cardList: [{
            cardId: data.cardId,
            code: data.code
          },],
          success (res) { 
            
          }
        })
      }
      
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