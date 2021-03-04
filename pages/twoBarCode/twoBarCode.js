Page({
  data: {
    userInfoMore: {},
  },
  onLoad() { },
  onShow() {
    let userInfoMore = wx.getStorageSync('userInfoMore');
    if (userInfoMore) {
      this.setData({
        userInfoMore: userInfoMore
      })
    }
  },
});
