// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入tcb-router
const TcbRouter = require('tcb-router');
// 引入request-promise
const request = require('request-promise');
cloud.init();
const db = cloud.database();

const BASE_URL = 'http://musicapi.xiecheng.live';

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRouter({
    event
  });

  // app.use 表示该中间件适用于所有的路由
  app.use(async(ctx, next) => {
    ctx.data = {};
    await next();
  });

  // 获取歌单列表
  app.router('getMusics', async(ctx, next) => {
    let start = event.start;
    let count = event.count;
    let result = await db.collection('musiclist')
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get();
    ctx.body = result.data;
  });

  // 获取单个歌单的内容和所有歌曲
  app.router('getMenuById', async(ctx, next) => {
    let menuId = event.menuId;
    let result = await request(BASE_URL + '/playlist/detail?id=' + parseInt(menuId));
    ctx.body = JSON.parse(result);
  });

  // 根据musicId获取音乐播放地址
  app.router('getMusicUrl', async (ctx, next) => {
    let musicId = event.musicId;
    let result = await request(BASE_URL + `/song/url?id=${musicId}`);
    ctx.body = JSON.parse(result);
  });

  return app.serve();
}