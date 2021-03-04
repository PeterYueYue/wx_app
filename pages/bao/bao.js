var app = getApp();
const request = require("../../utils/request.js");
Page({
  data: {
    userInfo: {}, //用户登录存的所有信息
    type: 1, //判断类型 1为用户 2为企业
    bagCount: '0', // 用户情况下可绑定数量
    // active: "一次绑定资格可循环绑定一个拾尚包。需同时绑定使用多个拾尚包，请购买更多绑定资格",
    active: `"拾尚包"可循环使用，一个绑定资格可绑定一个拾尚包，如需同时绑定多个"拾尚包"，请购买更多绑定资格`,
    list: [],
    imgUrl: app.globalData.imgUrl,
    code: '',
  },
  onLoad(options) {
  },
  onReady() {
  },
  onShow(options) {
    this.getList();
    const _this = this;
    if (app.globalData.code !== '') {
      const param = {
        userId: this.data.userInfo.id,
        bagCode: app.globalData.code
      }
      request.post('user/rest/userSsb/userScanBag', param).then((res) => {
        app.globalData.code = "";
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: "绑定成功",
            duration: 1500,
            success: (res) => {

            },
          });
          _this.getList()
          wx.showToast({
            icon: 'none',
            title: '绑定成功',
            duration: 1500,
          });
        }
      })
    }
  },
  unlock(e) {
    const data = {
      id: e.target.dataset.id.id,
    }
    request.post("user/rest/user/unbind?id="+ data.id).then(res => {
      console.log(res);
      if (res.data.code === 0) {
        wx.showToast({
          icon:'none',
          title: '解绑成功',
          duration: 1500,
        });
       this.getList();
      }
    })
  },
  getBag() {//去获取拾尚包
    wx.navigateTo({
      url: '/pages/member/member/member'
    });
  },
  getList() {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        type: userInfo.userFlag,
        userInfo: userInfo
      })
      let data = { userId: userInfo.id }
      request.post("user/rest/user/getUserInfo", data).then(res => {
        if (res.data.code === 0) {
          wx.setStorageSync('userInfoMore', res.data.data);
          if (res.data.data.userAddress) {
            wx.setStorageSync('add',res.data.data.userAddress);
          }
        }
      })
    } else {
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
          } else {
            wx.switchTab({
              url: '../index/index',
              success: (res) => {},
            });
            wx.navigateBack()
          }
        },
      });
      return false;
    }
    //用户情况下获取可绑定数量
    if (userInfo.userFlag == 1) {
      request.post('user/rest/user/getUserInfo', { userId: userInfo.id }).then((res) => {
        if (res.data.code == 0) {
          this.setData({
            bagCount: res.data.data.bagCount
          })
        }
      })
    }
    //获取已绑定袋子列表
    request.post('user/rest/userSsb/getScanBagList', { userId: userInfo.id }).then((res) => {
      if (res.data.code == 0) {
        let status = 0
        if (res.data.data.length == 0) {
          status = 1
        }
        this.setData({
          list: res.data.data,
          status
        })
      }
    })
  },
  toBind() {
    const _this = this
    wx.scanCode({
      scanType: 'qrCode',
      success: (res) => {
        let data = {
          userId: this.data.userInfo.id,
          bagCode: res.result.split('code=')[1],
        }
        request.post('user/rest/userSsb/userScanBag', data).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              icon: 'none',
              title: "绑定成功",
              duration: 1500,
              success: (res) => {

              },
            });
            _this.getList()
          }
        })
      }
    })
  },
  onPullDownRefresh() {
    this.getList()
    wx.stopPullDownRefresh()
  }
});
