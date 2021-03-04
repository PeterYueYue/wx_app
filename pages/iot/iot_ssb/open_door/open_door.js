const request = require("../../../../utils/request.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    step:1,
    bagCode_index:0,
    imgUrlNew: app.globalData.imgUrlNew,
    bag_list:[],
    weight:"",
    vou:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getVou()
    this.getBagList()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  changeWeight(e){
    this.setData({weight:e.detail.value})
  },
  // 下单提交
  submit(e){
    wx.showLoading({
      title: '加载中',
    })
    let n = e?e.currentTarget.dataset.data:0
    let userInfo = wx.getStorageSync("userInfo");
    let voucherTypes = this.data.vou.filter(e=> e.selected)
    let data = JSON.stringify({
      bagCode:this.data.bag_list[this.data.bagCode_index].bagCode,
      voucherTypes:n==1?voucherTypes.map(e=> e.typeId):[],
      preWeight:this.data.weight,
      deviceNo:getApp().globalData.iotEncData,
      userId:userInfo.id
    })
    request.post("user/rest/iot/typeAIotRecycle",data).then(res => {
        wx.hideLoading()
        if(res.data.code == 0){

          wx.navigateTo({
            url: '/pages/iot/iot_ssb/replace_bag/replace_bag'
          })

        }
    })

  },
  defaultWeight(e){
    let n = e.currentTarget.dataset.data;
    console.log(n)
    this.setData({weight:5})

    if(!this.data.vou.length&&n>2){
      this.submit()
      return
    }
    this.setData({step:n})
  },
  // 切换显示
  changeStep(e){
    let n = e.currentTarget.dataset.data;
    if(!this.data.vou.length&&n>2){
      this.submit()
      return
    }
    if(n==3 && this.data.weight==0){
      wx.showToast({
        title: '请选择预估重量',
      })
      return
    }


    this.setData({step:n})
  },
  // 选择拾尚包
  changeBagCode(e){
    this.setData({bagCode_index:e.currentTarget.dataset.data})
  },
  // 获取包列表
  getBagList(){
    let userInfo = wx.getStorageSync("userInfo");
    //获取已绑定袋子列表
    request.post('user/rest/userSsb/getScanBagList', { userId: userInfo.id }).then((res) => {
      if (res.data.code == 0) {
        this.setData({ bag_list: res.data.data})
      }
    })
  },
  // 获取信息
  getVou() {
    let pageIndex = 0, state = 0, hasDoor = 0;
    let userInfo = wx.getStorageSync('userInfo');
    request.post(`user/rest/voucher/myVouchers?pageIndex=${pageIndex}&pageSize=50&state=${state}&userId=${userInfo.id}&hasDoor=${hasDoor}`).then(res => {
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})