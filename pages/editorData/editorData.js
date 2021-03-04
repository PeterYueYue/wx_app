var app = getApp();
const request = require("../../utils/request.js");
Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    name: '',
    head: '',
    headUrl: '',
    userInfo: ''
  },
  onLoad() {
    this.init()
  },
  onShow(){
    
  },
  init(){
    let userInfo = wx.getStorageSync('userInfo');
    let userInfoMore = wx.getStorageSync('userInfoMore');
    console.log(userInfo)
    this.setData({
      name: userInfoMore.name,
      headUrl: userInfoMore.headPortrait,
      userInfo: userInfo
    })
  },
  onInput(e) {
    console.log(e)
    this.setData({
      name: e.detail.value
    })
  },
  upload: function(e) {
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        console.log(res.tempFilePaths[0])
        const path = res.tempFilePaths[0];
        console.log(path)
        wx.uploadFile({
          
          url: request.localhost + 'user/rest/user/uploadImg',
          // url: request.localhost + 'user/rest/user/uploadImg',
          // fileType: 'image',
          name: 'file',
          header: request.dataConversion(),
          filePath: path,
          success: res => {
            console.log(JSON.parse(res.data).data.imageUrl)
            let str = JSON.stringify(res.data)
            that.setData({
              headUrl: JSON.parse(res.data).data.baseImgUrl + JSON.parse(res.data).data.imageUrl,
              // headUrl: request.localhost + "user/" + JSON.parse(res.data).data.imageUrl,
              head: JSON.parse(res.data).data.imageUrl,
            })
            
            
          },
          fail: function(res) {
            console.log(res);
          },
        })

      }
    })
  },
  submit() {
    if (!this.data.name) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none',
        duration: 1500,
      });
      return false;
    }
    let data = {
      avatar: this.data.headUrl,
      nickName: this.data.name,
      userId: this.data.userInfo.id
    }
    console.log(data)
    request.post('user/rest/user/updateUserInfo', data).then((res) => {
      let userInfo = wx.getStorageSync("userInfo")
      userInfo.headPortrait = this.data.headUrl
      userInfo.nickName = this.data.name
      wx.setStorageSync('userInfo', userInfo );
      wx.showToast({
        title: '修改成功',
        icon: 'none',
        duration: 1500,
        success() {
          wx.navigateBack();
        }
      });
      // const authCode = 'c691708e35584d51ba5ff91134fcQX64';
      // request.post("user/rest/user/login", {
      //   "authCode": authCode
      // }).then(res => {
      //   console.log(res)
      //   if (res.data.code === 0) {
      //     wx.setStorageSync('userInfo', res.data.data.userInfo);
      //     wx.showToast({
      //       title: '修改成功',
      //       icon: 'none',
      //       duration: 1500,
      //       success() {
      //         wx.navigateBack();
      //       }
      //     });
      //   }
      // })

      return
      wx.login({
        success(res) {

          wx.getUserInfo({
            success(res1) {
              let param = {
                "code": res.code,
                "encryptedData": res1.encryptedData,
                "iv": res1.iv,
                "userId": wx.getStorageSync('userInfo').id,
              }
              param = JSON.stringify(param);
              request.post("user/rest/weixin/login", param).then(res => {
                if (res.data.code == 0) {
                  console.log(res.data.data.userInfo)
                  wx.setStorageSync("openId", res.data.data.userInfo.openId)
                  wx.setStorageSync("userInfo", res.data.data.userInfo)
                  wx.showToast({
                    title: '修改成功',
                    icon: 'none',
                    duration: 1500,
                    success() {
                      wx.navigateBack();
                    }
                  });
                }
              })
            },
            
          })
        }
      })
    })
    // if (this.data.name.length < 2) {
    //   wx.showToast({
    //     content: '昵称不能少于两个字符',
    //     duration: 1500,
    //   });
    //   return false;
    // }
    // let data = {
    //   card: this.data.card,
    //   name: this.data.name,
    //   userId: this.data.userId,
    //   frontCard: this.data.frontCard,
    //   reverseCard: this.data.reverseCard,
    // }
    // console.log(data);
    // request.post('user/rest/user/addUserCard', data).then((res) => {
    //   if (res.data.code == 0) {
    //     wx.showToast({
    //       content: '绑定成功',
    //       duration: 1500,
    //     });
    //     wx.navigateBack();
    //   }
    // })

  }
});