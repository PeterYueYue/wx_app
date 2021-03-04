const request = require("../../../utils/request.js");
var app = getApp();
var isDisable = true
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowJf:false,
    userInfoMore:{},
    item:{},
    numberOfDonors:"",
    projectList:[],
    jf:[
      { count:'100', active:true,disable:false },
      { count:'200', active:false,disable:false },
      { count:'300', active:false,disable:false },
      { count:'500', active:false,disable:false },
      { count:'1000', active:false,disable:false },
      { count:'2000', active:false,disable:false },
      { count:'5000', active:false,disable:false },
      { count:'10000', active:false,disable:true },
    ],
    userName:'',
    mobile:'',
    mailNo:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.donationDetail({
      id:options.id,
      type:options.projectType
    });

    this.setData({
      navH: app.globalData.navHeight
    })
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
    
    this.init();
  },
  init(){
    let userInfoMore = wx.getStorageSync("userInfoMore")
    let userId = wx.getStorageSync("userId")
    if(userInfoMore){
      request.post("user/rest/user/getUserInfo", {userId: userId,}).then(res => {
        if (res.data.code === 0) {
          this.setData({
            userInfoMore: res.data.data,
          });
          wx.setStorageSync('userInfoMore', res.data.data);
        }
      })
    }
  },
  // 提交
  submit(){
    if(!isDisable){return}
    isDisable = false
    let userInfo = wx.getStorageSync("userInfo")
    if(this.data.item.projectType == 0){
      let ssb = this.data.jf.filter(e => e.active);
      request.post("user/open/donation/donationSubmit",JSON.stringify({
        projectId:this.data.item.id,
        userId:userInfo.id,
        userName:userInfo.nickName,
        mobile:userInfo.userMobile,
        ssbDonationGoodsList:[{
          id:this.data.projectList[0].id,
          current:ssb[0].count
        }]
      })).then(res => {
        wx.showToast({
          icon:'success',
          duration:2000,
          title: res.data.message,
          success:() => {
            if(res.data.message == '捐赠成功'){
              this.setData({isShowJf:false})
              this.donationDetail(this.data.item)
              this.init()
              let item = this.data.item
              item.current = ssb[0].count
              wx.redirectTo({
                url: '/pages/publicBenefit/success/success?item='+JSON.stringify(item),
              })
            }
          }
        })
      })
    }
    setTimeout(() => {
      isDisable = true
    },3000)
  },
  analysisProjectType(){

    if(this.data.item.projectType == 1){
      wx.navigateTo({
        url: '/pages/publicBenefit/supplies/supplies?item='+JSON.stringify(this.data.item),
      })

    }else{
      this.setData({isShowJf:true})
    }

  },
  // 捐赠详情
  donationDetail(item){
    request.post("user/open/donation/donationProjectDetail",JSON.stringify({
      id:item.id
    })).then(res => {
      console.log(res)
      this.setData({item:res.data.ssbDonationProjects})
      this.setData({projectList:res.data.ssbDonationGoodsList})
      this.setData({numberOfDonors:res.data.numberOfDonors})
    })

  },
  goback(){
    wx.navigateBack()
  },
  onPageScroll(res){
    if(res.scrollTop >=80&&!this.data.navColorState){
      this.setData({navColorState:true})
    }else if(res.scrollTop <80&&this.data.navColorState){
      this.setData({navColorState:false})
    }
  },
  closeJf(e) {

    this.setData({isShowJf:false})
  },
  changeJf(e){
    let index = e.target.dataset.data;
    if(index != null){
      let arr = this.data.jf
      arr.forEach((k,i) => {
        i == index?k.active = true:k.active = false;
        return e;
      })
      this.setData({jf:arr})
    }
  },
  goHome(){
    wx.redirectTo({
      url: '/pages/index/index?common=index',
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
    return {
      title: this.data.item.projectName,
      path: `pages/publicBenefit/benefitDetail/benefitDetail?id=${this.data.item.id}`,
    };

  }
})