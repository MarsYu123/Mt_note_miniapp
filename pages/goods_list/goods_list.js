// pages/goods_list/goods_list.js

const app = getApp()
const module_login = require('../../utils/login.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goods_index: 0,
    material_page: 0, //材料加载更多页码
    async: true, //同步
    materials: {}, //材料内容
    materials_kind_id: 'all', //材料分类id
    item_id: '' //定位navid
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.open_user.uid == undefined) {
      module_login.userlogin(this);
    }
    var label = ''
    if (app.goods_list_nav == 0) {
      label = 'all'
    } else {
      label = app.goods_list_nav
    }
    that.setData({
      materials_kind_id: label,
      goods_index: app.goods_list_nav
    })
    that.materials()
  },

  // 材料加载
  materials: function () {
    var that = this;
    wx.request({
      url: app.url.materialArea,
      method: 'POST',
      data: {
        material_kind_id: that.data.materials_kind_id
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          materials: e.data.data
        })
      },
      fail: () => {}
    });
  },

  // 商品导航
  goods_nav_click: function (e) {
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    this.setData({
      goods_index: index,
      materials_kind_id: id,
      material_page: 0
    })
    this.materials()
  },

  // 跳转到商品详情页
  nav_goods: function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../goods/goods?id=' + id
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    that.data.load = true;
    setTimeout(function () {
      that.setData({
        item_id: app.goods_list_nav,
      })
    }, 300)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('aa')
    console.log(app.goods_list_nav)
    var that = this;
    if (that.data.load) {
      var label = ''
      if (app.goods_list_nav == 0) {
        label = 'all'
      } else {
        label = app.goods_list_nav
      }
      that.setData({
        materials_kind_id: label,
        goods_index: app.goods_list_nav
      })
      setTimeout(function () {
        that.setData({
          item_id: app.goods_list_nav,
        })
      }, 300)
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