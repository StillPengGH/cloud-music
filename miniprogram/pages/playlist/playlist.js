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
    musicList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this._loadData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      musicList: []
    });
    this._loadData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this._loadData();
  },

  _loadData() {
    wx.showLoading({
      title: '加载中',
    });
    wx.cloud.callFunction({
      name: 'music',
      data: {
        start: this.data.musicList.length,
        count: MAX_LIMIT,
        $url: "getMusics"
      }
    }).then((res) => {
      this.setData({
        musicList: this.data.musicList.concat(res.result)
      });
      // 停止下拉刷新的三个小点及空白处
      wx.stopPullDownRefresh();
      wx.hideLoading();
    });
  }
})