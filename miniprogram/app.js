App({
  onLaunch: function () {

    // 判断是否支持云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      // 云开发初始化
      wx.cloud.init({
        // env 参数说明：
        // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        // 如不填则使用默认环境（第一个创建的环境）
        // traceUser：是否记录访问小程序的用户
        env: 'develop-env-m2od5',
        traceUser: true,
      })
    }
    // 设置小程序全局属性和全局方法
    this.globalData = {}
  }
})
