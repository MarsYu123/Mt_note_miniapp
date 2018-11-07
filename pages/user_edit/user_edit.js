// pages/user_edit/user_edit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    profile: "",
    name: "", //昵称
    name_true: "", //真实姓名
    sex: ['男','女'], //性别
    sex_index:'',//当前性别下标
    company: "", //公司
    job: "", //工作
    provinces: "", //省份
    user_msg: "", //城市
    signature: "", //结业证书
    region: ['广东','深圳','福田'],
    complete_info:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app.open_user)
    var user_msg = app.open_user;
    var profile = app.globalData.userInfo.userInfo.avatarUrl;
    console.log(app.open_user.uid)
    wx.request({
      url: app.url.getUserData,
      header: app.header,
      method: "POST",
      data: {
        uid: app.open_user.uid
      },
      success: e => {
        console.log(e)
        var region=[];
        var province = e.data.data.province;
        var city = e.data.data.city;
        var sex_index='';
        if(province.indexOf("省")==-1&&province.indexOf("区")==-1){
          region = [province+"省",city]
        }else if(city.indexOf("市") ==-1&&province.indexOf("区")==-1&&province.indexOf("州")==-1){
          region = [province,city+"市"]
        }else{
          region = [province,city]
        }
        if(e.data.data.gender == "男"){
          sex_index = 0;
        }else{
          sex_index = 1
        }
        this.setData({
          profile: profile,
          name: e.data.data.nickname || '',
          name_true: e.data.data.realname || '',
          sex_index: sex_index,
          company: e.data.data.company || '',
          job: e.data.data.profession || '',
          signature: e.data.data.signature || '',
          region: region,
          complete_info: e.data.data.complete_info
        })
      }
    })
    wx.setNavigationBarTitle({
      title: "编辑个人信息"
    })
  },
  //修改地址
  bindRegionChange:function(e){
    this.setData({
      region:e.detail.value
    })
  },
  // 修改性别
  bindPickerChange:function(e){
    this.setData({
      sex_index:e.detail.value
    })
  },
  name: function (e) {
    this.setData({
      name: e.detail.value
    })
  },
  name_true: function (e) {
    this.setData({
      name_true: e.detail.value
    })
  },
  company: function (e) {
    this.setData({
      company: e.detail.value
    })
  },
  job: function (e) {
    this.setData({
      job: e.detail.value
    })
  },
  signature: function (e) {
    this.setData({
      signature: e.detail.value
    })
  },
  updata:function(e){
    var that = this;
    var index = that.data.sex_index;
    wx.request({
      url: app.url.saveData,
      header:app.header,
      method:"POST",
      data: {
        uid: app.open_user.id,
        nickname: that.data.name,
        realname: that.data.name_true,
        gender: that.data.sex[index],
        company: that.data.company,
        profession: that.data.job,
        province: that.data.region[0],
        city: that.data.region[1],
        signature: that.data.signature,
        complete_info: that.data.complete_info
      },
      success: e => {
        if(!e.data.true_false){
          wx.showToast({
            title: "保存失败，请稍后重试",
            icon: 'none',
            duration: 1500,
            mask: false,
          });
        }else{
          wx.showToast({
            title: "保存成功",
            icon: 'success',
            duration: 1500,
            mask: false,
          });
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 1500);
        }
      }
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
  call:function(){
    wx.navigateTo({
      url:'../web_view/web_view?url=call'
    });
  }
})