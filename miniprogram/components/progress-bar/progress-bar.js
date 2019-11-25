// 页面上没有用到的变量写在外面即可
let movableAreaWidth = 0;
let movableViewWidth = 0;
const bgAudioManager = wx.getBackgroundAudioManager();
// 当前播放时间的秒数（int型）
let currentTimeInt = -1;
// 当前音乐总时长
let duration = 0;
// 是否再做拽时间（解决拖拽停止，但是没有松手，时间块跳回播放点的问题）
let isMoving = false;
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    percent: 0
  },

  /**
   * 组件的生命周期函数
   */
  lifetimes: {
    // 组件在视图层布局完成后执行
    ready() {
      // 当音乐正在播放，且第二次进入音乐页面时，总时长会变为00:00
      if(this.data.showTime.totalTime == '00:00'){
        this.setTotalTime();
      }
      // 获取进度条长度，和小滑块宽度（进行后续计算）
      this.getMovableDis();
      // 绑定背景音乐监听函数
      this.bindBGMEvent();
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取可移动宽度(即进度条的长度)
    getMovableDis() {
      // 返回一个SelectorQuery对象实例。在自定义组件或包含自定义组件的页面中，应使用 this.createSelectorQuery() 来代替。
      const query = this.createSelectorQuery();
      // 获取进度条长度
      query.select('.m-area').boundingClientRect();
      // 获取小圆点的宽度
      query.select('.m-view').boundingClientRect();
      // 通过query.exec获取结果
      query.exec((res) => {
        movableAreaWidth = res[0].width;
        movableViewWidth = res[1].width;
      })
    },

    // 绑定背景音乐监听事件
    bindBGMEvent() {
      // 监听背景音乐进入可播放状态事件，但不保证后面可以流畅播放
      bgAudioManager.onCanplay(() => {
        // 获取背景音乐总时长
        if (typeof bgAudioManager.duration != 'undefined') {
          this.setTotalTime();
        } else {
          // bug，如果没有获取到，隔一秒再取获取
          setTimeout(() => {
            this.setTotalTime();
          }, 1000);
        }
      })

      // 监听背景音乐播放事件
      bgAudioManager.onPlay(() => {
        isMoving = false;
        this.triggerEvent('onPlay');
      })

      // 监听背景音乐停止事件 
      bgAudioManager.onStop(() => {
      })

      // 监听背景音乐暂停事件 
      bgAudioManager.onPause(() => {
        this.triggerEvent('onPause');
      })

      // 监听背景音乐加载中事件，当音频因为数据不足，需要停下来加载时会触发。
      bgAudioManager.onWaiting(() => {
      })

      // 监听背景音乐播放进度更新事件，只有小程序在前台时回调用。
      bgAudioManager.onTimeUpdate(() => {
        // 如果时间拖块还在拖拽中...，不要向下执行
        if(isMoving){
          return
        }
        // 获取当前播放时间（单位：秒）
        const currentTime = bgAudioManager.currentTime;
        duration = bgAudioManager.duration;
        const currentTimeObj = this._formatTime(currentTime);
        // 避免一秒钟频繁设置，保证每一秒设置一次数据即可
        if (parseInt(currentTime) != currentTimeInt) {
          currentTimeInt = parseInt(currentTime)
          // 设置移动小块的移动距离和进度条的移动百分比，以及当前播放时间（格式化后）
          this.setData({
            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
            percent: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeObj.min}:${currentTimeObj.sec}`
          })

          // 联动歌词
          this.triggerEvent('timeUpdate',{
            currentTime
          });
        }
      })

      // 监听背景音频自然播放结束事件
      bgAudioManager.onEnded(() => {
        // 当前音乐播放完毕，自动播放下一首
        // 再play页面中，有onNext方法，用来播放下一首，所以我们再父页面绑定onEnd，绑定next方法即可
        this.triggerEvent('onEnd');
      })

      // 监听背景音频播放错误事件
      bgAudioManager.onError((res) => {
        wx.showToast({
          title: '音频错误：' + res.errCode,
        })
      })
    },

    // 设置背景音乐总时长
    setTotalTime() {
      // 返回的是以秒为单位的小数
      duration = bgAudioManager.duration;
      // 对时间进行格式化
      const timeObj = this._formatTime(duration);
      // 给对象里的某个属性赋值，使用['对象.属性']
      this.setData({
        ['showTime.totalTime']: timeObj.min + ':' + timeObj.sec
      })
    },

    // 拖动滑块触发的事件
    onChange(event) {
      // source : touch[拖动] touch-out-of-bounds[超出移动范围] out-of-bounds[超出移动范围后的回弹] friction[惯性] 空[setData]
      // 当以touch拖动滑块时，给进度条赋值和移动距离赋值，并不更新视图，即setData，因为防止用户按住滑块，左右来回滑动，导致频繁setData
      if (event.detail.source == 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100;
        this.data.movableDis = event.detail.x;
        // 滑块拖拽中。。。
        isMoving = true;
      }
    },

    // 拖动滑块结束触发
    onTouchend(event) {
      // 获取当前播放时间（格式化后）
      let currentTimeObj = this._formatTime(bgAudioManager.currentTime);
      // 当touch结束后，才更新视图的progress和movableDis
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeObj.min + ':' + currentTimeObj.sec
      });
      // 通过seek方法，设置音乐再我们拖动结束点播放
      bgAudioManager.seek(duration * this.data.progress / 100);
      // 已经停止拖拽事件滑块...
      isMoving = false;
    },

    // 格式化时间：123.45秒转为02:03，即2分钟零3秒
    _formatTime(second) {
      let min = Math.floor(second / 60);
      let sec = Math.floor(second % 60);
      let minStr = min >= 10 ? min : '0' + min;
      let secStr = sec >= 10 ? sec : '0' + sec;
      return {
        min: minStr,
        sec: secStr
      }
    }
  }
})