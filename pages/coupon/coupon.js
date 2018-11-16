// pages/coupon/coupon.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav: ['我的卡券', '使用记录'],
    class: 0,
    coupon_msg: [], //卡券内容
    use_list: [] //使用记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.rquest_msg(1)
    this.rquest_msg(2)
  },

  // 获取内容
  rquest_msg: function (type) {
    var that = this;
    wx.request({
      url: app.url.myCoupon,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        area: type
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        if (type == 1) {
          that.setData({
            coupon_msg: e.data.data
          })
        } else {
          that.setData({
            use_list: e.data.data
          })
        }
      },
      fail: () => {}
    });
  },

  // 导航切换
  nav_click: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      class: id
    })
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
    return {
      title: '微信文章图片一键下载神器',
      path:'/pages/index/index'
    }
  }
})