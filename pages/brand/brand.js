// pages/brand/brand.js
var app = getApp();
var util = require('../../utils/login')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    brand_id: '',
    brand_info: {
      supplier_profile:'/MiniProgram-note/index/goods_de.png'
    }, //厂商信息
    brand_goods: {}, //厂商产品
    page: 0,
    moer_show: true,
    is_getuser: false
  },


  // 登陆后获取信息
  login_success: function () {
    this.setData({
      is_getuser: true,
    })
    if(this.type == 'join_brand'){
      this.join_brand()
    }
  },

  // 首次登陆
  getUserInfo: function (e) {
    this.type = 'join_brand'
    util.get_user_info(this, e);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '供应商详情',
    });
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    var brand_id = options.id;
    var that = this;
    that.setData({
      brand_id: brand_id
    })
    if(app.open_user.uid == undefined){
      util.userlogin(this);
    }else{
      this.setData({
        is_getuser:true
      })
    }

    that.down_msg()
  },

  down_msg: function () {
    var that = this;
    wx.request({
      url: app.url.supplierDetail,
      method: 'POST',
      data: {
        supplier_id: that.data.brand_id
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        wx.hideLoading();
        that.setData({
          brand_info: e.data.data.supplierData,
          brand_goods: e.data.data.aboutMaterial
        })
      },
      fail: () => {}
    });
  },

  // 查看更多
  moer: function () {
    var that = this;
    that.data.page++;
    wx.request({
      url: app.url.aboutMoreMaterial,
      method: 'POST',
      data: {
        supplier_id: that.data.brand_id,
        page: that.data.page
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var data = e.data.data.aboutMaterial
        if (data.length > 0) {
          var goods = that.data.brand_goods.concat(data);
          that.setData({
            brand_goods: goods
          })
        } else {
          that.setData({
            moer_show: false
          })
        }
      },
      fail: () => {}
    });
  },

  //加入供应商
  join_brand: function () {
    var that = this;
    console.log(app.open_user.uid,that.data.brand_id)
    wx.request({
      url: app.url.collectSupplier,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        supplier_id: that.data.brand_id
      },
      header: app.header,
      success: (e) => {
        console.log(e)
        var tips = ''
        if(e.data.status == '500'){
          tips = '已添加，请勿重复'
        }else if(e.data.status == '200'){
          tips = '添加成功'
        }

        wx.showToast({
          title: tips,
          icon: 'success',
          duration: 1500,
          mask: false,
        });
      },
      fail: () => {}
    });
  },

  // 拨打供应商电话
  call_brand:function (e) {
    var phone = e.target.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      success: ()=>{}
    });
  },

  //材料列表
  nav_goods:function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../goods/goods?id=" + id
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


})