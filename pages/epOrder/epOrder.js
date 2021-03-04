const wrapText = ({
  ctx,
  text,
  x,
  y,
  w,
  fontStyle: {
    lineHeight = 60,
    textAlign = 'left',
    textBaseline = 'top',
    font = 'normal 40px arial',
    fillStyle = '#000'
  }
}) => {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fillStyle;
  ctx.textAlign = textAlign;
  ctx.textBaseline = textBaseline;
  const chr = text.split('');
  const row = [];
  let temp = '';

  for (let a = 0; a < chr.length; a++) {
    if (ctx.measureText(temp).width < w) { } else {
      if (/[，。！》]/im.test(chr[a])) {
        temp += ` ${chr[a]} `;
        a++;
      }

      if (/[《]/im.test(chr[a - 1])) {
        temp = temp.substr(0, temp.length - 1);
        a--;
      }

      row.push(temp);
      temp = '';
    }
    temp += chr[a] ? chr[a] : '';
  }
  row.push(temp);
  for (let b = 0; b < row.length; b++) {
    ctx.fillText(row[b], x, y + b * lineHeight)

  }

  ctx.restore();
  return y + (row.length - 1) * lineHeight
}

const bgUrl = "https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/share_bg.jpg";

Page({

  data: {
    imgUrl: '',
    shareDate: {
      name: '阳阳',
      title: '拾尚包分类分享海报 ',
      status: '第一名',
      area: '上海市闵行区'
    }
  },

  onLoad: function (options) {
    let _that = this;
    // _that.draw();
    this.draw()
  },

  draw() {
    let _that = this;

    wx.getImageInfo({
      src: bgUrl,
      success(res) {
        let { shareDate } = _that.data;
        let titleHeight;
        let ctx = wx.createCanvasContext('myCanvas');

        ctx.drawImage(res.path, 0, 0, 750, 788);

        // 用户名
        wrapText({
          ctx,
          text: shareDate.name,
          x: 120,
          y: 75,
          w: 170,
          fontStyle: {
            lineHeight: 83,
            textAlign: 'left',
            textBaseline: 'top',
            font: 'normal 24px arial',
            fillStyle: '#ffffff'
          }
        })

        // 标题
        let title = shareDate.title.length < 80 ? shareDate.title : shareDate.title.substring(0, 80) + '...'
        titleHeight = wrapText({
          ctx,
          text: title,
          x: 42,
          y: 195,
          w: 645,
          fontStyle: {
            lineHeight: 58,
            textAlign: 'left',
            textBaseline: 'top',
            font: 'normal 40px arial',
            fillStyle: '#ffffff'
          }
        });

        let top1 = titleHeight + 120; // 地区在y轴上的值
        let top2 = top1 + 45; // 状态在y轴上的值

        // 地区
        ctx.font = 'normal normal 28px arial';
        ctx.fillStyle = '#b4a296';
        ctx.fillText('适用于 ', 42, top1);

        let w1 = ctx.measureText('适用于 ').width;
        ctx.font = 'normal normal 28px arial';
        ctx.fillStyle = '#ff7010';
        ctx.fillText(shareDate.area, 42 + w1, top1);

        let w2 = ctx.measureText(shareDate.area).width;
        ctx.font = 'normal normal 28px arial';
        ctx.fillStyle = '#b4a296';
        ctx.fillText(' 的范围', 42 + w1 + w2, top1);

        // 政策状态
        ctx.font = 'normal normal 28px arial';
        ctx.fillStyle = '#b4a296';
        ctx.fillText('综合排名：', 42, top2);

        let w3 = ctx.measureText('综合排名：').width;
        ctx.font = 'normal normal 28px arial';
        ctx.fillStyle = '#ff7010';
        ctx.fillText(shareDate.status, 42 + w3, top2);

        // 饼图
        var array = [20, 50, 10, 20];
        var colors = ["#228B22", "pink", "#008B8B", "#ADFF2F"];
        var total = 0;
        for (var val = 0; val < array.length; val++) {
          total += array[val];
        }
        var point = { x: 600, y: 220 };
        var radius = 100;
        for (var i = 0; i < array.length; i++) {
          ctx.beginPath();
          var start = 0;
          if (i > 0) {
            for (var j = 0; j < i; j++) {
              start += array[j] / total * 2 * Math.PI;
            }
          }
          var end = start + array[i] / total * 2 * Math.PI;
          ctx.arc(point.x, point.y, radius, start, end);
          ctx.setLineWidth(2)
          ctx.lineTo(point.x, point.y);
          ctx.setStrokeStyle("#F5F5F5");
          ctx.setFillStyle(colors[i]);
          ctx.fill();
          ctx.closePath();
          ctx.stroke();
        }
        // 小程序二维码图片
        wx.downloadFile({
          url: 'https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/yycode.png',
          success(res) {

            let width = 200;
            let height = 200;
            let x = 20;
            let y = 500;

            // ctx.beginPath();
            // ctx.arc(width / 2 + x, height / 2 + y, width / 2, 0, Math.PI * 2);
            // ctx.clip();
            ctx.drawImage(res.tempFilePath, x, y, width, height);


            ctx.draw(true, (res) => {
              wx.canvasToTempFilePath({
                canvasId: 'myCanvas',
                success(res) {

                  _that.setData({
                    imgUrl: res.tempFilePath
                  })
                }
              }, _that)
            })
          }
        })



        // 长按小程序码查看详情
        ctx.font = 'normal normal 24px arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('长按小程序码查看详情', 360, 700);

        // 头像
        wx.downloadFile({
          url: 'https://sbag-small.oss-cn-huhehaote.aliyuncs.com/upload/img/web/yy/tx.jpg',
          success(res) {

            let width = 63;
            let height = 63;
            let x = 40;
            let y = 55;

            ctx.beginPath();
            ctx.arc(width/2+x, height/2+y, width/2, 0, Math.PI*2);
            ctx.clip();
            ctx.drawImage(res.tempFilePath, x, y, width, height);


            ctx.draw(true, (res)=> {
              wx.canvasToTempFilePath({
                canvasId: 'myCanvas',
                success(res) {

                  _that.setData({
                    imgUrl: res.tempFilePath
                  })
                }
              }, _that)
            })
          }
        })

        ctx.draw(true, (res) => {
          wx.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success(res) {

              _that.setData({
                imgUrl: res.tempFilePath
              })
            }
          }, _that)
        })
      }
    })
  },

  save() {
    let _that = this;
    wx.showLoading({
      mask: true
    })
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 750,
      height: 788,
      destWidth: 750,
      destHeight: 788,
      canvasId: 'myCanvas',
      success(res) {

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
  }
})