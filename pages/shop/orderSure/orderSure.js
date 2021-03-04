const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    add: {}, //地址数据
    addressStatus: false,//是否选择了上门地址的状态
    userInfo: {},
    userInfoMore: {},
    list: [],//商品列表
    status: true,//加载
    productDetails: {},
    coin: 0,//使用拾尚币数量
    money: 0,//支付金额
    selected: false,//是否用拾尚币支付
    isShowVouList:false,
    pageSize:10
  },
  onLoad(options) {
    this.setData({itemId:options.id},() => {
      this.init();
    })
  },
  onShow() {
    
  },
  // 优惠券
  openVouList() {
    this.setData({ isShowVouList: true })
  },
  // 获取信息
  getVou(userInfo) {
    let pageIndex = 0, state = 0, hasDoor = 0;
    request.post(`user/rest/voucher/myCouponList?pageIndex=${pageIndex}&pageSize=${this.data.pageSize}&state=${state}&userId=${userInfo.id}&hasDoor=${hasDoor}`).then(res => {

      console.log(res,"kk")
      if (res.data.code === 0) {
        res.data.data.couponList.content.forEach(function (item, index) {
          item.selected = false;
          item.checked = false;
        })
        this.setData({
          vou: res.data.data.couponList.content,
        })
      }
    })
  },

  // 选择可用权益
  chooseVou(e) {
    const index = e.currentTarget.dataset.index;
    let list = this.data.vou.map((e,i) => {
      if( i==index && !e.selected ){
        e.selected = true
      }else{
        e.selected = false
      }
      return e
    })
    this.setData({vou:list})
  },
  //确定选中的券
  closeVouList() {
    this.setData({ isShowVouList: false });
    let p = new Promise((reslove,reject) => {
    let arr = this.data.vou
      arr.forEach( (item, i) => {
        if (item.selected) {
          reslove(item)
        } else if(this.data.vou.length-1 == i && !item.selected){
          reject()
        }
      })
    })
    p.then((item)=>{
      this.setData({
        vouChoosed: item,
      },() => {
        this.discountAmount(item)
      })

    },() => {
      this.delVou()
      
    })

  },
  // 获取优惠券后的价格
  discountAmount(item){
    request.post(`order/rest/order/calculateThePrice?userId=${this.data.userInfo.id}&productId=${this.data.productDetails.id}&useShiShangCoin=${this.data.selected}&userCouponId=${item.id}`).then(res => {
      this.setData({
        money: res.data.data.cashAmount,
      })
    })
  },
  //删除券
  delVou() {
    this.setData({vouChoosed:"",selected:!this.data.selected},() => {
      this.check()
    })
    let list = this.data.vou.map(e => {
      e.selected = false
      return e
    })

    this.setData({vou:list})
  },
  check() {

    this.setData({ selected: !this.data.selected });
    if(!this.data.vouChoosed){
      if (!this.data.selected) {
        this.setData({
          money: this.data.productDetails.price / 100+this.data.productDetails.freight,
        })
      } else {
        if (this.data.userInfoMore.residueMoney >= this.data.productDetails.price) {
          this.setData({
            money: 0+this.data.productDetails.freight,
          })
        } else {
  
          this.setData({
            money: ((this.data.productDetails.price - this.data.userInfoMore.residueMoney) / 100).toFixed(2)- -this.data.productDetails.freight,
          })
        }
      }
    }else{
      this.closeVouList()
    }
  },
  init() {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.getUserInfoMore(userInfo);
      // 地址数据
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
    }
    this.getVou(userInfo)
  },
  getUserInfoMore(userInfo){
    let data = { userId: userInfo.id }
    request.post("user/rest/user/getUserInfo", data).then(res => {
      if (res.data.code === 0) {
        wx.setStorageSync('userInfoMore', res.data.data);
        this.setData({
          userInfo: userInfo,
          userInfoMore: res.data.data,
        },() => {

          this.getProductDetail(this.data.itemId)
        });
      }
    })
  },
  toAddress() {
    wx.navigateTo({
      url: `/pages/address/address?status=2`
    });
  },
  getProductDetail(id) {//获取产品详情
    request.get(`user/rest/product/productDetail?productId=${id}`).then((res) => {
      this.setData({
        productDetails: res.data.data,
      },() => {
        if(this.data.userInfoMore.residueMoney > 0 ){
          this.setData({ selected: true });
          if (this.data.userInfoMore.residueMoney >= this.data.productDetails.price) {
            this.setData({
              money: 0+this.data.productDetails.freight,
              coin:this.data.productDetails.price
            })
          } else {
            this.setData({
              money: ((this.data.productDetails.price - this.data.userInfoMore.residueMoney) / 100).toFixed(2)- -this.data.productDetails.freight,
              coin:this.data.userInfoMore.residueMoney
            })
          }
        }else{
          this.setData({
            money: this.data.productDetails.price / 100+this.data.productDetails.freight,
            selected:false
          })
        }
      })
      
    })
  },
  order() {//下单

    let that = this;
    let param = {
      userId: this.data.userInfo.id,
      productId: this.data.productDetails.id,//传地址id
      addressId: this.data.add.id,
      useShiShangCoin: this.data.selected,
      payMethod: 'wx',
      userCouponId:this.data.vouChoosed?this.data.vouChoosed.id:''
    }
    this.setData({
      status: false,
    })
    request.get("order/rest/order/createOrder", param).then(res => {
      this.setData({
        status: true,
      })
      if (res.data.code == 0) {
        if (res.data.data.isCashUsed) {// 积分不够
          that.tradePay(res.data);
        } else {// 全额积分兑换
          wx.showToast({
            icon: 'none',
            title: "下单成功",
            duration: 1500,
            success: (res) => {
              wx.redirectTo({
                url: '/pages/shop/order/order'
              })
            },
          });
        }
      }
    });
  },
  tradePay(res) {
    console.log(res,"ppp")
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
          title: "下单成功",
          duration: 1500,
          success: (res) => {
            wx.redirectTo({
              url: '/pages/shop/order/order'
            })
          },
        });
      },
      fail: function (res) {
        wx.redirectTo({
          url: '/pages/shop/order/order'
        })
      },
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
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  }

});
