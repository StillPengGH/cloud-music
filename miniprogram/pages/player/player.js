// 获取全局唯一的背景音频管理器
const bgAudioManager = wx.getBackgroundAudioManager();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    musicList: [],
    coverUrl: '',
    musicTitle: '',
    music: {},
    musicUrl: '',
    isPlaying: false,
    musicId: -1,
    musicIndex: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 当前播放的musicId
    let musicId = options.musicId;
    // 当前播放的音乐在音乐数据中的index
    let musicIndex = options.index;
    // 根据index从缓存中音乐数组获取当前音乐详情
    this._getMusicByIndex(musicIndex);
    // 获取当前音乐播放地址
    this._getMusicUrl(musicId);
    this.setData({
      musicIndex,
      musicId
    })
  },

  // 获取缓存中当前音乐详细信息
  _getMusicByIndex(index) {
    let musicList = wx.getStorageSync("musicList");
    this.setData({
      musicList,
      music: musicList[index],
      musicIndex: index,
      coverUrl: musicList[index].al.picUrl,
      musicTitle: musicList[index].name
    })
    // 设置标题
    wx.setNavigationBarTitle({
      title: this.data.musicTitle
    })
  },

  async _getMusicUrl(musicId) {
    wx.showLoading({
      title: '音乐加载中'
    });

    let res = await wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'getMusicUrl'
      }
    });
    let musicUrl = res.result.data[0].url;
    this.setData({
      musicUrl
    })
    wx.hideLoading();
    bgAudioManager.src = this.data.musicUrl;
    bgAudioManager.title = this.data.musicTitle;
    bgAudioManager.coverImgUrl = this.data.music.al.picUrl;
    bgAudioManager.singer = this.data.music.ar[0].name;
    bgAudioManager.epname = this.data.music.al.name;

    this.setData({
      isPlaying: true
    });

    // 将当前播放的音乐id放入缓存中
    wx.setStorageSync('currentMusicId', musicId);
  },

  // 播放暂停开关
  togglePlaying() {
    if (this.data.isPlaying) {
      bgAudioManager.pause();
    } else {
      bgAudioManager.play();
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 上一首
  onPrev() {
    let prevMusicIndex = parseInt(this.data.musicIndex) - 1;
    // 如果当前播放时第一首，那么上一首就是歌单的最后一首
    if (prevMusicIndex < 0) {
      prevMusicIndex = this.data.musicList.length - 1;
    }
    this._getMusicByIndex(prevMusicIndex);
    this._getMusicUrl(this.data.musicList[prevMusicIndex].id);
  },

  // 下一首
  onNext() {
    let nextMusicIndex = parseInt(this.data.musicIndex) + 1;
    // 如果当前播放时第一首，那么上一首就是歌单的最后一首
    if (nextMusicIndex > this.data.musicList.length-1) {
      nextMusicIndex = 0;
    }
    this._getMusicByIndex(nextMusicIndex);
    this._getMusicUrl(this.data.musicList[nextMusicIndex].id);
  }
})