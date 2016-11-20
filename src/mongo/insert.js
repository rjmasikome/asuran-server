"use strict";

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var logger = require("../logger");

module.exports = function(obj, collectionName, cb) {

  MongoClient.connect( "mongodb://localhost:27017/asuran", function(err, db) {

    var collection = db.collection(collectionName);
    obj._id = (new ObjectId).toString()

    if (err) {
      cb(err, null);
    }
    else {

      collection.insert(obj, function(err, success) {

        if (err) {
          cb(err, null);
        }
        else {
          var successObj  = {
            id:  obj._id,
            collection: collectionName,
            msg: "Insert Success"
          }
          cb(null, successObj);
        }

        //Close connection
        db.close();
      });

    }

  });
}
