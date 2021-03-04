var app = getApp();
const request = require("../../../utils/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    showTop:false,
    productDetails:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options,"options")

    let item = JSON.parse(options.item)
    this.getProductDetail(item.id)
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

    


  },
  goOrder () {//立即兑换
    const id = this.data.productDetails.id;
    wx.navigateTo({
      url: `/pages/shop/orderSure/orderSure?id=${id}`,
    })
  },
  getProductDetail(id){
    request.get(`user/rest/product/productDetail?productId=${id}`).then((res)=>{
      console.log(res,"productDetails")
      wx.setNavigationBarTitle({
        title:res.data.data.typeName
      })
      this.setData({productDetails:res.data.data})
    })
  },
  onTopBtnTap() {
    this.setData({
      showTop: true,
    });
  },
  onPopupClose() {
    console.log(1)
    this.setData({
      showTop: false,
    });
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