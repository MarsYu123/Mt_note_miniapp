//app.js
App({
  onLaunch: function (options) {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    for (var i in this.url) {
      this.url[i] = this.host + this.url[i];
    }

    // 获取article_id
    var article_id = options.query.article_id

    //将分享的文章加入历史纪录 

    if(article_id !=""){
      // wx.request({
      //   url: app.url,
      //   method: 'GET',
      //   data: {},
      //   header: 'application/x-www-form-urlencoded',
      //   success: ()=>{},
      //   fail: ()=>{}
      // });
    }

    wx.getSystemInfo({
      success: res => {
        console.log(res)
        this.system = res
      }
    });

  },
  // 小程序域名
  host: 'https://www.mati.hk/Mobile/', 

  //  图片加速域名
  img_host: 'https://img.mati.hk/Public',

  //小程序api地址
  url: { 
    user_info: 'Notelogin/user_info',   //获取用户信息
    login: 'Notelogin/login',    //获取登陆解锁信息
    pictureHome: 'Notepic/pictureHome', //图库数据
    labelPicMore: 'Notepic/labelPicMore',  //图库瀑布流加载更多
    downTest: 'Notearticle/tt', // 下载
    getUserData: 'Noteuser/getUserData', //用户资料中心
    saveData: 'Noteuser/saveData', //提交资料
    downloadHistory: 'Noteindex/downloadHistory', //下载记录数据
    addUrl: 'Noteindex/addUrl',  //采集链接
    articleDetail: 'Notearticle/articleDetail', // 文章详情页内容
    articleReply: 'Notearticle/articleReply', //提交文章评论
    getReply: 'Notearticle/getReply', //获取文章评论
    articleLike: 'Notearticle/articleLike',  //文章点赞
    getLabels: 'Notepic/getLabels',  //获取标签
    toArticlePic: 'Notearticle/toArticlePic',  //文章下载页面获取资料
    pointExchangeRecord: 'Noteuser/pointExchangeRecord', //积分兑换记录
    pointTask: 'Noteuser/pointTask', //任务记录
    dailySign: 'Noteindex/dailySign',  //每日签到
    payHome: 'Notepay/payHome',  //购买会员
    selectCoupon: 'Notepay/selectCoupon',  //选择优惠券
    pointMall: 'Noteuser/pointMall',  //积分商城商品
    pointExchange: 'Noteuser/pointExchange',  //积分兑换
    notePay: 'Notepay/notePay', // 兑换vip支付接口
    orderStatus: 'Notepay/orderStatus', //支付结果返回接口
    downloadArticlePic: 'Notearticle/downloadArticlePic', //下载文章回调接口
    orderList: 'Notepay/orderList', //订单记录
    downloadPics:'Notepic/downloadPics', //下载图库图片
    myCoupon: 'Noteuser/myCoupon',//我的卡券
    QrCode: 'Notelogin/QrCode', //生成qrcode
    noteBanner: 'Noteindex/noteBanner' //首页banner
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
  article_msg:{},

  // 设备信息
  system:{}
})