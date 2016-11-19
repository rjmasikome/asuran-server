"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var md5 = require('md5');
var logger = require('./logger');
var mqtt = require('./mqtt');
var insert = require('./mongo/insert');
var findOne = require('./mongo/findOne');
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
