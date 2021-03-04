var app = getApp();
const request = require("../../../utils/request.js");
import F2 from '../../../f2-canvas/lib/f2';
let chart = null;
Page({
  data: {
    imgUrlNew: app.globalData.imgUrlNew,
    step: 1,
    bglist: {
      bg1: app.globalData.imgUrlNew + 'yy/bill/bg1.png',
      bg2: app.globalData.imgUrlNew + 'yy/bill/bg2.png',
      bg3: app.globalData.imgUrlNew + 'yy/bill/bg3.png',
      bg4: app.globalData.imgUrlNew + 'yy/bill/bg4.png',
      bg2word: app.globalData.imgUrlNew + 'yy/bill/bg2word.png',
      bg3word: app.globalData.imgUrlNew + 'yy/bill/bg3word.png',
      bg4word: app.globalData.imgUrlNew + 'yy/bill/bg4word.png',
    },
    current: 0,
    series: [
      {
        type: '纸类0',
        data: 1,
      },
      {
        type: '塑料0',
        data: 1,
      },
      {
        type: '金属0',
        data: 1,
      },
      {
        type: '玻璃0',
        data: 1,
      },
      {
        type: '衣物0',
        data: 0,
      },
      {
        type: '电子废弃物0',
        data: 0,
      },
      {
        type: '复合纸包装0',
        data: 0,
      },
      {
        type: '其他低值物0',
        data: 0,
      },
    ],
    navH:"",
    radius: 0.8,
    innerRadius: 0.6,
    legend: {
      position: 'right',
    },
    myWeightData: {},
  },
  onLoad() {
    this.setData({
      navH: app.globalData.navHeight
    })
  },
  onShow() {
    
    let userInfo = wx.getStorageSync("userInfo");
    let userInfoMore = wx.getStorageSync("userInfoMore");
    if (!userInfo) {
      this.toLogin();
      return;
    }
    this.setData({
      userInfo: userInfo,
      userInfoMore: userInfoMore,
    })
    this.goDetail(userInfo.id);
    
    
  },
  open() {
    let that = this;
    that.setData({
      step: 2,
    })
  },
  onChange: function (e) {
    this.setData({
      current: e.detail.current,
    });
  },
  touchStart(e) {
    var that = this;
    that.setData({
      touchx: e.changedTouches[0].clientX,
      touchy: e.changedTouches[0].clientY
    })
  },
  touchEnd(e) {
    var that = this;
    let x = e.changedTouches[0].clientX;
    let y = e.changedTouches[0].clientY;
    let turn = "";
    // if (x - that.data.touchx > 50 && Math.abs(y - that.data.touchy) < 50) {
    //   turn = "right";
    // } else if (x - that.data.touchx < -50 && Math.abs(y - that.data.touchy) < 50) {
    //   turn = "left";
    // }
    if (y - that.data.touchy > 50 && Math.abs(x - that.data.touchx) < 50) {
      turn = "down";
    } else if (y - that.data.touchy < -50 && Math.abs(x - that.data.touchx) < 50) {
      turn = "up";
    }
    //根据方向进行操作
    if (turn == 'down') {
      let number = this.data.step;
      
      if (number == 2) {
         return;
      }

      number -= 1;
      this.setData({
        step: number,
      })
    }
    if (turn == 'up') {
      let number = this.data.step;
      if (number == 1) {//首页禁止下滑
        return;
      }
      if(number == 3 && !this.data.showChart){
        setTimeout(() => {
          this.getMyMonthTotalDeliver();
        },2000)
        
      }
      if (number == 4) {//跳转

        wx.navigateTo({
          url: '/pages/annualBill/bill/bill',
        })
        return;
      }
      number += 1;
      
      this.setData({
        step: number,
      })
      console.log(number)
    }

  },
  goback() {
    wx.navigateBack({
      fail(res){
        wx.redirectTo({
          url: '/pages/index/index',
        })
      }
    })
  },
  goDetail(id) {
    let that = this;
    let prarm = {
      userId: id,
      year: '2020',
    }
    request.post(`user/rest/user/annualStatement?userId=` + prarm.userId + '&year=' + prarm.year).then(res => {
      if (res.data.code == 0) {
        let myWeightData = {};
        myWeightData = res.data.data;
        myWeightData.year = res.data.data.registerDate.slice(0, 4)
        myWeightData.month = res.data.data.registerDate.slice(5, 7)
        myWeightData.day = res.data.data.registerDate.slice(8, 10)
        this.setData({ myWeightData: myWeightData })
        let series = []
        res.data.data.userRegenerantWeightList.map((e) => {
          let obj = {};
          obj.type = e.name + e.weight
          obj.data = parseInt(e.weight);
          obj.a = 1;
          series.push(obj)
        })
        that.setData({
          series: series,
        })
      }
    });
  },
    // 获取我的回收重量和画图
    getMyMonthTotalDeliver() {
      let newmyMonthTotalDeliveries = []
          this.data.myWeightData.userRegenerantWeightList.map((e) => {
            let obj = {}
            obj.type = e.name
            // obj.type = e.name+"     "+e.weight
            if (e.name.length == 2) {
              obj.type = e.name + "                   " + e.weight
            } else if (e.name.length == 3) {
              obj.type = e.name + "               " + e.weight
            } else if (e.name.length == 4) {
              obj.type = e.name + "            " + e.weight
            } else if (e.name.length == 5) {
              obj.type = e.name + "        " + e.weight
            }
  
            if (this.data.myWeightData.totalWeight == 0) {
              obj.cost = 1
            } else {
              obj.cost = parseInt(e.weight)
            }
            obj.a = 1
            newmyMonthTotalDeliveries.push(obj)
          })
          // 请求完成后再生成初始化函数 加载图表
          // 必须用wx：if控制图表 不然页面一加载就执行初始化了
          const func = this.initChart(newmyMonthTotalDeliveries)
          this.setData({
            opts: { onInit: func },
            showChart: true
          })
    },
    // F2绘图
    initChart(data) {
      return function (canvas, width, height) {
  
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
          itemMarginBottom: 3,
        });
        chart.coord('polar', {
          transposed: true,
          innerRadius: 0.7,
          radius: 0.6,
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
  toLogin() {
    wx.showModal({
      title: '温馨提示',
      content: '您还未登录，确定去登录吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }else{
          wx.redirect({
            url: '/pages/index/index'
          });
        }
      },
    });
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: '环保账单',
      desc: this.data.userInfoMore.name + this.data.month + '在' + this.data.area + '排名第' + this.data.rankIndex + '位',
      bgImgUrl: app.globalData.imgUrlNew + "yy/member/sharerank.png",
      path: 'pages/index/index',
    };
  },
});
