"use strict";

var mqtt = require('mqtt');
var logger = require("./logger");
var find = require("./mongo/find");
var client  = mqtt.connect('tcp://broker.hivemq.com');

module.exports = function() {

  client.on('connect', function () {
    client.subscribe('asuran-geo');

    setInterval (function() {
      find({_id: {$exists: true}}, "risks", function(err, results) {
        if (!err) {
          results.forEach(function(n, index) {
            setTimeout(function() {
              client.publish('asuran-geo', JSON.stringify(n));
            }, index*1000);
          });
        }
        else {
          logger.log('error', err)
        }
      });
    }, 20000);

  });

  client.on('message', function (topic, message) {
    // message is Buffer
    logger.log('info', "MQTT sending " + message.toString());
  });

}
