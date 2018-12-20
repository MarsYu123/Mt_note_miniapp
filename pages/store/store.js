// pages/store/store.js
var app = getApp()
const module_login = require('../../utils/login.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    class: 0,
    nav: ['积分商城', '兑换记录'],
    exchange: [],  // 兑换记录
    goods: [], // 积分商品
    point: 0, //积分
    ticket: {}, //使用票券信息
    load: false,
    eq_price: ''  //优惠金额
  },

  // 获取用户数据成功回调
  login_success:function () {
    this.setData({
      point: app.open_user.point
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '积分商城',
    });
    var that = this;
    that.ajax_record()
    this.setData({
      point: app.open_user.point,
    })
    wx.request({
      url: app.url.pointMall,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          goods: e.data.data,
        })
      },
      fail: ()=>{}
    });
  },

  // 获取兑换记录
  ajax_record: function () {
    var that = this;
    wx.request({
      url: app.url.pointExchangeRecord,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          exchange: e.data.data,
        })
      },
      fail: () => {}
    });
  },

  // 导航切换
  nav: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      class: id
    })
  },

  // 积分任务
  nav_integral:function () {
    wx.navigateTo({
      url: '../integral/integral'
    });  
  },

  // 兑换积分
  exchange:function (e) {
    console.log(e)
    var id = e.target.dataset.id;
    var that = this;
    wx.request({
      url: app.url.pointExchange,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        coupon_id: id
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        var tips = ''
        if(e.data.status == '200'){
          tips = '兑换成功';
          module_login.userlogin(that);
          that.ajax_record()
        }else if(e.data.status == '500' || e.data.status == '404'){
          tips = '网络异常，请稍后重试'
        }else if(e.data.status == '403'){
          tips = '积分不足'
        }
        wx.showToast({
          title: tips,
          icon: 'success',
          duration: 1500,
          mask: false,
        });
      },
      fail: ()=>{}
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