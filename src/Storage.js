'use strict';

var AWS = require("aws-sdk");

var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

function Storage() {
}

Storage.prototype.save = function (data, callback){
  //console.log('Storage.save', data);
  dynamodb.putItem(data, function (err, data) {
    console.log(err, data);
    if (err) {
      console.log(err, err.stack);
    }
    if (callback) {
      callback();
    }
  });
}


Storage.prototype.load = function (callback){
  //console.log('Storage.load');
  dynamodb.getItem(data, function (err, data) {
    var currentGame;
    if (err) {
      console.log(err, err.stack);
    }
    if (callback) {
      callback();
    }
  });
}

module.exports = Storage;