// pages/vouchers/vouchers/vouchers.js
const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    userInfo: {},//用户信息
    imgUrl1: app.globalData.imgUrl1,
    autoDisplay: true,
    addressStatus: true,
    add: {},//选择地址
    once: true,
    encodeData: '',//加密过后的数据
    code: '',//微信code
  },
  onLoad: function (options) {
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
      this.lvSsbEncodeData()
    }
    let add = wx.getStorageSync('add');
    if (add) {
      this.setData({
        addressStatus: true,
        add: add
      })
    } else {
      this.setData({
        addressStatus: false,
        add: {}
      })
    }
  },
  
  toAddress() {//选择地址
    wx.navigateTo({
      url: `../../address/address?status=2`
    });
  },
  lvSsbEncodeData() {//获取加密后的数据
    request.get("user/rest/user/lvSsbEncodeData?userId=" + this.data.userInfo.id).then(res => {
      console.log(res);
      if (res.data.code == 0) {
        this.setData({
          encodeData: res.data.data,
        })
        console.log(this.data.encodeData);
      }
    })
  },
  freeGet(e) {//领袋子
    var that = this;
    if (!this.data.once) {
      return false;
    }
    this.setData({
      once: false,
    });
    if (!this.data.addressStatus) {
      wx.showToast({
        icon: 'none',
        title: '请选择收件地址',
        duration: 1500,
      });
      return false;
    }
    let param = {
      deliveryAddress: this.data.add.address,
      province: this.data.add.cityName + this.data.add.areaName,
      deliveryMobile: this.data.add.userMobile,
      deliveryName: this.data.add.userName,
      pushId: this.data.pushId,
      sendFlag: e.currentTarget.dataset.status,
      userId: this.data.userInfo.id,
      userMobile: this.data.add.userMobile,
      userName: this.data.add.userName,
    };
    request.post("user/rest/userSsb/getScanBag", param).then(res => {
      that.setData({
        once: true,
      });
      if (res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: '领取成功',
          duration: 1500,
          success: (res)=>{
            wx.navigateTo({
              url: `../../vouchers/success/success`
            });
          }
        });
      } else {
        setTimeout(() => {
          wx.navigateTo({
            url: `../../vouchers/success/success`
          });
        }, 2000)
      }
    });
  },
  onGetAuthorize(e) {
    this.lvSsbEncodeData()
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
                // wx.redirectTo({
                //   url: '/pages/index/index?common=index'
                // })
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
  gogreen(){

    wx.navigateTo({
      url: `/pages/webView/webView?url=https://weixin.greenfortune.sh.cn/greenwx/mobile/greenHS/autoChose?encodeData=${this.data.encodeData}`
    });


  },
  get(e) {
    let _this = this;
    if (!_this.data.addressStatus) {
      wx.showToast({
        icon: 'none',
        title: '请选择邮寄地址',
        duration: 1500
      });
    }
    let param = {
      deliveryAddress: this.data.add.address,
      province: this.data.add.cityName + this.data.add.areaName,
      deliveryMobile: _this.data.add.userMobile,
      deliveryName: _this.data.add.userName,
      pushId: _this.data.pushId,
      sendFlag: e.currentTarget.dataset.status,
      userId: _this.data.userInfo.id,
      userMobile: _this.data.add.userMobile,
      userName: _this.data.add.userName,
    };
    request.post("user/rest/userSsb/getScanBag", param).then(res => {
      if (res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: '领取成功',
          duration: 1500,
          success: function () {
            wx.redirectTo({
              url: '/pages/bao/bao'
            })
          }
        });
      } else {
        
      }
    });
  },
  toLogin() {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '../login/login'
          });
        }
      },
    });
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