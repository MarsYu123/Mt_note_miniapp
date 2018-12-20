// pages/goods/goods.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    material_info:{},  //材料信息
    reply_info:{}, //回复信息
    supplier_info: {
      supplier_profile:'/MiniProgram-note/index/goods_de.png'
    }, //品牌信息
    view_count:'', //视图数
    view_info:{}, //视图信息
    like_arr:{},  //点赞信息
    is_like:false, //是否点赞
    is_vip: false,
    async: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var that = this;
    console.log(app.open_user.uid)
    wx.request({
      url: app.url.materialDetail,
      method: 'POST',
      data: {
        material_id: id,
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        var data = e.data.data;
        that.setData({
          material_info: data.material_info,
          reply_info: data.reply_info,
          supplier_info: data.supplier_info,
          view_count: data.view_count,
          view_info: data.view_info,
        })
      },
      fail: ()=>{}
    });
    var like_arr = this.data.like_arr;
    var key = 'material_' + options.id
    if (wx.getStorageSync('goods_like') != "") {
      like_arr = wx.getStorageSync('goods_like');
    }
    this.setData({
      like_arr: like_arr,
      is_like: like_arr[key] || false,
      is_vip: app.open_user.is_vip || false
    })
  },

  // 点赞
  articleLike: function () {
    var like_arr = this.data.like_arr;
    console.log(JSON.stringify(wx.getStorageSync('goods_like')))

    var that = this;
    var type = 'yes';
    var id = that.data.material_info.material_id;
    var key = 'material_' + id;
    var like_num = that.data.material_info.like_count
    if (JSON.stringify(like_arr) != "{}") {
      if (like_arr[key]) {
        type = 'no'
      }
    }
    if (that.data.async) {
      that.data.async = false
      wx.request({
        url: app.url.likeMaterial,
        method: 'POST',
        data: {
          material_id: id,
          code: type
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          that.data.async = true;
          if (e.data.status == 200) {
            if (type == 'yes') {
              console.log(typeof like_arr)
              like_arr[key] = true;
              like_num++;
            } else {
              like_arr[key] = false;
              like_num--
            }
            wx.setStorageSync('goods_like', like_arr);
            var like_count = 'material_info.like_count'
            that.setData({
              like_arr: like_arr,
              is_like: like_arr[key],
              [like_count]: like_num
            })
          }
        },
        fail: () => {}
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