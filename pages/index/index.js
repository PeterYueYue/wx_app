var app = getApp();

// const { isMy } = require("../../miniprogram_npm/@antv/f2/index.js");
const request = require("../../utils/request.js");
Page({
  data: {
    isIphoneX: false,
    imgUrl1: app.globalData.imgUrl1,
    imgUrlNew: app.globalData.imgUrlNew,
    userInfo:{
      userFlag : 1
    },
    // 首页
    type: 'index',
    maskFlag: true,
    media: [],
    pageIndex: 1, //媒体报道分页的当前页
    pageSize: 10, //每页条数
    total: "", //总页数
    background: [{
      'picUrl': app.globalData.imgUrl + 'banner.png'
    }, {
      'picUrl': app.globalData.imgUrl + 'banner.png'
    }],
    // 拾尚包
    // 订单
    // 我的
    logins:false,
    isShowTips1:true,
    closeData:{},
    bagPopWindow:false,
    
    
  },

  onLoad(query) {
    // 初始 首页数据
    this.getAdvertList();
    this.getMediaList();
    if(query.common){
      // 消息订阅进来
      this.onswitchTab(query.common)
      if (query.common == 'order' && query.activeIndex){
        // activeIndex: 0 回收订单  1 预约订单  2 交易订单
        wx.setStorageSync('activeIndex', query.activeIndex);
      }

    } else if (query.code){
      //拾尚包 扫码进入的用户
      this.setData({ type: "bao" })
    }
  },
  onShow(){
    let userInfo = wx.getStorageSync('userInfo');
    if (!userInfo && this.data.type !== 'index' && this.data.type !== 'home'){
      this.toLogin()
    } else if (userInfo){
      this.initAuth(userInfo)
      this.initWindow(userInfo)

    }
    this.tab_orderInit(this.data.type)
    
  },
  onReady(){
    this.setData({ isIphoneX: app.data.isIphoneX})
    
    
    
  },
 
 
  // 初始化弹窗数据
  initWindow(userInfo){
    
    let closeData = wx.getStorageSync('closeData')
    let newDate = {
      bagPopWindow: true,
      trueDeliverPopWindow: true,
    }
    if (!closeData){
      wx.setStorageSync( 'closeData', newDate);
      closeData = newDate
    }
    this.setData({closeData:closeData})
    if(userInfo.id){
      request.post('user/rest/user/homePagePopWindow?userId='+userInfo.id).then((res) => {
        if (res.data.code == 0) {
          let data = res.data.data
          if(closeData.bagPopWindow&&data.bagPopWindow){
            this.setData({bagPopWindow:data.bagPopWindow})
          }else if(data.trueDeliverPopWindow){
            this.setData({trueDeliverPopWindow:data.trueDeliverPopWindow})
          }
        }
      })
    }
  },  
  // 关闭按钮
  closebagPopWindow(){
    let closeData = wx.getStorageSync('closeData')
    this.setData({bagPopWindow:false})
    closeData.bagPopWindow = false
    wx.setStorageSync('closeData',closeData);
    this.initWindow(this.data.userInfo)
  },
  // 关闭按钮
  closetrueDeliverPopWindow(){
    this.setData({trueDeliverPopWindow:false})
    request.post('user/rest/user/restTrueDeliverPopWindow?userId='+this.data.userInfo.id).then((res) => {
      console.log(res,"--------")
    })
   
  },
  closemask_(){
    this.setData({isShowTips1:false})
  },
  goSetAdd(e){
    wx.navigateTo({
      url: '/pages/freePost/freePost',
    })
  },
  scan() { //扫码
    if (!this.data.userInfo.id) {
      this.toLogin()
      return false;
    }
    let that = this
    wx.scanCode({
      scanType: 'qrCode',
      success: (res) => {

        
        // IOT扫码
        if(res.result.indexOf('q=') != -1){
          wx.showToast({
            title: res.result,
            icon: 'success',
            duration: 2000
          })
          
          getApp().globalData.iotEncData = res.result.split('q=')[1];
          wx.navigateTo({
            url: '/pages/iot/iot_ssb/login/login'
          });
          return

        }else if(res.result.indexOf('encData=') != -1) {
          getApp().globalData.iotEncData = res.result.split('encData=')[1];
          // wx.navigateTo({
          //   url: '/pages/iot/login/login'
          // });
          wx.navigateTo({
            url: '/pages/iot/iot_ssb/login/login'
          });
          return
        }else if(res.result.indexOf('obi=') != -1){
          // 脉动
          getApp().globalData.obi = res.result.split('obi=')[1];
          wx.navigateTo({
            url: '/pages/activity/yciotScan/yciotScan'
          });
          return
        } else if(res.result.indexOf('danone') != -1){  //脉动核销券
          request.post('user/open/iot/danoneCardCodeScan',JSON.stringify({
            userId:this.data.userInfo.id,
            cardCode:res.result
          })).then(res => {
            wx.showToast({
              icon: 'success',
              title: res.data.message,
              duration: 2000,
            });
          })
          return
        }
        let data = {
          userId: this.data.userInfo.id,
          bagCode: res.result.split('code=')[1],
        }
        request.post('user/rest/userSsb/userScanBag', data).then((res) => {
          if (res.data.code == 0) {
            wx.showToast({
              icon: 'none',
              title: "绑定成功",
              duration: 1500,
              success: (res) => {
                // that.onswitchTab("bao");
                wx.navigateTo({
                  url: '/pages/bao/bao',
                })
              },
            });
          }
        })
      }
    })

  },
  changePage(e) {
    let type = e.currentTarget.dataset.data;
    this.setData({ type: type });
    this.tab_orderInit(type);
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  tab_orderInit(type){
    // 订单
    if (type === 'order') {
      this.selectComponent('#tab_order').init()
    }
  },
  // 首页方法
  onclosemask() {
    this.setData({
      maskFlag: false
    })
  },
  onclearStorage(){
    wx.clearStorage()
    this.setData({
      userInfoMore: {},
      userInfo: {
        userFlag: 1
      },
      logins: false
    })

    
    wx.navigateTo({
      url: '../login/login'
    });


  },
  onuserExit(){
    this.setData({
      userInfoMore: {},
      userInfo: {
        userFlag: 1
      },
      logins: false
    })
  },
  // 切换TabBar
  onswitchTab(e) {
    switch (e.detail ? e=e.detail:e) {
      case "index":
        this.setData({ type: "index" })
        break;
      case "bao":
        this.setData({ type: "bao" })
        break;
      case "order":
        this.setData({ type: "order" })
        break;
      case "home":
        this.setData({ type: "home" })
        break;
    }
  },
  initAuth(userInfo){
    this.setData({
      userInfo: userInfo,
      logins:true
    });
  },
  //获取轮播图列表
  getAdvertList() {
    request.get("user/rest/banner/getAdvertList").then(res => {
      if (res.data.code === 0) {
        let background = res.data.data.filter(item => item.bannerType == 2)
        console.log(background,"background")
        this.setData({
          background: background,
        })
      }
    });
  },
  
  //获取媒体报道列表
  getMediaList() {
    let data = {
      pageIndex: this.data.pageIndex,
      pageSize: this.data.pageSize
    }
    request.get("user/rest/banner/getMediaList", data).then(res => {
      if (res.data.code === 0) {
        res.data.data.content = res.data.data.content.filter(item => item.mediaType == 2)
        if (this.data.pageIndex == 1) {
          let media = res.data.data.content
          this.setData({
            media,
            total: res.data.data.totalPages
          })
        } else {
          let list = this.data.media;
          let media = [...list, ...res.data.data.content]
          this.setData({
            media,
            total: res.data.data.totalPages
          })
        }
        // let list = this.data.media;
        // let media = [...list, ...res.data.data.content]
        // this.setData({
        //   media,
        //   total: res.data.data.totalPages
        // })
      }
    });
  },

  toLogin() {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '../login/login'
          });
        }
      },
    });
  },
  onstoppulldownrefresh(){
    wx.stopPullDownRefresh()

  },
  // 下拉刷新集合
  onPullDownRefresh() {

    if (this.data.type === 'order') {
      this.selectComponent('#tab_order').onPullDownRefresh()
    }
    if (this.data.type === 'index'){
      this.selectComponent('#tab_index').onPullDownRefresh()
    }
    if (this.data.type === 'bao') {
      this.selectComponent('#tab_bao').onPullDownRefresh()
    }
    // if (this.data.type === 'home') {
    //   this.selectComponent('#tab_home').onPullDownRefresh()
    // }
    if (this.data.type === 'home') {

      this.selectComponent('#tab_self').onPullDownRefresh()
    }
    
  },
  onPageScroll(e){
    if (e.scrollTop >= 100) {
      this.setData({isShowTitle:true})
    }else {
      if (this.data.isShowTitle){
        this.setData({ isShowTitle: false })
      }
    }
      
  },
  // 发放上门券
  shareSendticket(){
    this.closetrueDeliverPopWindow()
    let userInfo = wx.getStorageSync('userInfo');
    if(userInfo.id){
      request.post('user/rest/user/sendDoorVoucherNoLimit?userId='+userInfo.id+'&num=1').then((res) => {})
    }

  },
  // 分享
  onShareAppMessage(e) {
    if(e.target.id == "share"){
      this.shareSendticket()
    }
    return {
      title: '拾尚回收',
      imageUrl: app.globalData.imgUrlNew + "yy/freePost/061505.png",
      path: `pages/index/index`,
    };
    
  },
  







});
