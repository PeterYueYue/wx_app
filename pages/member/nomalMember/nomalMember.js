const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    num: 1,//数量
    total: 50,//总额
    add: {}, //地址数据
    addressStatus: false,//是否选择了上门地址的状态
    userInfo: {},
    userInfoMore: {},
    status: false,
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
  },
  onLoad(options) {
    // 页面加载
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    let add = wx.getStorageSync('add');
    if (add) {
      this.setData({
        addressStatus: true,
        add: add,
      })
    } else {
      this.setData({
        addressStatus: false,
        add: {},
      })
    }
    let userInfoMore = wx.getStorageSync('userInfoMore');
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({
      userInfoMore: userInfoMore,
      userInfo: userInfo,
      total: userInfoMore.bagPrice * this.data.num,
    })
    

  },

  buy(e) {
    console.log(e,"mmm")
    if(!this.data.add.id) {
      wx.showToast({
          icon: "none",
          title: "请填写地址",
        });
      return;
    }
    // member.registered 参数 userId，addressId
    let param = {
      userId: this.data.userInfo.id,
      addressId: this.data.add.id,
      sendFlag: e.currentTarget.dataset.status,
    }
    this.setData({
      status: true,
    })
    request.post("user/rest/user/member.registered?userId="+param.userId+"&addressId="+param.addressId+"&sendFlag="+param.sendFlag).then(res => {
      this.setData({
        status: false,
      })
      if (res.data.code == 0) {
        wx.showToast({
          type: "none",
          content: "注册成功,您已是普通会员 ",
          duration: 1500,
          success: function() {
            wx.navigateTo({
              url: `/pages/member/success/success`
            });
          }
        });
      }
    });
  },
  toAddress() {
    wx.navigateTo({
      url: `/pages/address/address?status=2`
    });
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
