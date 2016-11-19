"use strict";

var MongoClient = require('mongodb').MongoClient;
var logger = require("../logger");

module.exports = function(query, collectionName, cb) {

  MongoClient.connect( "mongodb://localhost:27017/asuran", function(err, db) {

    var collection = db.collection(collectionName);

    if (err) {
      cb(err, null);
    }
    else {

      collection.find(query).toArray( function(err, results) {

        if (err) {
          cb(err, null);
        }
        else {
          results.length > 0 && cb(null, results);
          !results.length && cb('{"error": "Data Not found"}', null);
        }

        //Close connection
        db.close();
      });

    }

  });
}
