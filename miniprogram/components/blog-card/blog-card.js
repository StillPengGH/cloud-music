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
      console.log(event);
      wx.previewImage({
        current: event.target.dataset.imgsrc,
        urls: this.data.blogData.img,
      })
    }
  }
})