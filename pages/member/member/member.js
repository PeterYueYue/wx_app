const request = require("../../../utils/request.js");
var app = getApp();
const picUrl = app.globalData.imgUrlNew + 'yy/equity/'
Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    userInfo: {},
    userInfoMore: {},
    invitationId: '',
    isAgree: false,
    // BackgroundImg: app.globalData.imgUrlNew + 'yy/equity/l1/lv1bg.png',
    // lvImage: app.globalData.imgUrlNew + 'yy/equity/l1/lv1.png',
    // lvName: '环保市民',
    // LV: 1,
    answerType: 0,
    qlist: [
      { name: '上门券', num: '3张', src: picUrl + 'l1/1.png', },
      { name: '拾尚包', num: '1个', src: picUrl + 'l1/2.png', },
      { name: '券礼包', num: '价值23元', src: picUrl + 'l1/3.png', },
      { name: '抽奖机会', num: '', src: picUrl + 'l1/5.png', },
      { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
      { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
      { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
      { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
    ],
    register:true,
    step: false,//查看等级蒙版
    tan: false,//碳排量蒙版 
  },
  onLoad(e) {
    if (e.id) {
      this.setData({ invitationId: e.id })
    }
  },
  onReady() {
  },
  lookStep() {//查看环保等级
    this.setData({
      step:!this.data.step
    })
  },
  lookTan() {//查看碳排放量
    this.setData({
      tan: !this.data.tan,
    })
  },
  onShow() {// 页面显示

    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          this.setData({
            register: true,
          })
        }else{
          this.setData({
            register: false,
          })
        }
      }
    })



    let userInfo = wx.getStorageSync("userInfo");
    let isAgree = wx.getStorageSync("isAgree");
    if (!userInfo) {
      this.toLogin();
      return false;
    }

    let data = { userId: userInfo.id }
    request.post("user/rest/user/getUserInfo", data).then(res => {
      if (res.data.code === 0) {
        wx.setStorageSync('userInfoMore', res.data.data);
        this.setData({
          userInfo: userInfo,
          userInfoMore: res.data.data,
          isAgree: isAgree,
        })
        this.getCompanys();
        this.checkLevel(res.data.data.carbonReducingLevel.level.split('LV')[1]);
        this.getAnswerType(userInfo.id);
        
      }
    })
    
    
  },
  getAnswerType(id) {
    request.post("user/rest/user/hasAnswerQuestion?userId="+id).then(res => {
      if (res.data.code == 0) {
        this.setData({
          answerType: res.data.data,
        })
      }
    })
  },
  goQA() {//跳转去问答
    wx.navigateTo({
      url: `/pages/answer/shClassroom/shClassroom`
    });
  },
  changeAgree(e) {
    this.setData({ isAgree: !this.data.isAgree }, () => {
      wx.setStorage({
        key: "isAgree",
        data: this.data.isAgree
      })
    })
  },
  goAgreeMent() {
    wx.navigateTo({
      url: `/pages/webView/webView?url=https://miniapp.shishangbag.vip/agreement/index.html`
    });
  },

  goNomal() {//免费预约回收
    this.setData({
      normal: !this.data.normal,
    })
    wx.navigateTo({
      url: '/pages/appointment/appointment'
    });
  },
  goSure() {//查看优惠详情
    wx.navigateTo({
      url: '/pages/member/nomalMemberSure/nomalMemberSure'
    });
  },
  getCompanys() {//获取企业列表
    request.get("user/rest/company/getHomePageShowCompany").then(res => {
      console.log(res,"pppp")
      if (res.data.code == 0) {
        this.setData({
          list: res.data.data,
        })
      }
    })
  },
  get() {//成为普通会员
    // wx.navigateTo({
    //   url: '/pages/member/nomalMember/nomalMember'
    // });
    // 达能活动
    wx.navigateTo({
      url: `/pages/member/dnActivity/dnActivity?id=${this.data.invitationId}`
    });
  },
  pay() {//成为plus会员
    wx.navigateTo({
      url: '/pages/member/plusMember/plusMember'
    });
  },
  tipsAgree(){
    wx.showToast({
      icon: 'none',
      title: '请先勾选同意',
      duration: 1500,
    });
  },
  goljqn(){

    wx.navigateToMiniProgram({
      appId: 'wxd810fff8e583d0c7',
      path: '',
      extraData: {
      },
      envVersion: '',
      success(res) {
        // 打开成功
      }
    })

  },
  // 授权
  bindGetUserInfo(e) {
  
    const that = this;

    wx.getUserInfo({
      success: function(res) {
        let userInfoMore = wx.getStorageSync('userInfoMore');
        let userInfo = res.userInfo
        const param = {
          avatar: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          userId: that.data.userInfo.id,
        }

        if (that.data.userInfo.headPortrait == 'http://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/image/home/12.png' && that.data.userInfo.nickName == '拾小尚') {
          //更新信息
          request.post("user/rest/user/updateUserInfo", param).then(res => {
           
            if(!userInfoMore.hasSendDoorVoucher){
              that.getUserInfoMore(that.data.userInfo)
            }
          })
        }else{
          
          if(!userInfoMore.hasSendDoorVoucher){
            that.getUserInfoMore(that.data.userInfo)

          }

        }
        that.goQA();
        
      }

    })


  },
  // 发券
  sendDoorVoucher() {
    request.post("user/rest/user/sendDoorVoucher?userId="+this.data.userInfo.id+"&num=3", ).then(res => {
      console.log(res);
      if (res.data.code === 0) {
        this.getUserInfoMore(this.data.userInfo)
      }
    })
  },
  getUserInfoMore(userInfo){

    let data = { userId: userInfo.id }
    request.post("user/rest/user/getUserInfo", data).then(res => {
      console.log(data,"pp")
      if (res.data.code === 0) {
        wx.setStorageSync('userInfoMore', res.data.data);
        this.setData({userInfoMore:res.data.data})
        this.setData({
          register: true,
        })
      }
    })

  },
  look(e) {
    console.log(e)
    let current = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/member/myEquity/myEquity?current=' + current
    });
  },
  checkLevel(e) {
    this.setData({
      BackgroundImg: app.globalData.imgUrlNew + 'yy/equity/l' + e + '/lv' + e + 'bg.png',
      lvImage: app.globalData.imgUrlNew + 'yy/equity/l' + e + '/lv' + e + '.png',
      LV: e,
    })
    switch (e) {
      case '1':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l1/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l1/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l1/3.png', },
            { name: '抽奖机会', num: '', src: picUrl + 'l1/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保市民',
        })
        break;
      case '2':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l2/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l2/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l2/3.png', },
            { name: '抽奖机会', num: '1次', src: picUrl + 'l2/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保志愿者',
        })
        break;
      case '3':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l3/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l3/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l3/3.png', },
            { name: '抽奖机会', num: '2次', src: picUrl + 'l3/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保达人',
        })
        break;
      case '4':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l4/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l4/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l4/3.png', },
            { name: '抽奖机会', num: '3次', src: picUrl + 'l4/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保明星',
        })
        break;
      case '5':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l5/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l5/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l5/3.png', },
            { name: '抽奖机会', num: '4次', src: picUrl + 'l5/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保大使',
        })
        break;
      case '6':
        this.setData({
          qlist: [
            { name: '上门券', num: '3张', src: picUrl + 'l6/1.png', },
            { name: '拾尚包', num: '1个', src: picUrl + 'l6/2.png', },
            { name: '券礼包', num: '价值23元', src: picUrl + 'l6/3.png', },
            { name: '抽奖机会', num: '5次', src: picUrl + 'l6/5.png', },
            { name: '九折商城券', num: '', src: picUrl + 'l1/4.png', },
            { name: '大家电返利', num: '', src: picUrl + 'l1/6.png', },
            { name: '捐赠运费补助', num: '', src: picUrl + 'l1/7.png', },
            { name: '周边赠送', num: '', src: picUrl + 'l1/8.png', },
          ],
          lvName: '环保巨匠',
        })
        break;
      default:
        break;
    }
  },
  toLogin() {
    wx.confirm({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        } else {
          wx.redirectTo({
            url: '/pages/index/index'
          });
        }
      },
    });
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
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
});
