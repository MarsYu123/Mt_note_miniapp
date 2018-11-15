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
    opensetting: false,
    article_msg: [], //页面数据
    is_vip: false, // 是否是vip（任何形式）
    check_num: 0, //下载数量
    all_check: false,
    sign_in_status: false,
    tips: {
      title: '签到成功',
      num: '5'
    },
    tips_show: false,
    tips_animate: {} //提示框动画
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.article_msg)
    var that = this;
    wx.request({
      url: app.url.toArticlePic,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        wx_url: app.article_msg.url,
        article_id: app.article_msg.article_id
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        if(e.data.status == 200){
          var data = [];
          var arr = []
          data = e.data.data;
          for (var i in data) {
            arr[i] = {
              url: data[i],
              check: false,
              index: i
            }
          }
          that.setData({
            img: arr,
            article_msg: app.article_msg,
            is_vip: app.open_user.is_vip
          })
        }else if(e.data.status == 555){
          wx.showModal({
            title: '提示',
            content: '非会员每天只能下载一次',
            showCancel: false,
            confirmText: '确定',
            confirmColor: '#3CC51F',
            success: res => {
              if(res.confirm){
                wx.navigateBack({
                  delta: 1
                });
              }
            }
          });
        }
     
      },
      fail: () => {}
    });
  },

  //全选 
  all_check: function () {
    var img = this.data.img;
    var all_check = this.data.all_check;
    var check_num = 0

    if (!all_check) {
      check_num = this.data.img.length
      for (var i in img) {
        img[i].check = true
      }
    } else {
      for (var i in img) {
        img[i].check = false
      }
    }
    all_check = !all_check;
    this.setData({
      all_check: all_check,
      check_num: check_num,
      img: img
    })
  },

  // 选择图片
  check_img: function (e) {
    console.log(e)
    var index = e.currentTarget.dataset.index;
    var check = 'img[' + index + '].check'
    var is_check = this.data.img[index].check;
    var check_num = this.data.check_num
    if (!is_check) {
      check_num++
    } else {
      check_num--
    }
    this.setData({
      [check]: !is_check,
      check_num: check_num
    })
  },


  save_image: function () {
    var that = this;
    var photo = 'scope.writePhotosAlbum'
    // 获取授权信息，查看是否已授权保存相册
    if (this.data.img.length > 0) {

      wx.getSetting({
        success: res => {
          that.setData({
            download_plan: '进行中'
          })
          // 已授权
          if (res.authSetting[photo]) {
            that.request_down()
          } else {
            // 未授权
            if (res.authSetting[photo] === false) {
              that.setData({
                opensetting: true,
                download_plan: '未开始'
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
                  that.request_down()
                },
              });
            }
          }
        }
      })
    } else {
      wx.showToast({
        title: '请选择图片',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
  },


  //  请求是否可以下载
  request_down: function () {
    wx.request({
      url: app.url.downloadArticlePic,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        wx_url: app.article_msg.url,
        article_id: app.article_msg.article_id
      },
      header: app.header,
      success: (e) => {
        console.log()
        var tips = ''
        if (e.data.status == '500') {
          tips = '网络异常'
        } else if (e.data.status == '200' || e.data.status == '2000') {
          tips = '开始下载'
          if (that.data.download_plan != '进行中') {
            that.getimage()
          } else {
            wx.showToast({
              title: '下载正在进行，请勿重复操作',
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          }
          if(e.data.status == '2000'){
            that.tips_animate()
            return false
          }
        }
        wx.showToast({
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      },
      fail: () => {}
    });
  },

  getimage: function (e) {
    var that = this;
    var download_img = []
    var img = that.data.img
    for (var i in img) {
      if (img[i].check) {
        download_img.push(img[i])
        img[i].check = false
      }
    }
    that.data.img_length = download_img.length;
    this.setData({
      img: img,
      check_num: 0,
      all_check: false
    })
    for (var i in download_img) {
      wx.getImageInfo({
        src: download_img[i].url,
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

  // 提示框动画
  tips_animate: function () {
    this.setData({
      tips_show: true
    })
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translate('-50%', '-50%').step();
    this.setData({
      tips_animate: animate.export()
    })
  },

  // 关闭提示框动画
  clear_tips_animate: function () {
    var that = this;
    this.setData({
      tips_show: true
    })
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translate('-50%', '300%').step();
    this.setData({
      tips_animate: animate.export()
    })
    setTimeout(function () {
      that.setData({
        tips_show: false
      })
    },200)
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