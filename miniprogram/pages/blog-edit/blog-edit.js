// 最大输入长度
const MAX_NUM = 140;
// 可以选择图片最多数量
const MAX_IMG_NUM = 9;
// 用户信息对象
let userInfo = {};
// 获取云数据库实例
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    images: [], // 图片数组
    inputNum: 0, // 输入个数
    inputValue: '', // 输入的内容
    footerBottom: 0, // footer距离底部距离
    chooseShow: true, // 选择图片是否显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 将昵称和头像url存入userInfo对象
    userInfo = {
      nickName: options.nickName,
      avatarUrl: options.avatarUrl
    };
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
      inputValue: value,
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
    console.log(event);
    wx.previewImage({
      current: event.target.dataset.imgsrc, // 当前图片路径
      urls: this.data.images // 所有图片集合
    })
  },

  /**
   * 发布内容
   */
  onSubmit() {
    if (this.data.inputValue.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return;
    }
    wx.showLoading({
      title: '发布中',
      mask: true
    });
    // 上传图片到云存储（每次只能上传一张）
    let imageArr = this.data.images;
    let fileIDs = []; // 存放上传图片返回的fileID集合
    let promiseArr = []; // 上传图片时异步操作，所有图片上传完才能插入云数据库，所有要用Promise控制
    for (let i = 0, len = imageArr.length; i < len; i++) {
      let promise = new Promise((resolve, reject) => {
        let item = imageArr[i];
        let suffix = /\.\w+$/.exec(item)[0]; // 获取后缀名
        // 将本地资源上传到云存储空间，如果上传至同一路径则是覆盖写
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, // 云存储路径（包含完整的文件夹+名字+后缀名）
          filePath: item, // 资源路径，即上传时返回的路径
          success: (res) => {
            // 上传成功，返回fileID
            let fileID = res.fileID;
            fileIDs = fileIDs.concat(fileID);
            resolve();
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '图片上传失败',
            });
            reject();
          }
        })
      });
      promiseArr.push(promise);
    }

    // 上传完毕，将数据插入云数据库
    Promise.all(promiseArr).then((res) => {
      // 向blog集合插入数据
      db.collection('blog').add({
        data: {
          ...userInfo, // 用户信息，昵称和头像
          content: this.data.inputValue, // 输入内容
          img: fileIDs, // 图片集合
          createTime: db.serverDate() // 服务端当前事件 
        }
      }).then((res) => {
        wx.hideLoading();
        wx.showToast({
          title: '发布成功'
        });
        // 回到上一页
        wx.navigateBack();

        // 获取当前页面栈（返回数组）
        // 0: ye { __wxExparserNodeId__: "92aa0956", __route__: "pages/blog/blog", route: "pages/blog/blog"...}
        // 1: ye {__wxExparserNodeId__: "7dc742f9", __route__: "pages/blog-edit/blog-edit", route: "pages/blog-edit/blog-edit"...}
        let pages = getCurrentPages();
        // 获取上一个页面，当前页面的index是pages.length-1,上一个页面的index就是pages.length-2
        let prevPage = pages[pages.length - 2];
        // 在上一个页面进行刷新操作(即调用下拉刷新函数即可)
        prevPage.onPullDownRefresh();
      });
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '发布失败'
      })
    });
  }
})