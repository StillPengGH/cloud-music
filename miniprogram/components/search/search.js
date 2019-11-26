// components/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: '请输入...'
    }
  },

  /**
   * 引入外部样式类
   */
  externalClasses: [
    "iconfont",
    "icon-chazhao"
  ],

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSearch() {
      console.log('开始搜索...');
    }
  }
})