
var app = getApp();
const request = require("../../../utils/request.js");
var countTime = null
var countTime2 = null
Component({

  mixins: [],
  data: {
    interval: 1000,
    imgUrl: app.globalData.imgUrl,
    imgUrl1: app.globalData.imgUrl1,
    imgUrlNew: app.globalData.imgUrlNew,
    orderState: true, //预约状态
    maskFlag: false,
    isShowDoorTips: false,
    couponbox: app.globalData.imgUrlNew + 'yy/newIndex/member.png',
    newUser: {},//新用户
    timeObj: {
      h: '00',
      m: '00',
      s: '00'
    },
    noticeList: [],
    flag: false,
    isHasVou: false,
    isShowVouList: false,
    annualBill: false
  },
  properties: {
    myProperty: { // 属性名
      type: null, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) { } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    background: {
      type: Array,
      value: '',
      observer: function (newVal, oldVal) { }

    },
    media: null,
    userInfo: {
      type: Object,
      value: '',
      observer: function (newVal, oldVal) { }
    },
    bagCount: null
    // maskFlag:null,


  },
  pageLifetimes: {
    show: function () {
      // 页面被展示

    },
    hide: function () {
      // 页面被隐藏

    },
    resize: function (size) {
      // 页面尺寸变化

    },

  },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      this.checkUser();
      this.getNextVoucherActivityDate();
      this.getTotalGroupNo();
      this.checkBill();
      let res = wx.getStorageSync('userInfo');
      if (res) {
        this.setData({
          userInfo: res,
        })

        // 补发优惠券功能
        this.getReserveIdByUserIdForVoucher(res);
        this.updataUserInfo(res.id)




      } else {
        this.setData({
          userInfo: {
            userFlag: 1
          },
        })
      }
    },
    moved: function () {

    },
    detached: function () {

    },
  },
  

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () {

  }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: () => {


  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      let res = wx.getStorageSync('userInfo');
      this.getSignInData();
      if(res.id){
        this.updataUserInfo(res.id)
      }
      this.noticeList();
      this.popWindows();
    },
    hide: function () {
      clearInterval(countTime)
      clearInterval(countTime2)
    }
  },
  methods: {
    updataUserInfo(userId){
      request.post("user/rest/user/getUserInfo", {userId:userId}).then(res => {
        if (res.data.code === 0) {
          wx.setStorage({
            key: 'userInfoMore',
            data: res.data.data,
          });
          this.setData({
            userInfoMore: res.data.data,
          });
          if (res.data.data.userAddress) {
            wx.setStorage({
              key: 'add', // 缓存数据的key
              data: res.data.data.userAddress,
            });
          }
        }
      })
    },
    goproducts(){
      this.triggerEvent("switchTab","bao")
    },
    goMember() { //成为会员
      if (!this.data.userInfo.id) {
        this.toLogin('/pages/member/member/member')
        return false
      }
      wx.navigateTo({
        url: '/pages/member/member/member'
      });
    },
    lookCoupon() {//查看卡券
      if (!this.data.userInfo.id) {
        this.toLogin('/pages/vouchers/typeList/typeList')
        return false
      }
      wx.navigateTo({
        url: '/pages/vouchers/typeList/typeList'
      });
    },
    checkBill() {
      let annualBill = wx.getStorageSync("annualBill");
      if (!annualBill && annualBill !== false) {
        this.setData({
          annualBill: true,
        })
        return;
      }
    },
    closebill() {
      this.setData({
        annualBill: false,
      })
      wx.setStorage({ key: "annualBill", data: false })
    },
    gobill() {
      if (!this.data.userInfo.id) {
        let path = this.data.userInfo.userFlag == 1 ? '/pages/annualBill/billOne/billOne' : '/pages/annualBill/bill/bill'
        this.toLogin(path)
        return false
      }
      if (this.data.userInfo.userFlag == 1) {
        wx.setStorage({ key: "annualBill", data: false })
        wx.navigateTo({
          url: '/pages/annualBill/billOne/billOne'
        })
      } else {
        wx.setStorage({ key: "annualBill", data: false })
        wx.navigateTo({
          url: '/pages/annualBill/bill/bill'
        })
      }
    },
    goMdActivity() {
      wx.navigateTo({
        url: `/pages/member/mdActivity/mdActivity`
      });
    },
    rule() {//回收规则
      wx.navigateTo({
        url: `/pages/webView/webView?url=${'https://miniapp.shishangbag.vip/recycle_rule/index.html'}`
      });
    },
    step() {//操作流程
      wx.navigateTo({
        url: `/pages/webView/webView?url=${'https://miniapp.shishangbag.vip/operation_step/index.html'}`
      });
    },
    donate() {//爱心捐赠
      if (!this.data.userInfo.id) {
        this.toLogin('/pages/activity/donate/donate')
        return false
      }
      wx.navigateTo({
        url: `/pages/activity/donate/donate`
      });
    },
    goSignin() {
      let userInfo = wx.getStorageSync('userInfo');
      if (!userInfo.id) {
        this.toLogin('/pages/shop/signIn/signIn')
      } else {
        wx.navigateTo({ url: `/pages/shop/signIn/signIn` });
      }
    },
    getSignInData() {
      request.get('user/rest/signIn/signInfo', { userId: this.data.userInfo.id }).then((res) => {
        this.setData({ signInData: res.data })
      })
    },
    goGzh() {//去公众号
      wx.navigateTo({
        url: `../../pages/webView/webView?&url=https://mp.weixin.qq.com/s/fJV0xqD-jBsjD6RMCi-unw`
      });
    },
    // 双十二活动
    go() {
      if (!this.data.userInfo.id) {
        this.toLogin()
        return false
      }
      this.getLocation();
    },
    checkUser() {//检查新用户
      let res = wx.getStorageSync('newUser');
      if (res !== null) {
        this.setData({
          newUser: res,
        })
      }
    },
    noticeList() {
      request.get("user/rest/notice/carousel").then(res => {
        this.setData({ noticeList: res.data.data })
      });
    },
    popWindows() {
      request.get("user/rest/notice/popWindows").then(res => {

        console.log(res,"lll")
        if (res.data.data) {
          let obj = wx.getStorageSync('popWindowsObj');
          if (obj && obj.pic == res.data.data.pic || res.data.data.state == 0) {
            return false;
          }
          this.setData({
            popWindowsObj: res.data.data,
            popWindowsBool: true,
          })
          wx.setStorage({
            key: 'popWindowsObj',
            data: res.data.data,
          });
        }
      });
    },
    closePop() {//关闭弹窗公告
      this.setData({ popWindowsBool: false });
    },
    getTotalGroupNo() {//获取环保团人数
      request.post("user/rest/groups/getTotalGroupNo").then(res => {
        this.setData({
          totalGroupNo: res.data,
        })
      });
    },
    closemask_() {
      let newUser = this.data.newUser;
      newUser.index = false;
      this.setData({
        newUser: newUser,
      })
      wx.setStorageSync('newUser', newUser);


    },
    closemask_a() {
      this.setData({
        check: false,
      })
      wx.setStorage({
        key: 'changeType',
        data: true,
      });
    },
    // 获取整点登录时间
    getNextVoucherActivityDate() {

      clearInterval(countTime)
      clearInterval(countTime2)
      request.get("user/rest/voucher/nextVoucherActivityDate").then(res => {
        if (res.data.code === 0) {

          this.setData({ countTime: res.data.data.residueSeconds });
          this.setData({ activityId: res.data.data.activityId });
          this.countDown(res.data.data.residueSeconds)
        }
      })



    },
    // 整点登录倒计时
    countDown(residueSeconds) {
      countTime = setInterval(() => {
        var time = residueSeconds--;
        this.setData({ residueSeconds: time })
        if (time <= 0) {
          this.setData({ isActivity: true })
          clearInterval(countTime)
          return
        }

        var min = Math.floor(time % 3600);
        var time1 = Math.floor(time / 3600) + "时" + Math.floor(min / 60) + "分" + time % 60 + "秒";
        let timeObj = {
          h: Math.floor(time / 3600) < 10 ? '0' + Math.floor(time / 3600) : Math.floor(time / 3600),
          m: Math.floor(min / 60) < 10 ? '0' + Math.floor(min / 60) : Math.floor(min / 60),
          s: time % 60 < 10 ? '0' + time % 60 : time % 60
        }
        this.setData({ timeObj: timeObj })
      }, 1000)

      countTime2 = setInterval(() => {
        this.getNextVoucherActivityDate()

      }, 10000)


    },
    goZddlu() { //进入整点登录
      if (!this.data.userInfo.id) {
        this.toLogin()
        return false
      }
      if (this.data.activityId) {
        wx.navigateTo({
          url: `/pages/vouchers/timelogin/timelogin?id=${this.data.activityId}`
        });
      }
    },
    goRank() { //进入环保推广排行榜
      if (!this.data.userInfo.id) {
        this.toLogin()
        return false
      }
      wx.navigateTo({
        url: `/pages/member/memberRank/memberRank`
      });
    },

    //轮播图
    gobanner(e) {
      var _this = this;
      const id = e.currentTarget.dataset.id;
      const flag = e.currentTarget.dataset.flag;
      const url = e.currentTarget.dataset.url;
      switch (flag) {
        case 1:
          wx.navigateTo({
            url: `/pages/webView/webView?id=${id}&url=${url}`
          });
          break;
        case 2:
          wx.navigateTo({
            url: '/pages/bannerDetail/bannerDetail?id=' + id
          })
          break;
        case 4:
          if (e.currentTarget.dataset.url == "pages/personalRank/personalRank") {
            wx.navigateTo({
              url: '/pages/personalRank/personalRank'
            });
          } else if (e.currentTarget.dataset.url == "pages/activity/a_index/a_index") {
            wx.navigateTo({
              url: '/pages/activity/a_index/a_index'
            });
          } else if (e.currentTarget.dataset.url == "pages/vouchers/login/login") {
            _this.getLocationlvse();
          } else if (e.currentTarget.dataset.url == "pages/activity/survey/survey") {
            wx.navigateTo({
              url: '/pages/activity/survey/survey'
            });
          } else if (e.currentTarget.dataset.url == "pages/activity/wholeFamily/wholeFamily") {
            wx.navigateTo({
              url: '/pages/activity/wholeFamily/wholeFamily'
            });
          } else {
            _this.getLocation();
          }
          break;
        case 3:
          wx.navigateTo({
            url: `/pages/webView/webView?url=${url}`
          });
          break;
      }
    },
    getLocationlvse() {
      var _this = this;
      wx.getLocation({
        success(res) {
          // 判断是否黄浦区用户参与 
          wx.request({
            url: 'https://restapi.amap.com/v3/geocode/regeo?location=' + res.longitude + ',' + res.latitude + '&key=adb6b96a1e4855bb109049e15c291aa0&radius=1000&extensions=all',
            method: 'GET',
            success: function (res) {
              if (res.data.regeocode.addressComponent.district == "黄浦区") {
                wx.navigateTo({
                  url: '/pages/vouchers/login/login'
                });
              } else {
                wx.showToast({
                  icon: 'none',
                  title: "该活动仅限黄浦区用户参加",
                  duration: 1500,
                });
              }
            },
            fail: function (res) {
              console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          })
        },

        fail() {
          wx.showToast({
            icon: 'none',
            title: "定位失败",
            duration: 1500,
          });
        },
      })
    },
    information(e) { //媒体报道
      let mediaFlag = e.currentTarget.dataset.mediaFlag
      let id = e.currentTarget.dataset.id
      let url = e.currentTarget.dataset.url
      // switch (mediaFlag) {
      //   case 2:
      //     wx.navigateTo({
      //       url: `../information/information?id=${id}`
      //     });
      //     break;
      //   case 1:
      //     wx.navigateTo({
      //       url: `../mediaLink/mediaLink?id=${id}&url=${url}`
      //     });
      //     break;
      //   default:
      // }
      if (mediaFlag == 2) {
        // 内容
        wx.navigateTo({
          url: `../information/information?id=${id}`
        });
      } else if (mediaFlag == 1) {
        // H5
        wx.navigateTo({
          url: `../mediaLink/mediaLink?id=${id}&url=${url}`
        });
      } else {
        wx.navigateTo({
          url: `../mediaLink/mediaLink?url=${url}`
        });
      }
    },

    //获取当前地理位置
    getLocation() {
      var _this = this;
      wx.getLocation({
        success(res) {
          // 判断是否上海用户参与 
          request.post(`user/rest/game1912/checkAddress?longitude=${res.longitude}&latitude=${res.latitude}`).then(res => {
            if (res.data.code === 0) {
              wx.getStorage({
                key: 'userInfo',
                success: function (res) {
                  if (res.data == null) {
                    _this.toLogin();
                  } else {
                    wx.navigateTo({
                      url: '../carnival/carnival'
                    });
                  }
                },
                fail: function (res) {
                  wx.showToast({
                    icon: 'none',
                    title: res.errorMessage,
                    duration: 1500,
                  });
                }
              });
            }
          });
        },
        fail() {
          wx.showToast({
            icon: 'none',
            title: '定位失败',
            duration: 1500,
          });
        },
      })
    },


    scan() { //扫码
      if (!this.data.userInfo.id) {
        this.toLogin()
        return false
      }
      this.triggerEvent("switchTab", "bao")
    },
    appointment() { //预约
      if (!this.data.userInfo.id) {
        this.toLogin()
        return false
      }
      wx.navigateTo({
        url: '/pages/appointment/appointment'
      });

    },
    closeDoorTips() {
      this.setData({ isShowDoorTips: false })
    },
    goGetDoor() {
      wx.navigateTo({
        url: '/pages/getDoor/getDoor',
      })
    },
    tiXian() { //提现
      let userInfo = wx.getStorageSync('userInfo');

      if (!userInfo.id) {
        this.toLogin('/pages/index/index?common=bao')
      } else {
        this.triggerEvent("switchTab", "bao")
      }
    },
    gotiXian() {//企业兑换
      if (!this.data.userInfo.id) {
        this.toLogin(`/pages/withdrawal/withdrawal`)
        return false
      }
      wx.navigateTo({//兑换时尚币
        url: `/pages/withdrawal/withdrawal`
      });
    },
    getBag() { //获取时尚包
      if (!this.data.userInfo.id) {
        this.toLogin('/pages/member/member/member')
        return false
      }
      wx.navigateTo({
        url: '/pages/member/member/member'
      });
    },

    site() { //环保体验站
      wx.navigateTo({
        url: '../site/site'
      });
    },
    sort() { //分类查询
      wx.navigateTo({
        url: '../sort/sort'
      });
    },
    area() { //服务区域
      wx.navigateTo({
        url: '../area/area'
      });
    },
    rank() { //机构排行
      wx.navigateTo({
        url: '../rank/rank'
      });
    },


    closemask() {
      this.triggerEvent('closemask')
    },
    carnival() {
      var _this = this;
      wx.getLocation({
        success(res) {
          // 判断是否上海用户参与 
          request.post(`user/rest/game1912/checkAddress?longitude=${res.longitude}&latitude=${res.latitude}`).then(res => {
            if (res.data.code === 0) {
              wx.getStorage({
                key: 'userInfo',
                success: function (res) {
                  if (res.data == null) {
                    _this.toLogin();
                  } else {
                    wx.navigateTo({
                      url: '../carnival/carnival'
                    });
                    _this.setData({
                      maskFlag: false
                    })
                  }
                },
                fail: function (res) {
                  wx.showToast({
                    icon: 'none',
                    title: res.errorMessage,
                    duration: 1500,
                  });
                }
              });
            } else {
              _this.setData({
                maskFlag: false
              })
            }
          });
        },
        fail() {
          wx.showToast({
            icon: 'none',
            title: '定位失败',
            duration: 1500,
          });
        },
      })
    },
    useVou() {
      this.setData({ isHasVou: false })
      this.setData({ isShowVouList: true })
    },
    closeVou() {
      this.setData({ isShowVouList: false })
      this.setData({ isHasVou: false })

    },
    // 获取弹出层的预约订单号
    getReserveIdByUserIdForVoucher(userInfo) {

      request.post("order/rest/resserveOrder/getReserveIdByUserIdForVoucher", JSON.stringify({ id: userInfo.id })).then(res => {
        if (res.data.code === 0) {
          console.log(res, "kkk23")
          this.setData({ orderId: res.data.data.orderId })
          if (res.data.data.orderId) {
            this.setData({ isHasVou: true })
          }

        }
      })

    },

    toLogin(backPage) {
      wx.showModal({
        title: '温馨提示',
        content: '您还未登录，确定去登录吗？',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        success: (result) => {
          if (result.confirm) {
            if (backPage) {
              wx.navigateTo({
                url: '../login/login?backPage=' + backPage
              });
            } else {
              wx.navigateTo({
                url: '../login/login'
              });
            }

          } else {
            this.triggerEvent("switchTab")
          }
        },
      });
    },
    godnlog() {
      let userInfo = wx.getStorageSync('userInfo');
      if (!userInfo.id) {
        this.toLogin("/pages/member/dnLog/dnLog")
      } else {
        wx.navigateTo({ url: "/pages/member/dnLog/dnLog" });
      }
    },
    onPullDownRefresh() {

      wx.stopPullDownRefresh()
    },






  },
});



