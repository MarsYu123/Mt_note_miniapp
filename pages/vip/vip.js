// pages/vip/vip.js
var app = getApp();
var pay = require('../../utils/login')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    class: 0,
    nav: ['VIP激活与续费', '订单记录'],
    check_id: 2, //购买商品kind
    load: false,
    user_msg: [], //用户信息
    profile: 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png', //头像
    vip_msg: [], //vip信息
    ticket: {
      user_coupon_id: '',
      eq_price: ''
    }, //使用票券信息
    load: false,
    eq_price: '', //优惠金额
    money: '', // 金额
    old_money: 0, //实际金额
    kind: '',  //优惠券kind
    order: []  //订单记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user_msg: app.open_user,
      profile: app.profile,
    })
    this.vip_msg();
    this.orderList()
  },

  // 导航切换
  nav: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      class: id,
    })
  },

  // vip_购买内容
  vip_msg: function () {
    var that = this;
    wx.request({
      url: app.url.payHome,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          vip_msg: e.data.data,
          money: e.data.data.month_vip_price,
          old_money: e.data.data.month_vip_price,
        })
      },
      fail: () => {}
    });
  },

  //订单记录
  orderList:function () {
    var that = this;
    wx.request({
      url: app.url.orderList,
      method: 'POST',
      data: {
        uid: app.open_user.id
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          order:e.data.data
        })
      },
      fail: ()=>{}
    });
  },


  // 选择金额
  check: function (e) {
    var id = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    if (this.data.ticket.user_coupon_id) {
      if (id != this.data.check_id) {
        wx.showToast({
          title: '请选择对应优惠券',
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      }
    }
    var ticket = {
      user_coupon_id: '',
      eq_price: ''
    }
    this.setData({
      check_id: id,
      money: money,
      old_money: money,
      eq_price: 0,
      ticket: ticket,
      kind: id
    })
  },

  // 跳转到卡券页面
  ticket: function () {
    wx.navigateTo({
      url: '../ticket/ticket?vip_kind=' + this.data.check_id + '&user_coupon_id=' + this.data.ticket.user_coupon_id + "&old_money=" + this.data.old_money
    });
  },


  // 支付卡券
  pay_submit: function () {
    var that = this;
    wx.request({
      url: app.url.notePay,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        open_id: app.open_user.note_openid,
        total_fee: that.data.money,
        user_coupon_id: that.data.ticket.user_coupon_id,
        vip_kind: that.data.check_id,
        coupon_kind: that.data.kind
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var status = e.data.status;
        var tips = '';
        if (status == 500 || status == 503 || status == 504 || status == 403) {
          tips = '网络异常，请稍后重试'
        } else if (status == 404) {
          tips = '无效的优惠码'
        } else if (status == 402) {
          tips = '代金券和会员种类不匹配'
        } else if (status == 200) {
          tips = '支付成功'
          wx.showToast({
            title: tips,
            icon: 'success',
            duration: 2000,
            mask: true,
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });
          },2000)
          return false
        } else {
          pay.pay(e.data, that)
          return false
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.data.load = true
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.load) {
      this.setData({
        user_msg: app.open_user
      })
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