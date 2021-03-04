const request = require("../../../utils/request.js");
var app = getApp();
function GetUrlParam(paraName,url_) {
  var url = url_;
　var arrObj = url.split("?");
　if (arrObj.length > 1) {
　　var arrPara = arrObj[1].split("&");
　　var arr;
　　for (var i = 0; i < arrPara.length; i++) {
　　　　arr = arrPara[i].split("=");

　　　　if (arr != null && arr[0] == paraName) {
　　　　　return arr[1];
　　　　}
　　}
　　return "";
　}else {
　　return "";
　}
}

Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    userInfo: {},//用户信息
    isAuth:false,
    autoDisplay: true,
    partyInfo: {},
    success_mask: false,
    userId:'',
    code:''
  },
  onLoad(e) {


    let res = GetUrlParam("id",decodeURIComponent(e.q))  
    if (res){
      this.getBasicUserInfo(res)
    }else if(e.id){

      console.log(e)
      this.getBasicUserInfo(e.id)
    }
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
      })
      
      
    }else{
      this.setData({ isAuth:true})
    }

    const codeKey = Date.parse(new Date());
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
  join() {//加入团队
    let data = {
      leaderId: this.data.userId,
      userId: this.data.userInfo.id,
    };
    request.post("user/rest/groups/addGroup?leaderId=" + this.data.userId+"&userId="+this.data.userInfo.id).then(res => {
      console.log(res);
      if(res.data.code ==0) {
        this.setData({
          success_mask: true,
        })
        setTimeout(function() {
          wx.redirectTo({
            url: '/pages/index/index?common=index'
          })
        },1500)
      }
    })

  },
  getBasicUserInfo(id){
    this.setData({userId:id})
    let param = {
      userId:id
    }
    request.post("user/rest/user/getBasicUserInfo", param).then(res => {
      if (res.data.code === 0) {
        this.setData({
          partyInfo: res.data.data,
        });
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
                _this.setData({ isAuth:false})
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
                        _this.setData({ isAuth: false })
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
          wx.navigateTo({
            url: '../login/login'
          });
        } 
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
