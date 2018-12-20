// pages/poster/poster.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    poster_url: '',
    article_id: '', //文章id
    scale: 1, //缩放比例
    article_cont: {},
    opensetting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var article_id = options.article_id;

    // 获取屏幕比例
    wx.getSystemInfo({
      success: e => {
        console.log(e)
        that.setData({
          scale: e.windowWidth / 750
        })
        console.log(this.data.scale)
      }
    })

    wx.request({
      url: app.url.articleDetail,
      method: 'POST',
      data: {
        article_id: article_id,
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          article_cont: e.data.data
        })
        that.qrcode()

      },
      fail: () => {}
    });


  },

  // 获取二维码
  qrcode: function () {
    // 获取带参二维码
    var that = this;
    wx.request({
      url: app.url.QrCode,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        article_id: that.data.article_id,
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          cord_img: "https://www.mati.hk/Public/Upload/Note/posterQrCode/" + e.data.data.imgName
        });
        wx.setStorageSync("qrcord", that.data.cord_img);
        that.create_share()
      },
      fail: () => {}
    });
  },

  // 生成分享
  create_share: function () {
    wx.showLoading({
      title: '生成中',
      mask: true,
    });

    var that = this;
    var img = that.data.article_cont.article_img;
    var user_data = that.data.article_cont.user_data;
    var article_cont = that.data.article_cont
    console.log(user_data)

    if (wx.getStorageSync('qrcord') != '') {

      // 封面图
      var promise1 = new Promise(function (res, rej) {
        var i = 0;
        var res_img = [];
        if (img.length >= 9) {
          a(i)

          function a(i) {
            if (i < 9) {
              wx.getImageInfo({
                src: img[i],
                success: function (e) {
                  res_img.push(e)
                  i++;
                  a(i)
                }
              })
            } else {
              res(res_img)
              console.log('获取图片成功')
            }
          }
        } else {
          wx.getImageInfo({
            src: img[0],
            success: (e) => {
              res(e)
              console.log('获取图片成功')
            },
          });
        }
      })
      // 下载用户
      var promise2 = new Promise(function (res, rej) {
        console.log(user_data)
        if (user_data.length > 0) {

          var i = 0;
          var res_img = [];
          b()

          function b() {
            // 有问题
            console.log(user_data.length)
            if (i < user_data.length) {
              console.log(user_data[i])
              var src = ''
              console.log('============')
              if (user_data[i].profile == '') {
                src = 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png'
              } else {
                if(user_data[i].profile_is_http == '0'){
                  src = 'https://www.mati.hk/Public/' +user_data[i].profile
                }else{
                  src = user_data[i].profile
                }
              }
              wx.getImageInfo({
                src: src,
                success: function (e) {
                  res_img.push(e)
                  i++;
                  b()
                },
              })
            } else {
              console.log(res_img)
              res(res_img)
              console.log('获取下载用户成功')
            }
          }

        } else {
          res('')
        }
      })

      // 二维码
      var promise3 = new Promise(function (res, rej) {
        wx.getImageInfo({
          src: that.data.cord_img,
          success: (e) => {
            res(e.path)
            console.log('获取二维码成功')
          },
        });
      })

      // 头像
      var promise4 = new Promise(function (res, rej) {
        wx.getImageInfo({
          src: app.profile,
          // 测试
          // src: 'https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eplJ7blJGjAOHhmp41Icibfag0yicicT6yFacaflJ2ukNGGwoHqledXol11OLtmXHibg7lNwRzOEHkia7g/132',
          success: (e) => {
            res(e.path)
            console.log('获取头像成功')
          },
        });
      });


      // 背景
      var promise5 = new Promise(function (res, rej) {
        wx.getImageInfo({
          src: 'https://www.mati.hk/Public/MiniProgram-note/index/canvas_bg.png',
          success: (e) => {
            res(e.path)
            console.log('获取背景成功')
          },
        });
      });

      //  icon
      var promise6 = new Promise(function (res, rej) {
        var img = []
        wx.getImageInfo({
          src: 'https://www.mati.hk/Public/MiniProgram-note/index/like.png',
          success: (e) => {
            img.push(e.path)
            wx.getImageInfo({
              src: 'https://www.mati.hk/Public/MiniProgram-note/index/msg.png',
              success: (e) => {
                img.push(e.path)
                res(img)
                console.log('获取icon成功')
              },
            });
          },
        });
      });

      Promise.all([
          promise1, promise2, promise3, promise4, promise5, promise6
        ])
        .then(res => {
          console.log(res)
          var scale = that.data.scale;

          // 创建canvas画布

          var ctx = wx.createCanvasContext('poster');


          // 原绘制圆形图片

          ctx.beginPath();
          ctx.drawImage(res[4], 0, 0, 710 * scale, 1078 * scale);


          var r = scale * 35
          var cx = scale * 45
          var cy = scale * 15
          ctx.save();
          ctx.beginPath()
          // 绘制圆形头像
          ctx.arc(cx + r, cy + r, r, 0, 2 * Math.PI)
          ctx.clip()
          ctx.drawImage(res[3], scale * 45, scale * 15, scale * 80, scale * 80);
          ctx.closePath()

          //绘制描边
          ctx.beginPath()
          ctx.arc(cx + r, cy + r, r, 0, 2 * Math.PI)
          ctx.clip()
          ctx.setStrokeStyle('#ffffff')
          ctx.setLineWidth(scale * 10)
          ctx.stroke()
          ctx.restore()
          ctx.closePath()


          ctx.save();
          ctx.beginPath()
          // 绘制文字
          ctx.fillStyle = "#ffffff";
          ctx.setFontSize(32 * scale)
          ctx.fillText('@' + app.open_user.nickname + '推荐给你', scale * 130, scale * 65)
          ctx.closePath()

          ctx.fillStyle = "#39CCE1";
          ctx.setFontSize(28 * scale)
          ctx.fillText(article_cont.source + '的看点', scale * 45, scale * 140)
          ctx.closePath()

          ctx.drawImage(res[5][0], 460 * scale, scale * 120, 24 * scale, 24 * scale);
          ctx.fillText(article_cont.like_count, scale * 500, scale * 142)

          ctx.drawImage(res[5][1], 570 * scale, scale * 120, 24 * scale, 24 * scale);
          ctx.fillText(article_cont.reply_count, scale * 610, scale * 142)
          ctx.beginPath();
          if (res[0].length > 1) {
            var x = 45
            var y = 176
            var n = 0
            for (var i in res[0]) {
              if (i < 3) {
                y = 176
                n = 0
              } else if (i >= 3 && i < 6) {
                y = 336
                n = 1
              } else if (i >= 5 && i < 9) {
                y = 496
                n = 2
              }
              if (i == 3 * n) {
                x = 45
              } else if (i == 3 * n + 1) {
                x = 255
              } else if (i == 3 * n + 2) {
                x = 465
              }
              ctx.save();
              ctx.rect(x * scale, y * scale, 200 * scale, 150 * scale)
              ctx.clip();
              ctx.setStrokeStyle('#ffffff');
              ctx.stroke();
              var img_w = res[0][i].width;
              var img_h = res[0][i].height;
              var img_scale = img_w / img_h;
              var img_y = y
              img_h = 200 / img_scale
              if (img_h < 150) {
                img_h = 200
              }
              // img_x = x-100
              ctx.drawImage(res[0][i].path, x * scale, y * scale, 200 * scale, img_h * scale);
              ctx.restore();
            }
          } else {
            ctx.closePath()
            ctx.beginPath();
            console.log('ss')
            ctx.rect(45 * scale, 176 * scale, 620 * scale, 480 * scale)
            ctx.clip();
            var img_w = res[0].width;
            var img_h = res[0].height;
            var img_s = img_w/img_h;
            
            if(img_w > img_h){
              img_w = 620*1.2
              img_h = img_w/ img_s
            }else{
              img_h = 480 *1.2
              img_w = img_h*img_s
            }

            var a = 45,
              b = 176;
            if (img_w > 620) {
              a = 45- Math.abs(img_w - 620) / 2 
              b = Math.abs(img_h - 550) / 2
            }
            ctx.drawImage(res[0].path, a * scale, 176 * scale, img_w * scale, img_h * scale);
            ctx.restore();
            ctx.closePath();
          }

          // // 下载用户
          if (res[1].length > 0) {
            ctx.setFontSize(24 * scale)
            ctx.fillText('下载用户', 45 * scale, 720 * scale);


            var x = 180;
            for (let i in res[1]) {
              console.log(res[1])
              var r = 35 * scale;
              ctx.save();
              ctx.beginPath();
              ctx.arc(x * scale + r, 680 * scale + r, r, 0, 2 * Math.PI)
              ctx.clip()
              ctx.setStrokeStyle('#ffffff');
              ctx.stroke();
              ctx.drawImage(res[1][i].path, x * scale, 680 * scale, 70 * scale, 70 * scale);
              ctx.restore();
              ctx.closePath()
              x = x + 80
            }
          }

          if (res[1].length > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(288 * scale, 780 * scale, 150 * scale, 140 * scale);
            ctx.clip();
            ctx.drawImage(res[2], 288 * scale, 780 * scale, 150 * scale, 170 * scale);
            ctx.restore();

            ctx.save();
            ctx.setFillStyle('#39CCE1');
            ctx.fillText('扫一扫，一键下载', 265 * scale, 960 * scale);
          }else{
            ctx.save();
            ctx.beginPath();
            ctx.rect(288 * scale, 730 * scale, 150 * scale, 140 * scale);
            ctx.clip();
            ctx.drawImage(res[2], 288 * scale, 730 * scale, 150 * scale, 170 * scale);
            ctx.restore();

            ctx.save();
            ctx.setFillStyle('#39CCE1');
            ctx.fillText('扫一扫，一键下载', 265 * scale, 910 * scale);
          }

          ctx.setFillStyle('#ffffff');
          ctx.setFontSize(12);
          ctx.fillText('微信文章图片一键下载神器', 200 * scale, 1030 * scale);

          // 绘制
          ctx.draw(false, that.getTempFilePath())
        })



    }


  },



  // 输出成图片
  getTempFilePath: function () {
    var that = this;
    var scale = that.data.scale;
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: scale * 1080,
        height: scale * 1920,
        canvasId: 'poster',
        success: (res) => {
          console.log(res)
          that.setData({
            poster_url: res.tempFilePath
          })
          wx.hideLoading();
        }
      })
    }, 200)
  },

  //开始保存 
  save: function () {
    var that = this;
    var photo = 'scope.writePhotosAlbum'
    // 获取授权信息，查看是否已授权保存相册
    console.log('sda')
    wx.getSetting({
      success: res => {
        // 已授权
        console.log(res)
        if (res.authSetting[photo]) {
          that.save_img()
        } else {
          // 未授权
          // console.log(res.authSetting[photo])
          if (res.authSetting[photo] === false) {
            that.setData({
              opensetting: true,
            })
            wx.showToast({
              title: "由于您之前拒绝授权访问相册，请重新授权",
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          } else {
            // 初次授权
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: res => {
                that.save_img()
              },
            });
          }
        }
      }
    })
  },

  //保存图片
  save_img: function () {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster_url,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      },
      fail: () => {}
    });
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
    var that = this
    var photo = 'scope.writePhotosAlbum'
    wx.getSetting({
      success: res => {
        // 已授权
        console.log(res)
        if (res.authSetting[photo]) {
          that.setData({
            opensetting: false
          })
        }
      }
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


})