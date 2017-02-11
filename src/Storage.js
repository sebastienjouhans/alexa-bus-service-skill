'use strict';
var AWS = require("aws-sdk");
var moment = require('moment-timezone');
const uuid = require('node-uuid');

var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

var storage = (function () {
    var save = function (data, callback) {
        let json = {
            TableName: 'AlexaBusServiceTable',
            Item: {
                id: {
                    S: data.id
                },
                userId: {
                    S: data.userid
                },
                date: {
                    S: data.date
                },
                intent: {
                    S: data.intent
                },
                intentSuccess: {
                    BOOL: data.intentSuccess
                }
            }
        };
        console.log(JSON.stringify(json));
        dynamodb.putItem(json, function (err, data) {
            console.log(err, data);
            if (err) {
                console.log(err, err.stack);
            }
            if (callback) {
                callback();
            }
        });
    }


    return {
        saveData: function (userId, intentName, intentSuccess) {
            save({
                id: uuid.v1(),
                userid: userId,
                date: moment().tz('Europe/London').format(),
                intent: intentName,
                intentSuccess: intentSuccess
            }, function () { console.log('data saved'); });
        }
    };
})();

module.exports = storage;