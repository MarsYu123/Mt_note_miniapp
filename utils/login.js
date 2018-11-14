// 获取code并存储sessionId
var that = this;

// 首次登陆，获取codeid
function wx_login(that) {
  var app = getApp()
  wx.login({
    success: res => {
      // 发送 res.code 到后台换取 openId, sessionKey, unionId
      var code = res.code;
      if (res.errMsg == "login:ok") {
        //发送请求
        app.code = code;
        console.log('获取code成功')
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                withCredentials: true,
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  app.globalData.userInfo = res
                  app.profile = res.userInfo.avatarUrl
                  getsession(that)
                }
              })
            }else{
                console.log('用户未授权')
            }
          }
        })
      } else {
        console.log('code请求失败')
      }
    }
  })
}

// 获取session
function getsession(page) {
    var app = getApp();
    wx.request({
      url: app.url.login,
      method: "POST",
      header: app.header,
      dataType: 'json',
      data: {
        "code": app.code
      },
      success: e => {
        if (e) {
          //需获取sessionid
          wx.setStorageSync("sessionId", e.data.data.session);
          wx.setStorageSync("string", e.data.data.string);
          app.session = e.data.data.session
          unlock(page)
        } else {
          console.log("服务器回执失败")
        }
      },
      fail: e => {
        console.log("服务器访问失败" + e)
      }
    })
  }

// 获取授权后操作
function get_user_info(that, e) {
    var app = getApp();
    var get_info = function () {}
    if(that.get_info){
      get_info = that.get_info
    }
    if (e.detail.errMsg == "getUserInfo:ok") {
      app.globalData = e.detail
      console.log(e.detail.userInfo)
      app.profile = e.detail.userInfo.avatarUrl
      userlogin(that);
      get_info()
    } else {
      console.log("用户不同意")
    }
  }

function userlogin(e) {
  var app = getApp();
  var page = e || '';
    //判断是否有sessionid，如果没有走重新获取流程，若存在走直接获取用户信息   
  if (wx.getStorageSync("sessionId")) {
    console.log("直接获取")
    getencode(page)
  } else {
    console.log("初始访问")
    wx_login(page)
  }
};

function getencode(that) {
    var app = getApp()
    var get_info = function () {}
    if(that.get_info){
      get_info = that.get_info
    }
    wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
            wx.getUserInfo({
              withCredentials: true,
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                app.globalData.userInfo = res
                app.profile = res.userInfo.avatarUrl
                unlock(that)
                get_info()
              }
            })
          }else{
              console.log('用户未授权')
          }
        }
      })  
};



//使用session获取用户信息
function unlock(e) {
  var app = getApp();
  console.log("解密获取openid")
  var page = e || '';

  // 获取调用page的数据修改方法，用于获取到数据以后填充当前页面的data 
  var login_success = function () {}; 
  if(page.login_success){
    login_success = page.login_success;
  }
  //发送请求
  wx.request({
    url: app.url.user_info,
    // 加密信息
    data: {
      "encryptedData": encodeURIComponent(app.globalData.userInfo.encryptedData),  
      "iv": encodeURIComponent(app.globalData.userInfo.iv),
      "session": wx.getStorageSync("sessionId"),
      "string": wx.getStorageSync("string")
    },
    method: "POST",
    header: app.header,
    dataType: 'json',
    success: e => {
      console.log(e)
      var data = e.data.data
      if (e.data.status != "3333") { // 不是冻结用户

        // 获取数据失败
        if (e.data.true_false == false) {
          wx_login(page);
          console.log(new Date())
        } else {
          // 获取数据成功
          app.open_user = e.data.data;
          // 是否暂停使用
          if (false) {
            wx.showLoading({
                title: '正在维护。。。',
                mask: true,
            });
          }

          // 执行调用登陆js的填充数据函数
          if (data.note_openid != undefined) {

            app.bind_user = true;
            console.log("已注册会员")
            login_success(data)

          } else {

            if (e.data.status == "4000") {

                wx.showModal({
                  title: '提示',
                  content: '您尚未绑定学院账号，是否前往绑定',
                  success: e => {
                    if (e.confirm) {
                      wx.navigateTo({
                        url: '../login/login'
                      })
                    }
                  }
                })

            }
          }
        }
      } else {
        wx.showModal({
          title: "提示",
          content: '您的账号已被冻结！'
        })
        app.open_user.disabled = true
      }
      return false
    }
  })
}


// 科学计数法
function num_slice(e) {
  var data = e;
  if(typeof data != 'string'){
    data = String(e);
  }

  var money = data.replace(/(\d)(?=(\d{3})+$)/g, "$1,");
  return money;
}

// 清除所有空格

function remove_space(e) {
  return e.replace(/\s+/g, "");
}


//向微信发送支付调用，并提交支付信息
function pay(data,that) {
  var app = getApp()
  wx.requestPayment({
    timeStamp: data.timeStamp,
    nonceStr: data.nonceStr,
    package: data.package,
    signType: data.signType,
    paySign: data.paySign,
    success: e => {
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
        mask: true,
      });
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        });
      },2000)
      that.setData({
        asyn: true
      });
      req(1)
      unlock(that)
    },
    fail: function(e) {
      if (e.errMsg == "requestPayment:fail cancel") {
        wx.showToast({
          title: "支付取消",
          icon:'none',
          duration:3000,
          mask:true
        });
        req(2)
      } else {
        wx.showToast({
          title: "支付失败",
          icon:'none',
          duration:3000,
          mask:true
        });
        req(0)
      }
      that.setData({
        asyn: true
      });
    }
  });
}
//返回支付结果
function req(state) {
  var app = getApp()
  wx.request({
    url: app.url.orderStatus,
    method: 'POST',
    header: app.header,
    data: {
      "pay_status": state,
      "uid": app.open_user.id,
    },
    success: e => {
    }
  })
}



module.exports.userlogin = userlogin;
module.exports.unlock = unlock;
module.exports.wx_login = wx_login;
module.exports.get_user_info = get_user_info;
module.exports.getsession = getsession;
module.exports.num_slice = num_slice;
module.exports.pay = pay;
module.exports.remove_space = remove_space