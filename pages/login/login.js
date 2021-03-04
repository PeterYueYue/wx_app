const request = require("../../utils/request.js");
const md5 = require("../../utils/md5.js");
var app = getApp();
Page({
  data: {
    userAccount: '', //账号
    userPassword: '', //密码
    vCode: '', //验证码
    display: true,
    autoDisplay: true,
    codeKey: "",
    codeImg: '',
    userInfo: '',
    imgUrl: app.globalData.imgUrl,
    openId: '',
    choose:true,
    code: '',
    backPage:""
  },
  onLoad(opt) {
    if(opt&&opt.backPage){
      this.setData({backPage:opt.backPage})
    }
  },
  onShow() {
    const codeKey = this.getuuid();
    this.setData({
      codeKey: codeKey,
    })
    this.setData({
      codeImg: request.localhost + 'user/rest/user/getCode?codeKey=' + codeKey,
    })
    let that = this
    wx.login({
      success(res) {
        that.setData({
          code: res.code,
        })
      }
    })
  },
  tab() {
    this.setData({
      choose: !this.data.choose,
    })
  },
  change(e) {
    const id = e.target.dataset.id
    switch (id) {
      case "1": //账户
        this.setData({
          userAccount: e.detail.value
        });
        break;
      case "2": //密码
        this.setData({
          userPassword: e.detail.value
        });
        break;
      case "3": //验证码
        this.setData({
          vCode: e.detail.value
        });
        break;
      default:
        break;
    }
  },
  getuuid() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; 
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";
    var uuid = s.join("");
    console.log(uuid);
    return uuid;
  },
  changeCode() { //更换验证码
    const codeKey = this.getuuid();
    this.setData({
      codeKey: codeKey,
    })
    this.setData({
      codeImg: request.localhost + 'user/rest/user/getCode?codeKey=' + codeKey,
      vCode: '',
    })
  },
  // 企业登录
  push() {
    if (this.data.userAccount === "") {
      wx.showToast({
        icon: 'none',
        title: '请输入账号',
        duration: 1500,
      });
      return
    }
    if (this.data.userPassword === "") {
      wx.showToast({
        icon: 'none',
        title: '请输入密码',
        duration: 1500,
      });
      return
    }
    if (this.data.vCode === "") {
      wx.showToast({
        icon: 'none',
        title: '请输入验证码',
        duration: 1500,
      });
      return
    }
    this.setData({
      display: false,
    })
    const param = {
      userAccount: this.data.userAccount,
      userPassword: md5.hex_md5(this.data.userPassword),
      vCode: this.data.vCode,
      codeKey: this.data.codeKey,
    }
    request.post("user/rest/user/companyLogin", param).then(res => {
      this.setData({
        display: true,
      })
      if (res.data.code === 0) {
        // wx.setStorage({
        //   key: 'userInfo', // 缓存数据的key
        //   data: res.data.data.result, // 要缓存的数据
        //   success: (res) => {
        //   },
        // });
        wx.setStorageSync('userInfo', res.data.data.result)
        wx.showToast({
          icon: 'none',
          title: '登录成功',
          duration: 1500,
          success: () => {
            this.goBack()
          },
        });
      } else {
        this.setData({
          display: true,
        })
      }
    });
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
            wx.setStorageSync("token", res.data.data.token)
            _this.getUserInfoMore(res.data.data.userInfo)
            
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
                    wx.setStorageSync("token", res.data.data.token)
                    wx.showToast({
                      icon: 'none',
                      title: '登录成功',
                      duration: 1500,
                      success: () => {
                        _this.goBack()
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
  getUserInfoMore(userInfo){
    let data = { userId: userInfo.id }
    request.post("user/rest/user/getUserInfo", data).then(res => {
      if (res.data.code === 0) {
        wx.setStorageSync('userInfoMore', res.data.data);
        if (res.data.data.userAddress) {
          wx.setStorageSync('add', res.data.data.userAddress);
        }
        wx.showToast({
          icon: 'none',
          title: '登录成功',
          duration: 1500,
          success: () => {
            this.goBack()
          },
        });
      }
    })
  },

  bindGetUserInfo(e) {
    const _this = this;
    let code = '';
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        let login = e.detail;
        code = _this.data.code
        let param = {
          "userId": wx.getStorageSync('userId'),
          "code": code,
          "encryptedData": login.encryptedData,
          "iv": login.iv
        }
        param = JSON.stringify(param);
        request.post("user/rest/weixin/login", param).then(res => {
          if (res.data.code == 0) {
            wx.setStorageSync("openId", res.data.data.userInfo.openId)
            wx.setStorageSync("userInfo", res.data.data.userInfo)
            wx.setStorageSync("userId", res.data.data.id)
            _this.setData({
              autoDisplay: false,
              userInfo: res.data.data.userInfo,
            });
            wx.showToast({
              icon: 'none',
              title: '登录成功',
              duration: 1500,
              success: () => {
                _this.goBack()
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
                param = JSON.stringify(param)
                request.post("user/rest/weixin/login", param).then(res => {
                  if (res.data.code == 0) {
                    wx.setStorageSync("openId", res.data.data.userInfo.openId)
                    wx.setStorageSync("userInfo", res.data.data.userInfo)
                    _this.setData({
                      autoDisplay: false,
                      userInfo: res.data.data.userInfo,
                    });
                    wx.showToast({
                      icon: 'none',
                      title: '登录成功',
                      duration: 1500,
                      success: () => {
                        _this.goBack()
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

  goBack(){
    if(this.data.backPage){
      wx.redirectTo({
        url: this.data.backPage
      })
    }else{
      wx.navigateBack();
    }
  },



  // getPhoneNumber(e) {
  //   console.log(e)
  //   console.log(this.data.openId)
  //   let data = {
  //     "openId": this.data.openId,
  //     "encryptedData": e.detail.encryptedData,
  //     "iv": e.detail.iv
  //   }
  //   console.log(data)
  //   data = JSON.stringify(data)
  //   request.post("user/rest/weixin/updateUserMobile", data).then(res => {
  //     console.log(res, 3333)
  //   })
  // },

  getmsg(authCode) {
    const _this = this;
    request.post("user/rest/user/login", {
      "authCode": authCode
    }).then(res => {
      if (res.data.code === 0) {
        _this.setData({
          userInfo: res.data.data.userInfo,
        });
        wx.setStorageSync('userInfo', res.data.data.userInfo)

      }
    })
  }

});