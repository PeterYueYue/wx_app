// pages/vouchers/friendsHelp/friendsHelp.js
const request = require("../../../utils/request.js");
var countTime  = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeObj:{
      h: "00",
      m: "00",
      s: "00"
    },
    fdList:[],
    activInfo:{},
    mainUserId:'',
    isYq:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if (options.userId && options.activityId){
      this.setData({ mainUserId: options.userId})
      this.setData({ isYq:true})
    }
    if(options.activityId){
      this.setData({ activityId: options.activityId })
    }else{
      wx.showToast({
        icon: 'none',
        title: '获取活动失败！',
        duration: 1500,
      });
    }
    
    
    
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

    this.init()


  },
  init(){
    let userId = wx.getStorageSync("userId")
    this.setData({ userId: userId })
    let data = JSON.stringify({ "userId": this.data.mainUserId ? this.data.mainUserId : userId })
    request.post(`user/rest/voucher/receiveAssistInfo`, data).then(res => {
      clearInterval(countTime)
      if (res.data.code === 0) {
        this.setData({ activInfo: res.data.data })
        this.setData({ fdList: res.data.data.list })
        this.setData({ countTime: res.data.data.leftTime.residueSeconds });
        this.countDown(res.data.data.leftTime.residueSeconds)
      }
    })
  },
  // 整点登录倒计时
  countDown(residueSeconds) {
    countTime = setInterval(() => {
      var time = residueSeconds--;
      this.setData({ residueSeconds: time })
      if (time <= 0) {
        this.setData({ isActivity: true })
        clearInterval(countTime)
        return
      }
      var min = Math.floor(time % 3600);
      var time1 = Math.floor(time / 3600) + "时" + Math.floor(min / 60) + "分" + time % 60 + "秒";
      let timeObj = {
        h: Math.floor(time / 3600) < 10 ? '0' + Math.floor(time / 3600) : Math.floor(time / 3600),
        m: Math.floor(min / 60) < 10 ? '0' + Math.floor(min / 60) : Math.floor(min / 60),
        s: time % 60 < 10 ? '0' + time % 60 : time % 60
      }
      this.setData({ timeObj: timeObj })
    }, 1000)
  },
  goFdHp(){
    wx.redirectTo({
      url: `/pages/vouchers/friendsHelp/friendsHelp?activityId=${this.data.activityId}`
    });
  },
  helpAction(){
    if (!this.data.userId){
      this.toLogin()
    }else{
      // 执行助力成功
      let userId = wx.getStorageSync("userId")
      let data = JSON.stringify({ 
        "forUserId":this.data.mainUserId,
        "userId":userId,
        "activityId":this.data.activityId 
        })
      request.post(`user/rest/voucher/receiveAssistVoucher`,data).then(res => {
        this.init()
        wx.showToast({
          icon: 'none',
          title: res.data.message,
          duration: 1500,
        });

      })
    }
  },
  toLogin() {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      },
    });
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

    this.init()
    wx.stopPullDownRefresh();

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {

    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: "点击助力，帮我拿下上门券吧，谢谢！",
        path: `pages/vouchers/friendsHelp/friendsHelp?activityId=${this.data.activityId}&userId=${this.data.userId}`,
        imageUrl: 'http://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/vouchers/shareHelp.png',
      }
    }


  }
})