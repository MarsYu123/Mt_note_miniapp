//app.js
App({
  onLaunch: function (options) {

    // 更新提示
    const updateManager = wx.getUpdateManager();

    updateManager.onUpdateReady(function () {
      updateManager.applyUpdate()
    })

    for (var i in this.url) {
      this.url[i] = this.host + this.url[i];
    }
    var that = this;
    // 存储设备信息
    wx.getSystemInfo({
      success: res => {
        console.log(res)
        that.system = res
        if(res.model == 'iPhone 6'){
          that.system.platform = 'ios'
          console.log(that.system)
        }
      }
    });

    // 获取article_id
    var article_id = options.query.article_id
    var share_uid = options.query.share_uid
    var source = options.query.source

    
    if(article_id !=undefined){
      wx.setStorageSync(source, source); 
      wx.setStorageSync(article_id, article_id);
    }
    if(share_uid != undefined){
      wx.setStorageSync(share_uid,share_uid,);
    }
    console.log(options)
    //将分享的文章加入历史纪录 


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
    noteBanner: 'Noteindex/noteBanner', //首页banner
    check_num: 'Notelogin/msg_code_verify', //绑定接口
    phone_login: 'Notelogin/send_msg_code', //发送验证码
    user_register: "Notelogin/user_register", //注册接口
    showAllimage: "Notearticle/showAllimage",  //查看所有
    saveScreenshot: "Noteindex/saveScreenshot", //上传识别图片
    searchImages: "Material/searchImages",  //图库以及文章识别图片
    materialArea: "Material/materialArea", //材料模块首次加载
    materialDetail: "Material/materialDetail", //材料详情页
    likeMaterial: "Material/likeMaterial",  //材料点赞
    materialReply: "Material/materialReply",  // 材料评论
    moreMaterial: "Material/moreMaterial",  //首页材料列表加载更多
    supplierDetail: "Material/supplierDetail", //厂商详情
    aboutMoreMaterial: "Material/aboutMoreMaterial", //查看更多材料
    collectSupplier: "Material/collectSupplier",  //加入供应商
    mySupplier: "Noteuser/mySupplier", //我的供应商
    recordKeywordImg: "Material/recordKeywordImg", //记录图片到相册
    myAlbum: "Material/myAlbum",  //相册
    myAlbumMore: "Material/myAlbumMore" //相册加载更多
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
  system:{},

  // 图片识别信息
  discern:{},

  // 图片识别页面跳转
  goods_list_nav:0
})