'use strict';

var registerEventHandlers = function (eventHandlers, skillContext) {
  eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  };

  eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = 'Welcome to the bus service skill. You can say for example, when is the next bus to Canada Water or London Bridge. Why don\'t you try it yourself now?';
    var repromptText = 'For instructions on what you can say, simply say help me.';
    response.ask(speechText, repromptText);
  };
};
exports.register = registerEventHandlers;
