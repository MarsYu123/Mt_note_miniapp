// pages/discern_img/discern_img.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_url:'',
    label:{},
    type:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.duration)
    
    this.setData({
      img_url: app.duration.image_url,
      label: app.duration.keyword_info,
      type: options.type
    })
  },

  nav_goods:function (e) {
    console.log(e)
    var id = e.currentTarget.dataset.id;
    app.goods_list_nav = id
    wx.switchTab({
      url: '../goods_list/goods_list'
    });
  },

  // 记录图片到相册
  record:function () {
    var that = this;
    var data = that.data;
    var type = 1;
    var keyword = []
    if(data.type == 'original'){
      type = 1
    }else if(data.type == 'clip'){
      type = 2
    }

    for(var i in data.label){
      keyword.push(data.label[i].material_kind_id)
    }
    console.log(data.img_url)
    wx.request({
      url: app.url.recordKeywordImg,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        record_img: data.img_url,
        keyword_string: keyword.join('_'),
        type: type
      },
      header: app.header,
      success: (e)=>{
        console.log(e)
        var tips = '';
        if(e.data.status == 403){
          tips = '非法请求'
        }else if(e.data.status == 500){
          tips = '网络异常，请稍后再试'
        }else if(e.data.status == 200){
          tips = '记录成功'
        }
        wx.showToast({
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      },
      fail: ()=>{}
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
})