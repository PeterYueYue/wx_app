const request = require("../../utils/request.js");
var app = getApp();
Page({
  data: {
    tabs: [
      { title: '待审批', titles: '待审批' },
      { title: '已审批', titles: '已审批' },
      { title: '全部', titles: '全部' }
    ],
    activeTab: 0,
    imgUrl: app.globalData.imgUrl, //图片路径
    list1: [],
    list2: [],
    list3: [],
    list1Length: 0,
    list2Length: 0,
    list3Length: 0,
    userInfo: {}, //当前身份的信息
    pageSize: 10, //每页条数
    pageIndex1: 1, //待审批当前页码
    pageIndex2: 1,  //已审批当前页码
    pageIndex3: 1,  //全部当前页码
    total1: '', //待审批总页数
    total2: '',  //已审批总页数
    total3: ''  //全部总页数
  },
  handleTabClick(e) {
    let index = e.detail.index
    this.setData({
      activeTab: index,
    });
  },
  handleTabChange(e) {
    let index = e.detail.index
    this.setData({
      activeTab: index,
    });
  },
  onLoad(e) {
    let user = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: user
    })
    this.getList1()
    this.getList2()
    this.getList3()
  },
  approve(e) {
    const _this = this
    let id = e.currentTarget.dataset.id
    if (e.currentTarget.dataset.type == 1) {
      wx.showModal({
        title: '温馨提示',
        content: '确定通过吗',
        confirmText: '确定',
        cancelText: '取消',
        success: (result) => {
          if (result.confirm) {
            let data = {
              id: id,
              companyState: 2
            }
            request.get(`user/rest/withdraw/companyApprove`, data).then((res) => {
              if (res.data.code == 0) {
                _this.setData({
                  pageIndex1: 1,
                  pageIndex2: 1,
                  pageIndex3: 1
                })
                _this.getList1()
                _this.getList2()
                _this.getList3()
              }
            })
          }
        },
      });
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '确定不通过吗',
        confirmText: '确定',
        cancelText: '取消',
        success: (result) => {
          if (result.confirm) {
            let data = {
              id: id,
              companyState: 3
            }
            request.get(`user/rest/withdraw/companyApprove`, data).then((res) => {
              if (res.data.code == 0) {
                _this.setData({
                  pageIndex1: 1,
                  pageIndex2: 1,
                  pageIndex3: 1
                })
                _this.getList1()
                _this.getList2()
                _this.getList3()
              }
            })
          }
        },
      });
    }
  },
  //获取待审批列表
  getList1() {
    let data = {
      userId: this.data.userInfo.id,
      companyState: 1,
      pageIndex: this.data.pageIndex1,
      pageSize: this.data.pageSize
    }
    request.get(`user/rest/withdraw/getCompanyWithdrawList`, data).then((res) => {
      console.log(res,1111111)
      if (res.data.code == 0) {
        if (res.data.data != null) {
          let list = []
          if (this.data.pageIndex1 == 1) {
            list = res.data.data.content
          } else {
            list = [...thi.data.list1, ...res.data.data.content]
          }
          let tabs = this.data.tabs
          tabs[0].title = tabs[0].titles + " " + res.data.data.totalElements
          this.setData({
            list1: list,
            total1: res.data.data.totalPages,
            tabs,
            list1Length: 0
          })
        } else {
          let tabs = this.data.tabs
          tabs[0].title = tabs[0].titles + " " + "0"
          this.setData({
            list1: [],
            total1: 1,
            tabs,
            list1Length: 1
          })
        }
      }
    })
  },
  getList2() {
    let data = {
      userId: this.data.userInfo.id,
      companyState: 2,
      pageIndex: this.data.pageIndex2,
      pageSize: this.data.pageSize
    }
    request.get(`user/rest/withdraw/getCompanyWithdrawList`, data).then((res) => {
      console.log(res, 22222222)
      if (res.data.code == 0) {
        if (res.data.data != null) {
          let list = []
          if (this.data.pageIndex2 == 1) {
            list = res.data.data.content
          } else {
            list = [...thi.data.list2, ...res.data.data.content]
          }
          let tabs = this.data.tabs
          tabs[1].title = tabs[1].titles + " " + res.data.data.totalElements
          this.setData({
            list2: list,
            total2: res.data.data.totalPages,
            tabs,
            list2Length: 0,
          })
        } else {
          let tabs = this.data.tabs
          tabs[1].title = tabs[1].titles + " " + "0"
          this.setData({
            list2: [],
            total2: 1,
            tabs,
            list2Length: 1
          })
        }
      }
    })
  },
  getList3() {
    let data = {
      userId: this.data.userInfo.id,
      companyState: "",
      pageIndex: this.data.pageIndex3,
      pageSize: this.data.pageSize
    }
    request.get(`user/rest/withdraw/getCompanyWithdrawList`, data).then((res) => {
      console.log(res, 3333333)
      if (res.data.code == 0) {
        if (res.data.data != null) {
          let list = []
          if (this.data.pageIndex3 == 1) {
            list = res.data.data.content
          } else {
            list = [...thi.data.list3, ...res.data.data.content]
          }
          let tabs = this.data.tabs
          tabs[2].title = tabs[2].titles + " " + res.data.data.totalElements
          this.setData({
            list3: list,
            total3: res.data.data.totalPages,
            tabs,
            list3Length: 0
          })
        } else {
          let tabs = this.data.tabs
          tabs[2].title = tabs[2].titles + " " + "0"
          this.setData({
            list1: [],
            total1: 1,
            tabs,
            list3Length: 1
          })
        }
      }
    })
  },
  // onReachBottom() {
  //   let activeTab = this.data.activeTab
  //   switch (activeTab) {
  //     case 0:
  //       if ((this.data.pageIndex1 - 0) >= (this.data.total1 - 0)) {
  //         return false;
  //       }
  //       this.setData({
  //         pageIndex1: this.data.pageIndex1 + 1
  //       })
  //       this.getList1()
  //       break;
  //     case 1:
  //       if ((this.data.pageIndex2 - 0) >= (this.data.total2 - 0)) {
  //         return false;
  //       }
  //       this.setData({
  //         pageIndex2: this.data.pageIndex2 + 1
  //       })
  //       this.getList2()
  //       break;
  //     case 2:
  //       if ((this.data.pageIndex3 - 0) >= (this.data.total3 - 0)) {
  //         return false;
  //       }
  //       this.setData({
  //         pageIndex3: this.data.pageIndex3 + 1
  //       })
  //       this.getList3()
  //       break;
  //   }
  // },
  lower(e) {
    let activeTab = this.data.activeTab
    switch (activeTab) {
      case 0:
        if ((this.data.pageIndex1 - 0) >= (this.data.total1 - 0)) {
          return false;
        }
        this.setData({
          pageIndex1: this.data.pageIndex1 + 1
        })
        this.getList1()
        break;
      case 1:
        if ((this.data.pageIndex2 - 0) >= (this.data.total2 - 0)) {
          return false;
        }
        this.setData({
          pageIndex2: this.data.pageIndex2 + 1
        })
        this.getList2()
        break;
      case 2:
        if ((this.data.pageIndex3 - 0) >= (this.data.total3 - 0)) {
          return false;
        }
        this.setData({
          pageIndex3: this.data.pageIndex3 + 1
        })
        this.getList3()
        break;
    }
  },
  onPullDownRefresh() {
    this.getList1()
    this.getList2()
    this.getList3()
    wx.stopPullDownRefresh()
  }
});
