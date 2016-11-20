"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('md5');
var logger = require('./logger');
var mqtt = require('./mqtt');
var insert = require('./mongo/insert');
var findOne = require('./mongo/findOne');
var find = require('./mongo/find');
var update = require('./mongo/update');
var checkCities = require('./helper/checkCities');
var risks = require('../risks');
var app = express();
var port = '8080';

mqtt();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  return next();
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/getRisk', function (req, res) {
  res.send(req.body);
  // localGenerator(req.body.url, req.body.context, function (response) {
  //   res.send(response);
  // });
});

app.post('/setAddress', function(){

  if(req.body.address && req.body.id) {
    var set = {
      $set: {
        address: req.body.address
      }
    };
    update(req.body.id, set, "users", function(err, success) {
      if (!err) {
        res.send(success);
        logger.log('info', success);
      }
      else {
        res.send(err);
        logger.log('error', err);
      }
    });
  }
  else {
    var errMsg = {error: "error", msg:"No address or id defined"}
    res.send(err);
    logger.log('error', errMsg);
  }
});

app.post('/calculateSummary', function (req, res) {

  var tokens;
  var summaryFound = false;

  logger.log('info', req.body);

  if (req.body.address) {
    tokens = req.body.address.split(" ");
    tokens.forEach(function(n, i, arr) {
      checkCities(n, function(err, cityName) {

        if (!err) {
          summaryFound = true;
          find({where: true, city: cityName}, "risks", function(err, results) {
            if (!err) {
              var obj = [{name: "car", children:[]},{name: "house", children:[]},{name: "life", children:[]}];
              results.forEach(function(n){
                if(req.body.disable){
                  req.body.disable.forEach(function(element) {
                    delete n[element];
                  });
                }
                if(n.type === "car") {
                  n.status = true;
                  obj[0].status = true;
                  obj[0].children.push(n);
                } else if(n.type === "house") {
                  n.status = true;
                  obj[1].status = true;
                  obj[1].children.push(n);
                } else if(n.type === "life") {
                  n.status = true;
                  obj[2].status = true;
                  obj[2].children.push(n);
                }
              });
              res.send(obj);
            }
            else {
              logger.log('error', err);
              res.send(err);
            }
          });
        }

        if (i === arr.length - 1) {
          if (!summaryFound) {
            var errObj = {
              error: "Error",
              msg: "Your city is not yet in our database, coming soon"
            }
            logger.log('error', errObj);
            res.send(errObj);
          }
        }
      });
    });
  }


  // localGenerator(req.body.url, req.body.context, function (response) {
  //   res.send(response);
  // });
});


app.post('/setRisk', function (req, res) {
  // res.send(req.body);
  risks.forEach(function(n, i, arr) {
    if (n.where) {
      var now = new Date();
      n.start= new Date().getTime();
      n.end = new Date(now.setFullYear(now.getFullYear() + 20)).getTime();
    }
    if (n.when) {
      var now = new Date();
      n.start = new Date().getTime();
      n.end = new Date(now.setMinutes(now.getMinutes() + 5)).getTime();
    }
    insert(n, "risks", function(err, result){
      if (!err) {
        logger.log('info', result);
        if (i === arr.length-1) {
          res.send("Risks updated");
        }
      }
      else {
        logger.log('info', err);
      }
    });
  });
});

app.post('/claim', function (req, res) {
  res.send(req.body);
  // remoteGenerator(req.body.data, req.body.context, function (response) {
  //   res.send(response);
  // });
});

app.post('/setUser', function (req, res) {
  insert(req.body, "users", function(err, result){
    if (!err) {
      logger.log('info', result);
      res.send(result);
    }
    else {
      logger.log('info', err);
    }
  });
});

app.get('/getUser/:id', function (req, res) {
  findOne({_id: req.params.id}, "users", function(err, result){
    if (!err) {
      logger.log('info', "Returning user", result._id);
      res.send(result);
    }
    else {
      logger.log('info', err);
      res.send(err);
    }
  });
});

app.post('/login', function (req, res) {

  findOne({"login.password": md5(req.body.password), "login.username": req.body.username}, "users", function(err, result){
    if (!err) {
      logger.log('info', "Returning user", result._id);
      res.send(result);
    }
    else {
      logger.log('info', err);
      res.send(err);
    }
  });
});

app.listen(port, function () {
  logger.log('info', 'Asuran server is listening on port ' + port + ' !');
});
