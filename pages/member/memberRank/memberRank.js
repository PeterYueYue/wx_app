const request = require("../../../utils/request.js");
const QR = require("../../../utils/qrcode.js");
var app = getApp();
function createRpx2px() {
  const {
    windowWidth
  } = wx.getSystemInfoSync()

  return function(rpx) {
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
function canvasToTempFilePath(option, context) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      ...option,
      success: resolve,
      fail: reject,
    }, context)
  })
}



Page({
  canvasRef(ref) {
    this.canvas = ref;
  },
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrl1: app.globalData.imgUrl1,
    imgUrlNew: app.globalData.imgUrlNew,
    activeTab: 0,
    share_mask: false,//分享蒙版
    userInfo: {},//
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    visible: false,
    list1: [],//数据及页码
    list2: [],//数据及页码
    pageIndex1: 1,
    pageIndex2: 1,
    list1Length: 0,
    list2Length: 0,
    pageSize: 10,
    imageFile: '',
    canvasWidth: 843,
    canvasHeight: 1500,
    responsiveScale: 1,
    beginDraw: false,
    isDraw: false,
    total1:1,
    total2:2,
  },
  onLoad(e) {
    if (e.isOpen && e.isOpen == 'Y'){
      this.setData({ share_mask:true})
    }
  },
  onReady() {
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
  show: function () {
    this.setData({ visible: true })
  },
  close: function () {
    this.setData({ visible: false })
  },
  onShow() {
    // 页面显示
    let userInfo = wx.getStorageSync('userInfo');

    if (!userInfo) {
      return;
    }
    this.setData({
      userInfo: userInfo,
    })
    this.getSocreList();
    this.getTanList();
  },
  tab(e) {
    this.setData({
      activeTab: e.currentTarget.dataset.index,
      current: e.currentTarget.dataset.index,
    })
    wx.setStorage({
      key: 'activeIndex',
      data: e.currentTarget.dataset.index,
      success: (res) => {
      },
    })
  },
  onChange(e) {
    this.setData({
      activeTab: e.detail.current
    })
    console.log(this.data.activeTab)
  },
  // 获取积分排行榜
  getSocreList () {
    request.post("user/rest/groups/pointRank?pageSize="+this.data.pageSize+"&pageIndex="+ this.data.pageIndex1).then(res => {
      if (res.data.code === 0) {
        let list = []
        if (this.data.pageIndex1 == 0) {
          list = res.data.data.content
        } else {
          let data = this.data.list1
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list1: list,
          total1: res.data.data.totalPages,
        })
    }
    })
  },
  // 获取减碳排行榜
  getTanList () {
    request.post("user/rest/groups/carbonReducingRank?pageSize="+this.data.pageSize+"&pageIndex="+ this.data.pageIndex2).then(res => {
      if (res.data.code === 0) {
        let list = []
        if (this.data.pageIndex2 == 0) {
          list = res.data.data.content
        } else {
          let data = this.data.list2
          list = [...data, ...res.data.data.content]
        }
        this.setData({
          list2: list,
          total2: res.data.data.totalPages,
        })
    }
    })
  },
  lower() {
    console.log(123)
      let activeTab = this.data.activeTab
      switch (activeTab) {
        case 0:
          if ((this.data.pageIndex1 - 0) >= (this.data.total1 - 0)) {
            return false;
          }
          this.setData({
            pageIndex1: this.data.pageIndex1 + 1
          })
          this.getSocreList()
          break;
        case 1:
          if ((this.data.pageIndex2 - 0) >= (this.data.total2 - 0)) {
            return false;
          }
          this.setData({
            pageIndex2: this.data.pageIndex2 + 1
          })
          this.getTanList()
          break;
      }
    },
  onInfo(){
    let userInfo = wx.getStorageSync({
      key: 'userInfo',
    });
    if (userInfo.data) {
      this.setData({
        userInfo: userInfo.data,
      })
    }
  },
  guan() {
    this.setData({ 
      share_mask: false,
    })
  },
  goMethod () {
    wx.navigateTo({
      url: `../../webView/webView?url=https://miniapp.shishangbag.vip/web_rule/index.html`
    });
  },
  share () {//打开分享蒙版
    this.setData({
      share_mask: true,
    })
  },
  close: function() {
    this.setData({ 
      visible: false,
      share_mask: false,
    })
  },
  shareQ() {//分享到朋友圈
    this.setData({ 
      visible: true,
      share_mask: false,
    });

    this.draw()
    // this.canvas.draw();
    // this.selectComponent('#canvasShare').draw()
  },
  shareF() {//分享给朋友

  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: '加入我的环保团队，为保护地球出一份力！',
      // desc: '拾尚包环保',
      imageUrl: app.globalData.imgUrlNew + "yy/member/shareImage.png",
      path: `pages/member/memberHelp/memberHelp?id=${this.data.userInfo.id}`,
    };


  
  },
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
      let newHead = headPortrait

      console.log(headPortrait,"headPortrait")
      if (headPortrait.indexOf("http://static.shishangbag.vip") !== -1) {
        newHead = headPortrait.replace("http://static.shishangbag.vip", "https://sbag.oss-cn-huhehaote.aliyuncs.com")
      }else if(headPortrait.indexOf("https://tfs.alipayobjects.com") !== -1){
        newHead = ("https://sbag.oss-cn-huhehaote.aliyuncs.com/upload/img/web/image/home/12.png")
      }else{
        newHead = ("https://sbag.oss-cn-huhehaote.aliyuncs.com/upload/img/web/image/home/12.png")
      }

      const avatarPromise = getImageInfo(newHead)
      const backgroundPromise = getImageInfo('https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/member/poster.png')
      
      Promise.all([avatarPromise, backgroundPromise])
        .then(([avatar, background]) => {
          const ctx = wx.createCanvasContext('myCanvas')
          const canvasW = rpx2px(canvasWidth * 2)
          const canvasH = rpx2px(canvasHeight * 2)

          console.log(canvasH,"canvasHcanvasHcanvasH")
          // 绘制背景
          ctx.drawImage( background.path,0,0,canvasW,canvasH)
          function rect (x, y, w, h, r) {
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
          // 绘制数据区域
          ctx.fillStyle = "#fff";
          rect(canvasW * 0.1, canvasH * 0.77, canvasW * 0.8, canvasH * 0.15,10);
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
          ctx.fillStyle = '#fff';
          circleImage(
            ctx,
            avatar.path,
            canvasW * 0.15,
            canvasH * 0.80,
            radius/2,
          )

          // 绘制用户名
          ctx.setFontSize(30)
          // ctx.setTextAlign('center')
          ctx.font = "bold";
          ctx.setFillStyle('#000')
          ctx.fillText(
            'HI,我是' + nickName,
            canvasW*0.32,
            canvasH * 0.81,
          )
          //绘制数据
          ctx.setFontSize(25)
          ctx.setTextAlign('left')
          ctx.setFillStyle('#000')
          ctx.fillText(
            '我的环保推广团队已经',
            canvasW*0.32,
            canvasH * 0.84,
          )

          let userInfoMore = wx.getStorageSync('userInfoMore');
          let num = userInfoMore.carbonReducing?userInfoMore.carbonReducing:0
          ctx.setFontSize(25)
          ctx.fillText(
            '累计减少碳排放量' + num + 'kg',
            canvasW*0.32,
            canvasH * 0.865,
          )
          ctx.setFontSize(25)
          ctx.fillText(
            '一起加入我们吧',
            canvasW*0.32,
            canvasH * 0.890,
          )

          // 绘制二维码
          const url = 'https://miniapp.shishangbag.vip/member?id='+userInfo.id;
          QR.api.draw(url, ctx, canvasW * 0.68, canvasH * 0.79, 154, 154 );
          ctx.stroke()
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'myCanvas',
            }, this).then(({
              tempFilePath
            }) => this.setData({
              imageFile: tempFilePath
            },() => {
              
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

  
  
});
