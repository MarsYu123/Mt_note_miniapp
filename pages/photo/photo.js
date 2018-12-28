// pages/photo/photo.js

const app = getApp()
const module_login = require( '../../utils/login.js' );


Page( {

  /**
   * 页面的初始数据
   */
  data: {
    is_getuser: false,
    user_info: {},
    all_label: [], //所有标签
    label_nav: [ {
      key: 'space',
      name: '空间场景'
    }, {
      key: 'style',
      name: '风格'
    }, {
      key: 'texture',
      name: '材质'
    }, {
      key: 'soft',
      name: '软装'
    }, {
      key: 'other',
      name: '其他'
    } ],
    img: { //最终呈现在图库的图片
      left: [],
      right: []
    }, //瀑布流图片组
    new_img: [], //存储在暂缓区用户获取图片信息的图片组
    img_load: false, //该图片是否加载完毕，用于方式每次刷新加载图片顺序不同
    all_img: [], //所有图片组
    img_index: 0, //当前加载图片下标
    page: 0, //加载更多页码
    material_page: 0, //材料加载更多页码
    img_host: '', //图片加速域名
    l_height: 0, //瀑布流左边高度
    r_height: 0, //瀑布流右边高度
    async: true, //同步
    animate: {}, //动画
    is_check: 'open_img', //是否打开筛选
    is_check_discern: false, //是否打开识别
    download_img: [], //下载图片地址
    article_img_id: '', //识别图片id
    download_index: 0, //目前下载下标
    fail_img: [], //下载失败的下标
    opensetting: false, //图片保存权限
    box_link: false, //链接box是否显示
    link_cont: '', //复制的链接内容
    getuser_type: '', //未授权时点击记录文章或前往下载后自动操作
    history_cont: {}, //下载历史文章记录
    label_checked: '121', // 筛选标签id
    open_img: {
      baseWidth: '',
      baseHeight: '',
      url: '',
      index: ''
    }, // 放大图片url
    mova: {
      x: 0,
      y: 0
    }, //放大图片参数
    mova_class: 'hide', //渐隐
    is_open_img: false, //是否放大图片
    download_plan: '未开始',
    open_arr: [], //放大图片列表
    open_index: 1,
    is_open_movable: true,
    open_scale: 1 //缩放的尺寸
  },

  // 登陆后获取信息
  login_success: function () {
    this.setData( {
      is_getuser: true,
      user_info: app.open_user,
    } )
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ( options ) {
    var that = this;
    module_login.userlogin( this );
    this.checked_img()
    // 获取图库标签
    wx.request( {
      url: app.url.getLabels,
      method: 'POSt',
      data: {},
      header: app.header,
      success: ( e ) => {
        console.log( e )
        var all_label = e.data.data;
        that.setData( {
          all_label: all_label
        } )
      },
      fail: () => {
        wx.showToast( {
          title: "网络异常，请稍后重试",
          icon: 'none',
          duration: 1500,
          mask: false,
        } );
      }
    } );
    var win_width = app.system.windowWidth;
    var win_height = app.system.windowHeight;
    var scale = win_width / 750;
    var mova_x = ( win_width - ( 100 * scale ) ) / 2;
    var mova_y = ( win_height - ( 100 * scale ) ) / 2;
    this.setData( {
      mova: {
        x: mova_x,
        y: mova_y
      }
    } )
  },

  // 判断图片尺寸
  img_load: function ( e ) {
    if ( e.target.id != '' ) {
      var height = e.detail.height; //新图片高度
      var img = this.data.img; //将要放入图库的图片
      var index = e.currentTarget.dataset.index; //新图片标识
      var all_img = this.data.all_img //所有图片
      var l_height = this.data.l_height; //左侧视图高度
      var r_height = this.data.r_height; //右侧视图高度

      /* ===============================================
      如果左侧视图低于右侧视图，则将图片放入左侧，否则将放入右侧，
      实现瀑布流的参差不齐，并且更新对应视图新高度
       */

      if ( l_height < r_height ) {
        l_height += height
        img.left.push( all_img[ index ] );
      } else {
        r_height += height
        img.right.push( all_img[ index ] );
      }

      // 更新左右视图高度
      this.data.l_height = l_height;
      this.data.r_height = r_height

      this.setData( {
        img: img
      } )

      // 更新下张图片坐标
      this.data.img_index++

      // 获取下张图片
      this.ajax_img()
    }

  },

  // 获取下张图片
  ajax_img: function () {
    var img_list = this.data.all_img
    var new_img = []
    var index = this.data.img_index

    if ( index < img_list.length ) {
      img_list[ index ].index = index
      new_img.push( img_list[ index ] )
      this.setData( {
        new_img: new_img
      } )
    }
  },

  // 加载更多图片
  load_photo: function () {

    console.log( '加载' )
    var that = this;
    var page = that.data.page;
    page++;
    if ( that.data.async ) {
      that.data.async = false
      wx.request( {
        url: app.url.labelPicMore,
        method: 'POST',
        data: {
          page: page,
          label_id: that.data.label_checked
        },
        header: app.header,
        success: ( e ) => {
          console.log( e )
          console.log( page )
          var data = e.data.data.pictures;
          for ( var i in data ) {
            data[ i ].check = false
          }
          if ( data.length > 0 ) {
            that.data.page = page
            that.data.all_img = that.data.all_img.concat( data )
            that.ajax_img()
            that.data.async = true
          }
        },
        fail: () => {}
      } );
    }


  },

  // 关闭选择标签
  clear_label: function ( e ) {
    var type = e.target.dataset.type;
    var animate = wx.createAnimation( {
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    } );

    animate.translateY( "100%" ).step();
    this.setData( {
      animate: animate.export()
    } )
    var that = this;
    setTimeout( function () {
      that.setData( {
        label_show: false
      } )
    }, 100 )
    if ( type == "enter" ) {
      this.checked_img( this.data.label_checked )
    }
  },

  //打开选择标签
  screen: function () {
    this.setData( {
      label_show: true
    } )
    var animate = wx.createAnimation( {
      duration: 200,
      timingFunction: 'linear',
      delay: 0,
      transformOrigin: '50% 50% 0'
    } );
    animate.translateY( "0" ).step();
    this.setData( {
      animate: animate.export()
    } )
  },


  // 选择下载
  download_check: function () {
    this.setData( {
      is_check: 'check_img'
    } )
  },

  // 选择识别
  discern_check: function () {
    this.setData( {
      is_check: 'discern'
    } )
  },

  // 取消下载
  esc_check: function () {
    var img = this.data.img;
    for ( var i in img ) {
      for ( var j in img[ i ] ) {
        img[ i ][ j ].check = false
      }
    }
    this.setData( {
      is_check: 'open_img',
      img: img,
    } )
  },

  // 放大图片
  open_img: function ( e ) {
    var url = this.data.img_host + e.currentTarget.dataset.url;
    var open_img_url = 'open_img.url';
    var origin_index = e.currentTarget.dataset.originindex; //原始数组下标
    var open_img = []

    var one_index = origin_index - 1 //取三张图片

    for ( var i = 0; i < 3; i++ ) {
      open_img.push( this.data.all_img[ one_index ] )
      one_index++
    }
    console.log( open_img )
    console.log( this.data.all_img[ origin_index ] )

    this.setData( {
      is_open_img: true,
      [ open_img_url ]: url,
      [ 'open_img.index' ]: origin_index,
      open_arr: open_img,
    } )


  },

  // 放大图片的load
  open_img_load: function ( e ) {
    var win_width = app.system.windowWidth;
    var win_height = app.system.windowHeight;
    var img_width = e.detail.width;
    var img_height = e.detail.height;
    var img_ratio = img_width / img_height
    var open_img = this.data.open_img;
    var that = this;
    if ( img_width > img_height ) {
      open_img.baseWidth = win_width;
      open_img.baseHeight = win_width / img_ratio
    } else {
      open_img.baseHeight = win_height;
      open_img.baseWidth = win_height * img_ratio
    }
    var y = parseInt( ( win_height - open_img.baseHeight ) / 2 )
    var x = parseInt( ( win_width - open_img.baseWidth ) / 2 )

    var mova = {
      y: y,
      x: x
    }
    that.setData( {
      open_img: open_img,
      // mova: mova,
      mova_class: 'show'
    } )
  },

  touch: function () {
    this.data.async = true

  },

  // 放大后拖拽
  move: function ( e ) {
    var url = '';
    var is_open_movable = this.data.is_open_movable;
    var that = this;
    var index = e.target.dataset.index;
    var old_x = this.data.mova.x;

    // return false
    if ( this.data.open_scale == 1 ) {
      if ( that.data.async ) {

        that.data.async = false

        var difference = e.detail.x - old_x
        if ( Math.abs( difference ) > 100 ) {
          is_open_movable = false
          if ( difference > 100 ) {
            index--;
          } else if ( difference < -100 ) {
            index++;
          }

          if ( index < 0 || index > that.data.all_img.length - 1 ) return false
          url = that.data.all_img[ index ].img_url
          that.setData( {
            mova_class: 'hide'
          } )
          setTimeout( function () {
            that.setData( {
              [ 'open_img.url' ]: 'https://www.mati.hk/Public' + url,
              is_open_movable: is_open_movable,
              [ 'open_img.index' ]: index
            } )
            setTimeout( function () {
              that.setData( {
                is_open_movable: true,
                mova_class: 'show'
              } )
            }, 200 )
          }, 200 )
        }

      }
    }
  },
  open_scale: function ( e ) {
    var scale = e.detail.scale;
    this.data.open_scale = scale;
  },

  // 放大图片拖动离开
  open_end: function () {
    this.data.async = true
  },
  open_cancel: function () {
    this.data.async = true
  },

  // 关闭缩放
  open_img_claer: function () {
    var that = this;
    this.setData( {
      is_open_img: false,
      async: true,

    } )
  },

  // 标签筛选
  label_checked: function ( e ) {
    var id = e.target.dataset.id;
    console.log( id )
    this.setData( {
      label_checked: id
    } )
  },

  checked_img: function () {
    //获取图库内容
    var that = this;
    console.log( that.data.label_checked )
    var img = {
      left: [],
      right: []
    }
    that.data.page = 0
    that.setData( {
      img: img,
      new_img: [],
      all_img: [],
      img_index: 0,
      l_height: 0,
      r_height: 0
    } )
    wx.request( {
      url: app.url.pictureHome,
      method: 'POST',
      data: {
        uid: this.data.user_info.uid,
        label_id: that.data.label_checked
      },
      header: app.header,
      success: ( e ) => {
        console.log( e )
        var all_img = e.data.data.pictures;
        if ( all_img.length > 0 ) {
          for ( var i in all_img ) {
            all_img[ i ].check = false;
          }
          that.setData( {
            img_host: app.img_host,
            all_img: all_img,
          } )
          that.ajax_img()
        }
      },
      fail: ( e ) => {
        wx.showToast( {
          title: "网络异常，请稍后重试",
          icon: 'none',
          duration: 1500,
          mask: false,
        } );
      }
    } );
  },

  // 选择下载图片
  check_img: function ( e ) {
    console.log( e )
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var download_img = this.data.download_img;
    var all_img = this.data.img;
    var direction = e.currentTarget.dataset.direction;
    var one_img_l = 'img.left[' + index + '].check';
    var one_img_r = 'img.right[' + index + '].check';
    var is_repeat = false;
    var img_url = e.currentTarget.dataset.url;
    var label_id = e.currentTarget.dataset.labelid;
    if ( direction == 'left' ) {
      all_img.left[ index ].check = !all_img.left[ index ].check
      this.setData( {
        [ one_img_l ]: all_img.left[ index ].check
      } )
    } else {
      all_img.right[ index ].check = !all_img.right[ index ].check
      this.setData( {
        [ one_img_r ]: all_img.right[ index ].check
      } )
    }
    if ( download_img.length > 0 ) {
      for ( var i in download_img ) {
        if ( download_img[ i ].picture_id == id ) {
          download_img.splice( i, 1 )
          is_repeat = true;
        }
      }
      if ( !is_repeat ) {
        download_img.push( {
          picture_id: id,
          img_url: img_url,
          label_id: label_id
        } );
      }
    } else {
      download_img.push( {
        picture_id: id,
        img_url: img_url,
        label_id: label_id
      } );
    }
    this.setData( {
      download_img: download_img,
    } )
  },

  // 选择图片识别
  discern: function ( e ) {
    var article_img_id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var direction = e.currentTarget.dataset.direction;
    var all_img = this.data.img;
    var one_img_l = 'img.left[' + index + '].check';
    var one_img_r = 'img.right[' + index + '].check';
    var img = this.data.img;
    for ( var i in img ) {
      for ( var j in img[ i ] ) {
        img[ i ][ j ].check = false
      }
    }
    this.setData( {
      img: img
    } )
    if ( direction == 'left' ) {
      all_img.left[ index ].check = true
      this.setData( {
        [ one_img_l ]: all_img.left[ index ].check
      } )
    } else {
      all_img.right[ index ].check = true
      this.setData( {
        [ one_img_r ]: all_img.right[ index ].check
      } )
    }
    this.setData( {
      article_img_id: article_img_id
    } )
  },

  // 下载图片
  download_pic: function () {
    var download_img = this.data.download_img
    var that = this;
    var photo = 'scope.writePhotosAlbum'
    var img_url = [],
      picture_id = [];
    // 获取授权信息，查看是否已授权保存相册
    if ( download_img.length > 0 ) {

      for ( var i in download_img ) {
        img_url.push( that.data.img_host + download_img[ i ].img_url )
        picture_id.push( download_img[ i ].picture_id )
      }


      wx.getSetting( {
        success: res => {
          that.setData( {
            download_plan: '未开始'
          } )
          // 已授权
          if ( res.authSetting[ photo ] ) {
            that.request_down( img_url, picture_id, download_img )
          } else {
            // 未授权
            if ( res.authSetting[ photo ] === false ) {
              that.setData( {
                opensetting: true,
                download_plan: '未开始'
              } )
              wx.showToast( {
                title: "由于您之前拒绝授权访问相册，请重新授权",
                icon: 'none',
                duration: 1500,
                mask: false,
              } );
            } else {
              // 初次授权
              wx.authorize( {
                scope: 'scope.writePhotosAlbum',
                success: res => {
                  that.request_down( img_url, picture_id, download_img )
                  console.log( img_url )
                },
              } );
            }
          }
        }
      } )

    } else {
      wx.showToast( {
        title: '请选择图片',
        icon: 'none',
        duration: 1500,
        mask: false,
      } );
    }
  },


  // 请求是否可下载
  request_down: function ( img, picture_id, download_img ) {
    var that = this;
    console.log( img )
    var img_url = img;
    wx.request( {
      url: app.url.downloadPics,
      method: 'POST',
      data: {
        uid: app.open_user.uid,
        label_id: that.data.label_checked,
        img_url: img_url.join( '|' ),
        picture_id: picture_id.join( '_' ),
        download_count: download_img.length
      },
      header: app.header,
      success: ( e ) => {
        console.log( e )
        var tips = ''
        var type = '0' //0不出现load 1出现 2隐藏
        if ( e.data.status == '500' ) {
          tips = '网络异常'
        } else if ( e.data.status == '200' ) {
          tips = '开始下载'
          type = '1'
          if ( that.data.download_plan != '进行中' ) {
            that.getimage()
          } else {
            wx.showToast( {
              title: '下载正在进行，请勿重复操作',
              icon: 'none',
              duration: 1500,
              mask: false,
            } );
          }
        } else if ( e.data.status == '400' ) {
          tips = '您不是VIP'
        }
        if ( type == '1' ) {
          wx.showLoading( {
            title: tips,
            mask: true,
          } );
        } else {
          wx.showToast( {
            title: tips,
            icon: 'none',
            duration: 1500,
            mask: false,
          } );
        }
      },
      fail: () => {}
    } );
  },



  // 开始下载图片
  getimage: function ( e ) {
    console.log( 'ss' )
    var that = this;
    var download_img = that.data.download_img
    that.esc_check()
    for ( var i in download_img ) {
      wx.getImageInfo( {
        src: "https://www.mati.hk/Public" + download_img[ i ].img_url,
        success: ( e ) => {
          console.log( e )
          var path = e.path;
          this.saveimaeg( path )
        },
      } );
    }
  },

  // 保存图片
  saveimaeg: function ( path ) {
    var that = this;
    wx.saveImageToPhotosAlbum( {
      filePath: path,
      success: ( e ) => {
        console.log( e )
        that.data.download_index++
        that.plan_status()
      },
      fail: () => {
        that.data.download_index++
        that.data.fail_img.push( that.data.download_index )
        that.plan_status()
      }
    } );

  },
  // 统计下载状态
  plan_status: function () {
    var that = this;
    if ( that.data.download_index == that.data.download_img.length && that.data.download_img.length != 0 ) {
      that.setData( {
        download_plan: '结束',
        download_index: 0,
        download_img: []
      } )
      wx.hideLoading();
      wx.showToast( {
        title: '图片全部下载完毕',
        icon: 'none',
        duration: 1500,
        mask: false,
      } );
    }
  },

  // 识别图片
  up_photo: function () {
    var article_img_id = this.data.article_img_id;
    var that = this;
    wx.showLoading( {
      title: '识别中，请稍后',
      mask: true,
    } );
    wx.request( {
      url: app.url.searchImages,
      method: 'POST',
      data: {
        article_img_id: article_img_id,
        flag: 22
      },
      header: app.header,
      success: ( e ) => {
        console.log( e )
        wx.hideLoading();
        var data = e.data.data;
        var tips = '';
        if ( e.data.status == 200 ) {
          if ( ( data.keyword_info.length > 0 ) || ( JSON.stringify( data.keyword_info ) != '{}' ) ) {
            app.duration = data;
            that.esc_check()
            wx.navigateTo( {
              url: '../discern_img/discern_img?type=original'
            } );
            return false
          } else {
            tips = '未匹配到结果'
          }

        } else if ( e.data.status == 403 ) {
          tips = '非法请求'
        } else if ( e.data.status == 502 ) {
          tips = '图片为空'
        } else if ( e.data.status == 202 ) {
          tips = '未匹配到结果'
        } else if ( e.data.status == 500 ) {
          tips = '网络异常，请稍后重试'
        }

        wx.showToast( {
          title: tips,
          icon: 'none',
          duration: 1500,
          mask: false,
        } );
      },
      fail: ( e ) => {
        wx.hideLoading();
        wx.showModal( {
          title: '提示',
          content: '网络异常，请稍后重试',
          showCancel: false,
          cancelText: '取消',
          cancelColor: '#000000',
          confirmText: '确定',
          confirmColor: '#3CC51F',
          success: res => {
            if ( res.confirm ) {}
          }
        } );
      }
    } );
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

  }
} )