const MAX_COUNT = 10 // 每页显示条数
let keyword = '' // 搜索关键字
Page({

  data: {
    modalShow: false,
    blogs: [],
    noMore: false,
    noMoreContent: '没有更多新鲜事了(*￣︶￣)'
  },

  onLoad: function(options) {
    // 获取博客列表
    this._loadBlogs(0)
  },

  // 方法一：加载博客列表
  _loadBlogs(start = 0) {
    // 没有更多
    if (this.data.noMore) {
      return
    }
    wx.showLoading({
      title: '数据加载中'
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        start,
        count: MAX_COUNT,
        keyword,
        $url: 'list'
      }
    }).then((res) => {
      let len = parseInt(res.result.length);
      if (len < MAX_COUNT) {
        this.setData({
          noMore: true
        })
      }
      this.setData({
        blogs: this.data.blogs.concat(res.result)
      })
      wx.hideLoading()
    })
  },

  /**
   * 方法二：发布内容
   */
  onPublish() {
    this._userAuthrize();
  },

  /**
   * 方法三：用户授权处理
   */
  _userAuthrize() {
    wx.getSetting({
      success: (res) => {
        // 已经授权，进入发布页面
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              this.onAuthSuccess({
                detail: res
              });
            }
          })
          // 没有授权，打开授权模态框
        } else {
          this.setData({
            modalShow: true
          })
        }
      }
    })
  },

  /**
   * 方法四：授权成功处理函数
   */
  onAuthSuccess(event) {
    let userInfo = event.detail.userInfo;
    wx.navigateTo({
      url: `/pages/blog-edit/blog-edit?nickName=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}`
    })
  },

  /**
   * 方法五：授权失败处理函数
   */
  onAuthFail(event) {
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },

  /**
   * 方法六：页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      blogs: []
    })
    this._loadBlogs(0)
  },

  /**
   * 方法七：页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let start = this.data.blogs.length
    this._loadBlogs(start)
  },

  /**
   * 方法八：搜索
   */
  onSearch(event) {
    keyword = event.detail.keyword;
    this.setData({
      blogs: [],
      noMore: false
    })
    this._loadBlogs(0)
  },

  /**
   * 方法九：去详情页（评论）
   */
  goToComment(event) {
    let blogId = event.target.dataset.blogId
    wx.navigateTo({
      url: '../blog-comment/blog-comment?blogId=' + blogId
    })
  },

  /**
   * 方法十：分享
   */
  onShareAppMessage(event) {
    let blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})