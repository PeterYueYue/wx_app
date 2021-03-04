var app = getApp();
const request = require("../../utils/request.js");
Page({
  data: {
    value: '',
    imgUrl: app.globalData.imgUrl,
    checked: 3,
    userInfo: {},
    userInfoMore: {},
    limitFlag: true,
    status: true,
    cardNo: '',
    navigation: {
      "bg_color": "rgba(255,255,255,0)",
      "color": "#fff",
      "flag": 1,
      "name": "提现"
    }

  },
  onReady() {

  },
  onShow() {
    let userInfo = wx.getStorageSync('userInfo');
    let userInfoMore = wx.getStorageSync('userInfoMore');
    console.log(userInfoMore)
    console.log(userInfo)
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userInfoMore: userInfoMore,
      })
    };
    let param = {
      userId: this.data.userInfo.id
    }
    request.post("user/rest/user/getUserInfo", param).then(res => {
      if (res.data.code === 0) {
        this.setData({
          cardNo: res.data.data.cardNo
        })
      }

    })
    this.setData({
      value: (this.data.userInfoMore.residueMoney - this.data.userInfoMore.redResidueMoney).toFixed(2),
    });
  },
  onChange(e) {
    if (e.detail.value == 'card') {
      this.setData({
        checked: 2,
        limitFlag: false,
        value: this.data.userInfoMore.residueMoney
      })
    }
    if (e.detail.value == 'zfb') {
    console.log(this.data.value,"9999")

      this.setData({
        checked: 3,
        limitFlag: true,
        value: (this.data.userInfoMore.residueMoney - this.data.userInfoMore.redResidueMoney).toFixed(2),
      })
    }
  },
  push() {
    if (((this.data.userInfoMore.residueMoney - 0) < (this.data.userInfoMore.withDrawPrice - 0))) {
      wx.showToast({
        icon: 'none',
        title: `兑换拾尚币不得少于${this.data.userInfoMore.withDrawPrice}`,
        duration: 2000,
      });
      return false;
    }

    //兴业银行卡号,如果没有 提现按钮先去添加银行卡号
    if (this.data.checked == 2) {
      if (this.data.cardNo === "") {
     
        wx.showLoading({
          title: "请先添加银行卡",
          
        });
        const that = this
        setTimeout(() => {
          wx.hideLoading({
            // page: that
          });
          wx.navigateTo({
            url: '../bank/bank'
          });
        }, 1500);
        return false;
      }
    }
    this.setData({
      status: false,
    })
    if (this.data.checked == 3 && (this.data.userInfo.userFlag == 2 || this.data.userInfo.userFlag == 3)) { //企业用户要此时支付宝授权
      this.login();
    } else {
      this.tixian();
      
    }

  },
  login() {
    const _this = this;
    let code = '';
    wx.login({
      success(res) {
        
        code = res.code
        wx.getUserInfo({
          success(res1) {
            let param = {
              "code": code,
              "encryptedData": res1.encryptedData,
              "iv": res1.iv,
              "userId": _this.data.userInfo.id
            }
            console.log(param)
            param = JSON.stringify(param)
            request.post("user/rest/weixin/login", param).then(res => {
              console.log(res)
              if (res.data.code == 0) {
                _this.tixian();
              }
            })
          },
          fail(resfail){

            console.log(resfail,"999")
          }
        })
      }
    })
  },
  tixian() {
    const _this = this
    let prarm = {
      withdrawFlag: this.data.checked,
      withdrawMoney: this.data.userInfoMore.residueMoney/100,
      userId: this.data.userInfo.id,
    }
    console.log(prarm)
    //提现
    request.post("user/rest/withdraw/addWithdraw", prarm).then(res => {
      console.log(res)
      this.setData({
        status: true,
      })
      if (res.data.code === 0) {
        wx.showToast({
          icon: 'none',
          title: "操作成功,等待审核中",
          duration: 2000,
        });
      
        this.setData({
          value: '0.00'
        })
        let data = {
          userId: _this.data.userInfo.id
        }
        request.post("user/rest/user/getUserInfo", data).then(res => {
          if (res.data.code === 0) {
            _this.setData({
              userInfoMore: res.data.data

            })
            wx.setStorage({
              key: 'userInfoMore', // 缓存数据的key
              data: res.data.data, // 要缓存的数据
            });

          }

        })
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.message,
          duration: 2000,
        });
      }
    });
  },
  fanxian() {
    wx.navigateTo({
      url: `../webView/webView?url=https://miniapp.shishangbag.vip/xingye/index.html`
    });
  }

})