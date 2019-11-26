// 最大输入长度
const MAX_NUM = 140;
// 可以选择图片最多数量
const MAX_IMG_NUM = 9;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [], // 图片数组
    inputNum: 0, // 输入个数
    footerBottom: 0, // footer距离底部距离
    chooseShow: true, // 选择图片是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.nickName);
    console.log(options.avatarUrl);
  },

  /**
   * 输入内容时触发事件
   */
  onInput(event) {
    // 获取输入内容
    let value = event.detail.value;
    // 获取输入长度
    let len = value.length;
    this.setData({
      inputNum: len >= MAX_NUM ? `最大输入长度为${MAX_NUM}` : len
    })
  },

  /**
   * 获取textarea焦点时触发事件
   * 获取焦点时，会上拉键盘
   * 我们需要把footer设置到键盘上面
   */
  onFocus(event) {
    // 获取键盘高度
    let keyboardHeight = event.detail.height;
    // 将footer的bottom设置为键盘高度
    this.setData({
      footerBottom: keyboardHeight
    })
  },

  /**
   * 失去焦点，还原footer位置
   */
  onBlur() {
    this.setData({
      footerBottom: 0
    })
  },

  /**
   * 选择图片
   */
  onChooseImage() {
    // 可选择的张数 = 最大张数 - 已经选择的张数(即images数组的长度)
    let canChooseNum = MAX_IMG_NUM - this.data.images.length;
    // 选择图片
    wx.chooseImage({
      count: canChooseNum, // 最多可以选择图片的张数
      sizeType: ['original', 'compressed'], // 所选图片的尺寸,original原图 compressed压缩图
      sourceType: ['album', 'camera'], // 选择图片的来源 album从相册选 camera使用相机
      success: (res) => {
        let imagePaths = res.tempFilePaths; // 图片的本地临时文件路径列表（数组）
        let tempArr = this.data.images.concat(imagePaths);
        // 超过9张，进行截取
        if (tempArr.length > 9) {
          tempArr = tempArr.slice(0, 9);
        }
        this.setData({
          images: tempArr
        });
        // 添加后还能再选几张
        let imgNum = MAX_IMG_NUM - this.data.images.length;
        this.setData({
          chooseShow: imgNum <= 0 ? false : true
        })
      }
    })
  },

  /**
   * 删除图片
   */
  onDelete(event) {
    // 获取图片再数组中的索引
    let index = event.target.dataset.index;
    // 删除数组中指定索引的值(改变原数组)
    this.data.images.splice(index, 1);
    this.setData({
      images: this.data.images
    })
    // 如果删除了以后，数组的长度小于最大长度，那么就显示添加图片
    if (this.data.images.length < MAX_IMG_NUM) {
      this.setData({
        chooseShow: true
      })
    }
  },

  /**
   * 查看图片（放大查看）
   */
  previewImage(event) {
    wx.previewImage({
      current: event.target.dataset.imgsrc, // 当前图片路径
      urls: this.data.images // 所有图片集合
    })
  }
})