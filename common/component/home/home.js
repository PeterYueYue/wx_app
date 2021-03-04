var app = getApp();
const request = require("../../../utils/request.js");
const format = require("../../../utils/util.js");
Component({
  data: {
    headImg: '../../image/1.png',
    // canUse: wx.canIUse('lifestyle'),
    logins: false,
    visible: false,
    imgUrl: app.globalData.imgUrl,
    maskFlag: false,
    redFlag: true,
    redMoney: '',
    residueRedNum: ''
  },
  properties:{
    userInfo:{
      type:Object,
      value:'',
      observer:function(newVal,oldVal){
        this.init();
      }

    },
    logins:{
      type:Boolean,
      value:false
    }

  },

  lifetimes: {
    attached: function () {
    },
    moved: function () { },
    detached: function () { },
  },
  pageslifeTimes: {
    // 组件所在页面的生命周期函数
    show: function () {
    },
    hide: function () {},
    resize: function () {},
  },
  methods: {
    init(){
      
      const _this = this;
      let res = this.data.userInfo
      if (!res.id){
        return
      }
      this.setData({
        userInfo: format.format(res),
        logins: true
      });
      const param = {
        userId: res.id,
      };
      //获取个人中心信息
      if (!res) {
        return false;
      }
      request.post("user/rest/user/getUserInfo", param).then(res => {
        if (res.data.code === 0) {
          
          _this.setData({
            userInfoMore: res.data.data,
          });
          wx.setStorage({
            key: 'userInfoMore', // 缓存数据的key
            data: res.data.data, // 要缓存的数据
          });
          if (res.data.data.userAddress) {
            wx.setStorage({
              key: 'add', // 缓存数据的key
              data: res.data.data.userAddress,
            });
          }
          if ((res.data.data.residueRedNum - 0) > 0) {
            this.setData({
              maskFlag: true
            })
          }
        }
      })

    },
    onClicks(e) {
      console.log(e)
      const _this = this;
      let num = e.currentTarget.dataset.name || e.target.dataset.name
      switch (num) {
        case "编辑资料":
          wx.navigateTo({
            url: '../editorData/editorData'
          });
          break;
        case "地址簿":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../address/address'
          });
          break;
        case "分享":
          wx.navigateTo({
            url: '../share/share'
          });
          break;
        case "提现账户":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../bank/bank'
          });
          break;
        case "关于拾尚包":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../aboutMe/aboutMe'
          });
          break;
        case "地推二维码":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../twoBarCode/twoBarCode'
          });
          break;
        case "意见反馈":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../advice/advice'
          });
          break;
        case "收益":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../earnings/earnings'
          });
          break;
        case "提现记录":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../tiXian/tiXian'
          });
          break;
        case "错误投递":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../delivery/delivery'
          });
          break;
        case "在线客服":
          wx.navigateTo({
            url: '../contact-button/contact-button'
          });
          break;
        case "修改密码":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../changePwd/changePwd'
          });
          break;
        case "我的卡券":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../vouchers/myVouchers/myVouchers'
          });
          break;
        case "提现":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../withdrawal/withdrawal'
          });
          break;
        case "提现审核":
          if (!this.data.userInfo.id) {
            this.toLogin()
            return false;
          }
          wx.navigateTo({
            url: '../approve/approve'
          });
          break;
        case "退出":
          wx.showModal({
            title: '温馨提示',
            content: '确定退出登录吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: (result) => {
              if (result.confirm) {
                //清除登录信息
                this.clearStorage()
               
              }
            },
          });
          break;
        default:
          break;
      }
    },
    clearStorage(){
      this.triggerEvent('clearStorage')
      this.setData({ userInfoMore:{}})
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
    gologin() {
      wx.navigateTo({
        url: '../login/login'
      });
    },
    //拨打客服电话
    tocall(e) {
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.phonenum
      });
    },
    //关闭模板
    closermask() {
      this.setData({
        maskFlag: false
      })
      const _this = this
      const param = {
        userId: this.data.userInfo.id,
      };
      request.post("user/rest/user/getUserInfo", param).then(res => {
        if (res.data.code === 0) {
          _this.setData({
            userInfoMore: res.data.data,
          });
          wx.setStorageSync('userInfoMore', res.data.data);
          if (res.data.data.userAddress) {
            wx.setStorageSync('add', res.data.data.userAddress);
          }
        }
      })
    },
    //开红包
    openRed() {
      let param = {
        userId: this.data.userInfo.id
      }
      request.get("user/rest/redEnvelope/userRedEnvelope", param).then(res => {
        console.log(res)
        if (res.data.code == 0) {
          this.setData({
            redMoney: res.data.data.redMoney,
            residueRedNum: res.data.data.residueRedNum,
            redFlag: false
          })
          if (res.data.data.residueRedNum == 0) {
            wx.showToast({
              icon: "none",
              title: `您已没有抽取红包次数`,
              duration: 1500,
            });
          } else {
            wx.showToast({
              icon: "none",
              title: `您还有${res.data.data.residueRedNum}次抽取红包次数，请再次点击抽取`,
              duration: 1500,
            });
          }
        }
      })
    },
    showRed() {
      if ((this.data.residueRedNum - 0) > 0) {
        this.setData({
          redFlag: true
        })
      } else {

      }
    },
    onPullDownRefresh() {
      const _this = this;
      let res = wx.getStorageSync('userInfo');
      if (!res) {
        this.setData({
          userInfo: {},
          logins: false
        })
        return false;
      }
      this.setData({
        userInfo: res,
        logins: true
      });
      const param = {
        userId: res.id,
      };
      //获取个人中心信息
      if (!res) {
        return false;
      }
      request.post("user/rest/user/getUserInfo", param).then(res => {
        if (res.data.code === 0) {
          // res.data.data.residueMoney = (res.data.data.residueMoney - 0).toFixed(2).toString().split(".")
          // res.data.data.totalDeposit = (res.data.data.totalDeposit - 0).toFixed(2).toString().split(".")
          // res.data.data.totalErrWeight = (res.data.data.totalErrWeight - 0).toFixed(2).toString().split(".")
          _this.setData({
            userInfoMore: res.data.data,
          });
          wx.setStorageSync('userInfoMore', res.data.data);
          if (res.data.data.userAddress) {
            wx.setStorageSync('add', res.data.data.userAddress);
          }
        }
      })
      wx.stopPullDownRefresh();
    }

  },
  
});