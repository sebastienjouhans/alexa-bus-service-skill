'use strict';

var BusService = require('./busService');

exports.handler = function (event, context) {
    var busService = new BusService();
    busService.execute(event, context);
};
