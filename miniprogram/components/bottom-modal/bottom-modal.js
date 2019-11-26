// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  /**
   * 组件相关选项
   *  |--styleIsolation：组件样式隔离
   *    |--isolated：表示启用样式隔离，在自定义组件内外，使用 class 指定的样式将不会相互影响（一般情况下的默认值）。
   *    |--apply-shared：表示页面 wxss 样式将影响到自定义组件，但自定义组件 wxss 中指定的样式不会影响页面。
   *    |--shared：表示页面 wxss 样式将影响到自定义组件，自定义组件 wxss 中指定的样式也会影响页面和其他设置了。
   */
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 关闭底部模态框
    onClose() {
      this.setData({
        modalShow: false
      })
    }
  }
})