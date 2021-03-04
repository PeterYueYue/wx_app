const request = require("../../utils/request.js");
const md5 = require("../../utils/md5.js");
Page({
  data: {
    pwd: '',//原密码
    newPwd: '',//新密码
    verifyPwd: '',
    status: true,//确认按钮状态
    userInfo: {},//用户信息
  },
  onLoad() {

  },
  onShow() {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });
    }
  },
  change(e) {
    const id = e.target.dataset.id
    switch (id) {
      case "1"://原密码
        this.setData({
          pwd: e.detail.value
        });
        break;
      case "2"://新密码
        this.setData({
          newPwd: e.detail.value
        });
        break;
      case "3"://确认密码
        this.setData({
          verifyPwd: e.detail.value
        });
        break;
      default:
        break;
    }
  },

  push() { //按钮
    const _this = this;
    if (this.data.pwd == '' || this.data.newPwd == '' || this.data.verifyPwd == '') { //判断有无输入
      wx.showToast({
        icon: 'none',
        title: '请输入完整信息',
        duration: 1500
      });
      return false;
    }
    if (this.data.verifyPwd !== this.data.newPwd) {
      wx.showToast({
        icon: 'none',
        title: '两次密码输入不一致',
        duration: 1500
      });
      return false;
    };
    _this.setData({
      status: false
    })
    const param = {
      oldPwd: md5.hex_md5(this.data.pwd),
      newPwd: md5.hex_md5(this.data.newPwd),
      userId: this.data.userInfo.id
    }
    request.get("user/rest/user/updatePwd", param).then((res) => {
      _this.setData({
        status: true
      })
      if (res.data.code == 0) {
        wx.showToast({
          icon: 'none',
          title: '修改成功',
          duration: 1500,
          success: () => {
            wx.switchTab({
              url: '../home/home',
            });
          },
        });
      } else {
        wx.showToast({
          icon: 'none',
          title: res.data.message,
          duration: 1500
        });
      }
    })
  }
});
