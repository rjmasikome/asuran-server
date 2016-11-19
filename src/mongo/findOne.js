"use strict";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var logger = require("../logger");

module.exports = function(query, collectionName, cb) {

  MongoClient.connect( "mongodb://localhost:27017/asuran", function(err, db) {

    var collection = db.collection(collectionName);

    if (err) {
      cb(err, null);
    }
    else {

      collection.findOne(query, function(err, result) {

        if (err) {
          cb(err, null);
        }
        else {
          result && cb(null, result);
          !result && cb('{"error": "Data Not found"}', null);
        }

        //Close connection
        db.close();
      });

    }

  });
}
