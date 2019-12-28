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