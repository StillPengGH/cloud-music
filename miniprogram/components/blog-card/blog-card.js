import formatDate from '../../utils/formatDate.js'

Component({
  properties: {
    blogData: Object
  },

  observers: {
    ['blogData.createTime'](val) {
      // 格式化时间
      this.setData({
        _createTime: formatDate(new Date(val))
      })
    }
  },

  data: {
    _createTime: ''
  },

  methods: {
    // 查看图片
    previewImage(event) {
      wx.previewImage({
        current: event.target.dataset.imgSrc,
        urls: this.data.blogData.img,
      })
    }
  }
})