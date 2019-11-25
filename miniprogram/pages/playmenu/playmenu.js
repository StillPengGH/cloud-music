Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverImg: "",
    menuTitle: "",
    musicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    let menuId = options.menuId;
    let res = await wx.cloud.callFunction({
      name: "music",
      data: {
        menuId,
        $url: 'getMenuById'
      }
    });
    let menuData = res.result.playlist;
    this.setData({
      coverImg: menuData.coverImgUrl,
      menuTitle: menuData.name,
      musicList: menuData.tracks
    })
    // 将音乐列表放入缓存中
    this._setMusicList();
    wx.hideLoading();
  },

  _setMusicList(){
    wx.setStorageSync("musicList", this.data.musicList);
  }
})