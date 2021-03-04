import md5 from "./md5.js"
var app = getApp();
// var localhost = "https://miniapp.shishangbag.vip/sbag-server/v20210101/" //线上地址
var localhost = "https://miniapp.shishangbag.vip/sbag-server/v20210222/" //线上地址
// var localhost = "https://cat.shishangbag.vip/sbag-server/" //测试地址


// 签名MD5加密
function dataConversion (data) {
  let token = wx.getStorageSync('token');
  let timestamp = new Date().getTime();
  let random = Math.ceil(Math.random() * 100000); 
  let nonce = `83552b17-c9a4-4bfb-9ceb-ef31dc82faa9${new Date().getTime()}${random}`;
  let headMsg = {
    "appid": "appid00000000000002",
    "timestamp": timestamp,
    "nonce": nonce,
  }
 
  if (token){
    headMsg.token=token;
    headMsg.sign = md5.hex_md5(`appid=appid00000000000002&nonce=${nonce}&timestamp=${timestamp}&token=${token}&sa82kjk*98^asda78fyfhgt7fy6556r213gu`);
  }else{
    headMsg.sign = md5.hex_md5(`appid=appid00000000000002&nonce=${nonce}&timestamp=${timestamp}&sa82kjk*98^asda78fyfhgt7fy6556r213gu`);
  }
  return headMsg
}
// 封装post请求
var that = this;
const post = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    let newData = dataConversion(data)
    wx.request({
      url: localhost + url,
      data: data,
      method: 'POST',
      header: {
        // 'content-type': 'application/x-www-form-urlencoded',
        'content-type': 'application/json',
        ...newData
      },
      success: function(res) { //服务器返回数据
        if (res.data.code == 2 || res.data.code == 1) {
          wx.showToast({
            icon: 'none',
            title: res.data.message,
            duration: 2000,
          });
          resolve(res);
        } else if (res.data.code == "0000") {
          resolve(res);
        } else if (res.data.code == "1110") {
          wx.clearStorage();
          wx.navigateTo({
            url: '../login/login'
          });
        } else {
          resolve(res);
        }
      },
      error: function(e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}

// 封装get请求
const get = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    let newData = dataConversion(data)
    wx.request({
      url: localhost + url,
      data: data,
      header: {
        'content-type': 'application/json',
        ...newData
      },
      success: function(res) { //服务器返回数据 
        if (res.data.code == 2 || res.data.code == 1) {
          wx.showToast({
            icon: 'none',
            title: res.data.message,
            duration: 1500,
          });
          resolve(res);
        } else {
          resolve(res);
        }
      },
      error: function(e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}

module.exports = {
  post,
  get,
  localhost,
  dataConversion,
}