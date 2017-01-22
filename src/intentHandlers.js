'use strict';

var BusIntent = require('./BusIntent');


var registerIntentHandlers = function (intentHandlers, skillContext) {
  intentHandlers.NextBusesToIntent = function (intent, session, response) {
    try {
      let busIntent = new BusIntent();
      let busDirection = busIntent.getBusDirection(intent);
      console.log('## NextBusesToIntent ' + busDirection);
      if (busDirection == null) {
        response.ask("Sorry I didn't reconize the destination, please try again.");
        console.log('## NextBusesToIntent - did not reconize the destination');
        return;
      }
      busIntent.getBuses(busDirection, response);
    } catch (error) {
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
            //context.fail("Exception: ${error}");
    }
  };

  intentHandlers.NextBusesIntent = function (intent, session, response) {
    try {
      console.log('## NextBusesIntent');      
      let busIntent = new BusIntent();
      busIntent.getBuses('all', response);
    } catch (error) {
      console.log('error ' + error);
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
    //context.fail("Exception: ${error}");
    }
  };

  intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
    let speechOutput = 'You can say for example, when is the next bus to Canada Water. You also can replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. Using all will give buses for all directions.';
    let cardTitle = 'Help';
    let cardContent = '- Alexa ask bus service when is the next bus to Canada Water\n' +
                      '- Alexa ask bus service when is the next bus to London Bridge\n' +
                      '- Alexa ask bus service when is the next bus to all\n' +
                      '- Alexa ask bus service when is the next bus\n';
    response.tellWithCard(speechOutput,
                          cardTitle,
                          cardContent);
  };

  intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
    let speechOutput = 'Goodbye';
    response.tell(speechOutput);
  };

  intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
    let speechOutput = 'Goodbye';
    response.tell(speechOutput);
  };
};


exports.register = registerIntentHandlers;
