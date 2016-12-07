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

        var endpoint = [];

        if(busDirection == "bermondsey" || busDirection == "london bridge")
        {
            endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539E&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");

        }
        else if(busDirection == "canada water")
        {
            endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        }
        else if(busDirection == "all")
        {
            endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539E&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
            endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        }

        if(endpoint.length>0)
        {
            var buses = [];
            getRequest(endpoint[0], function(body){
                var newBuses1 = parseBuseResponse(body);
                getRequest(endpoint[1], function(body){
                    var newBuses2 = parseBuseResponse(body);
                    getRequest(endpoint[2], function(body){
                        var newBuses3 = parseBuseResponse(body);
                        if(endpoint.length<6)
                        {
                            buses = buses.concat(newBuses1);
                            buses = buses.concat(newBuses2);
                            buses = buses.concat(newBuses3);
                            buses.sort(function(a, b){return a.timeToStation-b.timeToStation});
                            /*
                            console.log("**bus time = "+ buses[0].timeToStation);
                            console.log("**bus time = "+ buses[1].timeToStation);
                            console.log("**bus time = "+ buses[2].timeToStation);
                            console.log("**bus time = "+ buses[3].timeToStation);
                            */
                            var message = "";
                            for(var i=0; i<buses.length; i++)
                            {
                                message += buses[i].lineName + " towards " + buses[i].direction + " expected in " + buses[i].minutes + " minutes and " + buses[i].seconds + " seconds, ";

                                if(i==2)
                                {
                                    break;
                                }
                            }
                            response.tell(message); 
                        }
                        else
                        {
                            getRequest(endpoint[3], function(body){
                                var newBuses4= parseBuseResponse(body);
                                getRequest(endpoint[4], function(body){
                                    var newBuses5 = parseBuseResponse(body);
                                   getRequest(endpoint[5], function(body){
                                        var newBuses6 = parseBuseResponse(body);
                                        buses = buses.concat(newBuses1);
                                        buses = buses.concat(newBuses2);
                                        buses = buses.concat(newBuses3);
                                        buses = buses.concat(newBuses4);
                                        buses = buses.concat(newBuses5);
                                        buses = buses.concat(newBuses3);
                                        buses.sort(function(a, b){return a.timeToStation-b.timeToStation});

                                        var message = "";
                                        for(var i=0; i<buses.length; i++)
                                        {
                                            message += buses[i].lineName + " towards " + buses[i].direction + " expected in " + buses[i].minutes + " minutes and " + buses[i].seconds + " seconds, ";

                                            if(i==3)
                                            {
                                                break;
                                            }
                                        }
                                        response.tell(message); 
                                    }); 
                                });
                            });
                        }
                    });
                });
            });
        }
        else
        {                
            response.tell("sorry I did not reconize the destination");    
        }          
    };



var getRequest = function(url, eventCallback) {
    var request = require('https');
    request.get(url, function(response) {
        var body = '';
        response.on('data', function (chunk) {
            body += chunk;
        });
        response.on('end', function () {
            eventCallback(body);
        });
    }).on('error', function (e) {
        console.log("Got error: ", e);
    });
};


   var parseBuseResponse = function(body) {
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
