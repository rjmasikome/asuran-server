"use strict";

var CITY_LIST = ["cologne", "köln", "hamburg", "berlin", "munich", "münchen"];

module.exports = function(name, cb) {
  var lowCaseName = name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
  var index = CITY_LIST.indexOf(lowCaseName);
  if (index >=0) {
    if (lowCaseName === "cologne" || lowCaseName === "köln") {
      console.log("success", "cologne");
      cb(null, "cologne");
    }
    else if (lowCaseName === "munich" || lowCaseName === "münchen") {
      cb(null, "munich");
    }
    else {
      cb(null, lowCaseName);
    }
  }
  else {
    cb("Error", null);
  }
}
