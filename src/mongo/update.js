"use strict";

var MongoClient = require('mongodb').MongoClient;

module.exports = function(id, set, collectionName, cb) {

  MongoClient.connect(process.env['DB_PATH'] || "mongodb://localhost:27017/homelike", function(err, db) {

    var collection = db.collection("apartments");

    var query = {
      _id: id
    };

    console.log(set);

    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }
    else {

      collection.update(query, set, function(err, success) {

        if (err) {
          console.log(err);
          cb(err, null);
        }
        else {
          var successObj  = {
            id:  id,
            collection: collectionName,
            set: set,
            msg: "Update Success"
          }
          cb(null, successObj);
        }

        //Close connection
        db.close();
      });

    }

  });
}
