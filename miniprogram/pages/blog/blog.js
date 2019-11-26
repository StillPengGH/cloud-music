// pages/blog/blog.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  /**
   * 发布内容
   */
  onPublish() {
    this._userAuthrize();
  },

  /**
   * 用户授权处理
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
   * 授权成功处理函数
   */
  onAuthSuccess(event) {
    let userInfo = event.detail.userInfo;
    wx.navigateTo({
      url: `/pages/blog-edit/blog-edit?nickName=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}`
    })
  },

  /**
   * 授权失败处理函数
   */
  onAuthFail(event) {
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  }
})