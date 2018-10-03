/**
//  * 小程序配置文件、、、、
 */
// var host = "http://127.0.0.1/appoint"

// var host = "http://192.168.1.109/appoint"
var host = "https://appoint.applinzi.com"
var apiUrl = host
var config = {
  //  下面的地址配合云端 Server 工作
  host,
  apiUrl,
  imgUploadUrl: `${host}/index.php/Api/Img/uploadOne`,
  // 登录地址，用于建立会话
  loginUrl: `${host}/index.php/Api/Weixin/login`,
  // check check_3rdsession地址，用于验证
  check3RdUrl: `${host}/index.php/Api/Weixin/check_3rdsession`,
  getUserTelUrl: `${host}/index.php/Api/Weixin/get_user_tel`,
  setSessionUrl: `${host}/index.php/Api/Weixin/setOpenid`
};

module.exports = config

// {
//   "iconPath": "images/5ac57a8bc2756.png",
//     "selectedIconPath": "images/5ac57a8bc27a9.png",
//       "text": "预约",
//         "pagePath": "pages/o9j42s2GS3_page10016/o9j42s2GS3_page10016"
// },
