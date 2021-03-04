const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    status: 1,
    addList: [],
    showMOdal: false, //删除的弹框
    imgUrl: app.globalData.imgUrl,
    status1: 0
  },
  onLoad(e) {
    if (e.status) {
      this.setData({
        status: e.status
      })
    }
  },
  onShow() {
    this.getList()
   
    let userInfo = wx.getStorageSync('userInfo');
    const param = {
      userId: userInfo.id,
    };
    request.post("user/rest/user/getUserInfo", param).then(res => {
      if (res.data.code == 0) {
        if (res.data.data.userAddress) {
          wx.setStorageSync('add', res.data.data.userAddress);
        }
      }
    })
  },
  getList() {
    let userInfo = wx.getStorageSync('userInfo');
    let data = {
      userId: userInfo.id
    }
    request.get('user/rest/address/getAddressList', data).then((res) => {
      console.log(res)
      if (res.data.code == 0) {
        let status1 = 0;
        if (res.data.data.length == 0) {
          status1 = 1
        }
        this.setData({
          addList: res.data.data,
          status1
        })
      }

    })
  },
  goBack(e) {
    wx.removeStorageSync('date')
    let add = e.currentTarget.dataset.add
    wx.setStorageSync('add', add);
    wx.navigateBack()
  },
  edit(e) {

    wx.navigateTo({
      url: `../new-address/new-address?data=${JSON.stringify(e.currentTarget.dataset.add)}&title=修改地址`
    });
  },
  delete(e) {
    let add = wx.getStorageSync("add")
    wx.showModal({
      title: '温馨提示',
      content: '确定删除吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          console.log(e.currentTarget.dataset.delid)
          let data = {
            addressId: e.currentTarget.dataset.delid
          }
          request.get("user/rest/address/delAddress", data).then((res) => {
            if (res.data.code == 0) {
              if (add && (add.id == e.currentTarget.dataset.delid)) {
                wx.removeStorageSync('add');
              }
              this.getList()
            }
          })
        }
      },
    });
  },
  goToNewAddress: function() {
    wx.navigateTo({
      url: '../new-address/new-address?title=新建地址'
    });
  },
  onPullDownRefresh() {
    this.getList()
    wx.stopPullDownRefresh();
  }
});