const request = require("../../../utils/request.js");
var app = getApp();
import F2 from '../../../f2-canvas/lib/f2';
function doHandleDate() {
  var myDate = new Date();
  var tYear = myDate.getFullYear();
  var tMonth = myDate.getMonth();

  var m = tMonth + 1;
  if (m.toString().length == 1) {
      m = "0" + m;
  }
  return tYear + m;
}

let chart = null;

Page({
  data: {
    radius: 0.85,
    innerRadius: 0.7,
    legend: {
      position: 'right',
    },
    // guide: {
    //   text: {
    //     position: ['50%', '50%'],
    //     style: {
    //       fontSize: 40,
    //       fill: '#1890FF',
    //     },
    //   },
    // },
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    list: [],//银行卡列表
    userInfo: {},
    userInfoMore:{
      carbonReducingLevel:{
        level:"LV1"
      }
    },
    month: '当月', //选择月份
    area: '',//选择区域
    open: true,
    array:["一月", '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    areaNameList:["徐汇区","长宁区"],
    areaIdList:[],
    index:0,
    opts: {
      onInit: () => {}
    },
    showChart: false,
    myInfo:{
      carbonReducing:{}
    },
    tYear:'',
    rankIndex:0,
    theFirst:{
      headPortrait:app.globalData.imgUrl+'home/12.png',
      name:"---",
      level:"---",
      carbonReducingM:"---",
      carbonReducingLevel:{
        level:"LV1"
      }
    },
    theSecond:{
      headPortrait:app.globalData.imgUrl+'home/12.png',
      name:"---",
      level:"---",
      carbonReducingM:"---",
      carbonReducingLevel:{
        level:"LV1"
      }

    },
    theThird:{
      headPortrait:app.globalData.imgUrl+'home/12.png',
      name:"---",
      level:"---",
      carbonReducingM:"---",
      carbonReducingLevel:{
        level:"LV1"
      }
    },
    share_mask:false,
    dateStr:"----年--月",
    imgUUrr:"",
    isShowCanvas:false

    
  },
  onLoad(e) {
    
  },
  onReady() {
    // 初始页面数据
    this.init()
    this.setMonth()
  },

  onShow() {// 页面显示
    wx.setNavigationBarTitle({
      title: '拾尚回收',
      backgroundColor: '#108ee9',
    })
    let userInfo = wx.getStorageSync("userInfo");
    let userInfoMore = wx.getStorageSync("userInfoMore");
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        userInfoMore:userInfoMore
      })
    }
    this.getCanvas();
  },
  // 绘图保存到相册
  shareQ(){

    this.setData({isShowCanvas:true})
    this.draw()
    wx.showLoading({
      mask: true
    })
  },
  setMonth() {//设置月份
    let arrlist = [];
    arrlist[0] = doHandleDate().slice(0, 4) + '年' + doHandleDate().slice(4) + '月';
    arrlist[1] = getLastMonth().slice(0, 4) + '年' + getLastMonth().slice(4) + '月';
    arrlist[2] = getLLastMonth().slice(0, 4) + '年' + getLLastMonth().slice(4) + '月';
    let arr = [doHandleDate(), getLastMonth(), getLLastMonth()]
    this.setData({
      arr: arr,
      array: arrlist,
      month: arrlist[0],
    })
  },
  lookBill() {
    wx.navigateTo({
      url: '/pages/annualBill/billOne/billOne'
    })
  },
  draw() {
    let _that = this;
    const ctx = wx.createCanvasContext('myCanvas2');

    let userInfo = wx.getStorageSync("userInfo");
    let userInfoMore = wx.getStorageSync("userInfoMore");


    wx.getSystemInfo({
      success: function (res) {


          var v =750 / res.windowWidth;//设计稿尺寸除以  当前手机屏幕宽度
          function shiftSize(w) {
            return w / v;
          }

          
           
          wx.downloadFile({
            url: 'https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/member/sharerankbg2.png',
            success(res) {
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
             

              // 小程序二维码图片
              wx.downloadFile({
                url: 'https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/ssbIndex.png',
                success(res) {
                  let width = shiftSize(130);
                  let height = shiftSize(130);
                  let x = shiftSize(426);
                  let y = shiftSize(580);
                  ctx.drawImage(res.tempFilePath, x, y, width, height);
                }
              })
              // 背景1
              ctx.fillStyle='#FFFFFF';
              ctx.fillRect(shiftSize(0), shiftSize(0), shiftSize(600), shiftSize(740));

              // 背景2
              ctx.drawImage(res.tempFilePath, shiftSize(30), shiftSize(30), shiftSize(540), shiftSize(200));

              // 日期地区
              ctx.setFontSize(shiftSize(28))
              ctx.setFillStyle('#fff')
              ctx.setTextAlign('center')
              ctx.fillText( _that.data.area+' | 2020年6月', shiftSize(300), shiftSize(72),)
              // 排名
              ctx.setFontSize(shiftSize(34))
              ctx.setFillStyle('#fff')
              ctx.setTextAlign('center')
              ctx.fillText('我的排名:第'+_that.data.rankIndex+'名', shiftSize(300), shiftSize(128))
              // 昵称
              ctx.setFontSize(shiftSize(42))
              ctx.setFillStyle('#333333')
              
              ctx.setTextAlign('center')
              ctx.fillText(userInfoMore.name, shiftSize(300), shiftSize(334))
              
              // 累计减少碳排放
              ctx.setFontSize(shiftSize(24))
              ctx.setFillStyle('#3AA5FF')
             
              ctx.setTextAlign('center')
              ctx.fillText('累计减少'+_that.data.myInfo.carbonReducing+'kg碳排放', shiftSize(300), shiftSize(380))

              // 加入天
              ctx.setTextAlign('left')
              ctx.setFontSize(shiftSize(50))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText(_that.data.myInfo.days,shiftSize(87),shiftSize(442),)
              ctx.setFontSize(shiftSize(22))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText(' 加入拾尚回收(天)',shiftSize(45),shiftSize(497),)
              // 累计投递次数
              ctx.setFontSize(shiftSize(50))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText(_that.data.myInfo.sendNumber,shiftSize(281),shiftSize(442),)
              ctx.setFontSize(shiftSize(22))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText('累计投递(次)',shiftSize(240),shiftSize(497),)
              // 累计重量
              ctx.setFontSize(shiftSize(50))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText(_that.data.myInfo.totalWeight,shiftSize(418),shiftSize(442),)
              ctx.setFontSize(shiftSize(22))
              ctx.setFillStyle('#3AA5FF')
              ctx.fillText('累计重量(kg)',shiftSize(428),shiftSize(497),)

              // 背景3
              ctx.fillStyle='#DFF0FF';
              ctx.fillRect(shiftSize(0), shiftSize(550),shiftSize(600) , shiftSize(190));

              // 底部提示
              ctx.setFontSize(shiftSize(24))
              ctx.setFillStyle('#333333')
              ctx.fillText('你知道吗？每投递2个塑料瓶',shiftSize(46),shiftSize(629),)
              ctx.fillText('相当于少开1个小时的空调噢~',shiftSize(46),shiftSize(670),)

              // 头像
              let newHead = userInfoMore.headPortrait
              if (userInfoMore.headPortrait.indexOf("http://static.shishangbag.vip") !== -1) {
                newHead = userInfoMore.headPortrait.replace("http://static.shishangbag.vip", "https://sbag.oss-cn-huhehaote.aliyuncs.com")
              }else if(userInfoMore.headPortrait.indexOf("https://tfs.alipayobjects.com") !== -1||userInfoMore.headPortrait.indexOf("https://thirdwx.qlogo.cn") !== -1){
                newHead = ("https://sbag.oss-cn-huhehaote.aliyuncs.com/upload/img/web/image/home/12.png")
              }
              wx.downloadFile({
                url: newHead,
                success(res) {
                  let width =shiftSize(120);
                  let height = shiftSize(120);
                  let x = shiftSize(240);
                  let y = shiftSize(174);
                  ctx.beginPath();
                  ctx.arc(width/2+x, height/2+y, width/2, 0, Math.PI*2);
                  ctx.clip();
                  ctx.drawImage(res.tempFilePath, shiftSize(240), shiftSize(174), shiftSize(120), shiftSize(120));

                  ctx.draw(true, (res) => {
                    wx.canvasToTempFilePath({
                      canvasId: 'myCanvas2',
                      fileType: 'png',
                      success(res) {
                        wx.hideLoading();
                        console.log(res.tempFilePath,"res.tempFilePath")
                        _that.setData({
                          imgUUrr: res.tempFilePath
                        })
                      }
                    }, _that)
                  })
                  
                  
                }
              })
      
              
            }
          })   
          
      }
    })

  },
  // 保存相册
  save() {
    let _that = this;
    wx.showLoading({
      mask: true
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 600*2,
      height: 740*2,
      destWidth: 600*2,
      destHeight: 740*2,
      canvasId: 'myCanvas2',
      success(res) {

        console.log(res,"res.tempFilePath")

        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
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
    }, _that)
  },
  share() {//我要晒账单
    this.setData({share_mask:true})
    this.shareQ()
    let m = this.data.index
    let myDate = new Date();
    let tMonth = myDate.getMonth();
    if(m){
      m = m<10?"0"+m:m
      m++
    }else{
      m = tMonth + 1;
    }
    let dateStr = myDate.getFullYear()+"年"+m+"月";
    this.setData({dateStr:dateStr})
    

  },
  close(e){
    let id = e.currentTarget.id;
    if(id == 'mask'){
      this.setData({share_mask:false})
    }
   
    console.log(e,"拾尚")
    
  },
  // F2绘图
  initChart(data) {
    return function(canvas, width, height){

      let sum = 0;
      data.map(obj => {
        sum += obj.cost;
      });
      chart = new F2.Chart({
        el: canvas,
        width,
        height
      });
      chart.source(data);
      chart.legend({
        position: 'right',
        offsetY: -5,
        marker: 'square',
        align: 'center',
        itemMarginBottom: 10,
      });
      chart.coord('polar', {
        transposed: true,
        innerRadius: 0.7,
        radius: 0.8,
      });
      chart.axis(false);
      chart.tooltip(false);
      chart.interval()
        .position('a*cost')
        .color('type', ['#1890FF', '#13C2C2', '#2FC25B', '#FACC14', '#F04864', '#8543E0'])
        .adjust('stack');
      // chart.guide().text({
      //   position: ['50%', '50%'],
      //   content: sum.toFixed(2),
      //   style: {
      //     fontSize: 24
      //   }
      // });
      chart.render();
      return chart;
    }
  },
  init(){
    this.getMyMonthTotalBasicUserInfo()
    let tYear = doHandleDate()
    this.setData({tYear:tYear})
    this.getMyMonthTotalDeliver(doHandleDate())
    this.getAreaList(doHandleDate())

  },
  // 选择月份
  openOne(e) {
    this.setData({
      index: e.detail.value,
      showChart: false
    })
    this.setData({month:this.data.array[e.detail.value]})
    let tYear = this.data.arr[e.detail.value]
    this.setData({tYear:tYear})
    this.getMyMonthTotalDeliver(tYear)
    this.getAreaList(tYear)
  },
  // 获取我的回收重量和画图
  getMyMonthTotalDeliver(tYear){
    let userInfo = wx.getStorageSync("userInfo")
    request.post("user/rest/monthTotalDeliveries/myMonthTotalDeliveries?userId="+userInfo.id+"&time="+tYear).then(res => {
      if (res.data.code == 0) {
        this.setData({myWeightData:res.data.data})
        let newmyMonthTotalDeliveries = []
        res.data.data.myMonthTotalDeliveries.map((e) => {
          let obj ={}
          obj.type = e.categoryName
          // obj.type = e.categoryName+"     "+e.sumWeight
          if (e.categoryName.length == 2) {
            obj.type = e.categoryName + "                   " + e.sumWeight
          } else if (e.categoryName.length == 3) {
            obj.type = e.categoryName + "               " + e.sumWeight
          }else if (e.categoryName.length == 4){
            obj.type = e.categoryName + "            " + e.sumWeight
          }else if (e.categoryName.length == 5) {
            obj.type = e.categoryName + "        " + e.sumWeight
          }

          if(res.data.data.mySumMonthTotalDeliveries == 0){
            obj.cost = 1
          }else{
            obj.cost = e.sumWeight
          }
          obj.a = 1
          newmyMonthTotalDeliveries.push(obj)
        })
        // 请求完成后再生成初始化函数 加载图表
        // 必须用wx：if控制图表 不然页面一加载就执行初始化了
        const func =  this.initChart(newmyMonthTotalDeliveries)
        this.setData({
          opts: { onInit: func },
          showChart: true
        })
      }
    })
  },
  // 当月用户投递的地区
  getAreaList(tYear){
    let userInfo = wx.getStorageSync("userInfo")
    request.post("user/rest/monthTotalDeliveries/monthTotalDeliveriesArea?userId="+userInfo.id+"&time="+tYear).then(res => {
      if (res.data.code == 0) {
        if(res.data.data.length >0){
          this.setData({open:true})
          let areaNameList = []
          let areaIdList = []
          res.data.data.map((e) => {
            areaNameList.push(e.areaName)
            areaIdList.push(e.id)
          })
          this.setData({
            areaNameList:areaNameList,
            areaIdList:areaIdList
          })
          this.setData({area:areaNameList[0]})
          this.getTop50()
        }else{
          this.setData({open:false})
        }
        
      }
    })
  },
  // 根据时间和区域获取排行榜
  getTop50(value){
    let index = value?value.detail.value:0
    request.post("user/rest/monthTotalDeliveries/monthTotalDeliveriesTop50?areaId="+this.data.areaIdList[index]+"&time="+this.data.tYear)
    .then(res => {
      if (res.data.code == 0) {
        let topList = res.data.data
        this.setData({
          area:this.data.areaNameList[index],
          topList:topList
        })

        console.log(topList,"topList")
        let arr = ["theFirst","theSecond","theThird"]
        arr.forEach((e,i) => {
          if(topList[i]){




            this.setData({
              [e]:{
                name:topList[i].user.nickName?topList[i].user.nickName:'---',
                level:topList[i].user.carbonReducingLevel.level+topList[i].user.carbonReducingLevel.name,
                carbonReducingM:topList[i].carbonReducingM,
                carbonReducingLevel:topList[i].user.carbonReducingLevel,
                headPortrait:topList[i].user.headPortrait?topList[i].user.headPortrait:`${this.data.imgUrl}home/12.png`
              }
            })
          }
        })
      }
    })
    this.myCarbonReducingRank(index)
  },
  myCarbonReducingRank(index){
    let userInfo = wx.getStorageSync("userInfo")
    request.post("user/rest/monthTotalDeliveries/myCarbonReducingRank?areaId="+this.data.areaIdList[index]+"&time="+this.data.tYear+"&userId="+userInfo.id)
    .then(res => {
      if (res.data.code == 0) {
        this.setData({rankIndex:res.data.data})
       
      }
    })
  },
  // 天数  投递次数  累计重量
  getMyMonthTotalBasicUserInfo(){
    let userInfo = wx.getStorageSync("userInfo")
    request.post("user/rest/monthTotalDeliveries/myMonthTotalBasicUserInfo?userId="+userInfo.id).then(res => {
      if (res.data.code == 0) {
        this.setData({myInfo:res.data.data})
        
      }
    })

  },
  //成为普通会员
  goNomal() {
    wx.navigateTo({
      url: '../nomalMember/nomalMember'
    });
  },
  pay() {//成为plus会员
    wx.navigateTo({
      url: '../plusMember/plusMember'
    });
  },
  getCanvas() {

  },
  
  
  getCompanys() {//获取企业列表
    request.get("user/rest/company/getHomePageShowCompany").then(res => {
      if (res.data.code == 0) {
        let list = this.data.list;
        // for (let index = 0; index < 10; index++) {
        //   list.push(res.data.data);
        // }
        this.setData({
          list: list,
        })
      }
    })
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
    wx.stopPullDownRefresh();
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    // 返回自定义分享信息
    return {
      title: '环保账单',
      desc: this.data.userInfoMore.name+this.data.month+'在'+this.data.area+'排名第'+this.data.rankIndex+'位',
      bgImgUrl: app.globalData.imgUrlNew + "yy/member/sharerank.png",
      path: 'pages/index/index',
    };
  },
});

function doHandleDate() {//获取当前月份
  var myDate = new Date();
  var tYear = myDate.getFullYear();
  var tMonth = myDate.getMonth();
  tMonth = tMonth + 1;
  if (tMonth.toString().length == 1) {
    tMonth = "0" + tMonth;
  }
  return tYear.toString() + tMonth.toString();
}
function getLastMonth() {//获取上月
  var myDate = new Date();
  var tYear = myDate.getFullYear();
  var tMonth = myDate.getMonth();
  if (tMonth == 0) {
    tMonth = 12;
    tYear = tYear - 1;
  }
  if (tMonth.toString().length == 1) {
    tMonth = "0" + tMonth;
  }
  return tYear.toString() + tMonth.toString();
}
function getLLastMonth() {//获取上上月
  var myDate = new Date();
  var tYear = myDate.getFullYear();
  var tMonth = myDate.getMonth();
  if (tMonth == 0) {
    tMonth = 11;
    tYear = tYear - 1;
  } else if (tMonth == 1) {
    tMonth = 12;
    tYear = tYear - 1;
  } else {
    tMonth = tMonth - 1;
  }
  if (tMonth.toString().length == 1) {
    tMonth = "0" + tMonth;
  }
  return tYear.toString() + tMonth.toString();
}

