const bgAudioManager = wx.getBackgroundAudioManager();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musicList: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectedId: -1
  },

  /**
   * 组件生命周期函数
   */
  lifetimes:{
    // 在组件实例被从页面节点树移除时执行,删除缓存中正在播放的歌曲id
    detached(){
      wx.removeStorageSync('currentMusicId');
    }
  },

  /**
   * 组件所在页面的生命周期:它们并非与组件有很强的关联，但有时组件需要获知，以便组件内部处理。
   *  |--show:组件所在的页面被展示时执行
   *  |--hide:组件所在的页面被隐藏时执行
   *  |--resize:组件所在的页面尺寸变化时执行
   */
  pageLifetimes: {
    show() {
      // 在缓存中获取当前播放的音乐，设置那首歌曲标红
      let currentMusicId = wx.getStorageSync('currentMusicId');
      if (currentMusicId) {
        this.setData({
          selectedId: currentMusicId
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 去音乐详情页面
    goToMusicDetail(event) {
      let musicId = event.currentTarget.dataset.musicId;
      let index = event.currentTarget.dataset.index;
      this.setData({
        selectedId: musicId
      });
      wx.navigateTo({
        url: `/pages/player/player?musicId=${musicId}&index=${index}`
      })
    }
  }
})