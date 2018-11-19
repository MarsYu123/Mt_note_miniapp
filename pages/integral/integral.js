// pages/integral/integral.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nav:['做任务','积分记录'],
    class:0,
    task_more_class:[false,false],
    more_state:[false,false],
    user_msg:{},
    load: false,
    profile: 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png',
    task: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '积分任务',
    });
    var that = this;
    wx.request({
      url: app.url.pointTask,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          task: e.data.data
        })
      },
      fail: ()=>{}
    });

    this.setData({
      user_msg: app.open_user,
      profile: app.profile
    })
  },

  // 导航切换
  nav_click: function (e) {
    var id = e.currentTarget.dataset.id;
    this.setData({
      class: id
    })
  },
  // 任务切换
  task_more:function (e) {
    var id = e.currentTarget.dataset.id;
    var more_state = this.data.more_state
    var task_more_class = this.data.task_more_class;
    if(id == 'long'){
      task_more_class[0] = !task_more_class[0];
      more_state[0] = !more_state[0]
    }else{
      task_more_class[1] = !task_more_class[1];
      more_state[1] = !more_state[1]
    }
    this.setData({
      more_state:more_state,
      task_more_class:task_more_class
    })
  },
  // 积分商城
  store_nav:function () {
    wx.navigateTo({
      url: '../store/store'
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
    if(this.data.load){
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
    return {
      title: '微信文章图片一键下载神器',
      path:'/pages/index/index'
    }
  }
})