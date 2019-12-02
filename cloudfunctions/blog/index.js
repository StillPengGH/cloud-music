const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const blogCollection = db.collection('blog')
const blogCommentCollection = db.collection('blogComment')
const MAX_NUM = 100

exports.main = (event, context) => {
  const app = new TcbRouter({
    event
  })

  // 获取博客列表
  app.router('list', async(ctx) => {
    let start = event.start
    let count = event.count
    let keyword = event.keyword
    let where = {}
    // 模糊查询
    if (keyword.trim() != '') {
      where = {
        content: new db.RegExp({ // 查询字段content
          regexp: keyword, // 匹配搜索关键字
          options: 'i' //忽略大小写
        })
      }
    }
    let res = await blogCollection
      .where(where)
      .skip(start)
      .limit(count)
      .orderBy('createTime', 'desc')
      .get()
    let blogList = res.data
    ctx.body = blogList
  })

  // 添加评论
  app.router('addComment', async(ctx) => {
    let blogId = event.blogId
    let comment = event.comment
    let nickName = event.nickName
    let avatarUrl = event.avatarUrl
    let openId = cloud.getWXContext().OPENID
    let createTime = db.serverDate();
    let res = await blogCommentCollection.add({
      data: {
        blogId,
        openId,
        comment,
        nickName,
        avatarUrl,
        createTime
      }
    })
    ctx.body = res
  })

  // 获取博客详细信息 a4d6e3ee5de45ffe011e4a0239d83534
  app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    // 获取博客信息
    let blogDetail = await db.collection('blog').where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })
    // 获取评论信息
    let countResult = await db.collection('blogComment').count()
    let total = countResult.total // 获取总条数
    let times = Math.ceil(total / MAX_NUM)
    let promiseArr = []
    for (let i = 0; i < times; i++) {
      let promise = db.collection('blogComment').where({
        blogId
      }).skip(i * MAX_NUM).limit(MAX_NUM).orderBy('createTime', 'desc').get()
      promiseArr.push(promise)
    }

    let commentArr = []
    if (promiseArr.length > 0) {
      let resArr = await Promise.all(promiseArr)
      commentArr = resArr.reduce((acc, cur) => {
        return acc.data.concat(cur.data)
      })
    }
    
    // 返回结果
    ctx.body = {
      blogDetail,
      commentArr
    }
  });

  return app.serve()
}