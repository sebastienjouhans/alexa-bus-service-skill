'use strict';

var BusIntent = require('./BusIntent');
var busServiceStorage = require('./BusServiceStorage');


var registerIntentHandlers = function (intentHandlers, skillContext) {
  intentHandlers.NextBusesToIntent = function (intent, session, response) {
    try {
      let busIntent = new BusIntent();
      let busDirection = busIntent.getBusDirection(intent);
      console.log('## NextBusesToIntent ' + busDirection);
      if (busDirection == null) {
        response.ask("Sorry I didn't reconize the destination, please try again.");
        busServiceStorage.saveData(session.user.userId, intent.name, false);
        console.log('## NextBusesToIntent - did not reconize the destination');
        return;
      }
      busIntent.getBuses(intent, session, response, busDirection);
    } catch (error) {
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
      busServiceStorage.saveData(session.user.userId, intent.name, false);
      console.log('error ' + error);
    }
  };

  intentHandlers.NextBusesIntent = function (intent, session, response) {
    try {
      console.log('## NextBusesIntent');
      let busIntent = new BusIntent();
      busIntent.getBuses(intent, session, response, 'all');
    } catch (error) {
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
      busServiceStorage.saveData(session.user.userId, intent.name, false);
      console.log('error ' + error);
    }
  };

  intentHandlers.NextBusToIntent = function (intent, session, response) {
    try {
      let busIntent = new BusIntent();
      let busDirection = busIntent.getBusDirection(intent);
      let route = busIntent.getRoute(intent);
      console.log('## NextBusToIntent busDirection ' + busDirection);
      console.log('## NextBusToIntent route ' + route);
      if (busDirection == null) {
        response.ask("Sorry I didn't reconize the destination, please try again.");
        busServiceStorage.saveData(session.user.userId, intent.name, false);
        console.log('## NextBusToIntent - did not reconize the destination busDirection == null');
        return;
      }
      if (route == null) {
        response.ask("Sorry I didn't reconize the route, please try again.");
        busServiceStorage.saveData(session.user.userId, intent.name, false);
        console.log('## NextBusToIntent - did not reconize the destination route == null');
        return;
      }
      busIntent.getBus(intent, session, response, route, busDirection);
    } catch (error) {
      response.ask("Sorry but I wasn't able to get the bus' timetable at this time, please try again.");
      busServiceStorage.saveData(session.user.userId, intent.name, false);
      console.log('## NextBusToIntent - ' + error);
    }
  };

  intentHandlers['AMAZON.HelpIntent'] = function (intent, session, response) {
    let speechOutput = 'You can say for example, when is the next bus to Canada Water. You also can ' +
      'replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. ' +
      'Using all will give buses for all directions. For further commands check out the Alexa app on your mobile. ' +
      'I have sent a card with  the list of all available commands. Why don\'t you try one of the commands yourself now?';
    let reprompt = 'Have look at the Alexa app for a list of all avalaible commands.';
    let cardTitle = 'Help';
    let cardContent = '- Alexa ask bus service when is the next bus to Canada Water\n' +
      '- Alexa ask bus service when is the next bus to London Bridge\n' +
      '- Alexa ask bus service when is the next bus to all\n' +
      '- Alexa ask bus service when is the next bus\n' +
      '- Alexa ask bus service when is the next 381 to London Bridge\n' +
      '- Alexa ask bus service when is the next 381 to Canada Water\n' +
      '- Alexa ask bus service when is the next c10 to London Bridge\n' +
      '- Alexa ask bus service when is the next c10 to Canada Water\n';
    response.askWithCard(speechOutput,
      reprompt,
      cardTitle,
      cardContent);
    busServiceStorage.saveData(session.user.userId, intent.name, true);
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
