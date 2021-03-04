const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    userInfo: {},//用户信息
    imgUrl1: app.globalData.imgUrl1,
    imgUrlNew: app.globalData.imgUrlNew,
    iotEncData:app.globalData.iotEncData,
    autoDisplay: true,
    success: false,///开箱成功
    code:"",
    marked:""
    
  },
  onLoad: function (options) {
  },
  onReady: function () {
  },
  onShow: function () {

    let userInfo = wx.getStorageSync("userInfo");

    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
      this.openIot(userInfo)
    }
    let that = this
    wx.login({
      success(res) {
        that.setData({
          code: res.code,
        })
      }
    })

  },
  openIot(){
    let userInfo = wx.getStorageSync("userInfo");

    let iotEncData = getApp().globalData.iotEncData;

    let data = JSON.stringify({
      userId:userInfo.id,
      encData:iotEncData
    })
    wx.showToast({
      title: data,
    })
    request.post("user/rest/iot/scan",data).then(res => {
        wx.hideLoading()
        if(res.data.code == 0){
          this.setData({marked:res.data.data.msg})
        }else{
          this.setData({marked:res.data.message})
        }
        this.setData({success:true})
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/index/index?common=index'
          })
         },3000);
    })

  },
 
  onGetAuthorize(e) {
    wx.showLoading()

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
            // wx.setStorageSync("openId", res.data.data.userInfo.openId)
            // wx.setStorageSync("userInfo", res.data.data.userInfo)
            // wx.setStorageSync("userId", res.data.data.userInfo.id)
            wx.showToast({
              icon: 'none',
              title: '登录成功',
              duration: 1500,
              success: () => {
                _this.openIot(res.data.data.userInfo)
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
                let data = {
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
                        // wx.navigateBack();
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
    wx.confirm({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          my.navigateTo({
            url: '../../login/login'
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