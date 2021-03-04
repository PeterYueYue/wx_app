const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    imgUrl: app.globalData.imgUrl, //图片访问地址
    num: 1, //数量
    total: 50, //总额
    add: {}, //选择上门后的数据
    addressStatus: false, //是否选择了上门地址的状态
    userInfo: {},
    pushId: '', //地推人员Id
    sourceId: '', //绿色小程序传过来id
    countdown: '', //倒计时
    endDate: '',
    flag: false,
    code: '',
  },
  timeout: '',
  onLoad(query) {
    if (app.globalData.pushId !== "") {
      this.setData({
        pushId: app.globalData.pushId,
      })
    }
    if (app.globalData.sourceId !== "") {
      this.setData({
        sourceId: app.globalData.sourceId
      })
    }
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    let add = wx.getStorageSync('add');
    console.log(add)
    let userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
    } else {
      // wx.showToast({
      //   icon: 'none',
      //   title: '您还未登录,请先授权登录',
      //   duration: 2000,
      //   success: (res) => {
      //     wx.navigateTo({
      //       url: '../login/login'
      //     })
      //   },
      // });

    }
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
    wx.login({
      success(res) {
        console.log(res)
      }
    })
    const param = {
      userId: userInfo.id
    }
    request.get("user/rest/userSsb/getBagTiming/" + userInfo.id).then(res => {
      if (res.data.code == 0) {
        console.log(res.data.data)
        let time = new Date(res.data.data.replace(/\-/g, "/"));
        // time = new Date("2019-11-27 13:45:30")
        let endDate = time.getTime() + 172800000; //设置截止时间
        this.setData({
          endDate
        })
        this.countTime()
      }
    })
  },
  countTime() {
    var that = this;
    var date = new Date();
    var now = date.getTime();
    var end = that.data.endDate;
    var leftTime = end - now; //时间差
    // console.log(leftTime)                              
    var d, h, m, s, ms;
    if (leftTime >= 0) {
      h = Math.floor(leftTime / 1000 / 60 / 60);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      ms = Math.floor(leftTime % 1000);
      ms = ms < 100 ? "0" + ms : ms
      s = s < 10 ? "0" + s : s
      m = m < 10 ? "0" + m : m
      h = h < 10 ? "0" + h : h
      that.setData({
        countdown: `${h}:${m}:${s}:${ms}`,
        flag: true
      })
      this.timeout = setTimeout(that.countTime.bind(that), 50);
    } else {
      this.setData({
        flag: false
      })
    }

    // console.log(that.data.countdown)
    //递归每秒调用countTime方法，显示动态时间效果

  },


  toAddress() { //选择地址
    wx.navigateTo({
      url: `../address/address?status=2`
    });
  },
  freeGet(e) { //免费邮寄
    //地推人员id要修改
    if (this.data.addressStatus) {
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
        sourceId: this.data.sourceId
      };
      request.post("user/rest/userSsb/getScanBag", param).then(res => {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'none',
            title: '领取成功,您现在有可绑定的袋子了',
            duration: 1500
          });
          wx.setStorage('activeIndex', 2);
          setTimeout(function() {
            // wx.switchTab({
            //   // url: `/pages/order/order`
            //   url: `/pages/bao/bao`
            // })

            wx.navigateTo({
              url: '/pages/bao/bao'
            })

          }, 1500)
        }
      });
    } else {
      wx.showToast({
        icon: 'none',
        title: '请选择邮寄地址',
        duration: 1500
      });
    }

  },
  banka() {
    wx.navigateTo({
      url: `../webView/webView?url=https://miniapp.shishangbag.vip/xingye/index.html`
    });
  },
  bindGetUserInfo(e) {
    const _this = this;
    wx.login({
      success(res) {
        console.log(res)
        _this.setData({
          code: res.code,
        })
      }
    })
    let code = '';
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        let login = e.detail;
        code = _this.data.code
        let param = {
          "userId": wx.getStorageSync('userInfo').id,
          "code": code,
          "encryptedData": login.encryptedData,
          "iv": login.iv
        }
        param = JSON.stringify(param);
        request.post("user/rest/weixin/login", param).then(res => {
          console.log(res)
          if (res.data.code == 0) {
            wx.setStorageSync("openId", res.data.data.userInfo.openId)
            wx.setStorageSync("userInfo", res.data.data.userInfo)
            wx.setStorageSync("userId", res.data.data.id)
            _this.setData({
              autoDisplay: false,
              userInfo: res.data.data.userInfo,
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
                param = JSON.stringify(param);
                request.post("user/rest/weixin/login", param).then(res => {
                  if (res.data.code == 0) {
                    wx.setStorageSync("openId", res.data.data.userInfo.openId)
                    wx.setStorageSync("userInfo", res.data.data.userInfo)
                    _this.setData({
                      userInfo: res.data.data.userInfo,
                    });
                  }
                  _this.get(e);
                })
              }
            })
          }
        })
      }
    })
  },
  get(e) {
    let _this = this;
    if (_this.data.addressStatus) {
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
        sourceId: this.data.sourceId
      };
      request.post("user/rest/userSsb/getScanBag", param).then(res => {
        if (res.data.code == 0) {
          app.globalData.sourceId = '';
          my.showToast({
            type: 'none',
            content: '领取成功,您现在有可绑定的袋子了',
            duration: 1500
          });
          my.setStorage({
            key: 'activeIndex',
            data: 2,
            success: (res) => {
            },
          });
          setTimeout(function () {
            wx.navigateTo({
              url: '/pages/bao/bao'
            })
          }, 1500)
          // 领取成功完成任务
          if (this.data.userId) {
            this.finishTask();
          }
        }
      });
    } else {
      my.showToast({
        type: 'none',
        content: '请选择邮寄地址',
        duration: 1500
      });
    }
  },
  // onGetAuthorize(e) {
  //   const _this = this;
  //   let openId = wx.getStorageSync('openId');
  //   let data = {
  //     "openId": openId,
  //     "encryptedData": e.detail.encryptedData,
  //     "iv": e.detail.iv
  //   }
  //   data = JSON.stringify(data)
  //   request.post("user/rest/weixin/updateUserMobile", data).then(res => {
  //     if (res.data.code == 2) {
  //       wx.login({
  //         success(res) {
  //           wx.getUserInfo({
  //             success(res1) {
  //               let param = {
  //                 "code": res.code,
  //                 "encryptedData": res1.encryptedData,
  //                 "iv": res1.iv
  //               }
  //               param = JSON.stringify(param)
  //               request.post("user/rest/weixin/login", param).then(res => {
  //                 console.log(res)
  //                 if (res.data.code == 0) {
  //                   console.log(res.data.data.userInfo)
  //                   wx.setStorageSync("openId", res.data.data.userInfo.openId)
  //                   wx.setStorageSync("userInfo", res.data.data.userInfo)
  //                   _this.setData({
  //                     userInfo: res.data.data.userInfo,
  //                   });
  //                 }
  //               })
  //             }
  //           })
  //         }
  //       })
  //       if (_this.data.addressStatus) {
  //         let param = {
  //           deliveryAddress: this.data.add.address,
  //           province: this.data.add.cityName + this.data.add.areaName,
  //           deliveryMobile: _this.data.add.userMobile,
  //           deliveryName: _this.data.add.userName,
  //           pushId: _this.data.pushId,
  //           sendFlag: e.currentTarget.dataset.status,
  //           userId: _this.data.userInfo.id,
  //           userMobile: _this.data.add.userMobile,
  //           userName: _this.data.add.userName,
  //           sourceId: this.data.sourceId
  //         };
  //         request.post("user/rest/userSsb/getScanBag", param).then(res => {
  //           if (res.data.code == 0) {
  //             app.globalData.sourceId = '';
  //             my.showToast({
  //               type: 'none',
  //               content: '领取成功,您现在有可绑定的袋子了',
  //               duration: 1500
  //             });
  //             my.setStorage({
  //               key: 'activeIndex',
  //               data: 2,
  //               success: (res) => {},
  //             });
  //             setTimeout(function() {
  //               my.switchTab({
  //                 // url: `/pages/order/order`
  //                 url: `/pages/bao/bao`
  //               })
  //             }, 1500)
  //             // 领取成功完成任务
  //             if (this.data.userId) {
  //               this.finishTask();
  //             }
  //           }
  //         });
  //       } else {
  //         my.showToast({
  //           type: 'none',
  //           content: '请选择邮寄地址',
  //           duration: 1500
  //         });
  //       }
  //     }
  //   })
  // },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    //页面卸载执行
    clearTimeout(this.timeout)
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
      path: 'pages/index/index',
    };
  },
});