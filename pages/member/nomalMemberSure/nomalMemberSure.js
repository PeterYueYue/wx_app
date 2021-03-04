const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    num: 1,//数量
    total: 30,//总额
    add: {}, //地址数据
    addressStatus: false,//是否选择了上门地址的状态
    userInfo: {},
    userInfoMore: {},
    status: true,
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    type: 0,//0为正常购买袋子, 1为新用户买袋子返三十
  },
  onLoad(options) {
    // 页面加载
    if (options.type) {
      this.setData({
        type: options.type,
      })
    }


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
    

  },
  getUserInfo() {
    let id = wx.getStorageSync('userId');
    request.post("user/rest/user/getUserInfo", { userId: id }).then(res => {
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
  getThree() {
    const data = {
      userId: wx.getStorageSync('userId'),
      payMethod: 'wx',
      goods: 'RechargeDiscount',
      userAddressId:this.data.add.id
    }
    this.setData({status: false,})
    request.post("order/pays/trade", data).then(res => {
      console.log(res,"666")
      
      wx.requestPayment({
        nonceStr: res.data.nonceStr,
        paySign: res.data.paySign,
        package: res.data.package,
        timeStamp: res.data.timeStamp,
        signType: 'MD5',
        success: function (res) {
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
        fail: function (res) {
          console.log(res);
        },
      });
    })
  },
  buy() {

    //判断买袋子返三十
    if( this.data.type == 1) {
      this.getThree();
      return;
    }
    let param = {
      bagNum: this.data.num,
      userId: wx.getStorageSync('userId'),
      deliveryAddress: this.data.add.provinceName + this.data.add.cityName + this.data.add.areaName + this.data.add.address,
      deliveryMobile: this.data.add.userMobile,
      deliveryName: this.data.add.userName,
      // purchaseItems: 'vip',
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
      url: `/pages/address/address?status=2`
    });
  },
  add() {
    const num = this.data.num + 1;
    this.setData({
      num: num,
      // total: num*this.data.userInfoMore.bagPrice,
      total: (Math.round(num * this.data.userInfoMore.bagPrice * 100) / 100).toFixed(2),
    })
  },
  rdu() {
    if (this.data.num === 1) {

    } else {
      const num = this.data.num - 1;
      this.setData({
        num: num,
        total: Math.round(num * this.data.userInfoMore.bagPrice * 100) / 100,
      })
    }
  },
  change() {

  },
  onGetAuthorize() {
    const _this = this;
    wx.getPhoneNumber({
      success: (res) => {
        const encryptedData = res.response;
        const param = {
          userId: _this.data.userInfo.id,
          response: JSON.parse(encryptedData).response,
          sign: JSON.parse(encryptedData).sign,
        }
        request.post("user/rest/user/getUserPhone", param).then(res => {
          if (res.data.code === 0) {
            // 更新用户手机号
            wx.getAuthCode({
              scopes: ['auth_base', 'auth_user',],
              success: (res) => {
                request.post("user/rest/user/login", { "authCode": res.authCode }).then(res => {
                  if (res.data.code === 0) {
                    _this.setData({
                      userInfo: res.data.data.userInfo,
                    });
                    wx.setStorage({
                      key: 'userInfo', // 缓存数据的key
                      data: res.data.data.userInfo, // 要缓存的数据
                      success: (res) => {
                      },
                    });
                  }
                })
              },
            });
            // _this.buy();
            let param = {
              bagNum: _this.data.num,
              userId: _this.data.userInfo.id,
              deliveryAddress: _this.data.add.provinceName + _this.data.add.cityName + _this.data.add.areaName + _this.data.add.address,
              deliveryMobile: _this.data.add.userMobile,
              deliveryName: _this.data.add.userName,
            }
            _this.setData({
              status: false,
            })
            request.post("order/rest/order/tradeCreate", param).then(res => {
              _this.setData({
                status: true,
              })
              if (res.data.code == 0) {
                wx.tradePay({
                  tradeNO: res.data.data.tradeNo,
                  success: function(res) {
                    // console.log(res);
                    if (res.resultCode == 9000) {
                      wx.setStorage({
                        key: 'activeIndex',
                        data: 2,
                        success: (res) => {
                        },
                      })
                      wx.showToast({
                        type: 'none',
                        content: "购买成功，可立即绑定拾尚包",
                        duration: 1500,
                        success: (res) => {
                          // wx.switchTab({
                          //   url: '../bao/bao'
                          // });

                        },
                      });
                      setTimeout(function() {
                        wx.redirectTo({
                          url: '/pages/bao/bao'
                        })
                      }, 1500)

                    } else if (res.resultCode == 6001) {
                      wx.showToast({
                        type: 'none',
                        content: "用户中途取消",
                        duration: 2000,
                      });
                    }
                  },
                  fail: function(res) {
                    // wx.alert(res.resultCode);
                  },
                });
              }
            });
          }


        })
      },
      fail: (res) => {
      },
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
