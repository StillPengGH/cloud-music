// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const MAX_NUM = 100
// 云函数入口函数
exports.main = async(event, context) => {
  let blogId = 'a4d6e3ee5de45ffe011e4a0239d83534'
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

  return commentArr;
}