// common/component/shopIndex/shopIndex.js

var app = getApp();
const request = require("../../../utils/request.js");

Component({

  data:{
    userInfoMore:{}
  },
  /**
   * 组件的属性列表
   */
  properties: {
    userInfo:{
      type: Object, 
      value: '', 
      observer: function (newVal, oldVal) { } 
    }
  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { 
      let userInfoMore = wx.getStorageSync('userInfoMore');
      this.setData({userInfoMore:userInfoMore})
      this.getSignInData(); 
      this.getProductList();
      this.isToParticipateIn();
    },
    moved: function () { },
    detached:function () { },
  },
  pageLifetimes: {
    show: function () {
      // 页面被展示
      this.getSignInData(); 
    },
    hide: function () {
      // 页面被隐藏
    },
    resize: function (size) {
      // 页面尺寸变化
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    signInData:{},
    productList:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isToParticipateIn(){
      request.get("user/rest/userSsb/rechargeDiscountInfo?userId="+ this.data.userInfo.id).then(res => {
        this.setData({
          isItQualified: res.data.isItQualified,
        })
      })
    },
    getSignInData(){
      request.get('user/rest/signIn/signInfo',{userId:this.data.userInfo.id}).then((res)=>{
        this.setData({signInData:res.data})
      })
    },
    getProductList(){
      request.post('user/rest/product/shopProductPage').then((res)=>{
        this.setData({productList:res.data.data})
      })
    },
    onClick(e){

      let name = e.currentTarget.dataset.name

      
      let userInfo = wx.getStorageSync('userInfo');
      if (!userInfo.id){
        this.toLogin()
      }else{

        switch(name){
          case '兑换':
            wx.navigateTo({
              url: '/pages/withdrawal/withdrawal'
            });
            break;
          case '券码兑换':
            wx.navigateTo({
              url: `/pages/vouchers/exchange/exchange`
            });
          break;
          case '买三十送三十':
            wx.navigateTo({
              url: `/pages/shop/cashback/cashback`,
            });
          break;
          case '拾尚币兑换':
            wx.navigateTo({
              url: `/pages/withdrawal/withdrawal`,
            });
          break;
          case '我的订单':
            wx.navigateTo({
              url: `/pages/shop/order/order`
            });
          break;
          case '查看更多':
            wx.navigateTo({
              url: `/pages/shop/productList/productList?item=${JSON.stringify(e.currentTarget.dataset.item)}`
            });
          break;
          case '商品详情':
            if(e.currentTarget.dataset.item.stock ==0) {
              return;
            }
            wx.navigateTo({
              url: `/pages/shop/productDetail/productDetail?item=${JSON.stringify(e.currentTarget.dataset.item)}`
            });
          break;
        }
        
      }
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
    onPullDownRefresh() {
      wx.stopPullDownRefresh()
    }

  }
})
