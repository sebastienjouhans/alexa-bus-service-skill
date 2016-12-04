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
        
          case "GetFirstBusIntent":
          
          
            var endpoint = "https://hook.io/sebastienjouhans/alexa-next-bus-skill";
            var body = "";
            request.get(endpoint, (response) => {
              response.on('data', (chunk) => { body += chunk });
              response.on('end', () => {
                var data = JSON.parse(body);
                var message = data.lineName + " towards " + data.direction + " expected in " + data.minutes + " minutes and " + data.seconds + " seconds";
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(message, true), {}));
              });
            });
            

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