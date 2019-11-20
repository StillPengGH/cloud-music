// 云函数入口文件
const cloud = require('wx-server-sdk')
// 引入tcb-router
const TcbRouter = require('tcb-router');
cloud.init()
const db = cloud.database();

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

  // 获取音乐列表
  app.router('getMusics', async (ctx,next)=>{
    let start = event.start;
    let count = event.count;
    let musics = await db.collection('musiclist')
      .skip(start)
      .limit(count)
      .orderBy("createTime", "desc")
      .get();
    ctx.body = musics.data;
  });

  return app.serve();
}