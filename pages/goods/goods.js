// pages/goods/goods.js
var app = getApp();
var util = require('../../utils/login');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    material_id: '', //产品id
    material_info: {}, //材料信息
    reply_info: {}, //回复信息
    supplier_info: {
      supplier_profile: '/MiniProgram-note/index/goods_de.png'
    }, //品牌信息
    view_count: '', //视图数
    view_info: {}, //视图信息
    like_arr: {}, //点赞信息
    is_like: false, //是否点赞
    is_vip: false,
    async: true,
    replay_val: '', //留言内容
    is_getuser: false, //是否获取用户权限
    everyday_sign: false, //每日任务
    tips_animate:false, //积分动画
    tips:{
      title: '留言成功',
      num: '5'
    }, //积分提示
    all_img:[], //所有图片
    moer:{
      text:'点击查看更多图片',
      falg: true,
      show: true
    },
    min_img:[],
    all_img:[]
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
      sign_in_status: everyday_sign
    })
  },


  // 首次登陆
  getUserInfo: function (e) {
    console.log(e.target.dataset.type)
    var type = e.target.dataset.type;
    this.data.getuser_type = type
    util.get_user_info(this, e);
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '材料详情',
    });
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    var id = options.id;
    console.log(id)
    if(app.open_user.uid == undefined){
      util.userlogin(this);
    }else{
      this.setData({
        is_getuser:true
      })
    }
    var like_arr = this.data.like_arr;
    var key = 'material_' + options.id
    if (wx.getStorageSync('goods_like') != "") {
      like_arr = wx.getStorageSync('goods_like');
    }

    this.setData({
      like_arr: like_arr,
      is_like: like_arr[key] || false,
      is_vip: app.open_user.is_vip || false,
      material_id: id
    })
    
    this.get_goods_msg()
  },

  get_goods_msg:function () {
    var that = this;
    console.log(that.data.material_id)
    wx.request({
      url: app.url.materialDetail,
      method: 'POST',
      data: {
        material_id: that.data.material_id,
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e) => {
        wx.hideLoading();
        console.log(e)
        var data = e.data.data;
        var all_img = data.material_info.material_img;
        var min_img = [];
        var inx = 0;
        if(all_img.length >3){
          for(var i in all_img){
            if(inx >2){
              break
            }
            inx++;
            min_img.push(all_img[i])
          }
          data.material_info.material_img = min_img
        }else{
          that.setData({
            ['moer.show']: false
          })
        }

        that.setData({
          material_info: data.material_info,
          reply_info: data.reply_info,
          supplier_info: data.supplier_info,
          view_count: data.view_count,
          view_info: data.view_info,
          all_img: all_img,
          min_img:min_img
        })
      },
      fail: () => {}
    });
  },

  // 查看更多
  moer_img:function () {
    var moer = this.data.moer;
    var material_info = this.data.material_info;
    if(moer.flag == true){
      moer.text = '点击查看更多图片'
      moer.flag = false
      material_info.material_img = this.data.min_img
    }else{
      moer.text = '收起'
      moer.flag = true
      material_info.material_img = this.data.all_img
    }
    console.log( this.data.all_img)
    this.setData({
      moer: moer,
      material_info : material_info
    })
  },

  // 点赞
  articleLike: function () {
    var like_arr = this.data.like_arr;
    console.log(JSON.stringify(wx.getStorageSync('goods_like')))

    var that = this;
    var type = 'yes';
    var id = that.data.material_id;
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

  // 评论记录
  input_change: function (e) {
    var val = e.detail.value;
    this.setData({
      replay_val: val
    })
    console.log(e);
  },

  // 提交评论
  reply_up: function (e) {
    var that = this;
    if (util.remove_space(that.data.replay_val).length > 0) {
      wx.request({
        url: app.url.materialReply,
        method: 'POST',
        data: {
          material_id: that.data.material_id,
          uid: app.open_user.uid,
          reply_content: that.data.replay_val
        },
        header: app.header,
        success: (e) => {
          console.log(e)
          var reply_tips = '留言成功';
          var status = e.data.status;
          if (status == '200' || status == '2000') {

            that.setData({
              replay_val: ''
            })
            that.get_goods_msg()

            if (status == '200') {
              var tips = 'tips.num'
              that.setData({
                sign_in_status: true,
                [tips]: e.data.data,
                tips_show: true,
                tips_animate: true
              })
              setTimeout(function () {
                that.setData({
                  tips_animate: false
                })
                setTimeout(function () {
                  that.setData({
                    tips_show: false,
                  })
                }, 1000)
              }, 1500)
              return false
            }
            wx.showToast({
              title: reply_tips,
              icon: 'none',
              duration: 1500,
              mask: false,
            });
          } else if (status == '500' || status == '504') {
            wx.showToast({
              title: '网络异常，请稍后重试',
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

  // 跳转到供应商
  nav_brand:function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.brandid;
    wx.navigateTo({
      url: '../brand/brand?id=' + id
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