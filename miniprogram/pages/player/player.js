// 获取全局唯一的背景音频管理器
const bgAudioManager = wx.getBackgroundAudioManager();
// 获取小程序全局唯一App实例
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    musicId: -1, // 歌曲id
    musicIndex: 0, // 歌曲在歌单数组中的索引值
    musicList: [], // 所有歌单中的歌曲（缓存中获取到的）
    music: {}, // 当前播放的音乐信息（只包含基础信息，图片，歌名，不包含播放url）
    coverUrl: '', // 音乐背景图
    musicTitle: '', // 音乐名称
    musicUrl: '', // 当前音乐url
    isPlaying: false, // 是否正在播放
    isLyricShow: false, // 是否展示歌词
    lyric: '', // 歌词,
    isSame: false // 再次点击进来，判断是否是同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 当前播放的musicId
    let musicId = options.musicId;
    // 当前播放的音乐在音乐数据中的index
    let musicIndex = options.index;
    // 在缓存中获取当前音乐信息musicList[musicIndex]
    this.getMusicByIndex(musicIndex);
    // 根据musicId获取音乐播放信息（url）
    this.getMusicUrl(musicId);
    // 将当前播放音乐的id和index放入data中
    this.setData({
      musicId: parseInt(musicId),
      musicIndex: parseInt(musicIndex)
    })
  },

  // 方法一：获取缓存中当前音乐详细信息
  getMusicByIndex(index) {
    let musicList = wx.getStorageSync("musicList");
    // 将所有音乐，当前播放音乐，当前音乐背景图，当前音乐名称放入data中
    this.setData({
      musicList,
      musicIndex: index,
      music: musicList[index],
      coverUrl: musicList[index].al.picUrl,
      musicTitle: musicList[index].name
    })
    // 设置标题
    wx.setNavigationBarTitle({
      title: this.data.musicTitle
    })
  },

  // 方法二：根据音乐id获取音乐播放信息（url）
  async getMusicUrl(musicId) {
    // 判断加载page时传递的musicId和当前播放的音乐id是否是同一首
    if (musicId == app.getPlayingMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    // 如果不是同一首，才停止当前音乐
    if(!this.data.isSame){
      bgAudioManager.stop();
    }

    wx.showLoading({
      title: '音乐加载中'
    });

    // 通过调用云函数，获取播放信息
    let res = await wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'getMusicUrl'
      }
    });
    let musicUrl = res.result.data[0].url;
    // 如果没有获取到url，证明没有权限播放
    if (musicUrl == null) {
      wx.showToast({
        title: '无权限播放',
      });
      return
    }

    if(!this.data.isSame){
      bgAudioManager.src = musicUrl;
      bgAudioManager.title = this.data.musicTitle;
      bgAudioManager.coverImgUrl = this.data.music.al.picUrl;
      bgAudioManager.singer = this.data.music.ar[0].name;
      bgAudioManager.epname = this.data.music.al.name;
    }
   
    this.setData({
      musicUrl,
      isPlaying: true
    });

    wx.hideLoading();
    // 将当前播放的音乐id放入全局globalData中
    app.setPlayingMusicId(musicId);
    // 通过musicId获取歌词
    this.getLyricByMusicId(musicId);
  },

  // 方法三：获取歌词
  async getLyricByMusicId(musicId) {
    let res = await wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'lyric'
      }
    });
    let lyricStr = res.result.lrc.lyric ? res.result.lrc.lyric : '暂无歌词';
    // 将获取到的歌词写入data中。
    this.setData({
      lyric: lyricStr
    })
  },

  // 方法四：播放和暂停
  togglePlaying() {
    this.data.isPlaying ? bgAudioManager.pause() : bgAudioManager.play();
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  // 方法五：上一首
  onPrev() {
    // 获取上一首在音乐列表中的索引值
    let prevMusicIndex = parseInt(this.data.musicIndex) - 1;
    // 如果当前播放时第一首，即musicIndex=0，那么上一首就是歌单的最后一首
    if (prevMusicIndex < 0) {
      // 最后一首：如musicList中有37首歌，最后一首即：musicList[36]
      prevMusicIndex = this.data.musicList.length - 1;
    }
    console.log(this.data.musicList.length);
    console.log(prevMusicIndex);
    // 获取上一首音乐信息和播放url
    this.getMusicByIndex(prevMusicIndex);
    this.getMusicUrl(this.data.musicList[prevMusicIndex].id);
  },

  // 方法六：下一首
  onNext() {
    // 获取下一首个的索引值
    let nextMusicIndex = parseInt(this.data.musicIndex) + 1;
    // 如果当前播放的是最后一首，那么下一首就是第一首歌
    // 如果musicList一共37首歌，当前播放的index是36，即最后一首。
    // 下一首的索引值就是37，当下一首的index大于musicList的长度 - 1时，播放第一首。
    if (nextMusicIndex > this.data.musicList.length - 1) {
      nextMusicIndex = 0;
    }
    console.log(nextMusicIndex);
    // 获取第一首音乐信息和播放url
    this.getMusicByIndex(nextMusicIndex);
    this.getMusicUrl(this.data.musicList[nextMusicIndex].id);
  },

  // 方法七：封面歌词切换
  changeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  // 方法八：父页面绑定progress-bar的事件更新事件处理函数
  timeUpdate(event) {
    // 向指定子组件绑定一个自定义方法，并将progress-bar传来的参数传递到lyric子组件中
    this.selectComponent('.lyric').tUpdate(event.detail.currentTime);
  },

  // 方法九：监听系统控制器点击播放
  playMusic() {
    this.setData({
      isPlaying: true
    })
  },

  // 方法十：监听系统控制器点击暂停
  pauseMusic() {
    this.setData({
      isPlaying: false
    })
  }
})