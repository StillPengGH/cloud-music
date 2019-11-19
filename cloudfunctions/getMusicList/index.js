/**
 * 云函数：getMusicList，每天定时12点、23点，获取指定api的音乐，把和云数据库里
 *        musiclist集合不重复的数据，插入到musiclist。
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入request-promise模块（用于发送http请求）
const rq = require('request-promise');
// 初始化云函数
cloud.init();
// 初始化云数据库对象
const db = cloud.database();
// 获取音乐api
const musicURL = 'http://musicapi.xiecheng.live/personalized';
// musiclist集合，因为要频繁使用，所以可以提取出来
const musiclistCollection = db.collection('musiclist');
// 最大限制值
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async(event, context) => {
  // 获取云数据库中musiclist集合的音乐数据（因为云函数限制只能获取100条数据，所以超过100条的话，就无法进行下面的比较）
  // let cloudList = await musiclistCollection.get();
  // 解决超过100条限制
  let countResult = await musiclistCollection.count(); // 获取集合musiclist的总条数，返回值是一个对象
  let total = countResult.total; // 获取总条数
  // 要发送几次请求，能把所有数据获取到
  let times = Math.ceil(total / MAX_LIMIT);
  let tasks = [];
  for (let i = 0; i < times; i++) {
    let promise = musiclistCollection
      .skip(i * MAX_LIMIT) //从第几条开始取
      .limit(MAX_LIMIT) // 取多条
      .get();
    tasks.push(promise);
  }
  let cloudList = {
    data: []
  }
  if (tasks.length > 0) {
    // 返回一个数据，数组包含三个对象[{data:[..],errMsg:'collection.get:ok'},{data:[..],errMsg:'collection.get:ok'},...]
    let musicAllArr = await Promise.all(tasks);
    // 对数组进行累加操作，acc前一次累加结果，cur当前对象
    cloudList = musicAllArr.reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    });
  }

  // 从远程api获取音乐列表
  let musicList = await rq(musicURL).then((res) => {
    return JSON.parse(res).result;
  })
  // 存储不重复的音乐 
  let musicArr = [];
  for (let i = 0, len = musicList.length; i < len; i++) {
    let flag = true;
    for (let j = 0, len2 = cloudList.data.length; j < len2; j++) {
      if (musicList[i].id == cloudList.data[j].id) {
        flag = false;
        break;
      }
    }
    if (flag) {
      musicArr.push(musicList[i]);
    }
  }
  // 获取到音乐数据插入到云数据库的musiclist集合中
  for (let i = 0, len = musicArr.length; i < len; i++) {
    await musiclistCollection.add({
      data: {
        ...musicArr[i],
        createTime: db.serverDate()
      }
    }).then((res) => {
      console.log('插入成功');
    }).catch((err) => {
      console.error('插入失败');
    })
  }

  return musicArr.length;
}