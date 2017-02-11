'use strict';
var AWS = require("aws-sdk");
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });


function Storage() {
}

Storage.prototype = (function () {
    return {
        save: function (data, callback) {
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
            //console.log(JSON.stringify(json));
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
    };
})();

module.exports = Storage;