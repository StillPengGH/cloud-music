// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async(event, context) => {
  // 获取openid
  const {
    OPENID
  } = cloud.getWXContext();

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID, // 接收者（用户）的 openid
    template_id: 'Mi4YCKSMBsBncYEBhnAekQvWPBaMbhcIoW_oHw2igVI', // 所需下发的模板消息的id
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`, // 点击模板卡片后的跳转页面
    data: { // 模板内容，不填则下发空模板。
      keyword1: {
        value: event.content
      },
      keyword2: {
        value: '评价完成'
      },
      keyword3: {
        value: event.createTime
      }
    },
    formId: event.formId
  });
}