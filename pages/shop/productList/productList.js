var app = getApp();
const request = require("../../../utils/request.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    item:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let item = JSON.parse(options.item)

    console.log(item,"opopo")
    this.setData({item:item.productType})
    this.getList(item.productType.id)
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
  getList(id){
    request.get(`user/rest/product/productPageByType?typeId=${id}&pageIndex=${1}&pageSize=99`).then((res)=>{
      wx.setNavigationBarTitle({
        title:res.data.productType.name
      })
      this.setData({productList:res.data.page})
    })
  },
  goDetails(e){
    if(e.currentTarget.dataset.item.stock ==0) {
      return;
    }
    wx.navigateTo({
      url: `/pages/shop/productDetail/productDetail?item=${JSON.stringify(e.currentTarget.dataset.item)}`,
    })

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