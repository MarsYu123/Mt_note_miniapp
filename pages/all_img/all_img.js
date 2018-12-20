// pages/all_img/all_img.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img:[],
    open_img: {
      baseWidth: '',
      baseHeight: '',
      scaleWidth: '',
      scaleHeight: '',
      dis: '',
      url: '',
      scale: 1
    }, // 放大图片url
    is_open_img:false,
    is_vip:false,
    load:false,
    article_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    that.data.article_id = options.article_id
    wx.setNavigationBarTitle({
      title: '查看全部',
    });
    that.up_data(options);
    that.setData({
      load: true
    })
  },

  // 拉取数据
  up_data: function () {
    var that = this;
    wx.request({
      url: app.url.showAllimage,
      method: 'POST',
      data: {
        article_id: that.data.article_id,
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        that.setData({
          img:e.data.data,
          is_vip: app.open_user.is_vip
        })
      },
      fail: ()=>{}
    });
  },

  // 放大图片
  open_img: function (e) {
    console.log(e)
    var url = e.target.dataset.url;
    var open_img_url = 'open_img.url'
    this.setData({
      is_open_img: true,
      [open_img_url]:url,
    })
  },

  // 放大图片的load
  open_img_load: function (e) {
    console.log(e)
    var win_width = app.system.windowWidth;
    console.log(app.system.windowWidth)
    console.log(e.detail.width)
    var open_img = this.data.open_img;
    open_img.baseWidth = win_width * 0.8;
    open_img.baseHeight = e.detail.height;
    open_img.scaleWidth = win_width * 0.8;
    open_img.scaleHeight = e.detail.heigh;
    this.setData({
      open_img: open_img
    })
  },

  // 手指触摸
  touch_start: function (e) {
    console.log(e.touches)
    if (e.touches.length > 1) {
      var x_dis = Math.abs(e.touches[1].clientX - e.touches[0].clientX);
      var y_dis = Math.abs(e.touches[1].clientY - e.touches[0].clientY);
      var dis = Math.sqrt(x_dis * x_dis + y_dis * y_dis);
      this.setData({
        'open_img.dis': dis
      })
    }
  },

  // 手指移动
  touch_move: function (e) {
    var open_img = this.data.open_img
    var old_dis = open_img.dis
    if (e.touches.length > 1) {
      var x_dis = e.touches[1].clientX - e.touches[0].clientX;
      var y_dis = e.touches[1].clientY - e.touches[0].clientY;
      var dis = Math.sqrt(x_dis * x_dis + y_dis * y_dis);
      var dis_differ = dis - old_dis
      var new_scale = open_img.scale + 0.001 * dis_differ;

      if (new_scale >= 2) {
        new_scale = 2
      } else if (new_scale <= 1) {
        new_scale = 1
      }

      var new_width = new_scale * open_img.baseWidth;
      var new_height = new_scale * open_img.baseHeight;
      open_img.scaleWidth = new_width;
      open_img.scaleHeight = new_height
      open_img.scale = new_scale
      this.setData({
        open_img: open_img
      })
    }
  },

  // 关闭缩放
  open_img_claer: function () {
    var open_img = {
      baseWidth: '',
      baseHeight: '',
      scaleWidth: '',
      scaleHeight: '',
      dis: '',
      url: '',
      scale: 1
    }
    this.setData({
      is_open_img: false,
      open_img: open_img
    })
  },

  // 识别图片
  up_img:function (e) {
    var img_id = e.target.dataset.imgid;
    wx.showLoading({
      title: '识别中，请等待',
      mask: true,
    });
    wx.request({
      url: app.url.searchImages,
      method: 'POST',
      data: {
        article_img_id: img_id,
        flag: 11
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        wx.hideLoading();
        var data = e.data.data;
        var tips = '';
        if (e.data.status == 200) {
          if( (data.keyword_info.length > 0) || (JSON.stringify(data.keyword_info) != '{}')){
            app.duration = data;
            wx.navigateTo({
              url: '../discern_img/discern_img'
            });
            return false
          }else{
            tips = '未匹配到结果'
          }
        
        } else if (e.data.status == 403) {
          tips = '非法请求'
        } else if (e.data.status == 502) {
          tips = '图片为空'
        } else if (e.data.status == 202) {
          tips = '未匹配到结果'
        } else if (e.data.status == 500) {
          tips = '网络异常，请稍后重试'
        }
        
        wx.showToast({
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      },
      fail: ()=>{}
    });
  },

  // 已识别图片跳转
  nav_discern:function (e) {
    var index = e.target.dataset.index;

    app.duration = this.data.img[index];
    wx.navigateTo({
      url: '../discern_img/discern_img'
    });
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
    if(this.data.load){
      this.up_data()
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