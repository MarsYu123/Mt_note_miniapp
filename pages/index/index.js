//index.js
//获取应用实例
const app = getApp()
const module_login = require('../../utils/login.js');

Page({
  data: {
    profile: 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png',
    all_label: [], //所有标签
    is_getuser: false, //是否获取用户权限
    user_info: {}, //用户详细信息
    load: false, //是否已加载
    nav_index: 0, //导航栏位置
    nav: ['下载记录', '图库'], //导航栏
    label_nav: [{
      key: 'space',
      name: '空间场景'
    }, {
      key: 'style',
      name: '风格'
    }, {
      key: 'texture',
      name: '材质'
    }, {
      key: 'soft',
      name: '软装'
    }, {
      key: 'other',
      name: '其他'
    }],
    img: { //最终呈现在图库的图片
      left: [],
      right: []
    }, //瀑布流图片组
    new_img: [], //存储在暂缓区用户获取图片信息的图片组
    img_load: false, //该图片是否加载完毕，用于方式每次刷新加载图片顺序不同
    all_img: [], //所有图片组
    img_index: 0, //当前加载图片下标
    page: 0, //加载更多页码
    img_host: '', //图片加速域名
    l_height: 0, //瀑布流左边高度
    r_height: 0, //瀑布流右边高度
    async: true, //同步
    animate: {}, //动画
    is_check: false, //是否打开筛选
    download_img: [], //下载图片地址
    download_index: 0, //目前下载下标
    fail_img: [], //下载失败的下标
    opensetting: false, //图片保存权限
    box_link: false, //链接box是否显示
    link_cont: '', //复制的链接内容
    getuser_type: '', //未授权时点击记录文章或前往下载后自动操作
    history_cont: {}, //下载历史文章记录
    label_checked: '121', // 筛选标签id
    open_img: {
      baseWidth: '',
      baseHeight: '',
      scaleWidth: '',
      scaleHeight: '',
      dis: '',
      src: '',
      scale: 1
    }, // 放大图片url
    is_open_img: false, //是否放大图片
    download_plan: '未开始',
    sign_in_status: false,
    tips: {
      title: '签到成功',
      num: '5'
    },
    tips_show: false,
    tips_animate: {}, //提示框动画
    label_show: false,
    banner: [], //首页轮播banner
    banner_height: 150
  },

  // 登陆后获取信息
  login_success: function () {
    var everyday_sign = false
    if (app.open_user.everyday_sign == 1) {
      everyday_sign = true
    } else {
      everyday_sign = false
    }
    this.setData({
      is_getuser: true,
      user_info: app.open_user,
      profile: app.profile,
      sign_in_status: everyday_sign
    })
    this.download_history()
    if (this.data.getuser_type == 1 || this.data.getuser_type == 2) {
      this.link_add(this.data.getuser_type)
      this.data.getuser_type = ''
    }
  },

  //导航
  nav_click: function (e) {
    var id = e.currentTarget.dataset.id;
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

  // 关闭链接窗口
  clear_link: function () {
    this.setData({
      box_link: false,
      link_cont: ''
    })
  },

  // 获取链接内容
  link_change: function (e) {
    var val = e.detail.value;
    this.setData({
      link_cont: val
    })
  },

  // 记录文章
  record_article: function () {
    if (JSON.stringify(app.open_user.note_openid) != '') {
      this.link_add(1)
      this.setData({
        box_link: false,
        link_cont: ''
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您暂未注册，请注册后使用',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login'
            });
          }
        }
      });
    }
  },

  // 前往下载
  dowload_article: function () {
    if (JSON.stringify(app.open_user.note_openid) != '') {
      this.link_add(2)
      this.setData({
        box_link: false,
        link_cont: ''
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您暂未注册，请注册后使用',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: res => {
          if (res.confirm) {
            wx.navigateTo({
              url: '../login/login'
            });
          }
        }
      });
    }
  },

  // 链接采集

  link_add: function (type) {
    var that = this;
    var url = that.data.link_cont
    if (module_login.remove_space(this.data.link_cont) == '') {
      wx.showToast({
        title: '请勿输入空字符',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    } else {
      wx.request({
        url: app.url.addUrl,
        method: 'POST',
        data: {
          url: url,
          uid: app.open_user.uid,
          download_kind: type
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          var status = e.data.status;
          var content = ''
          if (status == '444') {
            content = "非会员一天只能下载一次"
          } else if (status == '500' || status == '502' || status == '505') {
            content = "网络故障，请稍后重试"
          } else if (status == '402') {
            content = "只接收微信文章链接"
          } else if (status == '555') {
            content = "您不是VIP用户"
          } else if (status == '401') {
            content = "您已添加过此文章，请关闭窗口"
          } else if (status == '200') {
            that.setData({
              box_link: false,
              link_cont: ''
            })
            if (type == 1) {
              that.download_history()
              that.setData({
                box_link: false,
              })
            } else if (type == 2) {
              app.article_msg.url = url;
              wx.navigateTo({
                url: '../article/article?article_id=' + e.data.data.article_id
              });
            }
          }
          if (content != '') {
            wx.showToast({
              title: content,
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          }
        },
        fail: () => {}
      });
    }
  },



  // 下载记录获取
  download_history: function () {
    console.log(new Date())
    var that = this;
    wx.request({
      url: app.url.downloadHistory,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e.data.data)
        that.setData({
          history_cont: e.data.data
        })
      },
      fail: () => {}
    });
  },

  // 点击进入详情页
  nva_article: function (e) {
    var id = e.currentTarget.dataset.article
    wx.navigateTo({
      url: '../article/article?article_id=' + id
    });
  },


  // 新建下载
  new_donload: function () {
    var cont = ''
    wx.getClipboardData({
      success: res => {
        if (res.data != '') {
          if (res.data.indexOf('mp.weixin.qq.com') != -1) {
            cont = res.data
          }
        }
        this.setData({
          link_cont: cont,
          box_link: true
        })
      }
    });
  },


  // 判断图片尺寸
  img_load: function (e) {
    if (e.target.id != '') {
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
    }

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
          label_id: that.data.label_checked
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          console.log(page)
          var data = e.data.data.pictures;
          for (var i in data) {
            data[i].check = false
          }
          if (data.length > 0) {
            that.data.page = page
            this.data.all_img = this.data.all_img.concat(data)
            this.ajax_img()
            that.data.async = true
          }
        },
        fail: () => {}
      });
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

  // 提示框动画
  tips_animate: function () {
    var that = this;
    this.setData({
      tips_show: true
    })
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translate('-50%', '-50%').step();
    this.setData({
      tips_animate: animate.export()
    })
    setTimeout(function () {
      animate.translate('-50%', '300%').step();
      that.setData({
        tips_animate: animate.export()
      })
      setTimeout(function () {
        that.setData({
          tips_show: false
        })
      }, 200)
    }, 1200)
  },

  // 关闭提示框动画
  clear_tips_animate: function () {
    var that = this;
    this.setData({
      tips_show: true
    })
    var animate = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translate('-50%', '300%').step();
    this.setData({
      tips_animate: animate.export()
    })
    setTimeout(function () {
      that.setData({
        tips_show: false
      })
    }, 200)
  },

  // 选择下载
  download_check: function () {
    this.setData({
      is_check: true
    })
  },
  // 取消下载
  esc_check: function () {
    var img = this.data.img;
    for (var i in img) {
      for (var j in img[i]) {
        img[i][j].check = false
      }
    }
    this.setData({
      is_check: false,
      img: img,
    })
  },

  // 放大图片
  open_img: function (e) {
    console.log(e)
    var url = this.data.img_host + e.currentTarget.dataset.url;
    var open_img_url = 'open_img.url'
    this.setData({
      is_open_img: true,
      [open_img_url]: url
    })
  },

  // 放大图片的load
  open_img_load: function (e) {
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
    var that = this;
    this.setData({
      is_open_img: false
    })
  },
  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '看点笔记',
    });
    console.log(options.article_id)
    if (options.type == 'right_share') {
      wx.navigateTo({
        url: '../article/article?article_id=' + options.article_id
      });
    }

    wx.request({
      url: app.url.noteBanner,
      method: 'POST',
      data: {},
      header: app.header,
      success: (e) => {
        console.log(e)
        that.setData({
          banner: e.data.data
        })
      },
      fail: () => {}
    });



    // 若已授权，则自动登录
    module_login.userlogin(this);
    // 获取剪切板
    wx.getClipboardData({
      success: res => {
        if (res.data != '') {
          if (res.data.indexOf('mp.weixin.qq.com') != -1) {
            console.log(res.data.indexOf('mp.weixin.qq.com'))
            this.setData({
              link_cont: res.data,
              box_link: true
            })
          }
        }
      }
    });

    this.checked_img()
    // 获取图库标签
    wx.request({
      url: app.url.getLabels,
      method: 'POSt',
      data: {},
      header: app.header,
      success: (e) => {
        console.log(e)
        var all_label = e.data.data;
        that.setData({
          all_label: all_label
        })
      },
      fail: () => {
        wx.showToast({
          title: "网络异常，请稍后重试",
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      }
    });
  },

  // 标签筛选
  label_checked: function (e) {
    var id = e.target.dataset.id;
    console.log(id)
    this.setData({
      label_checked: id
    })
  },

  checked_img: function () {
    //获取图库内容
    var that = this;
    console.log(that.data.label_checked)
    var img = {
      left: [],
      right: []
    }
    that.data.page = 0
    that.setData({
      img: img,
      new_img: [],
      all_img: [],
      img_index: 0
    })
    wx.request({
      url: app.url.pictureHome,
      method: 'POST',
      data: {
        uid: this.data.user_info.uid,
        label_id: that.data.label_checked
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var all_img = e.data.data.pictures;
        if (all_img.length > 0) {
          for (var i in all_img) {
            all_img[i].check = false
          }
          that.setData({
            img_host: app.img_host,
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

  // 选择下载图片
  check_img: function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var download_img = this.data.download_img;
    var all_img = this.data.img;
    var direction = e.currentTarget.dataset.direction;
    var one_img_l = 'img.left[' + index + '].check';
    var one_img_r = 'img.right[' + index + '].check';
    var is_repeat = false;
    var img_url = e.currentTarget.dataset.url;
    var label_id = e.currentTarget.dataset.labelid;
    if (direction == 'left') {
      all_img.left[index].check = !all_img.left[index].check
      this.setData({
        [one_img_l]: all_img.left[index].check
      })
    } else {
      all_img.right[index].check = !all_img.right[index].check
      this.setData({
        [one_img_r]: all_img.right[index].check
      })
    }
    if (download_img.length > 0) {
      for (var i in download_img) {
        if (download_img[i].picture_id == id) {
          download_img.splice(i, 1)
          is_repeat = true;
        }
      }
      if (!is_repeat) {
        download_img.push({
          picture_id: id,
          img_url: img_url,
          label_id: label_id
        });
      }
    } else {
      download_img.push({
        picture_id: id,
        img_url: img_url,
        label_id: label_id
      });
    }
    this.setData({
      download_img: download_img,
    })
  },

  // 下载图片
  download_pic: function () {
    var download_img = this.data.download_img
    var that = this;
    var photo = 'scope.writePhotosAlbum'
    var img_url = [],
      picture_id = [];
    // 获取授权信息，查看是否已授权保存相册
    if (download_img.length > 0) {

      for (var i in download_img) {
        img_url.push(that.data.img_host + download_img[i].img_url)
        picture_id.push(download_img[i].picture_id)
      }


      wx.getSetting({
        success: res => {
          that.setData({
            download_plan: '未开始'
          })
          // 已授权
          if (res.authSetting[photo]) {
            that.request_down(img_url, picture_id, download_img)
          } else {
            // 未授权
            if (res.authSetting[photo] === false) {
              that.setData({
                opensetting: true,
                download_plan: '未开始'
              })
              wx.showToast({
                title: "由于您之前拒绝授权访问相册，请重新授权",
                icon: 'none',
                duration: 1500,
                mask: false,
              });
            } else {
              // 初次授权
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: res => {
                  that.request_down(img_url, picture_id, download_img)
                  console.log(img_url)
                },
              });
            }
          }
        }
      })

    } else {
      wx.showToast({
        title: '请选择图片',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
  },


  // 请求是否可下载
  request_down: function (img, picture_id, download_img) {
    var that = this;
    console.log(img)
    var img_url = img;
    wx.request({
      url: app.url.downloadPics,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        label_id: that.data.label_checked,
        img_url: img_url.join('|'),
        picture_id: picture_id.join('_'),
        download_count: download_img.length
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var tips = ''
        var type = '0' //0不出现load 1出现 2隐藏
        if (e.data.status == '500') {
          tips = '网络异常'
        } else if (e.data.status == '200') {
          tips = '开始下载'
          type = '1'
          if (that.data.download_plan != '进行中') {
            that.getimage()
          } else {
            wx.showToast({
              title: '下载正在进行，请勿重复操作',
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          }
        } else if (e.data.status == '400') {
          tips = '您不是VIP'
        }
        if (type == '1') {
          wx.showLoading({
            title: tips,
            mask: true,
          });
        } else {
          wx.showToast({
            title: tips,
            icon: 'none',
            duration: 1500,
            mask: false,
          });
        }
      },
      fail: () => {}
    });
  },



  // 开始下载图片
  getimage: function (e) {
    console.log('ss')
    var that = this;
    var download_img = that.data.download_img
    that.esc_check()
    for (var i in download_img) {
      wx.getImageInfo({
        src: "https://www.mati.hk/Public" + download_img[i].img_url,
        success: (e) => {
          console.log(e)
          var path = e.path;
          this.saveimaeg(path)
        },
      });
    }
  },

  // 保存图片
  saveimaeg: function (path) {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: (e) => {
        console.log(e)
        that.data.download_index++
        that.plan_status()
      },
      fail: () => {
        that.data.download_index++
        that.data.fail_img.push(that.data.download_index)
        that.plan_status()
      }
    });

  },
  // 统计下载状态
  plan_status: function () {
    var that = this;
    if (that.data.download_index == that.data.download_img.length && that.data.download_img.length != 0) {
      that.setData({
        download_plan: '结束',
        download_index: 0,
        download_img: []
      })
      wx.hideLoading();
      wx.showToast({
        title: '图片全部下载完毕',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
  },

  // 首次登陆
  getUserInfo: function (e) {
    console.log(e.target.dataset.type)
    var type = e.target.dataset.type;
    this.data.getuser_type = type
    module_login.get_user_info(this, e);
  },

  // 个人中心
  nav_user: function () {
    wx.navigateTo({
      url: "../user/user"
    });
  },

  // 签到
  sign_in: function () {
    var that = this;
    wx.request({
      url: app.url.dailySign,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var tips = ''
        var status = e.data.status;
        if (status == '505' || status == '500' || status == '502') {
          tips = '网络异常，请稍后重试'
        } else if (status == '400') {
          tips = '您今日已经签到'
        } else if (status == '200') {
          var tips = 'tips.num'
          that.setData({
            sign_in_status: true,
            [tips]: e.data.data
          })
          that.tips_animate()
          return false
        }
        wx.showToast({
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      },
      fail: () => {
        wx.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      }
    });
  },

  onShow: function () {
    // 更新用户信息
    if (this.data.load) {
      module_login.userlogin(this);
      this.download_history()
    }
  },
  onReady: function () {
    this.setData({
      load: true
    })
  },

  // banner自适应
  banner_load:function (e) {
    console.log(e)
    this.setData({
      banner_height: e.detail.height/2
    })
  }

})