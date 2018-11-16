// pages/article/article.js
var app = getApp()
var module_login = require("../../utils/login")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article_id:'', // 文章id
    article_cont: {},  //文章数据
    reply_msg: {}, //获取留言内容
    reply_cont:'', //提交留言内容
    async: true, //同步控制
    like_arr: {}, // 点赞情况
    is_like: false,
    is_vip: false, // 是否vip
    sign_in_status: false,
    tips: {
      title: '签到成功',
      num: '5'
    },
    tips_show: false,
    tips_animate: {}, //提示框动画
    share_show: false,
    share_animate: {} //分享动画
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.article_id;
    var that = this;
    var key = 'articleid_'+options.article_id
    that.data.article_id = id;
    console.log(id)
    var like_arr = {};
    if(wx.getStorageSync('like') != ""){
      like_arr = wx.getStorageSync('like');
    }
    this.setData({
      like_arr: like_arr,
      is_like: like_arr[key] || false,
      is_vip: app.open_user.is_vip
    })
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
        var article_msg = {
          title: e.data.data.title,
          time: e.data.data.create_time,
          like: e.data.data.like_count,
          source: e.data.data.source,
          has_download: e.data.data.hasdownload,
          reply_count: e.data.data.reply_count,
          url: e.data.data.wx_url,
          article_id: that.data.article_id
        }
        app.article_msg = article_msg
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
    if(module_login.remove_space(this.data.reply_cont) == ''){
      wx.showToast({
        title: '请勿提交空白内容',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
      return false
    }
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
          var status = e.data.status;
          this.data.async = true;
          var reply_count = 'article_cont.reply_count';
          var reply_num = that.data.article_cont.reply_count;
          var reply_tips = '留言成功';
          if(status == '200' || status == '2000'){
            reply_num++;

            that.setData({
              [reply_count]: reply_num,
              reply_cont: ''
            })
            that.getReply()

            if(status == '2000'){
              that.tips_animate()
              return false
            }
            wx.showToast({
              title: reply_tips,
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


  // 提示框动画
  tips_animate: function () {
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
    },200)
  },


  // 分享动画
  share_animate:function () {
    let animate = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animate.translate('-50%', '-50%').step();
    this.setData({
      share_animate: animate.export()
    })
  },

  // 关闭分享
  claer_share:function () {
    var that = this;
    let animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    });
    animation.translate('-50%','300%').step();
    this.setData({
      share_animate: animation.export()
    })
    setTimeout(function () {
      that.setData({
        share_show:false
      })
    },400)
  },



  // 点赞文章
  articleLike:function () {
    var like_arr = this.data.like_arr;
    console.log(JSON.stringify(wx.getStorageSync('like')))
    
    var that = this;
    var type = 1;
    var article_id = that.data.article_id;
    var key = 'articleid_'+article_id;
    var like_num = that.data.article_cont.like_count
    if(JSON.stringify(like_arr) != "{}"){
      if(like_arr[key]){
        type = 2
      }
    }
    if(that.data.async){
      that.data.async = false
      wx.request({
        url: app.url.articleLike,
        method: 'POST',
        data: {
          article_id: article_id,
          like_kind: type
        },
        header: app.header,
        success: (e)=>{
          console.log(e)
          that.data.async = true;
          if(e.data.status == 200){
            if(type == 1){
              console.log(typeof like_arr)
              like_arr[key] = true;
              like_num++;
            }else{
              like_arr[key] = false;
              like_num--
            }
            wx.setStorageSync('like', like_arr);
            var like_count = 'article_cont.like_count'
            that.setData({
              like_arr: like_arr,
              is_like: like_arr[key],
              [like_count]: like_num
            })
          }
        },
        fail: ()=>{}
      });
    }
  },
  

  // 下载图片
  download:function () {
    if(this.data.article_cont.code == true){
      wx.navigateTo({
        url: '../download/download?has_download='+this.data.article_cont.has_download
      });
    }else{
      wx.showToast({
        title: '非会员每天只能下载一次',
        icon: 'none',
        duration: 1500,
        mask: false,
      });
    }
  },

  // 分享
  share:function () {
    this.setData({
      share_show: true,
    })
    this.share_animate()
  },

  // 分享海报
  share_poster:function () {
    wx.navigateTo({
      url: '../poster/poster?article_id='+ this.data.article_id
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
  onShareAppMessage: function (res) {
    return {
      title: '微信文章图片一键下载神器',
      path:'/pages/index/index'
    }
  }
})