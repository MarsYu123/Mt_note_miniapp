// pages/photo/photo.js

const app = getApp()
const module_login = require('../../utils/login.js');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    load: false,
    is_getuser: false,
    user_info: {},
    nav: ['原图', '裁剪过'],
    class: 0,
    img: { //最终呈现在图库的图片
      left: [],
      right: []
    }, //瀑布流图片组
    new_img: [], //存储在暂缓区用户获取图片信息的图片组
    img_load: false, //该图片是否加载完毕，用于方式每次刷新加载图片顺序不同
    all_img: [], //所有图片组
    img_index: 0, //当前加载图片下标
    page: 0, //加载更多页码
    material_page: 0, //材料加载更多页码
    l_height: 0, //瀑布流左边高度
    r_height: 0, //瀑布流右边高度
    async: true, //同步
    animate: {}, //动画
    is_check: 'open_img',
    open_img: {
      baseWidth: '',
      baseHeight: '',
      scaleWidth: '',
      scaleHeight: '',
      dis: '',
      src: '',
      scale: 1
    }, // 放大图片url
    mova: {
      scale: 2
    }, //放大图片参数
    is_open_img: false, //是否放大图片
    type: 1, //图片类型
    label_checked: '121', // 筛选标签id
  },

  // 登陆后获取信息
  login_success: function () {
    this.setData({
      is_getuser: true,
      user_info: app.open_user,
    })
    this.checked_img()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    if (app.open_user.uid != undefined) {
      module_login.userlogin(this);
    }
  },

  // 首次登陆
  getUserInfo: function (e) {
    console.log(e.target.dataset.type)
    var type = e.target.dataset.type;
    this.data.getuser_type = type
    module_login.get_user_info(this, e);
  },

  // 导航切换
  nav_click: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      class: index,
      type: index+1
    })
    this.checked_img()
  },


  // 判断图片尺寸
  img_load: function (e) {
      var height = e.detail.height; //新图片高度
      var img = this.data.img; //将要放入图库的图片
      var index = e.currentTarget.dataset.index; //新图片标识
      var all_img = this.data.all_img //所有图片
      var l_height = this.data.l_height; //左侧视图高度
      var r_height = this.data.r_height; //右侧视图高度

      /* ===============================================
      如果左侧视图低于右侧视图，则将图片放入左侧，否则将放入右侧，
      实现瀑布流的参差不齐，并且更新对应视图新高度
       */
      if (l_height <= r_height) {
        l_height += height
        img.left.push(all_img[index]);
      } else {
        r_height += height
        img.right.push(all_img[index]);
      }

      // 更新左右视图高度
      this.data.l_height = l_height;
      this.data.r_height = r_height

      this.setData({
        img: img
      })

      // 更新下张图片坐标
      this.data.img_index++
      console.log(this.data.img_index)
      // 获取下张图片
      this.ajax_img()

  },

  // 获取下张图片
  ajax_img: function () {
    var img_list = this.data.all_img
    var new_img = []
    var index = this.data.img_index
    console.log(index < img_list.length - 1)
    if (index < img_list.length) {
      img_list[index].index = index
      new_img.push(img_list[index])
      this.setData({
        new_img: new_img
      })
      console.log(new_img)
    }
  },

  // 关闭选择标签
  clear_label: function (e) {
    var type = e.target.dataset.type;
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });

    animate.translateY("100%").step();
    this.setData({
      animate: animate.export()
    })
    var that = this;
    setTimeout(function () {
      that.setData({
        label_show: false
      })
    }, 100)
    if (type == "enter") {
      this.checked_img(this.data.label_checked)
    }
  },

  //打开选择标签
  screen: function () {
    this.setData({
      label_show: true
    })
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translateY("0").step();
    this.setData({
      animate: animate.export()
    })
  },


  // 放大图片
  open_img: function (e) {
    console.log(e)
    var url = e.currentTarget.dataset.url;
    var open_img_url = 'open_img.url'
    this.setData({
      is_open_img: true,
      [open_img_url]: url
    })
  },

  // 放大图片的load
  open_img_load: function (e) {
    var win_width = app.system.windowWidth;
    var win_height = app.system.windowHeight;
    var img_width = e.detail.width;
    var img_height = e.detail.height;
    var img_ratio = img_width / img_height


    var open_img = this.data.open_img;

    if (win_width / img_ratio < app.system.windowHeight) {
      open_img.baseWidth = win_width;
      open_img.baseHeight = win_width / img_ratio
    } else {
      open_img.baseHeight = win_height;
      open_img.baseWidth = win_height * img_ratio
    }
    open_img.scaleWidth = win_width * 0.8;
    open_img.scaleHeight = e.detail.heigh;
    var y = (win_height - open_img.baseHeight) / 2
    this.setData({
      open_img: open_img,
      ['mova.y']: y
    })
  },
  // 关闭缩放
  open_img_claer: function () {
    var that = this;
    this.setData({
      is_open_img: false
    })
  },

  checked_img: function () {
    //获取图库内容
    var that = this;
    var img = {
      left: [],
      right: []
    }
    that.data.page = 0
    that.setData({
      img: img,
      new_img: [],
      all_img: [],
      img_index: 0,
      l_height:0,
      r_height:0
    })
    wx.request({
      url: app.url.myAlbum,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        type: that.data.type
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var all_img = e.data.data;
        if (all_img.length > 0) {
          for (var i in all_img) {
            all_img[i].check = false;
            all_img[i].index = i
          }
          that.setData({
            // img_host: app.img_host,
            all_img: all_img,
          })
          that.ajax_img()
        }
      },
      fail: (e) => {
        wx.showToast({
          title: "网络异常，请稍后重试",
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      }
    });
  },

  
   // 加载更多图片
   load_photo: function () {

    console.log('加载')
    var that = this;
    var page = that.data.page;
    page++;
    if (that.data.async) {
      that.data.async = false
      wx.request({
        url: app.url.myAlbumMore,
        method: 'POST',
        data: {
          uid: app.open_user.uid,
          type: that.data.type,
          page: that.data.page
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          var data = e.data.data;
          for (var i in data) {
            data[i].check = false;
            data[i].index = i
          }
          if (data.length > 0) {
            that.data.page = page
            that.data.all_img = that.data.all_img.concat(data)
            that.ajax_img()
            that.data.async = true
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
    this.data.load = true
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.load) {
      console.log("s")
      if (app.open_user.uid != undefined) {
        this.checked_img()
      }
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