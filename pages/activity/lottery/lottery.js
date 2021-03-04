const request = require("../../../utils/request.js");
var app = getApp();
Page({
  awardsConfig: {
    chance: true,
    awards: [
      { 'index': 1, 'name': '携程券' },
      { 'index': 2, 'name': '高附加值加价券' },
      { 'index': 3, 'name': '10拾尚币' },
      { 'index': 4, 'name': '谢谢参与' },
      { 'index': 5, 'name': '5拾尚币' },
      { 'index': 6, 'name': '高附加值加价券' }
    ]
  },
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
    bg: app.globalData.imgUrlNew + 'yy/activity/bg.png',
    wheelBg: app.globalData.imgUrlNew + 'yy/activity/wheelBg.png',
    wheel: app.globalData.imgUrlNew + 'yy/activity/wheel.png',
    awardsList: {},
    animation: {},
    userInfo: {},
    num: 0,
    ruleMask:false
  },
  onLoad() {
  },
  onReady() {
    this.animation = wx.createAnimation({
      duration: 100,
      timeFunction: 'ease'
    })
    this.animation.rotate(360).step();
    this.setData({
      animation: this.animation.export(),
    });
  },
  onShow() {
    this.drawAwardRoundel();
    let userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo,
    },()=>{
      this.getNum();
    })
    
  },
  getNum() {
    const param = {
      userId: this.data.userInfo.id,
    }
    request.post("user/rest/lottery/getLotteryCount?userId="+param.userId ).then(res => {
      if (res.data.code === 0) {
        this.setData({
          num: res.data.data,
        })
      }
    })
  },

  //画抽奖圆盘
  drawAwardRoundel: function () {
    var awards = this.awardsConfig.awards;
    var awardsList = [];
    var turnNum = 1 / awards.length;  // 文字旋转 turn 值
    // 奖项列表
    for (var i = 0; i < awards.length; i++) {
      awardsList.push({ turn: i * turnNum + 'turn', lineTurn: i * turnNum + turnNum / 2 + 'turn', award: awards[i].name });
    }
    this.setData({
      btnDisabled: this.awardsConfig.chance ? '' : 'disabled',
      awardsList: awardsList,
    });
  },
  goRule() {
    this.setData({
      ruleMask: !this.data.ruleMask,
    })
  },
  goWheel(){
    //判断次数 
    if(this.data.num<=0) {
      wx.showToast({
        icon: 'none',
        title: '暂无抽奖次数'
      });
      return;
    }
    let P =  new Promise((resolve, reject) => {
      request.post("user/rest/lottery/lottery?userId=" + this.data.userInfo.id).then(res => {
        if (res.data.code === 0) {
          resolve(parseInt(res.data.data.giftCode));
        }
      })
    })

    P.then(res => {
      console.log(res,"kk")
      this.setData({
        awardIndex: res,
      })
      this.playReward(res);
    })
   
  },


  playReward(awardIndex) {
    //中奖index
    // var awardIndex = 2;

    let that = this;
    var runNum = 8;//旋转8周
    var duration = 4000;//时长
    // 旋转角度
    this.runDeg = this.runDeg || 0;
    this.runDeg = this.runDeg + (390 - this.runDeg % 360) + (360 * runNum - awardIndex * (360 / 6))
    //创建动画
    this.animation = wx.createAnimation({
      duration: duration,
      timingFunction: 'ease'
    })
    this.animation.rotate(this.runDeg).step();
    this.setData({
      animation: this.animation.export(),
    });
    // 中奖提示
    var awardsConfig = this.awardsConfig;
    setTimeout(function () {
      wx.showModal({
        title: '恭喜',
        content: '获得' + (awardsConfig.awards[awardIndex-1].name),
        showCancel: false,
        success: (result) => {
          that.getNum();
        },
      });
    }.bind(this), duration);

  },
  goRecord() {//抽奖记录
    wx.navigateTo({
      url: '/pages/activity/lotteryRecord/lotteryRecord',
    });
  }
})
