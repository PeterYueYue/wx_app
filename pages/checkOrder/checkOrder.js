const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    imgUrl: app.globalData.imgUrl,
    imgUrls: '',
    id: '', //订单id
    status: '', //订单的状态
    type: '', //订单的状态值
    activeIndex: 2,
    list: [],
    items: [],
    imgUrl: app.globalData.imgUrl
  },
  onLoad(e) {
    console.log(e)
    let imgUrls = app.globalData.imgUrl
    let status = e.status
    if (status == '1') {
      status = '待发货'
      imgUrls = imgUrls + "order/15.png"
    } else {
      status = '已发货'
      imgUrls = imgUrls + "order/10.png"
    }
    this.setData({
      status: status,
      type: e.status,
      id: e.id,
      imgUrls
    })
    this.getList()
    this.setData({
      items: [{
          text: '步骤一'
        },
        {
          text: '步骤二'
        }
      ]
    })
  },
  getList() {
    request.get(`order/rest/order/getSendBagDetail?orderId=${this.data.id}`).then((res) => {
      if (res.data.code == 0) {
        switch (this.data.type) {
          case "1":
            let items = [{
              text: ''
            }]
            items[0].text = "申请时间：" + res.data.data.createDate
            this.setData({
              items,
              list: res.data.data
            })
            break;
          case "2":
            items = [{
              text: ''
            }, {
              text: ''
            }]
            items[0].text = "申请时间：" + res.data.data.createDate
            items[1].text = "发货时间：" + res.data.data.sendDate
            this.setData({
              items,
              list: res.data.data
            })
        }
      }
    })
  },
});