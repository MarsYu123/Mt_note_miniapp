//index.js
//获取应用实例
const app = getApp()
const module_login = require('../../utils/login.js');

Page({
  data: {
    is_getuser: false, //是否获取用户权限
    user_info: {}, //用户详细信息
    load: false, //是否已加载
    nav_index: 1, //导航栏位置
    nav: ['下载记录', '图库'], //导航栏
    img: {                      //最终呈现在图库的图片
      left: [],
      right: []
    }, //瀑布流图片组
    new_img: [], //存储在暂缓区用户获取图片信息的图片组
    img_load: false, //该图片是否加载完毕，用于方式每次刷新加载图片顺序不同
    all_img: [], //所有图片组
    img_index: 0, //当前加载图片下标
    page: 0, //加载更多页码
    img_host: '',
    l_height: 0,
    r_height: 0,
    async: true
  },

  // 登陆后获取信息
  login_success: function () {
    this.setData({
      is_getuser: true,
      user_info: app.open_user
    })
  },

  //导航
  nav_click: function (e) {
    var id = e.currentTarget.id;
    this.setData({
      nav_index: id
    });
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  // 判断图片尺寸
  img_load: function (e) {
    var height = e.detail.height; //新图片高度
    var img = this.data.img;       //将要放入图库的图片
    var index = e.currentTarget.dataset.index; //新图片标识
    var all_img = this.data.all_img //所有图片
    var l_height = this.data.l_height;   //左侧视图高度
    var r_height = this.data.r_height;   //右侧视图高度

    /* ===============================================
    如果左侧视图低于右侧视图，则将图片放入左侧，否则将放入右侧，
    实现瀑布流的参差不齐，并且更新对应视图新高度
     */

    if (l_height < r_height) {
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

    // 获取下张图片
    this.ajax_img()
  },

  // 获取下张图片
  ajax_img: function () {
    var img_list = this.data.all_img
    var new_img = []
    var index = this.data.img_index

    if (!(index > img_list.length - 1)) {
      img_list[index].index = index
      new_img.push(img_list[index])
      this.setData({
        new_img: new_img
      })
    }

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
        url: app.url.labelPicMore,
        method: 'POST',
        data: {
          page: page,
          label_id: 101
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          var data = e.data.data.pictures;
          if(data.length>0){
           that.data.page = page
           this.data.all_img= this.data.all_img.concat(data)
          this.ajax_img()
          that.data.async = true 
          }
        },
        fail: () => {}
      });
    }


  },
  onLoad: function () {
    // 若已授权，则自动登录
    module_login.userlogin(this);

    var that = this;
    wx.request({
      url: app.url.pictureHome,
      method: 'POST',
      data: {
        uid: this.data.user_info.uid,
        label_id: 101
      },
      header: app.header,
      success: (e) => {
        that.setData({
          img_host: app.img_host,
          all_img: e.data.data.pictures
        })
        that.ajax_img()
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

  getUserInfo: function (e) {
    module_login.get_user_info(this, e);
  },

  // 个人中心
  nav_user:function () {
    wx.navigateTo({
      url: "../user/user"
    });
  },

  onShow: function () {
    // 更新用户信息
    if (this.data.load) {
      module_login.userlogin(this);
    }
  },
  onRead: function () {
    this.data.load = true
  }

})