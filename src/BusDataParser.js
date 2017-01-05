'use strict';

function BusDataParser () {
}

BusDataParser.prototype = (function () {

  return {

    parse: function (body) {
      var buses = [];
      try {
        console.log('parseBuseResponse body = ' + body);
        var data = JSON.parse(body);
        for (var i = 0; i < data.length; i++) {
          var bus = {};
          bus.timeToStation = data[i].timeToStation;
          bus.lineName = data[i].lineName;
          bus.direction = data[i].towards;
          var time = parseInt(bus.timeToStation);
          bus.minutes = Math.floor(time / 60);
          bus.seconds = time - bus.minutes * 60;
          buses.push(bus);
        }
        return buses;
      } catch (error) {
        console.log('error parseBuseResponse body = ' + body);
        return buses;
      }
    }

  };

})();

module.exports = BusDataParser;