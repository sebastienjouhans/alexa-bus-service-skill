'use strict';

var Alexa = require('alexa-sdk');

var BusIntent = require('./BusIntent');
var busServiceStorage = require('./BusServiceStorage');

var APP_ID = 'amzn1.ask.skill.7e868583-eaf8-4be0-afdb-251b4858e4cf';

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    //alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.attributes['speechOutput'] = 'Welcome to the bus service skill. You can say for example, when is the next bus to Canada Water or London Bridge. Why don\'t you try it yourself now?';
        this.attributes['repromptSpeech'] = 'For instructions on what you can say, simply say help me.';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    
    'NextBusesToIntent': function () {

        try {
            let busIntent = new BusIntent();
            let busDirection = busIntent.getBusDirection(this.event.request.intent);
            console.log('## NextBusesToIntent ' + busDirection);
            if (busDirection == null) {
                this.attributes['speechOutput'] = "Sorry I didn't reconize the destination, please try again., please try again.";
                this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusesToIntent - did not reconize the destination');
                return;
            }
            busIntent.getBuses(this, busDirection);
        } catch (error) {
            this.attributes['speechOutput'] = "Sorry but I wasn't able to get the bus' timetable at this time, please try again.";
            this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
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
            this.attributes['speechOutput'] = "Sorry but I wasn't able to get the bus' timetable at this time, please try again.";
            this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
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
                this.attributes['speechOutput'] = "Sorry I didn't reconize the destination, please try again.";
                this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusToIntent - did not reconize the destination busDirection == null');
                return;
            }
            if (route == null) {
                this.attributes['speechOutput'] = "Sorry I didn't reconize the route, please try again.";
                this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
                this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
                busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
                console.log('## NextBusToIntent - did not reconize the destination route == null');
                return;
            }
            busIntent.getBus(this, route, busDirection);
        } catch (error) {
            this.attributes['speechOutput'] = "Sorry but I wasn't able to get the bus' timetable at this time, please try again.";
            this.attributes['repromptSpeech'] = 'You can say for example, when is the next bus to Canada Water or London Bridge.';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
            busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, false);
            console.log('## NextBusToIntent - ' + error);
        }
    },


    'AMAZON.HelpIntent': function () {

        this.attributes['speechOutput'] = 'You can say for example, when is the next bus to Canada Water. You also can ' +
            'replace Canada Water with another supported directions such as London Bridge, Bermondsey or all. ' +
            'Using all will give buses for all directions. For further commands check out the Alexa app on your mobile. ' +
            'I have sent a card with  the list of all available commands. Why don\'t you try one of the commands yourself now?';
        this.attributes['repromptSpeech'] = 'Have look at the Alexa app for a list of all avalaible commands.';
        let cardTitle = 'Help';
        let cardContent = '- Alexa ask bus service when is the next bus to Canada Water\n' +
            '- Alexa ask bus service when is the next bus to London Bridge\n' +
            '- Alexa ask bus service when is the next bus to all\n' +
            '- Alexa ask bus service when is the next bus\n' +
            '- Alexa ask bus service when is the next 381 to London Bridge\n' +
            '- Alexa ask bus service when is the next 381 to Canada Water\n' +
            '- Alexa ask bus service when is the next c10 to London Bridge\n' +
            '- Alexa ask bus service when is the next c10 to Canada Water\n';

        this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'], cardTitle, cardContent, null);
        busServiceStorage.saveData(this.event.session.user.userId, this.event.request.intent.name, true);
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
        this.emit(':tell', "Goodbye!");
    }
};
