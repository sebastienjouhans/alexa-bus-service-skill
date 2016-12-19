'use strict';


var registerIntentHandlers = function (intentHandlers, skillContext) {

    intentHandlers.NextBusToIntent = function (intent, session, response) {
        try {
            let busDirection = getBusDirection(intent);
            console.log("## NextBusToIntent "+busDirection);    
            if(busDirection == null)
            {
                response.ask("Sorry I didn't reconize the destination, please try again.");    
                console.log("## NextBusToIntent - did not reconize the destination");
                return;
            }
            getBuses(busDirection, response);
        } 
        catch(error) { 
            console.log("error "+error);
            response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
            //context.fail("Exception: ${error}"); 
        }
    };

    intentHandlers.NextBusIntent = function (intent, session, response) {
        try {        
            console.log("## NextBusIntent");    
            getBuses("all", response);
        } 
        catch(error) { 
            console.log("error "+error);
            response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
            //context.fail("Exception: ${error}"); 
        }
    };

    intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
        response.ask("You can say for example, when is the next bus to Canada Water. You also can replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. Using all will give buses for all directions.");
    };

    intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    };

    intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    };
};





var getBusDirection = function(intent) {
    
    if(intent.slots.BusDirection && intent.slots.BusDirection.value)
    {
        console.log("## getBusDirection - "+intent.slots.BusDirection.value.toLowerCase()); 
        return intent.slots.BusDirection.value.toLowerCase();
    }
    console.log("## getBusDirection - empty string"); 
    return null;
};





var  getBuses = function (busDirection, response) {

    console.log("## getBuses - bus direction "+busDirection);

    var endpoint = [];

    if(busDirection == "bermondsey" ||
        busDirection == "london bridge")
    {
        console.log("## getBuses endpoint 1 - "+busDirection);
        endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186N&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539E&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");

    }
    else if(busDirection == "canada water")
    {
        console.log("## getBuses endpoint 2 - "+busDirection);
        endpoint.push("https://api.tfl.gov.uk/Line/381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        endpoint.push("https://api.tfl.gov.uk/Line/n381/Arrivals?stopPointId=490006186S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
        endpoint.push("https://api.tfl.gov.uk/Line/c10/Arrivals?stopPointId=490004539S&app_id=8105f5d7&app_key=687691bd1523d7c4c2f56ed249b21266");
    }
    else if(busDirection == "everywhere" || 
            busDirection == "anywhere" || 
            busDirection == "all")
    {
        console.log("## getBuses endpoint 3 - "+busDirection);
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
                        buses = removeCloseBuses(buses);

                        var alexaResponse = getAlexaResponse(buses, busDirection);
                        response.tellWithCard(alexaResponse.message, 
                                                "Buses to "+ busDirection, 
                                                alexaResponse.cardContent); 
                        console.log("## 3 bus requests success "+busDirection); 
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
                                    buses = removeCloseBuses(buses);

                                    var alexaResponse = getAlexaResponse(buses, busDirection);
                                    response.tellWithCard(alexaResponse.message, 
                                                            "Buses to Canada Water and London Bridge", 
                                                            alexaResponse.cardContent);
                                    console.log("## 6 bus requests success "+busDirection);                                     
                                }, 
                                function(){
                                    console.log("## data load error - bus 1");           
                                    cantFindBuseTimetableResponse(response);
                                }); 
                            }, 
                            function(){
                                console.log("## data load error - bus 2");    
                                cantFindBuseTimetableResponse(response);
                            });
                        }, 
                        function(){
                            console.log("## data load error - bus 3");                    
                            cantFindBuseTimetableResponse(response);
                        });
                    }
                }, 
                function(){
                    console.log("## data load error - bus 4");    
                    cantFindBuseTimetableResponse(response);
                });
            }, 
            function(){
                console.log("## data load error - bus 5"); 
                cantFindBuseTimetableResponse(response);
            });
        }, 
        function(){
            console.log("## data load error - bus 6");    
            cantFindBuseTimetableResponse(response);
        });
    }
    else
    {
        response.ask("Sorry but I didn't reconize the destination, please try again.");    
        console.log("## getBuses - no endpoint"); 
    }          
};


var cantFindBuseTimetableResponse = function(response){
    response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
    console.log("## NextBusToIntent - can't find timetable");
};


var getAlexaResponse = function (buses, busDirection){
    var busTitle = busDirection == "all" ? "Canada Water and London Bridge" : busDirection;
    var message = "Buses to " + busTitle + ", ";
    var cardContent = "";
    var isAllDirection = busDirection == "all" || busDirection == "everywhere" || busDirection == "anywhere";
    var totalBuses = isAllDirection ? 3 : 2;
    for(var i=0; i<buses.length; i++)
    {
        message += buses[i].lineName + " towards " + buses[i].direction + " expected in " + buses[i].minutes + " minutes and " + buses[i].seconds + " seconds, ";
        let direction = (isAllDirection ? " to " + buses[i].direction : "");
        cardContent += "- " +buses[i].lineName + direction + " in " + buses[i].minutes + " mins and " + buses[i].seconds + " secs\n";
        if(i==totalBuses)
        {
            break;
        }
    }
    return {message:message, cardContent:cardContent};
};


var removeCloseBuses = function(buses)
{
    for(var i = buses.length - 1; i >= 0; i--) 
    {
        if(parseInt(buses[i].minutes)==0) 
        {
            buses.splice(i, 1);
        }
    }
    return buses;
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
    try
    {
        console.log("parseBuseResponse body = "+body);
        var data = JSON.parse(body);
        for(var i=0; i<data.length; i++)
        {
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
    }
    catch(error)
    {
        console.log("error parseBuseResponse body = "+body);
        return buses;
    }
};




exports.register = registerIntentHandlers;
