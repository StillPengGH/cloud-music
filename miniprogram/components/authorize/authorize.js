// components/authorize/authorize.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
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
    // 获取授权信息、用户信息
    onGetUserInfo(event) {
      const userInfo = event.detail.userInfo;
      // 如果userInfo为true，证明点击了允许授权，反之未授权
      if (userInfo) {
        this.setData({
          modalShow: false
        });
        this.triggerEvent('authSuccess', {
          userInfo
        });
      } else {
        this.triggerEvent('authFail');
      }
    }
  }
})