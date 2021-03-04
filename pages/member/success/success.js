const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    name:"", //姓名
    card:"", //银行卡号
    phone: '',//手机号
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
  },
  onLoad(e) {
    if(e.name&&e.card){
      this.setData({
        name:e.name,
        card:e.card
      })
    }
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    }
  },
  goSuccess() {
     wx.redirectTo({
      url: '/pages/index/index?common=index'
    })
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
