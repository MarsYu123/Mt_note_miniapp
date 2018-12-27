//index.js
//获取应用实例
const app = getApp()
const module_login = require('../../utils/login.js');

Page({
  data: {
    profile: 'https://www.mati.hk/Public/MiniProgram-note/user/wx_tx.png',
    is_getuser: false, //是否获取用户权限
    user_info: {}, //用户详细信息
    load: false, //是否已加载
    goods_index:0,
    page: 0, //加载更多页码
    material_page: 0, //材料加载更多页码
    async: true, //同步
    animate: {}, //动画
    box_link: false, //链接box是否显示
    link_cont: '', //复制的链接内容
    getuser_type: '', //未授权时点击记录文章或前往下载后自动操作
    history_cont: {}, //下载历史文章记录
    sign_in_status: false,
    tips: {
      title: '签到成功',
      num: '5'
    },
    tips_show: false,
    tips_animate: false, //提示框动画
    label_show: false,
    banner: [], //首页轮播banner
    banner_height: 150,
    banner_show: false, //广告是否关闭

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

  onLoad: function (options) {
    var that = this;
    wx.setNavigationBarTitle({
      title: '看点笔记',
    });

    if (options.type != 'user' && options.article_id != undefined) {
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
          banner: e.data.data.banner,
          banner_show: e.data.data.banner_show
        })
      },
      fail: () => {}
    });
    
    if(app.open_user.uid == undefined){
     // 若已授权，则自动登录
    module_login.userlogin(this); 
    }
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

  },

 
  // 首次登陆
  getUserInfo: function (e) {
    module_login.get_user_info(this, e);
  },

  // 个人中心
  nav_user: function () {
    wx.navigateTo({
      url: "../../pack_user/pages/user/user"
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
            [tips]: e.data.data,
            tips_show: true,
            tips_animate: true
          })
          setTimeout(function () {
            that.setData({
              tips_animate:false
            })
            setTimeout(function () {
              that.setData({
                tips_show: false,
              })
            },1000)
          },1500)
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
  },

  // banner点击跳转
  banner_nav:function (e) {
    console.log('banner_nav')
    var kind = e.target.dataset.kind;
    if(kind == 11){
      wx.navigateToMiniProgram({
        appId:'wx5b81d3177b12c31a',
        path: 'pages/vip/vip'
      })
    }else if(kind == 22){
      var id = e.target.dataset.courseid;
      wx.navigateToMiniProgram({
        appId:'wx5b81d3177b12c31a',
        path: 'pages/vip/vip?course_id='+id+'&course=true'
      })
    }
  },

  // 上传图片识别
  up_img:function () {
    var that = this;
    wx.chooseImage({
      count: 1,
      success: (e) => {
        wx.navigateTo({
          url: '../img_clip/img_clip?url='+e.tempFilePaths[0]
        });
      },
      fail: () => {}
    });
  },

  // 材料加载更多
  moer_goods_list:function () {
    var that = this;
    console.log(that.data.materials_kind_id)
    if(that.data.async){
      that.data.async = false;
      that.data.material_page++;
      wx.request({
        url: app.url.moreMaterial,
        method: 'POST',
        data: {
          material_kind_id: that.data.materials_kind_id,
          page: that.data.material_page
        },
        header: app.header,
        success: (e)=>{
          console.log(e)
          var info = 'materials.material_info';
          var new_info = that.data.materials.material_info.concat(e.data.data.material_info)
          that.setData({
            [info]:new_info
          })
          that.data.async = true;
        },
        fail: ()=>{}
      });
    }
  
  },

})