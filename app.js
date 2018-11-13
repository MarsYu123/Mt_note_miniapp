//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    for (var i in this.url) {
      this.url[i] = this.host + this.url[i];
    }
    wx.getSystemInfo({
      success: res => {
        console.log(res)
      }
    });
  },
  // 小程序域名
  host: 'https://www.mati.hk/Mobile/', 

  //  图片加速域名
  img_host: 'https://img.mati.hk/Public/',

  //小程序api地址
  url: { 
    user_info: 'Notelogin/user_info',   //获取用户信息
    login: 'Notelogin/login',    //获取登陆解锁信息
    pictureHome: 'Notepic/pictureHome', //图库数据
    labelPicMore: 'Notepic/labelPicMore',  //图库瀑布流加载更多
    downTest: 'Notearticle/tt', // 下载
    getUserData: 'Noteuser/getUserData', //用户资料中心
    saveData: 'Noteuser/saveData', //提交资料
    downloadHistory: 'Notearticle/downloadHistory', //下载记录数据
    addUrl: 'Noteindex/addUrl',  //采集链接
    articleDetail: 'Notearticle/articleDetail', // 文章详情页内容
    articleReply: 'Notearticle/articleReply', //提交文章评论
    getReply: 'Notearticle/getReply', //获取文章评论
    articleLike: 'Notearticle/articleLike',  //文章点赞
    getLabels: 'Notepic/getLabels',  //获取标签
    toArticlePic: 'Notearticle/toArticlePic',  //文章下载页面获取资料
  },

  //post请求的header头
  header: { 
    "Content-Type": "application/x-www-form-urlencoded"
  },

  //小程序code码
  code: '', 

  // 解锁用户信息session
  session:'',

  //获取权限以后的信息
  globalData: {}, 

  // 微信头像
  profile: {},
  
  //
  userInfo: {}, 

  //是否绑定用户
  bind_user: false, 

  //用户数据
  open_user:{},

  // 临时存储文章信息
  article_msg:{}
})