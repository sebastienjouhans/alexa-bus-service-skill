'use strict';

var Storage = require('./Storage');
var moment = require('moment-timezone');
const uuid = require('node-uuid');

var BusServiceStorage = function () {
    Storage.call(this);
};


// Extend Storage
BusServiceStorage.prototype = Object.create(Storage.prototype);
BusServiceStorage.prototype.constructor = BusServiceStorage;

BusServiceStorage.prototype.saveData = function(userId, intentName, intentSuccess) {
    let json = {
        TableName: 'AlexaBusServiceTable',
        Item: {
            id: {
                S: uuid.v1()
            },
            userId: {
                S: userId
            },
            date: {
                S: moment().tz('Europe/London').format()
            },
            intent: {
                S: intentName
            },
            intentSuccess: {
                BOOL: intentSuccess
            }
        }
    };

    this.save(json, function() { console.log('data saved'); });
}

module.exports = new BusServiceStorage();