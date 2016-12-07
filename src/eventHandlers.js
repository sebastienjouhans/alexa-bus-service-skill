'use strict';

var registerEventHandlers = function (eventHandlers, skillContext) {
    eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
        
    };

    eventHandlers.onLaunch = function (launchRequest, session, response) {
        response.tell("Welcome to the bus service skill. You can say for example, when is my next bus to Canada Water or London Bridge");
    };
};
exports.register = registerEventHandlers;
