const request = require("../../../utils/request.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeTab: 0,
    current: 0,
    total1: "", 
    total2: "", 
    total3: "", 
    userId: '', 
    imgUrl: app.globalData.imgUrl, 
    pageIndex1: 1, 
    pageIndex2: 1, 
    pageIndex3: 1, 
    pageSize: 100, 
    list1: [],
    list2: [],
    list3: [],
    list1Length: 0,
    list2Length: 0,
    list3Length: 0,
    imgUrlNew: app.globalData.imgUrlNew,
    newUser: {},//新用户

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    if(options.type){
      this.setData({vouType:options.type},()=>{
        this.getVouchersList(1,0)
      })
    }

    
  },
  checkUser() {//检查新用户
    let res = wx.getStorageSync('newUser');
    if (res !== null) {
      this.setData({
        newUser: res,
      })
    }
  },
  closemask_() {
    let newUser = this.data.newUser;
    newUser.myVoucher = false;
    this.setData({
      newUser: newUser,
    })
    wx.setStorageSync('newUser',newUser);
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
    this.checkUser();
    
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
  tab(e) {
    if (e.currentTarget.dataset.index == 0) {
      this.getVouchersList(this.data.pageIndex1, e.currentTarget.dataset.index)
    } else if (e.currentTarget.dataset.index == 1) {
      this.getVouchersList(this.data.pageIndex2, e.currentTarget.dataset.index)
    } else if (e.currentTarget.dataset.index == 2) {
      this.getVouchersList(this.data.pageIndex3, e.currentTarget.dataset.index)
    }

    this.setData({
      activeTab: e.currentTarget.dataset.index,
      current: e.currentTarget.dataset.index
    })
    wx.setStorageSync('activeIndex', e.currentTarget.dataset.index)
  },
  onChange(e) {
    if (e.detail.current == 0){
      this.getVouchersList(this.data.pageIndex1, e.detail.current)
    } else if (e.detail.current == 1){
      this.getVouchersList(this.data.pageIndex2, e.detail.current)
    } else if (e.detail.current == 2){
      this.getVouchersList(this.data.pageIndex3, e.detail.current)
    }
    this.setData({
      activeTab: e.detail.current
    })
    wx.setStorageSync('activeIndex', e.detail.current)
  },
  // 获取卡券列表
  getVouchersList(pageIndex,state){
    // @ApiParam("状态 0 未使用 1 已使用 2 过期") 
    let userId = wx.getStorageSync('userId');
    request.post(`user/rest/voucher/myVouchers?pageIndex=${pageIndex}&pageSize=${this.data.pageSize}&state=${state}&userId=${userId}`).then(res => {
      let data = this.data.vouType == 'voucherList'?res.data.data.voucherList:res.data.data.couponList;
      if (state == 0){
        this.setData({ list1: data.content })
        this.setData({ total1: data.totalElements})
        this.setData({ list1Length: data.content.length})
      } else if (state == 1){
        this.setData({ list2: data.content })
        this.setData({ total2: data.totalElements })
        this.setData({ list2Length: data.content.length })
      } else if (state == 2){
        this.setData({ list3: data.content })
        this.setData({ total3: data.totalElements })
        this.setData({ list3Length: data.content.length })
      }
    })
  },
  // 获取卡券列表
  pullgetVouchersList(pageIndex, state) {
    // @ApiParam("状态 0 未使用 1 已使用 2 过期") 
    let userId = wx.getStorageSync('userId');
    request.post(`user/rest/voucher/myVouchers?pageIndex=${pageIndex}&pageSize=${this.data.pageSize}&state=${state}&userId=${userId}`).then(res => {
      if (state == 0) {
        let arr = this.data.list1
        let newArr = arr.concat(res.data.data.content)
        this.setData({ list1: newArr })
        this.setData({ total1: res.data.data.totalElements })
        this.setData({ list1Length: res.data.data.content.length })
      } else if (state == 1) {
        let arr = this.data.list2
        let newArr = arr.concat(res.data.data.content)
        this.setData({ list2: newArr })
        this.setData({ total2: res.data.data.totalElements })
        this.setData({ list2Length: res.data.data.content.length })
      } else if (state == 2) {
        let arr = this.data.list3
        let newArr = arr.concat(res.data.data.content)
        this.setData({ list3: newArr })
        this.setData({ total3: res.data.data.totalElements })
        this.setData({ list3Length: res.data.data.content.length })
      }
    })
  },
  changeDetails(e){
    let state = this.data.activeTab;
    let index = e.currentTarget.dataset.data;
    let str = ''
    let atcive = ''
    if (state == 0) {
      str = 'list1[' + index + '].active'
      atcive = this.data.list1[index].active
    } else if (state == 1) {
      str = 'list2[' + index + '].active'
      atcive = this.data.list2[index].active
    } else if (state == 2) {
      str = 'list3[' + index + '].active'
      atcive = this.data.list3[index].active
    }
    if (!atcive){
      this.setData({ [str]: true })
    }else{
      this.setData({ [str]: false })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  lower(){
    // switch (this.data.activeTab){
    //   case 0 :
    //     if (this.data.list1.length < this.data.total1){
    //       this.setData({ pageIndex1: this.data.pageIndex1++ }, () => {
    //         this.pullgetVouchersList(this.data.pageIndex1, this.data.activeTab)
    //       })
    //     }
    //     break
    //   case 1:
    //     if (this.data.list2.length < this.data.total2) {
    //       this.setData({ pageIndex2: this.data.pageIndex2++ }, () => {
    //         this.pullgetVouchersList(this.data.pageIndex2, this.data.activeTab)
    //       })
    //     }
    //     break
    //   case 2:
    //     if (this.data.list3.length < this.data.total3) {
    //       this.setData({ pageIndex3: this.data.pageIndex3++ }, () => {
    //         this.pullgetVouchersList(this.data.pageIndex3, this.data.activeTab)
    //       })
    //     }
    //     break
    // }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      var item = res.target.dataset.data
      request.post(`user/rest/voucher/presentVoucher?voucherId=${item.id}&userId=${item.userId}`).then(res => {
        console.log(res, "分享成功")
      })
      return {
        title: "送你一张权益券，拿走不客气！",
        path: `pages/vouchers/getVouchers/getVouchers?activityId=${item.activityId}&id=${item.id}&userId=${item.userId}`,
        imageUrl: 'http://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/vouchers/sharePoster.png',
      }
    }
    return {
      title: "拾尚包",
      path: `pages/home/home`,
    }
  },
  handerbinderror(res){
    this.setData({ isShowOfficial:false})

  },
  handerbindload(res){
    this.setData({ isShowOfficial: true })
  },
  goGzh(){

    wx.navigateTo({
      url: `../../webView/webView?&url=https://miniapp.shishangbag.vip/officialAccounts/index.html`
    });
  }
})