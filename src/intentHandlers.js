'use strict';


var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.NextBusToIntent = function (intent, session, response) {
        try {
            var busDirection = getBusDirection(intent);
            if(null)
            {
                response.tell("sorry I did not reconize the destination.");    
                return;
            }
            getBuses(busDirection, response);
        } 
        catch(error) { 
            console.log("error "+error);
            response.tell("I am sorry but Bus service wasn't able to get the bus' timetable, please try again");
            //context.fail("Exception: ${error}"); 
        }
    };

    intentHandlers.NextBusIntent = function (intent, session, response) {
        try {            
            getBuses("all", response);
        } 
        catch(error) { 
            console.log("error "+error);
            response.tell("I am sorry but Bus service wasn't able to get the bus' timetable, please try again");
            //context.fail("Exception: ${error}"); 
        }
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        response.tell("You can say for example, when is my next bus to Canada Water. You also can replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. Using all will give buses for all directions.");
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {

    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {

    };
};





var getBusDirection = function(intent) {
    
    if(intent.slots.BusDirection && intent.slots.BusDirection.value)
    {
        return intent.slots.BusDirection.value.toLowerCase();
    }
   
    return null;
};





var  getBuses = function (busDirection, response) {

    console.log("bus direction "+busDirection);

    var endpoint = [];

    if(busDirection == "bermondsey" ||
        busDirection == "london bridge")
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
    else if(busDirection == "everywhere" || 
            busDirection == "anywhere" || 
            busDirection == "all")
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
                        var alexaResponse = getAlexaResponse(buses, false);
                        response.tellWithCard(alexaResponse.message, 
                                            "Buses to "+ busDirection, 
                                            alexaResponse.cardContent); 
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
                                    buses = buses.concat(newBuses6);
                                    buses.sort(function(a, b){return a.timeToStation-b.timeToStation});

                                    var alexaResponse = getAlexaResponse(buses, true);
                                    response.tellWithCard(alexaResponse.message, 
                                                    "Buses to Canada Water and London Bridges", 
                                                    alexaResponse.cardContent);
                                }); 
                            });
                        });
                    }
                });
            });
        }, function(){                
            response.tell("I am sorry but Bus service wasn't able to get the bus' timetable, please try again.");
        });
    }
    else
    {                
        response.tell("sorry I did not reconize the destination.");    
    }          
};


var getAlexaResponse = function (buses, isAllDirection){
    var message = "";
    var cardContent = "";
    for(var i=0; i<buses.length; i++)
    {
        message += buses[i].lineName + " towards " + buses[i].direction + " expected in " + buses[i].minutes + " minutes and " + buses[i].seconds + " seconds, ";
        let direction = (isAllDirection ? " to " + buses[i].direction : "");
        cardContent += "- " +buses[i].lineName + direction + " in " + buses[i].minutes + " mins and " + buses[i].seconds + " secs\n";
        if(i==2)
        {
            break;
        }
    }
    return {message:message, cardContent:cardContent};
};



var getRequest = function(url, eventCallback, errorCallback) {
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
        errorCallback();
    });
};


var parseBuseResponse = function(body) {
    var buses = [];
    var data = JSON.parse(body);
    //console.log(body);
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
