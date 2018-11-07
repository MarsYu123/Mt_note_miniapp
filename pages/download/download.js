// pages/download/download.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: [],
    img_length: 0,
    download_length: 0,
    download_plan: '未开始',
    fail_img: [],
    opensetting:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({
      url: app.url.downTest,
      method: 'GET',
      data: {},
      header: 'application/x-www-form-urlencoded',
      success: (e) => {
        console.log(e)
        var data = e.data.data
        this.data.img = data
      },
      fail: () => {}
    });
  },

  save_image: function () {
    var that = this;
    var photo = 'scope.writePhotosAlbum'
    // 获取授权信息，查看是否已授权保存相册
    if (that.data.download_plan != '进行中') {
      wx.getSetting({
        success: res => {
          that.setData({
            download_plan: '进行中'
          })
          // 已授权
          if (res.authSetting[photo]) {
            that.getimage()
          } else {
            // 未授权
            if (res.authSetting[photo] === false) {
              that.setData({
                opensetting: true
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
                  that.getimage()
                },
              });
            }
          }
        }
      })
    } else {
      wx.showToast({
        title: '下载正在进行，请勿重复操作',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
  },


  getimage: function (e) {
    var that = this;
    that.data.img_length = that.data.img.length;
    for (var i in that.data.img) {
      wx.getImageInfo({
        src: that.data.img[i],
        success: (e) => {
          console.log(e)
          var path = e.path;
          this.saveimaeg(path)
        },
      });
    }
  },

  saveimaeg: function (path) {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: (e) => {
        console.log(e)
        that.data.download_length++
        that.plan_status()
      },
      fail: () => {
        that.data.download_length++
        that.data.fail_img.push(that.data.download_length)
        that.plan_status()
      }
    });

  },

  plan_status: function () {
    var that = this;
    if (that.data.download_length == that.data.img_length && that.data.img_length != 0) {
      that.setData({
        download_plan: '结束',
        download_length: 0,
        img_length: 0
      })
      wx.showToast({
        title: '图片全部下载完毕',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
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
    var photo = 'scope.writePhotosAlbum'
    // 获取存储图片权限
    wx.getSetting({
      success: res => {
        console.log(res.authSetting[photo])
        res.authSetting[photo] === false ?
          this.setData({
            opensetting: true
          }) : this.setData({
            opensetting: false
          })
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})