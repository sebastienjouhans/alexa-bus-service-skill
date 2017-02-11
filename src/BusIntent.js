'use strict';

var async = require('async');
var moment = require('moment-timezone');

var HttpsRequest = require('./HttpsRequest');
var BusParser = require('./BusDataParser');
var storage = require('./storage');


function BusIntent() {
}

BusIntent.prototype = (function () {
  const LONDON_BRIDGE_C10 = 'https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539E&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';
  const LONDON_BRIDGE_381 = 'https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';
  const LONDON_BRIDGE_N381 = 'https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';
  const CANADA_WATER_C10 = 'https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';
  const CANADA_WATER_381 = 'https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';
  const CANADA_WATER_N381 = 'https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266';

  var onAsyncCompleteFailed = function (err, response) {
    console.log(err);
    cantFindBuseTimetableResponse(response);
  };

  var onAsyncCompleteSuccess = function (results, response, busDirection, route) {
    if (results) {
      var buses = [];
      for (var i = 0; i < results.length; i++) {
        if (results[i].length === 0) {
          continue;
        }

        for (var j = 0; j < results[i].length; j++) {
          var newBuses = results[i][j];
          buses.push(newBuses);
        }
      }

      buses.sort(function (a, b) { return a.timeToStation - b.timeToStation });
      buses = removeCloseBuses(buses);

      if (buses.length === 0) {
        cantFindBuseTimetableResponse(response);
        console.log('## no buses from request ' + busDirection);
      } else {
        let alexaResponse = getAlexaResponse(buses, busDirection, route);

        response.tellWithCard(alexaResponse.message,
          alexaResponse.title,
          alexaResponse.cardContent);

        console.log('## 6 bus requests success ' + busDirection);
      }
    } else {
      cantFindBuseTimetableResponse(response);
    }
  };

  var cantFindBuseTimetableResponse = function (response) {
    response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
    console.log("## NextBusToIntent - can't find timetable");
  };

  var getAlexaResponse = function (buses, busDirection, route) {
    let isAllDirection = busDirection === 'all' || busDirection === 'everywhere' || busDirection === 'anywhere';

    let directionTitle = isAllDirection ? 'Canada Water and London Bridge' : busDirection;
    let title = route == null ? 'Buses to ' + directionTitle : route + ' to ' + directionTitle;
    let message = title + ', ';
    let cardContent = moment().tz('Europe/London').format('HH:mm:ss') + '\n';
    let totalBuses = isAllDirection ? 3 : 2;

    for (var i = 0; i < buses.length; i++) {
      message += buses[i].lineName + ' towards ' + buses[i].direction + ' expected in ' + buses[i].minutes + ' minutes and ' + buses[i].seconds + ' seconds, ';
      let direction = (isAllDirection ? ' to ' + buses[i].direction : '');
      cardContent += '- ' + buses[i].lineName + direction + ' in ' + buses[i].minutes + ' mins and ' + buses[i].seconds + ' secs\n';
      if (i === totalBuses) {
        break;
      }
    }
    return { message: message, cardContent: cardContent, title: title };
  };

  var removeCloseBuses = function (buses) {
    for (var i = buses.length - 1; i >= 0; i--) {
      if (parseInt(buses[i].minutes) === 0) {
        buses.splice(i, 1);
      }
    }
    return buses;
  };

  var getBusesData = function (endpoint, callback) {
    let https = new HttpsRequest();
    https.get(endpoint, function (body) {
      let busParser = new BusParser();
      callback(null, busParser.parse(body));
    },
      function () {
        callback(endpoint, null);
      });
  };



  return {
    getBus: function (intent, session, response, route, busDirection) {
      var endpoint = [];

      let busDirectionLowercase = busDirection.toLowerCase();
      let routeLowercase = route.toLowerCase();

      if (routeLowercase === 'c 10' && (busDirectionLowercase === 'bermondsey' ||
        busDirectionLowercase === 'london bridge')) {
        console.log('## getBuses endpoint 1 - ' + busDirectionLowercase + ', ' + route);
        endpoint.push(LONDON_BRIDGE_C10);
      } else if (routeLowercase === 'c 10' && busDirectionLowercase === 'canada water') {
        console.log('## getBuses endpoint 2 - ' + busDirectionLowercase + ', ' + route);
        endpoint.push(CANADA_WATER_C10);
      } else if (routeLowercase === '381' && (busDirectionLowercase === 'bermondsey' || busDirectionLowercase === 'london bridge')) {
        console.log('## getBuses endpoint 3 - ' + busDirectionLowercase + ', ' + route);
        endpoint.push(LONDON_BRIDGE_381);
        endpoint.push(LONDON_BRIDGE_N381);
      } else if (routeLowercase === '381' && busDirectionLowercase === 'canada water') {
        console.log('## getBuses endpoint 4 - ' + busDirectionLowercase + ', ' + route);
        endpoint.push(CANADA_WATER_381);
        endpoint.push(CANADA_WATER_N381);
      }

      if (endpoint.length > 0) {
        async.map(endpoint, getBusesData, function (err, result) {
          if (!err) {
            onAsyncCompleteSuccess(result, response, busDirection, route);
          } else {
            onAsyncCompleteFailed(err, response);
          }
          storage.saveData(session.user.userId, intent.name, !err);
        });
      } else {
        response.ask("Sorry but I didn't reconize the destination or the bus number, please try again.");
        console.log('## getBus - no endpoint');
        storage.saveData(session.user.userId, intent.name, false);
      }
    },

    getBuses: function (intent, session, response, busDirection) {
      var endpoint = [];

      let busDirectionLowercase = busDirection.toLowerCase();

      if (busDirectionLowercase === 'bermondsey' ||
        busDirectionLowercase === 'london bridge') {
        console.log('## getBuses endpoint 1 - ' + busDirection);
        endpoint.push(LONDON_BRIDGE_381);
        endpoint.push(LONDON_BRIDGE_N381);
        endpoint.push(LONDON_BRIDGE_C10);
      } else if (busDirectionLowercase === 'canada water') {
        console.log('## getBuses endpoint 2 - ' + busDirection);
        endpoint.push(CANADA_WATER_381);
        endpoint.push(CANADA_WATER_N381);
        endpoint.push(CANADA_WATER_C10);
      } else if (busDirectionLowercase === 'everywhere' ||
        busDirectionLowercase === 'anywhere' ||
        busDirectionLowercase === 'all') {
        console.log('## getBuses endpoint 3 - ' + busDirection);
        endpoint.push(LONDON_BRIDGE_381);
        endpoint.push(LONDON_BRIDGE_N381);
        endpoint.push(LONDON_BRIDGE_C10);
        endpoint.push(CANADA_WATER_381);
        endpoint.push(CANADA_WATER_N381);
        endpoint.push(CANADA_WATER_C10);
      }

      if (endpoint.length > 0) {
        async.map(endpoint, getBusesData, function (err, result) {
          if (!err) {
            onAsyncCompleteSuccess(result, response, busDirection);
          } else {
            onAsyncCompleteFailed(err, response);
          }
          storage.saveData(session.user.userId, intent.name, !err);
        });
      } else {
        response.ask("Sorry but I didn't reconize the destination, please try again.");
        console.log('## getBuses - no endpoint');
        storage.saveData(session.user.userId, intent.name, false);
      }
    },

    getRoute: function (intent) {
      if (intent.slots.Route && intent.slots.Route.value) {
        console.log('## getRoute - ' + intent.slots.Route.value);
        return intent.slots.Route.value;
      }
      console.log('## getRoute - empty string');
      return null;
    },

    getBusDirection: function (intent) {
      if (intent.slots.BusDirection && intent.slots.BusDirection.value) {
        console.log('## getBusDirection - ' + intent.slots.BusDirection.value);
        return intent.slots.BusDirection.value;
      }
      console.log('## getBusDirection - empty string');
      return null;
    }
  };
})();

module.exports = BusIntent;