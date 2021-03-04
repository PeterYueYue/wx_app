const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    name: "", //姓名
    card: "", //银行卡号
    phone: '', //手机号
    imgUrl: app.globalData.imgUrl
  },
  onLoad(e) {
    if (e.name && e.card) {
      this.setData({
        name: e.name,
        card: e.card
      })
    }
  },
  onReady() {
    // 页面加载完成
  },
  push: function() {
    var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (this.data.phone == '') {
      wx.showToast({
        icon: 'none',
        title: '请填写手机号',
        duration: 1500,
      });
      return false;
    }
    if (!reg.test(this.data.phone)) {
      wx.showToast({
        icon: 'none',
        title: '请填写正确的手机号',
        duration: 1500,
      });
      return false;
    }
    wx.navigateTo({
      url: `../bank_step3/bank_step3?name=${this.data.name}&card=${this.data.card}&phone=${this.data.phone}`
    })

  },
  change(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  onShow() {
    // 页面显示
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