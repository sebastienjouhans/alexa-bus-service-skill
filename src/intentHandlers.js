'use strict';

var BusIntent = require('./BusIntent');


var registerIntentHandlers = function (intentHandlers, skillContext) {
  intentHandlers.NextBusToIntent = function (intent, session, response) {
    try {
      let busIntent = new BusIntent();
      let busDirection = busIntent.getBusDirection(intent);
      console.log('## NextBusToIntent ' + busDirection);
      if (busDirection == null) {
        response.ask("Sorry I didn't reconize the destination, please try again.");
        console.log('## NextBusToIntent - did not reconize the destination');
        return;
      }
      busIntent.getBuses(busDirection, response);
    } catch (error) {
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
            //context.fail("Exception: ${error}");
    }
  };

  intentHandlers.NextBusIntent = function (intent, session, response) {
    try {
      console.log('## NextBusIntent');      
      let busIntent = new BusIntent();
      busIntent.getBuses('all', response);
    } catch (error) {
      console.log('error ' + error);
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
    //context.fail("Exception: ${error}");
    }
  };

  intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
    response.ask('You can say for example, when is the next bus to Canada Water. You also can replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. Using all will give buses for all directions.');
  };

  intentHandlers['AMAZON.CancelIntent'] = function (intent, session, response) {
    var speechOutput = 'Goodbye';
    response.tell(speechOutput);
  };

  intentHandlers['AMAZON.StopIntent'] = function (intent, session, response) {
    var speechOutput = 'Goodbye';
    response.tell(speechOutput);
  };
};


exports.register = registerIntentHandlers;
