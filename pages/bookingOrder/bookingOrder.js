var app = getApp();
const request = require("../../utils/request.js");
Page({
  data: {
    checked: 0,
    evaluation: 3,
    text: '',
    orderInfo: '',
    imgUrl: app.globalData.imgUrl,
    imgUrlNew: app.globalData.imgUrlNew,
    cancelReasonEnumList:[]
  },
  onLoad(e) {
    this.getOrderInfo(e.id)
  },
  // 取消原因列表
  getEnumList(){
    request.get("order/rest/order/reserveOrderCancelReasonEnumList").then(res => {
      if (res.data.code === 0) {
        let list = []
        res.data.data.map((item,index) => {
          let obj = {}
          obj.title = item;
          obj.checked = false;
          list.push(obj)
        })
        this.setData({cancelReasonEnumList:list})
        this.setData({cancelMask:true})
      }
    })
  },
  closemask_(){
    this.setData({cancelMask:false})
  },
  // 提交取消订单
  agree(){
    let reason = this.data.cancelReasonEnumList.filter(e => e.checked);
    if(reason.length>0){
      request.get(`order/rest/order/cancelReserveOrder?orderId=${this.data.orderInfo.id}&reason=${reason[0].title}`).then((res) => {
        if (res.data.code == 0) {
          wx.showToast({
            icon: 'success',
            title: "操作成功",
            duration: 1500,
          });
          this.setData({cancelMask:false})
          this.setData({
            pageIndex2: 1,
            list2Length: 0
          })
          this.getOrderInfo(this.data.orderInfo.id)
        }
      })
    }else{
      wx.showToast({
        icon: 'none',
        title: "请选择取消原因",
        duration: 1500,
      });
    }
  },
  // 取消原因
  changeChecked(e){
    let index = e.currentTarget.dataset.data;
    let list = this.data.cancelReasonEnumList.map((j,i) => {
      if(index == i){
        j.checked =true
      }else{
        j.checked = false
      }
      return j
    });
    this.setData({cancelReasonEnumList:list})
  },
  radioChange(e) {
    if (this.data.checked) {
      this.setData({
        checked: 0
      })
    } else {
      this.setData({
        checked: 1
      })
    }
  },
  getOrderInfo(id){
    request.get(`order/rest/order/getReserveOrderDetail?orderId=${id}`).then(res => {
      console.log(res,"订单详情")
      if (res.data.code == 0) {
        this.setData({
          orderInfo: res.data.data
        })
      }
    })
  },
  evaluation(e) {
    console.log(e)
    this.setData({
      evaluation: e.currentTarget.dataset.flag
    })
  },
  input(e) {
    this.setData({
      text: e.detail.value
    })
  },
  cancel(e) {
    let id = e.currentTarget.dataset.id
      this.getEnumList()
      this.setData({cancelOrderId:id});

    return
    wx.showModal({
      title: '温馨提示',
      content: '确定取消预约吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          request.get(`order/rest/order/cancelReserveOrder?orderId=${id}`).then((res) => {
            if (res.data.code == 0) {
              wx.navigateBack();
            }
          })
        }
      },
    });
  },
  del(e) {
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '温馨提示',
      content: '确定删除吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (result) => {
        if (result.confirm) {
          request.get(`order/rest/order/deleteReserveOrder?orderId=${id}`).then((res) => {
            if (res.data.code == 0) {
              wx.navigateBack();
            }
          })
        }
      },
    });
  },
  comments() {
    let data = {
      evalComm: this.data.text,
      evalScore: this.data.evaluation,
      isNm: this.data.checked,
      operationId: this.data.orderInfo.operationId,
      orderId: this.data.orderInfo.id,
      orderType: 1,
      userId: this.data.orderInfo.userId
    }
    console.log(data)
    // my.showToast({
    //   content: '评论成功',
    //   duration: 1500,
    //   success: (res) => {
    //     let orderInfo = this.data.orderInfo
    //     orderInfo.isComm = 1
    //     this.setData({
    //       orderInfo
    //     })
    //   },
    // });
    request.post("order/rest/order/submitServiceComm", data).then((res) => {
      if (res.data.code == 0) {
        // my.navigateBack();
        wx.showToast({
          title: '评论成功',
          duration: 1500,
          success: (res) => {
            let orderInfo = this.data.orderInfo
            orderInfo.isComm = 1
            this.setData({
              orderInfo
            })
          },
        });
      }
    })
  }
});