// pages/my_brand/my_brand.js
var app = getApp();
var module_login = require("../../utils/login")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: {},
    setting_show: false,
    user_site: {},
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.open_user.uid == undefined) {
      module_login.userlogin(this);
    }
    wx.request({
      url: app.url.mySupplier,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          msg: e.data.data
        })

        wx.getSetting({
          success: e => {
            console.log(e)
            if (!e.authSetting['scope.userLocation']) {
              that.setData({
                setting_show: true
              })
            } else {
              that.setData({
                setting_show: false
              })
            }
          }
        })
        wx.getLocation({
          type: 'wgs84',
          success(res) {
            var site = {
              lat: res.latitude,
              lng: res.longitude
            }
            for (var i in that.data.msg) {
              that.data.msg[i].site =
                that.getDisance(site.lat, site.lng, that.data.msg[i].address_latitude, that.data.msg[i].address_longitude)
            }
            that.setData({
              setting_show: false,
              msg: that.data.msg
            })
          }
        })
      },
      fail: () => {}
    });
  },

  openSetting(e) { //跳转授权设置之后的回调
    var that = this;
    if (e.detail.authSetting['scope.userLocation']) { //此处同上同理
      wx.getLocation({
        type: 'wgs84',
        success(res) {
          console.log(res)
          var site = {
            lat: res.latitude,
            lng: res.longitude
          }
          for (var i in that.data.msg) {
            that.data.msg[i].site =
              that.getDisance(site.lat, site.lng, that.data.msg[i].address_latitude, that.data.msg[i].address_longitude)
          }
          that.setData({
            setting_show: false,
            msg: that.data.msg
          })
        }
      })
    }
  },

  // set_site:function () {

  // },

  // 拨打电话
  call: function (e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      success: () => {}
    });
  },

  // 跳转到供应商
  nav_brand: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../brand/brand?id=' + id
    });
  },


  toRad: function (d) {
    return d * Math.PI / 180;
  },
  getDisance: function (lat1, lng1, lat2, lng2) {
    // lat为纬度,lng为经度
    var dis = 0;
    var radLat1 = this.toRad(lat1);
    var radLat2 = this.toRad(lat2);
    var deltaLat = radLat1 - radLat2;
    var deltaLng = this.toRad(lng1) - this.toRad(lng2);
    var dis = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(deltaLng / 2), 2)));
    return parseInt(dis * 6378137 / 1000);
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