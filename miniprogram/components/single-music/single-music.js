// components/single-music/single-music.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musicData: Object
  },

  /**
   * 用于属性监听
   */
  observers: {
    ['musicData.playCount'](count) {
      this.setData({
        _count: this._formatCount(count, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  lifetimes: {
    // 组件生命周期函数-在组件实例进入页面节点树时执行
    attached: function() {
      // console.log(this.properties.musicData);
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 格式化播放次数,point:保留小数点后几位
    _formatCount(num, point) {
      let numStr = num.toString();
      if (numStr.indexOf('.') > -1) {
        numStr = numStr.split('.')[0];
      }
      // 小于万，正常显示（万即5位数）
      if (numStr.length < 6) {
        return parseInt(numStr);
      } else if (numStr.length > 5 && numStr.length < 9) { // 万-千万
        let pointFront = numStr.substring(0, numStr.length - 4);
        let pointBehind = numStr.substr(numStr.length - 4, point);
        return parseFloat(pointFront + '.' + pointBehind) + '万';
      } else if (numStr.length > 8) { // 亿
        let pointFront = numStr.substring(0, numStr.length - 8);
        let pointBehind = numStr.substr(numStr.length - 8, point);
        return parseFloat(pointFront + '.' + pointBehind) + '亿';
      } else {
        return num;
      }
    }
  }
})