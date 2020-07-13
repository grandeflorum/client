/*
 * @Author: your name
 * @Date: 2020-01-13 13:11:01
 * @LastEditTime: 2020-06-20 18:13:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \client\src\assets\js\appconfig.js
 */
var AppConfig = (function () {
  var Configuration = function () {
    return {
      baseUrl: "http://localhost:8080",
      appUrl:"http://localhost:4200/#/applogin"
    };
  };
  return {
    Configuration: Configuration()
  };
})();