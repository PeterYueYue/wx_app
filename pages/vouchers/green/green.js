// pages/vouchers/vouchers/vouchers.js
const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    userInfo: {},//用户信息
    imgUrlNew: app.globalData.imgUrlNew,
    success_mask: false,
    autoDisplay: true,
    code: '',//微信code
    userInfo: {},//用户信息
  },
  onLoad: function (options) {
    // if (options.userId && options.activityId){
    //   this.setData({ mainUserId: options.userId})
    //   this.setData({ isYq:true})
    // }
    // this.setData({ activityId: options.activityId })
  },

  onReady: function () {
    
  },

  onShow: function () {
    let that = this;
    wx.login({
      success(res) {
        that.setData({
          code: res.code,
        })
      }
    })
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    }
  },
  get: function() {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    } else {
      this.toLogin();
      return false;
    }
    const data = {
      mobile: userInfo.userMobile,
    }
    request.post(`user/rest/voucher/sendVoucher`, data).then(res => {
      if(res.data.code == 0) {
        this.setData({
          success_mask: true,
        })
        setTimeout(() => {
          wx.redirectTo({
            url: '../../../pages/index/index',
          })
        }, 2000)
      } else {
        setTimeout(()=>{
          wx.redirectTo({
            url: '../../../pages/index/index',
          })
        },2000)
      }
    })
  },
  onGetAuthorize(e) {
    const _this = this;
    let code = '';
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        let login = e.detail;
        code = _this.data.code
        let data = {
          "code": code,
          "encryptedData": login.encryptedData,
          "iv": login.iv,
        }
        request.post("user/rest/weixin/updateUserMobile", data).then(res => {
          if (res.data.code == 0) {
            _this.setData({
              autoDisplay: false,
              userInfo: res.data.data.userInfo,
            });
            wx.setStorageSync("openId", res.data.data.userInfo.openId)
            wx.setStorageSync("userInfo", res.data.data.userInfo)
            wx.setStorageSync("userId", res.data.data.userInfo.id)
            wx.showToast({
              icon: 'none',
              title: '登录成功',
              duration: 1500,
              success: () => {
              },
            });
          }
        })
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.login({
          success(res) {
            code = res.code
            wx.getUserInfo({
              success(res1) {
                let param = {
                  "code": code,
                  "encryptedData": res1.encryptedData,
                  "iv": res1.iv,
                }
                data = JSON.stringify(data)
                request.post("user/rest/weixin/updateUserMobile", data).then(res => {
                  if (res.data.code == 0) {
                    _this.setData({
                      autoDisplay: false,
                      userInfo: res.data.data.userInfo,
                    });
                    wx.setStorageSync("openId", res.data.data.userInfo.openId)
                    wx.setStorageSync("userInfo", res.data.data.userInfo)
                    wx.setStorageSync("userId", res.data.data.userInfo.id)
                    wx.showToast({
                      icon: 'none',
                      title: '登录成功',
                      duration: 1500,
                      success: () => {
                      },
                    });
                  }
                })
              }
            })
          }
        })
      }
    })
  },
  toLogin() {
    this.setData({
      login_mask: true,
    })
    // wx.showModal({
    //   title: '温馨提示',
    //   content: '您还未登录，确定去登录吗？',
    //   confirmButtonText: '确定',
    //   cancelButtonText: '取消',
    //   success: (result) => {
    //     if (result.confirm) {
    //       wx.navigateTo({
    //         url: '../../login/login'
    //       });
    //     }
    //   },
    // });
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  },
  onShareAppMessage: function (res) {
  }
})