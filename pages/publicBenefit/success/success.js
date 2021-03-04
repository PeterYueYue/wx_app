const request = require("../../../utils/request.js");
const currentDay = require("../../../utils/date.js");
const QR = require("../../../utils/qrcode.js");
var app = getApp();
function timestampToTime() {
  let timestamp =  Date.parse(new Date());
  var date =new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() +'年';
  let M = (date.getMonth() +1 <10 ?'0' + (date.getMonth() +1) : date.getMonth() +1) +'月';
  let D = date.getDate() +'日';
  return Y +M +D;//时分秒可以根据自己的需求加上
}
  
function createRpx2px() {
  const {
    windowWidth
  } = wx.getSystemInfoSync()

  return function (rpx) {
    return windowWidth / 750 * rpx
  }
}

const rpx2px = createRpx2px()
function getImageInfo(url) {
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url,
      success: resolve,
      fail: reject,
    })
  })
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasWidth: 580,
    canvasHeight: 850,
    responsiveScale: 1,
    imageFile: '',
    msak: false,
    type: "goods",
    item:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let item = JSON.parse(options.item)
    let item = {
      address: null,
      categoryParentType: null,
      certificateUrl: "http://static.shishangbag.vip/upload/img/server/img/20201217/0c3836f09b554f2e9ecfeba83078b491.png",
      contactName: null,
      contactPhone: null,
      createDate: "2020-12-17 10:31:19",
      createUser: null,
      current: "100",
      deleteFlag: 0,
      express: null,
      id: "cc1a67371308442aaf0a804697cbedfa",
      issueCertificate: 1,
      lastUpdateDate: "2020-12-21 15:07:35",
      lastUpdateUser: null,
      mainUrl: "http://static.shishangbag.vip/upload/img/server/img/20201217/0e8405e425d0407d9e3a98e32ca67cbd.png",
      miniMainUrl: "http://static.shishangbag.vip/upload/img/server/img/20201217/0e8405e425d0407d9e3a98e32ca67cbd.png",
      numberOfPeople: 100,
      projectName: "为一个洁净的星球",
      projectType: 0,
      schedule: 28,
      sort: 5,
      status: 1,
      synopsis: "“塑料的数量比我们能看到的要多得多。在雨里，在雪里，都有。现在，塑料已经是环境的一部分了。”——美国地质勘探局首席研究员格雷戈里·韦瑟",
      synopsisUrl: "http://static.shishangbag.vip/upload/img/server/img/20201217/097f3ebb5ee64c1fad962db1e523fb7e.jpg",
      total: 10000,
      trackUrl: "http://static.shishangbag.vip/upload/img/server/img/20201217/6798ec3f64994a409bef86fc4f53e17d.jpg",
      unit: null,
    }
    console.log(item)
    this.setData({item})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 页面加载完成
    const designWidth = 375
    const designHeight = 603 // 这是在顶部位置定义，底部无tabbar情况下的设计稿高度
    // 以iphone6为设计稿，计算相应的缩放比例
    const {
      windowWidth,
      windowHeight
    } = wx.getSystemInfoSync()
    const responsiveScale =
      windowHeight / ((windowWidth / designWidth) * designHeight)
    if (responsiveScale < 1) {
      this.setData({
        responsiveScale,
      })
    }


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 页面显示
    let userInfo = wx.getStorageSync('userInfo');

    if (!userInfo) {
      return;
    }
    this.setData({
      userInfo: userInfo,
    })

    // this.generate_certificate()
  },
  generate_certificate() {
    this.setData({ msak: true })
    if(this.data.item.projectType == '1'){
      this.draw_goods();
    }else if(this.data.item.projectType == '0'){
      this.draw()
    }
    
  },
  backHome() {
    wx.redirectTo({
      url: '/pages/index/index?common=index'
    })

  },
  // 物品
  draw_goods() {
    let _that = this;
    wx.showLoading()
    const {
      userInfo,
      canvasWidth,
      canvasHeight
    } = this.data
    const {
      headPortrait,
      nickName
    } = userInfo
    let userInfoMore = wx.getStorageSync('userInfoMore');
    let newHead = headPortrait
      if (headPortrait.indexOf("http://static.shishangbag.vip") !== -1) {
        newHead = headPortrait.replace("http://static.shishangbag.vip", "https://sbag.oss-cn-huhehaote.aliyuncs.com")
      }else if(headPortrait.indexOf("https://thirdwx.qlogo.cn") !== -1){
        newHead = "https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/image/home/12.png"
      }
    const avatarPromise = getImageInfo(newHead)
    const backgroundPromise = getImageInfo('https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/publicBenefit/certificate2.png')
    Promise.all([backgroundPromise,avatarPromise])
      .then(([background,avatar]) => {
        const ctx = wx.createCanvasContext('myCanvas')
        const canvasW = rpx2px(canvasWidth * 2)
        const canvasH = rpx2px(canvasHeight * 2)

        // 绘制背景
        ctx.drawImage(background.path, 0, 0, canvasW, canvasH)
        function rect(x, y, w, h, r) {
          var min_size = Math.min(w, h);
          if (r > min_size / 2) r = min_size / 2;
          // 开始绘制
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.closePath();
          return ctx;
        }
        // 绘制头像
        const circleImage = (context, path, x, y, r) => {
          let d = 2 * r;
          let cx = x + r;
          let cy = y + r;
          context.save();
          context.beginPath();
          context.arc(cx, cy, r, 0, 2 * Math.PI);
          context.fill();
          context.clip();
          context.drawImage(path, x, y, d, d);
          context.restore();
        };
        const radius = rpx2px(126 * 2)
        ctx.strokeStyle="#fff";
        circleImage(
          ctx,
          avatar.path,
          canvasW * 0.387,
          canvasH * 0.02,
          radius/2,
        )

        // 标题
        ctx.setFontSize(40)
        ctx.font = "bold";
        ctx.setTextAlign('center')
        ctx.setFillStyle('#3AA5FF')
        ctx.fillText(
          "公益证书",
          canvasW * 0.5,
          canvasH * 0.22,
        )

        // 绘制用户名
        ctx.setFontSize(28)
        ctx.font = "bold";
        ctx.setFillStyle('#000')
        ctx.setTextAlign('left')
        ctx.fillText(
          '亲爱的'+nickName+':',
          canvasW * 0.1,
          canvasH * 0.3,
        )
        // 文字1
        ctx.setFontSize(28)
        ctx.font = "bold";
        ctx.setFillStyle('#333')
        ctx.setTextAlign('center')
        ctx.fillText(
          '感谢您对大凉山扶贫公益项目',
          canvasW * 0.52,
          canvasH * 0.37,
        )
        ctx.fillText(
          '的支持!',
          canvasW * 0.19,
          canvasH * 0.43,
        )

        // 文字2
        ctx.setFontSize(28)
        ctx.font = "bold";
        ctx.setFillStyle('#333')
        ctx.fillText(
          '心连心，献爱心；手牵手，伸出',
          canvasW * 0.52,
          canvasH * 0.49,
        )
        ctx.fillText(
          '援手! ',
          canvasW * 0.18,
          canvasH * 0.55,
        )
        ctx.fillText(
          '期待您将爱心传递给更多人~',
          canvasW * 0.49,
          canvasH * 0.62,
        )
        ctx.fillText(
          '期待您将爱心传递给更多人~',
          canvasW * 0.49,
          canvasH * 0.62,
        )
        // 日期
        ctx.setFontSize(30)
        ctx.font = "bold";
        ctx.setFillStyle('#000')
        ctx.fillText(
          timestampToTime(),
          canvasW * 0.67,
          canvasH * 0.7,
        )
        // 文字3
        ctx.fillText(
          '支持环保，支持公益',
          canvasW * 0.33,
          canvasH * 0.85,
        )
        ctx.fillText(
          '立即扫码参与吧!',
          canvasW * 0.29,
          canvasH * 0.92,
        )



        ctx.stroke()
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({

            canvasId: 'myCanvas',
          }, this).then(({
            tempFilePath
          }) => this.setData({
            imageFile: tempFilePath
          }, () => {

            setTimeout(() => {
              this.setData({
                isDraw: true
              })
              wx.hideLoading()
            }, 1000);
          }))
        })


      })
      .catch((res) => {

        this.setData({
          beginDraw: false
        })
        wx.hideLoading()
      })


  },
  // 时尚币
  draw() {
    let _that = this;
    wx.showLoading()
    const {
      userInfo,
      canvasWidth,
      canvasHeight
    } = this.data
    const {
      headPortrait,
      nickName
    } = userInfo
    let userInfoMore = wx.getStorageSync('userInfoMore');
    const backgroundPromise = getImageInfo('https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/publicBenefit/certificate3.png')
    Promise.all([backgroundPromise])
      .then(([background]) => {
        const ctx = wx.createCanvasContext('myCanvas')
        const canvasW = rpx2px(canvasWidth * 2)
        const canvasH = rpx2px(canvasHeight * 2)

        // 绘制背景
        ctx.drawImage(background.path, 0, 0, canvasW, canvasH)
        function rect(x, y, w, h, r) {
          var min_size = Math.min(w, h);
          if (r > min_size / 2) r = min_size / 2;
          // 开始绘制
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.arcTo(x + w, y, x + w, y + h, r);
          ctx.arcTo(x + w, y + h, x, y + h, r);
          ctx.arcTo(x, y + h, x, y, r);
          ctx.arcTo(x, y, x + w, y, r);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.closePath();
          return ctx;
        }



        // 绘制用户名
        ctx.setFontSize(26)
        ctx.font = "bold";
        ctx.setFillStyle('#000')
        ctx.fillText(
          nickName,
          canvasW * 0.28,
          canvasH * 0.44,
        )
        // 时尚币数量
        ctx.setFontSize(24)
        ctx.font = "bold";
        ctx.setTextAlign('left')
        ctx.setFillStyle('#000')
        ctx.fillText(
          this.data.item.current,
          canvasW * 0.30,
          canvasH * 0.56,
        )



        ctx.stroke()
        ctx.draw(false, () => {
          wx.canvasToTempFilePath({

            canvasId: 'myCanvas',
          }, this).then(({
            tempFilePath
          }) => this.setData({
            imageFile: tempFilePath
          }, () => {
 
            setTimeout(() => {
              this.setData({
                isDraw: true
              })
              wx.hideLoading()
            }, 1000);
          }))
        })


      })
      .catch((res) => {

        this.setData({
          beginDraw: false
        })
        wx.hideLoading()
      })


  },
  handleSave() {
    let that = this;
    const {
      imageFile
    } = this.data

    if (imageFile) {
      wx.showLoading({
        mask: true
      })
      wx.saveImageToPhotosAlbum({
        filePath: imageFile,
        success(res) {
          wx.hideLoading();
          wx.showModal({
            title: '提示',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#0facf3',
            content: '已成功为您保存图片到手机相册，请自行前往朋友圈分享。',
            success: (res) => {
              if (res.confirm) {
                console.log('保存成功，隐藏模态框')
                that.setData({ msak: false })
              }
            }
          })
        },
        fail(res) {
          wx.hideLoading();
          wx.showModal({
            title: '保存出错',
            showCancel: false,
            confirmText: '知道了',
            confirmColor: '#0facf3',
            content: '您拒绝了授权 ，如果您要保存图片，请删除小程序，再重新打开。',
            success: (res) => {
              console.log(res)
            }
          })
        }
      })

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