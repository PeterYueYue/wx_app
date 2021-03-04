App({
  data:{
    isIphoneX:false,
  },
  globalData: {
    "navHeight": 0
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function(options) {

    // 获取手机系统信息
    wx.getSystemInfo({
      success: res => {
        
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    })
    this.isIphoneX()
    let url = decodeURIComponent(options.query.q);
    if(url.indexOf('pushId=') != -1) {
      this.globalData.pushId = url.split('pushId=')[1];
      console.log(this.globalData.pushId)
    }
    if(url.indexOf('code=') != -1) {
      this.globalData.code= url.split('code=')[1];
      console.log(this.globalData.code)
    }
    
    if(url.indexOf('encData=') != -1) {
      this.globalData.iotEncData= url.split('encData=')[1];
      console.log(this.globalData.iotEncData)
    }
    if(url.indexOf('obi=') != -1) {
      this.globalData.obi= url.split('obi=')[1];
      console.log(this.globalData.obi,"obi")
    }
    if(url.indexOf('q=') != -1) {
      this.globalData.iotEncData= url.split('q=')[1];
      console.log(this.globalData.iotEncData)
    }


    // 新手领券初始化
    let newUser = wx.getStorageSync('newUser')
    if (!newUser){
      wx.setStorageSync(
        'newUser',
        {
          index: true,
          myVoucher: true,
          timelogin: true,
          appointment: true,
        }
      );
    }
    // 首页减碳50kg和分拣后弹窗
    let closeData = wx.getStorageSync('closeData')
    if (!closeData){
      wx.setStorageSync(
        'closeData',
        {
          bagPopWindow: true,
          trueDeliverPopWindow: true,
        }
      );
    }

  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function(options) {
    this.UpDate()
    this.isIphoneX()
    let url = decodeURIComponent(options.query.q);
    if(url.indexOf('pushId=') != -1) {
      this.globalData.pushId = url.split('pushId=')[1];
    }
    if(url.indexOf('code=') != -1) {
      this.globalData.code= url.split('code=')[1];
    }
    if(url.indexOf('encData=') != -1) {
      this.globalData.iotEncData= url.split('encData=')[1];
    }
    if(url.indexOf('obi=') != -1) {
      this.globalData.obi= url.split('obi=')[1];
      console.log(this.globalData.obi,"obi")
    }
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function() {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function(msg) {

  },
  isIphoneX() {

    var promise = new Promise((resolve,reject) => {
      wx.getSystemInfo({
        success: (res) => {
          let isIphoneX = false;
          switch (res.model) {
            case "iPhone X":
              isIphoneX = true
              break;
            case "iPhone10,3":
              isIphoneX = true
              break;
            case "iPhone10,6":
              isIphoneX = true
              break;
            case "iPhone10,3":
              isIphoneX = true
              break;
            case "iPhone11,2":
              isIphoneX = true
              break;
            case "iPhone11,6":
              isIphoneX = true
              break;
            case "iPhone11,8":
              isIphoneX = true
              break;
            case "iPhone XR<iPhone11,8>":
              isIphoneX = true
              break;
            case "iPhone XR":
              isIphoneX = true
              break;
            case "iPhone X":
              isIphoneX = true
              break;
            case "iPhone XS":
              isIphoneX = true
              break;
            case "iPhone XS Max":
              isIphoneX = true
              break;
            case "iPhone 11":
              isIphoneX = true
              break;
            case "iPhone 11 Pro":
              isIphoneX = true
              break;
            case "iPhone 11 Pro Max":
              isIphoneX = true
              break;
          }
          resolve(isIphoneX)
        }
      })


    })
    promise.then((res) => {
      getApp().data.isIphoneX = res

    })

  },
  globalData: {
    // 全局数据
    // imgUrl: 'http://image.shishangbag.vip/upload/img/web/image/',
    // imgUrl: 'https://miniapp.shishangbag.vip/sbag-webImg/image/',
    imgUrl: 'http://image.shishangbag.vip/upload/img/web/image/',
    imgUrl1: 'http://image.shishangbag.vip/upload/img/web/',
    pushId: '',//地推人员身份id
    code: '',//拾尚包二维码
    sourceId: '',//绿色小程序传过来id
    iotEncData:'', //IOT获取设备码信息
    imgUrlNew: 'http://image.shishangbag.vip/upload/img/web/',//线上新图片地址
  },
  UpDate(){
    //使用更新对象之前判断是否可用
    if (wx.canIUse('getUpdateManager')){
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate)//res.hasUpdate返回boolean类型
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启当前应用？',
              success(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用applyUpdate应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          // 新版本下载失败时执行
          updateManager.onUpdateFailed(function () {
            wx.showModal({
              title: '发现新版本',
              content: '请删除当前小程序，重新搜索打开...',
            })
          })
        }
      })
    }else{
      //如果小程序需要在最新的微信版本体验，如下提示
      wx.showModal({
        title: '更新提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
})