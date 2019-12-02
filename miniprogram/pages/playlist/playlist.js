// 单页获取最大条数
const MAX_LIMIT = 15;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperImgUrls: [{
        url: 'http://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/109951164169407335.jpg',
      },
      {
        url: 'http://p1.music.126.net/xhWAaHI-SIYP8ZMzL9NOqg==/109951164167032995.jpg',
      },
      {
        url: 'http://p1.music.126.net/Yo-FjrJTQ9clkDkuUCTtUg==/109951164169441928.jpg',
      }
    ],
    musicList: [],
    noMore: false,
    noMoreContent: '没有更多歌单了(*￣︶￣)'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 加载歌单数据
    this._loadData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 设置歌单列表数组为空
    this.setData({
      musicList: []
    });
    // 从新加载一次数据即可
    this._loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadData();
  },

  // 加载歌单数据
  _loadData() {
    // 如果没有更多了，停止加载
    if (this.data.noMore) {
      return
    }
    // 显示加载中
    wx.showLoading({
      title: '正在加载歌单'
    });

    // 调用云函数music中路由为getPlayList，获取歌单
    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.musicList.length,
        count: MAX_LIMIT,
        $url: "getPlayList"
      }
    }).then((res) => {
      // 如果获取的歌单数组长度小于设置的15条,设置noMore代表没有更多
      if (res.result.length < MAX_LIMIT) {
        this.setData({
          noMore: true
        });
      }
      this.setData({
        musicList: this.data.musicList.concat(res.result)
      });
      // 停止下拉刷新的三个小点及空白处
      wx.stopPullDownRefresh();
      // 关闭加载中图标
      wx.hideLoading();
    });
  }
})