//获取应用实例
const app = getApp()
import WeCropper from '../../utils/img_clip/we-cropper'

const device = wx.getSystemInfoSync() // 获取设备信息
const width = device.windowWidth // 示例为一个与屏幕等宽的正方形裁剪框
const height = width / 1.57

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    img_w: '',
    img_h: '',
    img_src: '',
    is_canvas: false,

    cropperOpt: {
      id: 'cropper',
      width, // 画布宽度
      height, // 画布高度
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x: (width - 235) / 2, // 裁剪框x轴起点
        y: (height - 235) / 2, // 裁剪框y轴期起点
        width: 235, // 裁剪框宽度
        height: 235 // 裁剪框高度
      }
    }
  },

  onLoad: function (options) {
    var url = options.url;
    var that = this;
    wx.getImageInfo({
      src: url,
      success: (e) => {
        console.log(e)
        var scale = e.width / e.height
        that.wecropper.pushOrign(e.path)
        that.setData({
          img_src: e.path,
          img_w: app.system.screenWidth,
          img_h: app.system.screenWidth / scale,
          old_width: app.system.screenWidth,
          old_height: app.system.screenWidth / scale,
        })
      },
    });
    const {
      cropperOpt
    } = this.data

    // 若同一个页面只有一个裁剪容器，在其它Page方法中可通过this.wecropper访问实例
    new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
        console.log(`wecropper is ready for work!`)
      })
      .on('beforeImageLoad', (ctx) => {
        console.log(`before picture loaded, i can do something`)
        console.log(`current canvas context: ${ctx}`)
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        console.log(`picture loaded`)
        console.log(`current canvas context: ${ctx}`)
        wx.hideToast()
      })
  },



  // 上传原图
  no_cilp: function () {
    this.up_img(this.data.img_src)
  },

  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
  getCropperImage() {
    var that = this;
    this.wecropper.getCropperImage((src) => {
      if (src) {
        that.up_img(src)
      } else {
        wx.showToast({
          title: '获取图片失败，请稍后重试',
          icon: 'none',
          duration: 1500,
          mask: false,
        });
      }
    })
  },
  up_img: function (src) {
    wx.showLoading({
      title: '识别中，请等待',
      mask: true,
    });
  
    wx.uploadFile({
      url: app.url.saveScreenshot,
      filePath: src,
      name: 'screenshot',
      success: (e) => {
        wx.hideLoading();

        var jsonStr = e.data;
        jsonStr = jsonStr.replace(" ", "");
        if (typeof jsonStr != 'object') {
          jsonStr = jsonStr.replace(/\ufeff/g, "");
          var jj = JSON.parse(jsonStr);
          e.data = jj;
        }
        console.log(e.data.data)
        var data = e.data.data;
        var tips = '';
        if (e.data.status == 200) {
          if( (data.keyword_info.length > 0) || (JSON.stringify(obj) != '{}')){
            app.duration = data;
            wx.navigateTo({
              url: '../discern_img/discern_img'
            });
            return false
          }else{
            tips = '未匹配到结果'
          }
        
        } else if (e.data.status == 403) {
          tips = '非法请求'
        } else if (e.data.status == 502) {
          tips = '图片为空'
        } else if (e.data.status == 202) {
          tips = '未匹配到结果'
        } else if (e.data.status == 500) {
          tips = '网络异常，请稍后重试'
        }
        
        wx.showToast({
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        });

      },
      fail: () => {}
    });
  }
})