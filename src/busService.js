'use strict';
var AlexaSkill = require('./AlexaSkill'),
    eventHandlers = require('./eventHandlers'),
    intentHandlers = require('./intentHandlers');

var APP_ID = undefined;//replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var skillContext = {};

/**
 * ScoreKeeper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var BusService = function () {
    AlexaSkill.call(this, APP_ID);
    skillContext.needMoreHelp = true;
};


// Extend AlexaSkill
BusService.prototype = Object.create(AlexaSkill.prototype);
BusService.prototype.constructor = BusService;

eventHandlers.register(BusService.prototype.eventHandlers, skillContext);
intentHandlers.register(BusService.prototype.intentHandlers, skillContext);

module.exports = BusService;

