// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
      var mobile = event.weRunData.data.phoneNumber;
      return { mobile }
}