import formatDate from '../../utils/formatDate.js'
Page({
  data: {
    blogId: '',
    blogDetail: {},
    commentList: [],
    isHas: true
  },

  onLoad: function(options) {
    this.setData({
      blogId: options.blogId
    })
    this._loadBlogInfo()
  },

  // 加载数据
  _loadBlogInfo() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'detail'
      },
    }).then((res) => {
      // 格式化时间
      let clist = res.result.commentArr.data;
      for (let i = 0, len = clist.length; i < len; i++) {
        clist[i].createTime = formatDate(new Date(clist[i].createTime))
      }
      wx.hideLoading()
      this.setData({
        blogDetail: res.result.blogDetail[0],
        commentList: clist,
        isHas: clist.length == 0 ? false : true
      })
    });
  },

  /**
   * 分享
   */
  onShareAppMessage(event) {
    let blog = event.target.dataset.blog
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`
    }
  }
})