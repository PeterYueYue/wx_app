const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    userInfo: {},
  },
  onLoad() { },
  onShow() {
    this.init();
  },
  init() {
    this.getNextVoucherActivityDate();
    let res = wx.getStorageSync('userInfo');
    if (res === null) {
      return false;
    }
    this.setData({
      userInfo: res,
    });
  },
  goLife(){
    // let url = '微信公众号地址eg:https://mp.weixin.qq.com/mp/...?action=home&__biz=...==&scene=...#wechat_redirect';
    // var LinkUrl = encodeURIComponent(url);
    // let type = 'encodeUrl';
    // wx.navigateTo({
    //     url: `../d_webview/d_webview?type=${type}&url=${LinkUrl}`
    // });
    wx.navigateTo({
      url: `../webView/webView?&url=https://mp.weixin.qq.com/s/fJV0xqD-jBsjD6RMCi-unw`
    });
  },
  goMember() {//成为普通会员
    wx.navigateTo({
      url: '/pages/member/member/member'
    });
  },
  goFocus() {//关注生活号
    
  },
  goFriend() {//好友助力
    wx.navigateTo({
      url: '/pages/vouchers/friendsHelp/friendsHelp'
    });
  },
  goZddlu() { //进入整点登录
    if (!this.data.userInfo.id) {
      this.toLogin(`/pages/vouchers/timelogin/timelogin?id=${this.data.activityId}`)
      return false
    }
    wx.navigateTo({
      url: `/pages/vouchers/timelogin/timelogin?id=${this.data.activityId}`
    });
  },
  getNextVoucherActivityDate() { // 获取活动id
    request.get("user/rest/voucher/nextVoucherActivityDate").then(res => {
      if (res.data.code === 0) {
        this.setData({ activityId: res.data.data.activityId });
      }
    })

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
            url: '../login/login'
          });
        }
      },
    });
  },
  onPullDownRefresh() {

    my.stopPullDownRefresh()
  }

});
