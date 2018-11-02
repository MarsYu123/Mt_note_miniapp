// pages/user/user.js
const app = getApp();
const module_login = require('../../utils/login.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_getuser: false,
    user_info: {},
    load:false
  },

  // 登陆后获取信息
  login_success: function () {
    this.data.load = true
    this.setData({
      is_getuser: true,
      user_info: app.open_user
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.bind_user) {
      this.setData({
        is_getuser: true,
        user_info: app.open_user
      })
    } else {
      // 若已授权，则自动登录
      module_login.userlogin(this);
    }
  },

  //未授权提示用户授权，获取用户信息
  getUserInfo_user: e => {
    module_login.get_user_info(this, e)
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
    // 更新用户信息
    if(this.data.load){
      module_login.userlogin(this);
    }
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