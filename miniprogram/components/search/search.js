let keyword = ''; // 搜索关键字
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '请输入搜索关键字'
    }
  },

  /**
   * 引入外部样式类
   */
  externalClasses: [
    "iconfont",
    "icon-chazhao"
  ],

  methods: {
    onInput(event) {
      keyword = event.detail.value
    },
    onSearch() {
      this.triggerEvent('searchBlog', {
        keyword
      })
    }
  }
})