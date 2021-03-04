var app = getApp();
const request = require("../../utils/request.js");
Page({
  data: {
    status: true,
    time: 60,
    code: '',//验证码
    imgUrl: app.globalData.imgUrl
  },
  onLoad(e) {
    if (e.name && e.card && e.phone) {
      this.setData({
        name: e.name,
        card: e.card,
        phone: e.phone
      })
    }
  },
  onReady() {
    // 页面加载完成
  },
  push: function () {
    let data = {
      name: thi.data.name,
      phone: this.data.phone,
      card: this.data.card,
      code: this.data.code
    }
    wx.navigateTo({
      url: '../bank/bank'
    });
  },
  change(e) {
    this.setData({
      code: e.detail.value
    });
  },
  getcode() {//获取验证码
    this.setData({
      status: false
    })
    let data = {
      mobile: this.data.phone,
      flag: 2,
    };
    request.post("user/rest/user/getCodeByMobile", data).then((res) => {
      if (res.data.code == 0) {

      }
    })
    const time = setInterval(() => {
      this.setData({
        time: this.data.time - 1
      });
      if (this.data.time === 0) {
        clearInterval(time);
        this.setData({
          status: true,
          time: 60
        });
      }
    }, 1000);
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
