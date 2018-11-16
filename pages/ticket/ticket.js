// pages/ticket/ticket.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    check_ticket:0,
    ticket:[],  //拥有卡券
    eq_price: '', //优惠金额
    kind: '', //代金券类型
    vip_kind: '',
    old_money: '' //原始价格
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var vip_kind = '';
    var user_coupon_id = '';
    var old_money = options.old_money
    if(options.vip_kind !=''){
      vip_kind = options.vip_kind
    }
    if(options.user_coupon_id !=''){
      user_coupon_id = options.user_coupon_id
    }
    var that = this;
    var eq_price = '';
    wx.request({
      url: app.url.selectCoupon,
      method: 'POST',
      data: {
        uid: app.open_user.uid
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        if(user_coupon_id !=''){
          for(var i in e.data.data){
            if(e.data.data[i].user_coupon_id == user_coupon_id){
              eq_price = e.data.data[i].eq_price
            }
          }
        }
        that.setData({
          ticket: e.data.data,
          vip_kind:vip_kind,
          check_ticket: user_coupon_id,
          eq_price:eq_price,
          old_money: old_money
        })
      },
      fail: ()=>{}
    });
  },

  // 切换优惠券选择
  check_ticket: function (e) {
    var id = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    var kind = e.currentTarget.dataset.kind;
    console.log(id)
    this.setData({
      check_ticket:id,
      eq_price: money,
      kind: kind
    })
  },

  // 
  no_check:function () {
    wx.showToast({
      title: '当前选择商品与代金券使用条件不符',
      icon: 'none',
      duration: 1500,
      mask: false,
    });  
  },
  // 使用卡券
  submit:function () {

    var page = getCurrentPages() //当前页面
    var page_prev = page[page.length-2]  //上级页面
    var money = this.data.old_money;
    var ticket = {
      user_coupon_id:this.data.check_ticket,
      eq_price: this.data.eq_price,
    }
    page_prev.setData({
      ticket:ticket,
      money: money - this.data.eq_price,
      kind: this.data.kind
    })
    wx.navigateBack({
      delta: 1
    })
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
    return {
      title: '微信文章图片一键下载神器',
      path:'/pages/index/index'
    }
  }
})