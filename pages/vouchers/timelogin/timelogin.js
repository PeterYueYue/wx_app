// pages/vouchers/timelogin/timelogin.js
const request = require("../../../utils/request.js");
var app = getApp();
var countTime = null
var countTime2 = null
Page({
  data: {
    activityId: '',
    list: [],
    imgUrlNew: app.globalData.imgUrlNew,
    newUser: {},//新用户
    timeObj: { //显示的倒计时
      h: "00",
      m: "00",
      s: "00"
    },
    showTime: true,//活动是否开始
  },
  onLoad: function (options) {
    this.setData({ activityId: options.id });
    this.checkUser();
  },

  onReady: function () {
  },
  onShow: function () {
    this.getList(this.data.activityId)
    this.getNextVoucherActivityDate();//获取活动时间
  },
  // 获取整点登录时间
  getNextVoucherActivityDate() {
    clearInterval(countTime)
    clearInterval(countTime2)
    request.get("user/rest/voucher/nextVoucherActivityDate").then(res => {
      // console.log(res, "整点登录数据")
      if (res.data.code === 0) {
        this.setData({ countTime: res.data.data.residueSeconds });
        // this.setData({ activityId: res.data.data.activityId});
        this.countDown(res.data.data.residueSeconds);
        //活动开始 显示领取按钮
        if (res.data.data.residueSeconds == null) {
          this.setData({
            showTime: false,
          })
        }
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
      // var time1 = Math.floor(time / 3600) + "时" + Math.floor(min / 60) + "分" + time % 60 + "秒";
      let timeObj = {
        h: Math.floor(time / 3600) < 10 ? '0' + Math.floor(time / 3600) : Math.floor(time / 3600),
        m: Math.floor(min / 60) < 10 ? '0' + Math.floor(min / 60) : Math.floor(min / 60),
        s: time % 60 < 10 ? '0' + time % 60 : time % 60
      }
      this.setData({ timeObj: timeObj })
    }, 1000)

    countTime2 = setInterval(() => {
      this.getNextVoucherActivityDate()

    }, 10000)


  },
  checkUser() {//检查新用户
    let res = wx.getStorageSync("newUser");

     


    if (res !== null) {
      this.setData({
        newUser: res.data,
      })
    }
  },
  closemask_() {
    let newUser = this.data.newUser;
    newUser.timelogin = false;
    this.setData({
      newUser: newUser,
    })
    wx.setStorageSync({
      key: 'newUser',
      data: newUser,
    });
  },

  goFriendHelp() {
    if(this.data.activityId){
      wx.navigateTo({
        url: `/pages/vouchers/friendsHelp/friendsHelp?activityId=${this.data.activityId}`
      });
    }else{
      wx.showToast({
        icon: 'none',
        title: '获取活动失败！',
        duration: 1500,
      });
    }
    
  },
  getList(id) {
    request.post("user/rest/voucher/getTypeByActivityId?activityId=" + id).then(res => {
      if (res.data.code === 0) {
        this.setData({ list: res.data.data });
      }
    });
  },
  submit(e) {
    let that = this;
    let userInfo = wx.getStorageSync('userInfo');
    userInfo = userInfo;
    let data = JSON.stringify({
      "mobile": userInfo.userMobile,
      "activityId": e.target.dataset.data.activityId,
      "voucherId": e.target.dataset.data.typeId
    })
    request.post("user/rest/voucher/sendVoucher", data).then(res => {
      if (res.data.code === 0) {
        wx.showToast({
          type: 'none',
          title: "领取成功",
          duration: 1500,
        });
        that.getList(that.data.activityId)
        return
      }
    });
  },
  goH5() {
    wx.navigateTo({
      url: `/pages/webView/webView?url=https://cat.shishangbag.vip/aland/`
    });
  },

  onHide() {
    // 页面隐藏
    clearInterval(countTime)
    clearInterval(countTime2)
  },

  onUnload: function () {
    clearInterval(countTime)
    clearInterval(countTime2)

  },

  onPullDownRefresh: function () {
    this.getList(this.data.activityId)
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})