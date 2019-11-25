let lyricHeight = 0;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },

  /**
   * 数据监听器
   */
  observers: {
    lyric(lrc) {
      this._parseLyric(lrc);
    }
  },

  data: {
    lyricList: [],
    nowLyricIndex: 0, // 当前选中的歌词索引
    scrollTop: 0 // 滚动条滚动高度
  },

  lifetimes: {
    ready() {
      wx.getSystemInfo({
        success: function(res) {
          // 获取不同屏幕下对应的每行高度
          lyricHeight = res.screenWidth / 750 * 64;
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 子组件之间的传递（获取progress-bar组件中当前播放的事件）
    tUpdate(currentTime) {
      // 没有歌词不向下执行
      let lyricList = this.data.lyricList;
      if (lyricList.length == 0) {
        return
      }

      // 当前音乐播放时间大于最后一行歌词时间
      if (currentTime > lyricList[lyricList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lyricList.length * lyricHeight
          })
        }
      }
      // 循环比较
      for (let i = 0, len = lyricList.length; i < len; i++) {
        if (parseInt(currentTime) == parseInt(lyricList[i].time)) {
          this.setData({
            nowLyricIndex: i,
            scrollTop: i * lyricHeight
          });
          break;
        }
      }
    },

    // 解析歌词（字符串转成数组）
    _parseLyric(sLyric) {
      let arrLyric = [];
      // 获取歌词每一行，组成数组
      let lineArr = sLyric.split('\n');
      // 获取歌词和时间（转换为秒）
      lineArr.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g);
        if (time) {
          let lrc = elem.split(time)[1];
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/);
          let timeToSeconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000;
          arrLyric.push({
            lrc,
            time: timeToSeconds
          })
        }
      })

      this.setData({
        lyricList: arrLyric
      })
    }
  }
})