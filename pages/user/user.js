// pages/user/user.js
const app = getApp();
const module_login = require('../../utils/login.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_getuser: false, //是否获取权限
    user_info: {},
    load: false,
    profile: 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png',
    site: ''
  },

  // 登陆后获取信息
  login_success: function () {
    var site = ''
    if (app.open_user.profession == '') {
      if (app.open_user.city == '') {
        if (app.open_user.province == '') {
          site = ''
        } else {
          site = app.open_user.province
        }
      } else {
        site = app.open_user.city
      }
    } else {
      if (app.open_user.city == '') {
        if (app.open_user.province == '') {
          site = app.open_user.profession
        } else {
          site = app.open_user.profession + '-' + app.open_user.province
        }
      } else {
        site = site = app.open_user.profession + '-' + app.open_user.city
      }
    }
    this.setData({
      user_info: app.open_user,
      site: site,
      profile: app.profile,
      is_getuser:true
    })
  },
  // 获取授权后提示
  get_info: function () {
    this.setData({
      is_getuser: true,
      profile: app.profile
    })
  },

  // 跳转下载教程
  nav_help: function () {
    wx.navigateTo({
      url: '../help/help'
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.bind_user) {
      this.login_success()
    } else {
      // 若已授权，则自动登录
      module_login.userlogin(this);
    }
  },

  //未授权提示用户授权，获取用户信息
  getUserInfo_user: function (e) {
    module_login.get_user_info(this, e)
  },
  // 跳转到积分任务
  integral_nav:function () {
    wx.navigateTo({
      url: '../integral/integral'
    });
  },

  // 跳转到编辑资料
  nav_edit: function () {
    wx.navigateTo({
      url: '../user_edit/user_edit'
    });
  },
  
  // 跳转到首页
  nav_index:function () {
    wx.redirectTo({
      url: '../index/index'
    });
  },

  // 跳转到我的vip
  nav_vip:function () {
    wx.navigateTo({
      url: '../vip/vip'
    });
  },

  // 跳转到卡券
  nav_coupon:function () {
    wx.navigateTo({
      url: '../coupon/coupon'
    });
  },

  // 积分商城
  nav_store:function () {
    wx.navigateTo({
      url: '../store/store'
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({
      load: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 更新用户信息
    if (this.data.load) {
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
    return {
      title: '微信文章图片一键下载神器',
      path:'/pages/index/index'
    }
  }
})