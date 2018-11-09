// pages/user/user.js

// 3008 没有用户

var getChina = require("../city.js")
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    button: {
      flag: [true, true], //手机号和验证码是否正确
      check_flag: true, //验证码状态
      up: false, //提交状态
      msg: "获取验证码",
      new_user: false,
      password: true //密码校验
    },
    login_text: '点击注册',
    url: app.url.check_num, //登陆，注册接口
    login_data: {}, //注册数据
    type: '', //进入注册页入口
    course_id: '', //由课程页进入id
    asyn: true //同步处理
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "用户绑定"
    })
    console.log(options)
    var type = '';
    var course_id = '';
    if (options.type) {
      type = options.type;
    } else if (options.course_id) {
      course_id = options.course_id;
    }
    // wx.showNavigationBarLoading()
    var that = this;
    var new_user = 'button.new_user'
    console.log(app.open_user.gender)
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (app.open_user.gender == "1") {
      app.open_user.gender = "男"
    } else if (app.open_user.gender == "2") {
      app.open_user.gender = "女"
    } else if (!reg.test(app.open_user.gender)) {
      app.open_user.gender = ""
    }
    var cn = new RegExp("[\\u4E00-\\u9FFF]+", "g")
    console.log(cn.test(app.open_user.city))
    if (!cn.test(app.open_user.city)) {
      app.open_user.city = getChina.getChina(app.open_user.city.toLowerCase())
    }
    if (!cn.test(app.open_user.province)) {
      app.open_user.province = getChina.getChina(app.open_user.province.toLowerCase())
    }
    console.log(app.open_user)

    var data = {
      msg_code: '', //验证码
      phone_number: '', //手机号
      open_id: app.open_user.openId, //openid
      union_id: app.open_user.unionId, //unionid
      nickname: app.open_user.nickName, //昵称
      profile: app.open_user.avatarUrl, //头像}//注册数据
      city: app.open_user.city, //城市
      province: app.open_user.province, //省份
      gender: app.open_user.gender, //性别
      channel:wx.getStorageSync('source') //来源
    }
    that.setData({
      login_data: data,
      type: type,
      course_id: course_id
    })
    wx.setTopBarText({
      text: 'hello, world!'
    })
    wx.setNavigationBarTitle({
      title: '绑定手机'
    })
  },
  //手机号校验
  isPoneAvailable: function (str) {
    var myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    var flag = 'button.flag[0]';
    var check = 'button.check_flag';
    var up = 'button.up'
    if (!myreg.test(str)) {
      this.setData({
        [flag]: true,
        [check]: true
      })
    } else {
      this.setData({
        [flag]: false,
        [check]: false
      })
    }
    if (this.data.button.flag[0] == false && this.data.button.flag[1] == false) {
      this.setData({
        [up]: true
      })
    } else {
      this.setData({
        [up]: false
      })
    }
  },
  //验证码校验
  ischack: function (str) {
    var myreg = /^[0-9]{6}$/;
    var check_flag = 'button.flag[1]'; //验证码输入正确
    var up = 'button.up'
    var msg = 'button.msg';
    var that = this;
    if (!myreg.test(str)) {
      that.setData({
        [check_flag]: true
      })
    } else {
      that.setData({
        [check_flag]: false
      })
    }
    if (this.data.button.flag[0] == false && this.data.button.flag[1] == false) {
      this.setData({
        [up]: true
      })
    } else {
      this.setData({
        [up]: false
      })
    }
  },
  //获取手机号
  phone_inp: function (e) {
    var val = e.detail.value;
    var phone_number = 'login_data.phone_number'
    this.isPoneAvailable(val);
    this.setData({
      [phone_number]: val,
    });
  },
  //发送验证码间隔时间
  timeout: function (e, that) {
    var msg = 'button.msg';
    var flag = 'button.check_flag';

    function time_out() {
      setTimeout(function () {
        var text = e + "s"
        that.setData({
          [msg]: text
        })
        if (e == 0) {
          that.setData({
            [msg]: "获取验证码",
            [flag]: false
          })
          return false;
        }
        e--;
        if (that.data.button.check_flag == false) {
          that.setData({
            [msg]: "获取验证码"
          })
          return false;
        }
        time_out();
      }, 1000)
    };
    time_out()
  },
  //发送验证码
  phone_up: function () {
    var that = this;
    var phone = that.data.login_data.phone_number;
    var flag = 'button.check_flag';
    var time = 60;
    that.timeout(time, that)
    that.setData({
      [flag]: true,
    })
    console.log(phone)
    wx.request({
      url: app.url.phone_login,
      method: 'POST',
      header: app.header,
      data: {
        "phone_number": phone,
        "openid":app.open_user.openId
      },
      success: e => {
        console.log(e)
        if (e.data.true_false) {
          wx.showToast({
            title: '验证码发送成功',
            icon: 'none',
            duration: 3000,
            mask: true
          })
        } else {
          wx.showToast({
            title: '验证码发送失败，请稍后重试',
            icon: 'none',
            duration: 3000,
            mask: true
          })
        }
      }
    })
  },
  //记录验证码
  check_inp: function (e) {
    var check_inp = e.detail.value;
    var msg_code = "login_data.msg_code"
    this.setData({
      [msg_code]: check_inp
    })
    this.ischack(check_inp)
  },
  //记录密码
  ispassword: function (e) {
    var myreg = /^[\d_a-zA-Z]{6,12}$/
    var flag = 'button.password';
    if (!myreg.test(str)) {
      this.setData({
        [flag]: true
      })
    } else {
      this.setData({
        [flag]: false
      })
    }
  },
  password_num: function (e) {
    var password_inp = e.detail.value;
    var password_num = "login_data.xcx_password"
    this.setData({
      [password_num]: password_inp
    })
  },
  //提交信息
  check_up: function () {
    var that = this;
    var new_user = 'button.new_user';
    var data = that.data.login_data;
    if (that.data.asyn) {
      console.log(data)
      // that.setData({
      //   login_data: data
      // })
      that.setData({
        asyn: false
      })
      wx.request({
        url: that.data.url,
        method: "POST",
        header: app.header,
        data: data,
        success: function (e) {
          that.setData({
            asyn: true
          })
          console.log(e)
          if (e.data.status == "3008") { //用户不存在
            wx.showModal({
              title: "提示",
              content: '用户不存在，是否注册？',
              success: e => {
                wx.setNavigationBarTitle({
                  title: "用户绑定"
                })
                if (e.confirm == true) {
                  that.setData({
                    [new_user]: true,
                    login_text: "绑定",
                    url: app.url.user_register,
                  })
                }
              }
            })
          } else if (e.data.status == "3000") { //绑定成功
            wx.showToast({
              title: '绑定成功！',
              icon: 'none',
              duration: 3000,
              mask: true
            })
            app.open_user = e.data.data
            app.bind = true
            console.log(that.data.type)
            setTimeout(function () {
                wx.navigateBack()
            }, 500)
          } else if (e.data.status == '3005') {
            wx.showToast({
              title: "密码格式不正确",
              icon: 'none',
              duration: 3000,
              mask: true
            })
          } else if (e.data.status == "20011") {
            wx.showToast({
              title: '验证码不正确，请重新输入',
              icon: 'none',
              duration: 3000,
              mask: true
            })
          }else{
            wx.showToast({
              title: '网络异常，请稍后再试',
              icon: 'none',
              duration: 3000,
              mask: true
            })
          }
        }
      })
    }
  },
  //注册切换
  login: function (e) {
    var that = this;
    var new_user = 'button.new_user';
    console.log(that.data.button.new_user)
    if (that.data.login_text == "点击注册") {
      that.setData({
        [new_user]: true,
        login_text: "绑定",
        url: app.url.user_register
      })
    } else {
      that.setData({
        [new_user]: false,
        login_text: "点击注册",
        url: app.url.check_num
      })
    }
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