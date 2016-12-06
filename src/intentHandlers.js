'use strict';


var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.NextBusIntent = function (intent, session, response) {
        getNextBus(intent, session, response);
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {

    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {

    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {

    };
};











  var  getNextBus = function (intent, session, response) {
        var busDirection = intent.slots.BusDirection.value.toLowerCase();
        console.log(busDirection);

        var endpoint = "";

        if(busDirection == "bermondsey" || busDirection == "london bridge")
        {
            endpoint = "https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266";
        }
        else if(busDirection == "canada water")
        {
            endpoint = "https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266";
        }

        if(endpoint)
        {
            sendRequest(endpoint, intent, session, response);
        }
        else
        {                
            response.tell("sorry I did not reconize the destination");    
        }          
    };


   var sendRequest = function (endpoint, intent, session, response) {
        var body = "";
        var request = require('https');
        request.get(endpoint, (rsp) => {
            rsp.on('data', (chunk) => { body += chunk });
            rsp.on('end', () => {
                var buses = parseResponse(body);
                buses.sort(function(a, b){return a.timeToStation-b.timeToStation});
                console.log("**bus time = "+ buses[0].timeToStation);
                var message = buses[0].lineName + " towards " + buses[0].direction + " expected in " + buses[0].minutes + " minutes and " + buses[0].seconds + " seconds";
                response.tell(message);    
            });
        });
    };


   var parseResponse = function(body) {
        var buses = [];
        var data = JSON.parse(body);
        console.log(body);
        for(var i=0; i<data.length; i++)
        {
            var bus = {};
            console.log("bus time = "+ data[i].timeToStation);
            bus.timeToStation = data[i].timeToStation;
            bus.lineName = data[i].lineName;
            bus.direction = data[i].towards;
            var time = parseInt(bus.timeToStation);
            bus.minutes = Math.floor(time / 60);
            bus.seconds = time - bus.minutes * 60;
            buses.push(bus);
        }
        return buses;
    };




exports.register = registerIntentHandlers;
