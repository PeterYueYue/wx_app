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
    status: true,
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
    this.getUserInfo()
  },
  getUserInfo(){
    let id = wx.getStorageSync('userId');
    request.post("user/rest/user/getUserInfo", {userId:id}).then(res => {
      if (res.data.code === 0) {
        
        this.setData({
          userInfoMore: res.data.data,
        });
        wx.setStorage({
          key: 'userInfoMore', // 缓存数据的key
          data: res.data.data, // 要缓存的数据
        });
        let userInfo = wx.getStorageSync('userInfo');
        this.setData({
          userInfo: userInfo,
          total: res.data.data.bagPrice * this.data.num,
        })
       
      }
    })

  },
  buy() {
    let param = {
      bagNum: this.data.num,
      userId: wx.getStorageSync('userId'),
      deliveryAddress: this.data.add.provinceName + this.data.add.cityName + this.data.add.areaName + this.data.add.address,
      deliveryMobile: this.data.add.userMobile,
      deliveryName: this.data.add.userName,
      purchaseItems: 'vip',
    }
    this.setData({
      status: false,
    })
    // return false
    request.post("order/rest/order/wxPay", param).then(res => {
      console.log(res)
      this.setData({
        status: true
      })
      if (res.data.code == 0) {
        wx.requestPayment({
          timeStamp: res.data.data.data.timeStamp,
          nonceStr: res.data.data.data.nonceStr,
          package: res.data.data.data.package,
          signType: 'MD5',
          paySign: res.data.data.data.paySign,
          success(res) {
            wx.setStorageSync('activeIndex', 2)
            wx.showToast({
              icon: 'none',
              title: "购买成功，可立即绑定拾尚包",
              duration: 1500,
              success: (res) => {
                // wx.switchTab({
                //   url: '../bao/bao'
                // });
              },
            });
            setTimeout(function () {

              wx.navigateTo({
                url: '/pages/bao/bao'
              })

            }, 1500)
          },
          fail(res) {
            wx.showToast({
              icon: 'none',
              title: "用户中途取消",
              duration: 2000,
            });
          }
        })
      }
    })
  },
  toAddress() {
    wx.navigateTo({
      url: `../../address/address?status=2`
    });
  },
  change() {
  },
  // 未开通普通会员用户
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
          "iv": login.iv
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
                wx.navigateBack();
              },
            });
          }
        })
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        //重新登录
        wx.login({
          success(res) {
            code = res.code
            wx.getUserInfo({
              success(res1) {
                let param = {
                  "code": code,
                  "encryptedData": res1.encryptedData,
                  "iv": res1.iv
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
                        wx.navigateBack();
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
