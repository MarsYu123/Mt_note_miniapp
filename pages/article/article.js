// pages/article/article.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article_id:'', // 文章id
    article_cont: {},  //文章数据
    reply_msg: {}, //获取留言内容
    reply_cont:'', //提交留言内容
    async: true //同步控制
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.article_id;
    var that = this;
    that.data.article_id = id;
    console.log(id)
    wx.request({
      url: app.url.articleDetail,
      method: 'POST',
      data: {
        article_id: id,
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          article_cont: e.data.data
        })
      },
      fail: ()=>{}
    });
    this.getReply()
  },

  //获取留言信息 
  getReply:function () {
    var that = this;
    wx.request({
      url: app.url.getReply,
      method: 'POST',
      data: {
        article_id: that.data.article_id
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          reply_msg:e.data.data.reply
        })
      },
      fail: ()=>{}
    });
  },

  // 记录留言
  input_change:function (e) {
    var val = e.detail.value
    this.setData({
      reply_cont:val
    })
  },

  // 提交留言
  reply_up:function () {
    var that = this;
    if(this.data.async){
      this.data.async = false;
      wx.request({
        url: app.url.articleReply,
        method: 'POST',
        data: {
          uid: app.open_user.uid,
          article_id: that.data.article_id,
          reply_content: that.data.reply_cont
        },
        header: app.header,
        success: (e)=>{
          console.log(e)
          var status = e.data.data.status;
          this.data.async = true
          if(status == '200'){
            wx.showToast({
              title: '留言成功',
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          }else if(status == '500' || status == '504'){
            wx.showToast({
              title: '网络异常，请稍后重试',
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          }
        },
        fail: ()=>{
          wx.showToast({
            title: '网络异常，请稍后重试',
            icon: 'none',
            duration: 1500,
            mask: false,
          });
          this.data.async = true
        }
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