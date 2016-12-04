var request = require('https');

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION");
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log("LAUNCH REQUEST");
        context.succeed(generateResponse( buildSpeechletResponse("Welcome to an Alexa Skill, this is running on a deployed lambda function", true), {} ));
        
        break;

      case "IntentRequest":
        // Intent Request
        console.log("INTENT REQUEST");

        switch(event.request.intent.name) {
        
          case "GetNextBusIntent":
         
            getNextBus(event, context);

            break;

          default:
            throw "Invalid intent";
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log("SESSION ENDED REQUEST");
        break;

      default:
        context.fail("INVALID REQUEST TYPE: ${event.request.type}");

    }

  } catch(error) { context.fail("Exception: ${error}"); }

};


getNextBus = (event, context) => {
    var busDirection = event.request.intent.slots.BusDirection.value.toLowerCase();
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
        var body = "";
        request.get(endpoint, (response) => {
            response.on('data', (chunk) => { body += chunk });
            response.on('end', () => {
                var data = JSON.parse(body);
                //console.log("bus time = "+data[0].timeToStation);
                var timeToStation = data[0].timeToStation;
                var lineName = data[0].lineName;
                var direction = data[0].towards;
                var time = parseInt(timeToStation);
                var minutes = Math.floor(time / 60);
                var seconds = time - minutes * 60;

                var message = lineName + " towards " + direction + " expected in " + minutes + " minutes and " + seconds + " seconds";
                context.succeed(
                    generateResponse(
                        buildSpeechletResponse(message, true), {}));
            });
        });
    }
    else
    {                
        context.succeed(
            generateResponse(
                buildSpeechletResponse("sorry I did not reconize the destination", true), {}));
    
    }          
};


// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  };

};

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };

};