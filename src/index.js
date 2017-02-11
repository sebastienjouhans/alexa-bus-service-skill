'use strict';

var BusService = require('./BusService');

exports.handler = function (event, context) {
    var busService = new BusService();
    busService.execute(event, context);
};
