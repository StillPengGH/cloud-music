import formatDate from '../../utils/formatDate.js'
let userInfo = {}; // 存放授权后的用户信息
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },

  /**
   * 外部样式类
   */
  externalClasses: [
    'iconfont',
    'icon-pinglun',
    'icon-fenxiang'
  ],

  /**
   * 组件的初始数据
   */
  data: {
    commentModalShow: false,
    authModalShow: false,
    comment: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 评论
    onComment() {
      wx.getSetting({
        success: (res) => {
          // 判断是否授权
          if (res.authSetting['scope.userInfo']) { // 已经授权
            wx.getUserInfo({
              success: (res) => {
                // 获取useInfo
                userInfo = res.userInfo
                // 显示评论模态框
                this.setData({
                  commentModalShow: true
                });
              }
            })
          } else { // 还没有授权
            // 进行授权，显示授权组件
            this.setData({
              authModalShow: true
            })
          }
        }
      })
    },

    // 授权成功
    onAuthSuccess(event) {
      // 获取用户信息、关闭授权框，打开评论框
      userInfo = event.detail.userInfo
      this.setData({
        authModalShow: false
      }, () => {
        this.setData({
          commentModalShow: true
        })
      })
    },

    // 授权失败
    onAuthFail() {
      wx.showModal({
        title: '授权用户才能评论',
        content: ''
      })
    },

    // 提交评论
    onSubmit(event) {
      let comment = event.detail.value.comment
      // 获取模板推送需要的formId
      let formId = event.detail.formId
      if (comment.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: ''
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true
      })

      // 将评论插入云数据库blog-comment集合
      wx.cloud.callFunction({
        name: 'blog',
        data: {
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl,
          comment,
          $url: 'addComment'
        }
      }).then((res) => {
        // 推送模板消息
        wx.cloud.callFunction({
          name: 'sendTmpMsg',
          data: {
            formId,
            content: comment,
            blogId: this.properties.blogId,
            createTime: formatDate(new Date())
          }
        })
        wx.hideLoading()
        wx.showToast({
          title: '评论成功'
        })
        this.setData({
          commentModalShow: false,
          comment: ''
        })

        // 刷新父页面
        this.triggerEvent('refreshPage')
      })
    }
  }
})