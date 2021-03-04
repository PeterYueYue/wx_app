const request = require("../../../../utils/request.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
    isShowBinding:false,
    bag_list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
    


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getIotData();
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
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
  // 获取设备投递数据
  getIotData(){
    let iotEncData = getApp().globalData.iotEncData;
    let data = JSON.stringify({
      deviceNo:iotEncData
    })
    // request.get("user/rest/iot/qrcode?deviceNo=F554B856A29CF1693D").then(res => {

    //   console.log(res,"qrcodeqrcode")
    // })
    request.post("user/rest/iot/typeAIotInformation",data).then(res => {
      this.setData({iot_data:res.data.data})

    })


  },
 
  // 新用户授权
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
  // 获取用户信息
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


          },
        });
      }
    })
  },
  goLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  toBind() {
    const _this = this
    let userInfo = wx.getStorageSync("userInfo");
    wx.scanCode({
      scanType: 'qrCode',
      success: (res) => {
        let data = {
          userId:userInfo.id,
          bagCode: res.result.split('code=')[1],
        }
        request.post('user/rest/userSsb/userScanBag', data).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              icon: 'none',
              title: "绑定成功",
              duration: 1500,
              success: (res) => {
                this.setData({isShowBinding:false})
                this.open_door()
              },
            });
          }
        })
      }
    })
  },
  // 判断是否开门逻辑
  open_door(){
    wx.showLoading({
      title: '加载中',
    })
    let userInfo = wx.getStorageSync("userInfo");
    let iotEncData = getApp().globalData.iotEncData;
    //获取已绑定袋子列表
    request.post('user/rest/userSsb/getScanBagList', { userId: userInfo.id }).then((res) => {
      if (res.data.code === 0) {
        this.setData({ bag_list: res.data.data})
        if (res.data.data.length === 0) {
          this.setData({isShowBinding:true})
          wx.hideLoading()
          return
        }
        request.post("user/rest/iot/typeAIotScan",JSON.stringify({
          userId:userInfo.id,
          q:iotEncData
        })).then(res => {
          wx.hideLoading()
          console.log(res,"是否开门")
            if(res.data.code == 0){
    
              wx.redirectTo({
                url: '/pages/iot/iot_ssb/open_door/open_door',
              })
    
            }
        })
        

      }
    })



  },
  close_binding_box(){
    this.setData({isShowBinding:false})
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})