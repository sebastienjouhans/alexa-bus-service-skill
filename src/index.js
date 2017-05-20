'use strict';

require('dotenv').config()

var Alexa = require('alexa-sdk');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).alexa;

var BusIntent = require('./BusIntent');
var busServiceStorage = require('./busServiceStorage');
var languageStrings = require('./languageStrings');

var APP_ID = 'amzn1.ask.skill.05fd8b53-71ed-424c-a10e-f14879d37f0b';//amzn1.ask.skill.7e868583-eaf8-4be0-afdb-251b4858e4cf';

exports.handler = dashbot.handler (function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        this.attributes['repromptSpeech'] = this.t('WELCOME_REPROMPT');
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },

    'NextBusesToIntent': function () {

        try {
            let busIntent = new BusIntent();
            let busDirection = busIntent.getBusDirection(this.event.request.intent);
            console.log('## NextBusesToIntent ' + busDirection);
            if (busDirection == null) {
                this.attributes['speechOutput'] = this.t('ERROR_NO_DESTINATION');
                this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusesToIntent - did not reconize the destination');
                return;
            }
            busIntent.getBuses(this, busDirection);
        } catch (error) {
            this.attributes['speechOutput'] = this.t('ERROR_NO_TIMETABLE');
            this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
            busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
            console.log('error ' + error);
        }

    },

    'NextBusesIntent': function () {
        try {
            console.log('## NextBusesIntent');
            let busIntent = new BusIntent();
            busIntent.getBuses(this, 'all');
        } catch (error) {
            this.attributes['speechOutput'] = this.t('ERROR_NO_TIMETABLE');
            this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
            busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
            console.log('error ' + error);
        }
    },

    'NextBusToIntent': function () {
        try {
            let busIntent = new BusIntent();
            let busDirection = busIntent.getBusDirection(this.event.request.intent);
            let route = busIntent.getRoute(this.event.request.intent);
            console.log('## NextBusToIntent busDirection ' + busDirection);
            console.log('## NextBusToIntent route ' + route);
            if (busDirection == null) {
                this.attributes['speechOutput'] = this.t('ERROR_NO_DESTINATION');
                this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusToIntent - did not reconize the destination busDirection == null');
                return;
            }
            if (route == null) {
                this.attributes['speechOutput'] = this.t('ERROR_NO_ROUTE');
                this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusToIntent - did not reconize the destination route == null');
                return;
            }
            busIntent.getBus(this, route, busDirection);
        } catch (error) {
            this.attributes['speechOutput'] = this.t('ERROR_NO_TIMETABLE');
            this.attributes['repromptSpeech'] = this.t('ERROR_REPROMPT');
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
            busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
            console.log('## NextBusToIntent - ' + error);
        }
    },

    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = this.t('HELP_MESSAGE');
        this.attributes['repromptSpeech'] = this.t('WELCOME_REPROMPT');
        let cardTitle = this.t('HELP_TITLE');
        let cardContent = this.t('HELP_CARD');

        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'], cardTitle, cardContent, null);
        busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, true);
    },
    'Unhandled': function () {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try again', 'Try again.');
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
});
