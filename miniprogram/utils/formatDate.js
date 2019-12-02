module.exports = (date) => {
  // 接收的date格式如下：为js的日期格式
  // Wed Nov 27 2019 10: 12: 32 GMT + 0800(中国标准时间)

  // 返回的格式化时间（格式）
  let formatDate = 'yyyy-MM-dd hh:mm:ss'

  // 获取 月、日、小时、分钟、秒
  // 输出：11 27  10   12   32
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let min = date.getMinutes()
  let sec = date.getSeconds()

  let dateObj = {
    'M+': month,
    'd+': day,
    'h+': hour,
    'm+': min,
    's+': sec
  }

  // 以年为例，通过正则，取替换formatData里的yyyy
  if (/(y+)/.test(formatDate)) { // 如果能匹配到多个y
    // RegExp.$1是RegExp的一个属性,指的是与正则表达式匹配的第一个子匹配(以括号为标志)字符串
    formatDate = formatDate.replace(RegExp.$1, date.getFullYear())
  }

  // 和年份一样，我们可以遍历对象dateobj，分别进行替换
  for (let key in dateObj) {
    if (new RegExp('(' + key + ')').test(formatDate)) {
      let value = dateObj[key];
      formatDate = formatDate.replace(RegExp.$1, value.toString().length == 1 ? '0' + value : value);
    }
  }
  return formatDate;
}