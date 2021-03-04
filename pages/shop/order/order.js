const request = require("../../../utils/request.js");
var app = getApp();
Page({
  data: {
    activeTab: 0,
    current: 0,
    userId: '', //用户id
    imgUrl: app.globalData.imgUrl, //图片路径
    imgUrlNew: app.globalData.imgUrlNew, //图片路径
    total1: "", //总页数
    total2: "", 
    total3: "",
    total4: "",
    total5: "",
    pageSize: 10, //每页十条数据
    pageIndex1: 1, //当前页码
    pageIndex2: 1, //当前页码
    pageIndex3: 1, //当前页码
    pageIndex4: 1, //当前页码
    pageIndex5: 1, //当前页码
    list1: [],
    list2: [],
    list3: [],
    list4: [],
    list5: [],
    list1Length: 0,
    list2Length: 0,
    list3Length: 0,
    list4Length: 0,
    list5Length: 0,
    userInfo: {},
  },
  onLoad() { },
  onShow() {
    this.init();
  },
  init() {
    const _this = this
    let res =  wx.getStorageSync('userInfo');

    console.log(res,"res")
    if (res == null) {
      _this.toLogin();
    } else {
      _this.setData({
        userInfo: res,
      })
      // _this.getList();
      _this.setData({
        userId: res.id,
        pageIndex1: 1,
        pageIndex2: 1,
        pageIndex3: 1,
        pageIndex4: 1,
        pageIndex5: 1,
      })
      _this.getList1();//获取全部订单
      _this.getList2()
      _this.getList3()
      _this.getList4()
      _this.getList5()
    }
  },
  tab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.index,
      current: e.currentTarget.dataset.index
    })
  },
  onChange(e) {
    this.setData({
      activeTab: e.detail.current
    })
  },
  Detail(e) {//查看详情
    let orderId = e.currentTarget.dataset.orderId;
    let userId = e.currentTarget.dataset.userId;
    // wx.navigateTo({
    //   url: `/pages/recoveryOrder/recoveryOrder?orderId=${orderId}&userId=${userId}`
    // });
  },
  del(e) {//待付款的删除
    let id = e.currentTarget.dataset.id
    wx.confirm({
      title: '温馨提示',
      content: '确定删除吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          request.get(`user/rest/order/deleteOrder?orderId=${id}`).then((res) => {
            if (res.data.code == 0) {
              this.setData({
                pageIndex1: 1,
                list1Length: 0
              })
              this.getList1()
            }
          })
        }
      },
    });
  },
  cancel(e) {//取消订单
    let that = this;
    let id = e.currentTarget.dataset.id
    wx.showModal({
      icon: '温馨提示',
      title: '确定取消订单吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          request.get(`order/rest/order/cancelOrder?orderId=${id}`).then((res) => {
            if (res.data.code == 0) {
              that.init();
            }
          })
        }
      },
    });
  },
  change(e) {//修改地址
    let item = e.currentTarget.dataset.item;//订单id
    console.log(item)
    wx.navigateTo({
      url: `/pages/shop/orderSure/orderSure?state=1&item=+${JSON.stringify(item)}`,
    })
  },
  lookDetail(e) {//查看详情
    this.setData({
      cpuponType: true,
      cpuponDetail: e.currentTarget.dataset.item
    });
    console.log(e.currentTarget.dataset.item);
  },
  close() {//关闭蒙版
    this.setData({
      cpuponType: false,
    });
  },
  setClipboard(e) {//复制粘贴
    wx.setClipboardData({
      data: e.currentTarget.dataset.a, 
      success: (res) => {

        wx.showToast({
          icon: 'none',
          title: "复制成功！",
          duration: 1500,
        })
       ;
      },
    });
  },
  goSure(e) {//立即支付
    let id = e.currentTarget.dataset.item.id;
    let param = {
      userId: this.data.userInfo.id,
      orderId: id,
      payMethod: 'wx',
    }
    request.post("order/pays/trade", param).then(res => {
      this.tradePay(res);
    })
  },
  tradePay(res) {
    let that = this;
    wx.requestPayment({
      nonceStr: res.data.nonceStr,
      paySign: res.data.paySign,
      package: res.data.package,
      timeStamp: res.data.timeStamp,
      signType: 'MD5',
      success: function (res) {
        wx.showToast({
          icon: 'none',
          title: "支付成功",
          duration: 1500,
          success: (res) => {
            that.init();
          },
        });
      },
      fail: function (res) {},
    });
  },
  getList1() {//全部订单
    let data = {
      pageIndex: this.data.pageIndex1,
      pageSize: this.data.pageSize,
      userId: this.data.userId,
      state: '',
    }
    request.get('order/rest/order/myOrders', data).then((res) => {
      if (res.data.code == 0) {
        let list = []
        let list1Length = 0
        if (this.data.pageIndex1 == 1) {
          list = res.data.data.content
          if (res.data.data.content.length == 0) {
            list1Length = 1
          }
        } else {
          let data = this.data.list1
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list1: list,
          total1: res.data.data.totalPages,
          list1Length
        })
      }
    })
  },
  getList2() {//待付款订单
    let _this = this
    let data = {
      pageIndex: this.data.pageIndex2,
      pageSize: this.data.pageSize,
      userId: this.data.userId,
      state: 0,
    }
    request.get('order/rest/order/myOrders', data).then((res) => {
      if (res.data.code == 0) {
        let list = [];
        let list2Length = 0
        res.data.data.content.forEach((item, index) => {
          if (item.reserveState == 1 && item.ghState == 1) {
            item.markers = _this.getMarkers(item.latitude, item.longitude, item.driveLat, item.driveLng)
            item.includePoints = _this.getIncludePoints(item.latitude, item.longitude, item.driveLat, item.driveLng)
          }
        })
        if (this.data.pageIndex2 == 1) {
          list = res.data.data.content
          if (res.data.data.content.length == 0) {
            list2Length = 1
          }
        } else {
          let data = this.data.list2
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list2: list,
          total2: res.data.data.totalPages,
          list2Length
        })
      }
    })
  },
  getList3() {//待发货订单
    let data = {
      pageIndex: this.data.pageIndex3,
      pageSize: this.data.pageSize,
      userId: this.data.userId,
      state: 1,
    }
    request.get('order/rest/order/myOrders', data).then((res) => {
      if (res.data.code == 0) {
        let list = []
        let list3Length = 0
        if (this.data.pageIndex3 == 1) {
          list = res.data.data.content
          if (res.data.data.content.length == 0) {
            list3Length = 1
          }
        } else {
          let data = this.data.list3
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list3: list,
          total3: res.data.data.totalPages,
          list3Length,
        })
      }
    })
  },
  getList4() {//待收货订单
    let data = {
      pageIndex: this.data.pageIndex4,
      pageSize: this.data.pageSize,
      userId: this.data.userId,
      state: 2,
    }
    request.get('order/rest/order/myOrders', data).then((res) => {
      if (res.data.code == 0) {
        let list = []
        let list4Length = 0
        if (this.data.pageIndex4 == 1) {
          list = res.data.data.content
          if (res.data.data.content.length == 0) {
            list4Length = 1
          }
        } else {
          let data = this.data.list4
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list4: list,
          total4: res.data.data.totalPages,
          list4Length,
        })
      }
    })
  },
  getList5() {//已完成订单
    let data = {
      pageIndex: this.data.pageIndex4,
      pageSize: this.data.pageSize,
      userId: this.data.userId,
      state: 3,
    }
    request.get('order/rest/order/myOrders', data).then((res) => {
      if (res.data.code == 0) {
        let list = []
        let list5Length = 0
        if (this.data.pageIndex5 == 1) {
          list = res.data.data.content
          if (res.data.data.content.length == 0) {
            list5Length = 1
          }
        } else {
          let data = this.data.list5
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list5: list,
          total5: res.data.data.totalPages,
          list5Length,
        })
      }
    })
  },
  lower() {
    let activeTab = this.data.activeTab
    switch (activeTab) {
      case 0:
        if ((this.data.pageIndex1 - 0) >= (this.data.total1 - 0)) {
          return false;
        }
        this.setData({
          pageIndex1: this.data.pageIndex1 + 1
        })
        this.getList1()
        break;
      case 1:
        if ((this.data.pageIndex2 - 0) >= (this.data.total2 - 0)) {
          return false;
        }
        this.setData({
          pageIndex2: this.data.pageIndex2 + 1
        })
        this.getList2()
        break;
      case 2:
        if ((this.data.pageIndex3 - 0) >= (this.data.total3 - 0)) {
          return false;
        }
        this.setData({
          pageIndex3: this.data.pageIndex3 + 1
        })
        this.getList3()
        break;
      case 3:
        if ((this.data.pageIndex4 - 0) >= (this.data.total4 - 0)) {
          return false;
        }
        this.setData({
          pageIndex4: this.data.pageIndex4 + 1
        })
        this.getList4()
        break;
      case 4:
        if ((this.data.pageIndex5 - 0) >= (this.data.total5 - 0)) {
          return false;
        }
        this.setData({
          pageIndex5: this.data.pageIndex5 + 1
        })
        this.getList5()
        break;
    }
  },
  onPullDownRefresh() {
    this.init();
    wx.stopPullDownRefresh();
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
            url: '/pages/login/login'
          });
        }
      },
    });
  },

});
