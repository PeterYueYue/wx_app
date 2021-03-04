const request = require("../../utils/request.js");
var time = null;
var startY = "";
var app = getApp();
var count = 1
Page({
  data: {
    addressStatus: false, //是否选择了上门地址的状态
    add: {}, //选择了上门地址后的数据
    timeType: false, //是否选择了上门时间的状态
    timeData: {}, //选择了时间的数据
    getAddressBranch: {}, //网点的数据
    submitStatus: true,
    imgUrl: app.globalData.imgUrl, //图片路径
    imgUrlNew: app.globalData.imgUrlNew,
    isShowVouList: false,
    weightId: 0,//重量范围
    vou: [],//券列表
    pageSize: 10,
    userId: '',
    vouChoosed: [],//已选中的券
    rans: [],//已选中的券类型集合
    userFlag: 1,
    newUser: {},//新用户
    isAgree: false,
    shangmenNum: '',
    isShowDoorTips: true,
    type: 'appliance',   // 上线更改
    householdList: {},
    applianceList: {},
    fwsCategoryId: '',
    path: '',
    stepBg: false,
    ani: {},
    isShowHk: "",
    item: {},
    navH:0,
    navColorState:false,
    donationList:[]
  },
  onLoad() {
    this.setData({
      navH: app.globalData.navHeight
    })
  },
  onReady() {
    // 页面加载完成
    let isAgree = wx.getStorageSync('isAgree')

    this.setData({ isAgree: isAgree })
    let res = wx.getStorageSync('userInfo');
    if (res) {
      this.setData({
        userInfo: res,
      })
    } else {
      this.setData({
        userInfo: {
          userFlag: 1
        },
      })
    }
  },

  onShow() {
    if (this.data.path !== 'date') {
      // 上线打开
      this.categoryListByAddressId();
    }
    this.checkUser()
    let add = wx.getStorageSync("add");
    let date = wx.getStorageSync("date");
    let hkObj = wx.getStorageSync("hkObj");
    this.setData({ hkObj: hkObj ? hkObj : {} })
    // 判断是否选择了地址
    if (add) {
      this.setData({
        addressStatus: true,
        add: add
      })
    } else {
      this.setData({
        addressStatus: false,
      })
    }
    //判断是选择了时间
    if (date) {
      this.setData({
        timeType: true,
        timeData: date
      })
    } else {
      this.setData({
        timeType: false
      })
    }
    if (this.data.addressStatus) {
      this.getPlace()
    }
    let userInfo = wx.getStorageSync("userInfo");

    if (userInfo) {
      this.setData({
        userId: userInfo.id,
        userFlag: userInfo.userFlag,
      });
    }
    this.getVou();
    this.getShangmenNum();
    if(userInfo.userFlag == 1){
      this.isMember();
    }
    
  },
  closeslgz(){
    this.setData({myslgz:false})
  },
  openslgz(){
    this.setData({myslgz:true})
  },
  gobenefitDetail(e){
    let item = e.currentTarget.dataset.data;
    wx.navigateTo({
      url: '/pages/publicBenefit/benefitDetail/benefitDetail?id='+item.id+'&type='+item.projectType,
    })
  },
  onPageScroll(res){
    console.log(res)
    if(res.scrollTop >=80&&!this.data.navColorState){
      this.setData({navColorState:true})
    }else if(res.scrollTop <80&&this.data.navColorState){
      this.setData({navColorState:false})
    }
  },
  // 上传图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.showLoading({
          title: '加载中',
        })
        wx.compressImage({
          src: res.tempFilePaths[0],
          success: (res) => {
            wx.uploadFile({
              url: request.localhost + 'user/rest/user/uploadImg',
              name: 'file',
              filePath: res.tempFilePath,
              header: request.dataConversion(),
              success: res => {
                wx.hideLoading();
                this.setData({
                  pic: JSON.parse(res.data).data.imgUrl,
                })
              },
              fail: function (res) {
              },
            })
          }
        })
      }

    })
  },
  closeCameraBox() {
    this.setData({ isShowCb: false })
  },
  openCb() {
    this.setData({ isShowCb: true })
  },
  // 判断是不是会员
  isMember() {
    let userInfo = wx.getStorageSync("userInfo");
    request.post("user/rest/user/getUserInfo", { userId: userInfo.id }).then(res => {
      if (res.data.code === 0) {
        if (!res.data.data.hasSendDoorVoucher) {
          this.setData({ showStatus: true })
        }
      }
    })


  },
  clickItem(e) {
    if(this.data.userFlag == 2){
      return
    }
    
    if (this.data.showStatus) {
      this.setData({ showSxs: true })
      return
    }
    let item = e.currentTarget.dataset.data;
    console.log(item,"item")
    let hkObj = this.data.hkObj;
    this.setData({ item: item })
    switch (item.name) {
      case '衣物':
        if (hkObj.yf != 'Y') { this.setData({ isShowHk: 'hk2' }) }
        break;
      case '复合纸包装':
        if (hkObj.fhzbz != 'Y') { this.setData({ isShowHk: 'hk1' }) }
        break;
      case '软塑包装':
        if (hkObj.rsbz != 'Y') { this.setData({ isShowHk: 'hk3' }) }
        break;
    }
  },
  touchstart(e) {
    startY = e.touches[0].pageY;
  },
  touchmove(e) {
    if (e.touches[0].pageY > startY) {
      this._animation('940rpx')
    } else {
      this._animation('250rpx')
    }
    this.setData({ stepBg: !this.data.stepBg })
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  touchend() {
    clearTimeout(time)
  },
  touchHead() {
    this._animation(this.data.stepBg ? '250rpx' : '940rpx');
    this.setData({ stepBg: !this.data.stepBg })
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  // onPageScroll(){
  //   this.setData({stepBg:false});
  //   this._animation("200rpx");
  // },
  _animation(rpx) {
    let animation = wx.createAnimation({
      delay: 0,
      timingFunction: 'ease',
      duration: 400
    })
    animation.top(rpx).step();
    this.setData({
      ani: animation.export()
    })


  },
  handChange(e) {
    let list = this.data.applianceList;
    if (this.data.addressStatus && list.isOpen == "open") {
      // 单选
      list.fwsCategories = list.fwsCategories.map((item, index) => {
        if (index == e.currentTarget.dataset.index) {
          item.checked = true
          this.setData({ fwsCategoryId: item.id })
        } else {
          item.checked = false
        }
        return item;
      })
      // 多选
      // if(!list.fwsCategories[e.currentTarget.dataset.index].checked){
      //   list.fwsCategories[e.currentTarget.dataset.index].checked=true;
      // }else{
      //   list.fwsCategories[e.currentTarget.dataset.index].checked=false;
      // }
      this.setData({ applianceList: list })
    } else if (list.isOpen == "close") {
      wx.showToast({
        icon: 'none',
        title: '当前地址暂未开通服务',
        duration: 1500,
      });
    } else {
      wx.showToast({
        icon: 'none',
        title: '请先选择上门地址',
        duration: 1500,
      });
    }



  },
  categoryListByAddressId() {
    let add = wx.getStorageSync("add");
    request.post('order/rest/resserveOrder/getFwsCategoryByAddressId', { addressId: add ? add.id : '' }).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          householdList: res.data.data.DOMESTIC_WASTE,
          applianceList: res.data.data.MAJOR_APPLIANCES
        })

        if(this.data.type == 'donations'){
          return
        }
        
        if (res.data.data.DOMESTIC_WASTE.isOpen == 'open') {
          this.setData({ type: 'household' })
        } else if (res.data.data.MAJOR_APPLIANCES.isOpen == 'open') {
          this.setData({ type: 'appliance' })
        } else {
          this.setData({ type: 'close' })
        }



      }
    })


  },
  changeType(e) {
    let type = e.currentTarget.dataset.data;
    if (type == 'household' && this.data.householdList.isOpen == 'open') {
      this.setData({ type: type });
      this.setData({ timeData: {}, timeType: false })
      this.setData({ vouChoosed: [] })
    } else if (type == 'appliance' && this.data.applianceList.isOpen == 'open') {
      this.setData({ pic:''})
      this.setData({ type: type });
      this.setData({ timeData: {}, timeType: false })
      this.setData({ vouChoosed: [] })
    } else {

      
      this.setData({ type: type });
      this.setData({ timeData: {}, timeType: false })
      this.setData({ vouChoosed: [] })
      this.donationList();
      return
      wx.showToast({
        icon: 'none',
        title: "暂未开通服务",
        duration: 1500,
      });
    }
  },
  // 捐赠列表
  donationList(){
    request.get("user/open/donation/donationProjectList").then(res => {
      this.setData({donationList:res.data})
    })
  },
  goGetBao() {
    wx.navigateTo({
      url: '/pages/member/member/member'
    });
  },
  goEffect() {
    wx.navigateTo({
      url: `/pages/webView/webView?url=https://miniapp.shishangbag.vip/web_rule/effect/index.html`
    });

  },
  bangding() {
    wx.navigateTo({
      url: `/pages/webView/webView?url=https://miniapp.shishangbag.vip/web_rule/bind/index.html`
    });
  },
  checkUser() {//检查新用户
    let res = wx.getStorageSync('newUser');
    if (res !== null) {
      this.setData({
        newUser: res,
      })
    }
  },
  changeAgree(e) {
    this.setData({ isAgree: !this.data.isAgree }, () => {
      wx.setStorage({
        key: "isAgree",
        data: this.data.isAgree
      })
    })

  },
  closemask_() {
    let newUser = this.data.newUser;
    newUser.appointment = false;
    this.setData({
      newUser: newUser,
    })
    wx.setStorageSync('newUser', newUser,);
  },

  goAgreeMent() {
    wx.navigateTo({
      url: `../webView/webView?url=https://miniapp.shishangbag.vip/agreement/index.html`
    });

  },
  // 选择可用权益
  chooseVou(e) {
    const index = e.currentTarget.dataset.index;
    const item = e.currentTarget.dataset.item;
    let vou = this.data.vou;
    let list = [] //列表状态
    if (item.ran == 0) {
      vou.map((e, i) => {
        if (i == index) {
          e.selected = true
        } else {
          e.selected = false
        }
        list.push(e)
      })
      this.setData({ vou: list })
    } else {
      vou.map((e, i) => {
        if (e.ran == 0) {
          e.selected = false
        }
        list.push(e)
      })
      vou[index].selected = !vou[index].selected
      this.setData({ vou: vou })
    }

  },
  //确定选中的券
  closeVouList() {
    let that = this;

    this.setData({ isShowVouList: false });
    this.setData({
      vouChoosed: [],
    })
    this.data.vou.forEach(function (item, i) {
      if (item.selected) {
        console.log(item)
        let vouChoosed = that.data.vouChoosed;
        vouChoosed.push(item);
        that.setData({
          vouChoosed: vouChoosed,
        })
      }
    })

  },
  //删除券
  delVou(e) {
    var newarr = this.data.vouChoosed;
    let ide = e.currentTarget.dataset.item
    if (ide) {
      newarr = newarr.filter(k => {
        if (k.id && k.id !== ide) {
          return k
        }
      });
    }
    this.setData({
      vouChoosed: newarr,
    })
  },
  // 获取信息
  getVou() {
    let pageIndex = 0, state = 0, hasDoor = 0;
    request.post(`user/rest/voucher/myVouchers?pageIndex=${pageIndex}&pageSize=${this.data.pageSize}&state=${state}&userId=${this.data.userId}&hasDoor=${hasDoor}`).then(res => {
      if (res.data.code === 0) {
        console.log(res, "kkk")
        res.data.data.voucherList.content.forEach(function (item, index) {
          item.selected = false;
          item.checked = false;
        })
        this.setData({
          vou: res.data.data.voucherList.content,
        })
      }
    })
  },
  //选择上门地址和时间后，获取网点
  getPlace() {
    let add = this.data.add
    let data = {
      address: add.provinceName + add.cityName + add.areaName + add.address,
      weightType: this.data.weightId

    }
    request.get("order/rest/resserveOrder/getAddressBranch?address=" + data.address + "&weightType=" + data.weightType).then((res) => {
      if (res.data.code == 0) {
        this.setData({
          getAddressBranch: res.data.data.result
        })
      }
    })
  },
  openVouList() {
    this.setData({ isShowVouList: true })
  },
  toMap() {
    // my.navigateTo({
    //   url: `../map/map?latitude=${this.data.getAddressBranch.latitude}&longitude${this.data.getAddressBranch.longitude}`
    // });
    console.log(this.data.getAddressBranch)
    wx.openLocation({
      longitude: this.data.getAddressBranch.longitude - 0,
      latitude: this.data.getAddressBranch.latitude - 0,
      name: this.data.getAddressBranch.brancheName,
      address: this.data.getAddressBranch.provinceName + this.data.getAddressBranch.areaName + this.data.getAddressBranch.address,
    })
  },
  toAddress() {
    this.setData({ path: '' })
    wx.navigateTo({
      url: '../address/address?status=2'
    });
  },
  toDate() {
    if (this.data.addressStatus == false) {
      wx.showToast({
        icon: 'none',
        title: '请先选择上门地址',
        duration: 1500,
      });
      return false;
    } else if (this.data.applianceList.providerId == undefined) {
      wx.showToast({
        icon: 'none',
        title: '获取服务商中,请稍后',
        duration: 1500,
      });
      return false;
    } else if (this.data.type == 'appliance' && !this.data.applianceList.providerId) {
      wx.showToast({
        icon: 'none',
        title: '当前地址暂未开通服务！',
        duration: 1500,
      });
      return false;

    }
    this.setData({ path: 'date' })
    if (this.data.type == 'appliance') {

      wx.navigateTo({
        url: `../date/date?data=${JSON.stringify(this.data.add)}&providerId=${this.data.applianceList.providerId}&type=${this.data.type}`
      });
    } else if (this.data.type == 'household') {
      wx.navigateTo({
        url: `../date/date?data=${JSON.stringify(this.data.add)}&providerId=${this.data.householdList.providerId}&weightId=${this.data.weightId}`
      });
    }
  },
  getShangmenNum() {
    let res = wx.getStorageSync('userInfo');
    // let data = { userId: res.id }

    request.get('order/rest/resserveOrder/getShangmenVoucherNum?userId=' + res.id).then((res) => {
      this.setData({ shangmenNum: res.data.data })
    })

  },
  submit() {

    if (this.data.type == 'appliance' && this.data.fwsCategoryId == "") {//不选小分类不能下单
      wx.showToast({
        icon: 'none',
        title: '请选择大家电回收类目',
        duration: 1500,
      });
      return;
    }

    if (!this.data.addressStatus) {
      wx.showToast({
        icon: 'none',
        title: '请先选择上门地址',
        duration: 1500,
      });
      return
    } else if (!this.data.timeType) {

      wx.showToast({
        icon: 'none',
        title: '请先选择上门时间',
        duration: 1500,
      });
      return
    } else if (this.data.shangmenNum < 2 && this.data.weightId == '1' && this.data.userInfo.userFlag == '1') {
      wx.showToast({
        icon: 'none',
        title: '上门券不足，无法预约',
        duration: 1500,
      });
      return
    }
    count++
    if (count > 2) return;

    this.setData({
      submitStatus: false
    })
    let voucherTypes = [];
    this.data.vouChoosed.forEach(function (item, index) {
      voucherTypes.push(item.typeId);
    })
    //查看数据
    let add = this.data.add
    let timeData = this.data.timeData;
    let providerId = this.data.applianceList.providerId;
    let providerId2 = this.data.householdList.providerId;
    let data = {
      userId: this.data.userId,
      address: add.provinceName + add.cityName + add.areaName + add.address,
      userAddressId: add.id,
      reserveDate: timeData.year,
      reserveTime: timeData.type == 1 ? "上午" : "下午",
      userMobile: add.userMobile,
      userName: add.userName,
      week: timeData.week,
      street: timeData.street,
      voucherTypes: voucherTypes,
      estimatedWeight: this.data.weightId,
      whetherSubscribeMessages: timeData.isAgree ? '1' : '0',  //是否同意推送称重信息
      source: 'wx',
      formId: '', //微信传空
      orderType: this.data.type == 'appliance' ? 'MAJOR_APPLIANCES' : 'DOMESTIC_WASTE',
      fwsCategoryId: this.data.fwsCategoryId,
      providerId: this.data.type == 'appliance' ? providerId : providerId2,
      photoRewardUrl: this.data.pic ? this.data.pic : ''
    }
    request.post('order/rest/resserveOrder/userResserveOrder', data).then((res) => {
      count = 1
      if (res.data.code == 0) {
        wx.redirectTo({
          url: '/pages/resultPage/resultPage'
        })
        this.setData({
          submitStatus: true
        })
      } else {
        this.setData({
          submitStatus: true
        })

      }
    })

  },
  closeHk() {
    this.setData({ isShowHk: "" })
    this.setData({ item: {} })
  },
  getRed() {

    console.log(this.data.isShowHk)
    let data = {
      userId: this.data.userId,
      voucherId: this.data.item.id
    }

    request.post('user/rest/voucher/receiveGiftVoucher', data).then((res) => {
      wx.showToast({
        icon: 'none',
        title: res.data.message,
        duration: 1500,
      });
      if (res.data.message == '券码领取成功') {
        let hkObj = this.data.hkObj;
        switch (this.data.item.name) {
          case "衣物": hkObj.yf = "Y"
            break;
          case "复合纸包装": hkObj.fhzbz = "Y"
            break;
          case "软塑包装": hkObj.rsbz = "Y"
            break;
        }
        wx.setStorage({ data: hkObj, key: 'hkObj', })
        this.setData({ hkObj: hkObj })
        this.getVou()
        this.closeHk()
      }

    })


  },


  goback() {
    wx.navigateBack()
  },
  onUnload() {
    wx.removeStorage({
      key: 'date',
      success: function () { }
    });
  },
  onHide() {
  }
});