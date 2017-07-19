/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';

const request = require('request');
const Alexa = require('alexa-sdk');
const events = require('events');
var escape = require('escape-html');
var index = 1;

var eventEmitter = new events.EventEmitter();

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).

const handlers = {
    'LaunchRequest': function () {
        var test = this.event.email;
        console.log(test);
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        } else {
            this.emit(':ask', "Hello, I'm Salazar the Spark bot. How can I help you? You can say 'read my messages', 'list my rooms', or 'create a new room' ", "Hello, I'm Salazar the Spark bot. How can I help you? You can say 'read my messages', 'list my rooms', or 'create a new room' ");
        }
    },
    'GetRoomIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        } else {
            var options = {
                url: 'https://api.ciscospark.com/v1/rooms',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + userToken,
                    'Accept': 'application/json'
                }
            };
            request(options, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred 
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('body:', body);
                body = JSON.parse(body);
                var rooms = "";
                for (var i = 0; i < body.items.length; i++) {
                    console.log(body.items[i].title);
                    rooms += body.items[i].title + ", ";
                };
                self.emit(':ask', "Ok. Here are your rooms: " + rooms + " . To get the latest message from your rooms, say 'read my messages' ", "To get the latest message from your rooms, say 'read my messages' ");
            });
        }
    },
    'GetMessagesIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        };
        var roomOptions = {
            url: 'https://api.ciscospark.com/v1/rooms',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'application/json'
            }
        };
        //Get array of room Ids
        request(roomOptions, function (error, response, body) {
            if (error == null) {
                this.emit(':tell', 'There are no messages');
            }
            console.log('error:', error); // Print the error if one occurred 
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            console.log('rooms body:', body);
            body = JSON.parse(body);
            var rooms = "";
            var listOfMsgs = "";
            var roomTitle;
            if (body.items[0] != undefined) {
                rooms = body.items[0].id;
                roomTitle = body.items[0].title;
                var msgOptions = {
                    url: 'https://api.ciscospark.com/v1/messages',
                    headers: {
                        'Content-type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer ' + userToken,
                        'Accept': 'application/json'
                    },
                    qs: {
                        'roomId': rooms
                    }
                };
                request(msgOptions, function (error, response, body) {
                    console.log('error:', error); // Print the error if one occurred 
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                    console.log('msgs body:', body);
                    body = JSON.parse(body);
                    if (body.items[0] != undefined) {
                        listOfMsgs += body.items[0].text;
                        console.log('msgs ' + body.items[0].text);
                        console.log('list of msgs: ' + listOfMsgs);
                        self.emit(':ask', "Ok. Here is your last message from " + roomTitle + ". " + escape(listOfMsgs) + ". Would you like to know more? Say yes for more messages or menu to return to the menu.", "Would you like to know more? Say yes for more messages or menu to return to the menu.");
                    } else {
                        self.emit(':ask', "There are no messages in " + roomTitle + ". You can say 'next' to get messages from your next room. ", "There are no messages in " + roomTitle + ". Say 'next' to get messages from your next room.");
                    }
                });
            } else {
                self.emit(':ask', 'There are no rooms. Please create a room or return to the menu.', 'There are no rooms. Please create a room or return to the menu.')
            }
        });
    },
    'AMAZON.YesIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        };
        var roomOptions = {
            url: 'https://api.ciscospark.com/v1/rooms',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'application/json'
            }
        };
        //Get array of room Ids
        request(roomOptions, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred 
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
            console.log('rooms body:', body);
            body = JSON.parse(body);
            var rooms = 0;
            var listOfMsgs = "";
            var roomTitle = "";
            console.log('index: ', index);
            if (index < body.items.length) {
                rooms = body.items[index].id;
                roomTitle = body.items[index].title;
                var msgOptions = {
                    url: 'https://api.ciscospark.com/v1/messages',
                    headers: {
                        'Content-type': 'application/json; charset=utf-8',
                        'Authorization': 'Bearer ' + userToken,
                        'Accept': 'application/json'
                    },
                    qs: {
                        'roomId': rooms
                    }
                };
                request(msgOptions, function (error, response, msgBody) {
                    console.log('error:', error); // Print the error if one occurred 
                    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                    console.log('msgs body:', msgBody);
                    msgBody = JSON.parse(msgBody);
                    if (msgBody.items.length > 0) {
                        console.log('message length: ', msgBody.items.length);
                        var string = "Ok. Here is your last message from " + body.items[index].title + ". " + escape(msgBody.items[0].text) + ". Would you like to know more? Say yes for more messages or menu to return to the menu.";
                        index++;
                        self.emit(':ask', string, "Would you like to know more? Say yes for more messages or menu to return to the menu.");
                    } else {
                        index++;
                        self.emit(':ask', "There was no message in " + body.items[index-1].title + ". Say next to get the next message.", "Say next to get the next message.");
                    }
                });
            } else {
                index = 1;
                self.emit(':ask', "There are no more messages. You can say 'Return to menu' or repeat my messages ", "There are no more messages. You can say 'Return to menu' or repeat my messages ");
            }
        });


    },
    'NewRoomIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        }
        var userTitle = this.event.request.intent.slots.Title.value;
        if (userTitle == undefined) {
            self.emit(':ask', "What should the room be called? For example, say 'New Room', 'Marketing', or 'Sales' ", "What should the room be called? For example, say 'New Room', 'Marketing', or 'Sales' ");
        }
        var options = {
            url: 'https://api.ciscospark.com/v1/rooms',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'application/json'
            },
            form: {
                'title': userTitle
            }
        };
        request.post(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', httpResponse.statusCode);
            self.emit(':tell', "Ok. I've created a new room called " + userTitle);
        });
    },
    'AMAZON.NoIntent': function () {
        this.emit(':ask', "Ok here is your menu: You can say 'list my rooms', 'read my messages', or 'create a new room'", "Here is your menu: You can say 'list my rooms', 'read my messages', or 'create a new room'");
    },
    'MenuIntent': function () {
        this.emit('AMAZON.NoIntent');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = "You can say 'list my rooms', 'create a room', or 'read my messages' ";
        const reprompt = "You can say 'list my rooms', 'create a room', or 'read my messages'. ";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', "Ok. Have a good day.");
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', "Ok. Have a good day.");
    },
    'Unhandled': function () {
        this.emit(':tell', "Goodbye.")
    },
    'GetTeamsIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        } else {
            var options = {
                url: 'https://api.ciscospark.com/v1/teams',
                headers: {
                    'Content-type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + userToken,
                    'Accept': 'application/json'
                }
            };
            request(options, function (error, response, body) {
                console.log('error:', error); // Print the error if one occurred 
                console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
                console.log('body:', body);
                body = JSON.parse(body);
                var teams = "";
                if (body.items[0] != undefined) {
                    for (var i = 0; i < body.items.length; i++) {
                        console.log(body.items[i].name);
                        teams += body.items[i].name + ", ";
                    };
                    let teamsPhrase = "Here are your teams: ";
                    if (body.items.length == 1) {
                        teamsPhrase = "Here is your team: "
                    };
                    self.emit(':tell', "Ok. " + teamsPhrase + teams + " .' ");
                } else {
                    self.emit(':ask', "There are no teams. You can say 'create a team'", "There are no teams. You can say 'create a team'");
                }
            });
        }
    },
    'NewTeamIntent': function () {
        var self = this;
        var userToken = this.event.session.user.accessToken;
        if (userToken == undefined) {
            this.emit(':tellWithLinkAccountCard', 'To start using this skill, please use the companion app to authenticate on Amazon.');
        }
        var teamTitle = this.event.request.intent.slots.TeamName.value;
        if (teamTitle == undefined) {
            self.emit(':ask', "What should the team be called? For example, say 'Marketing', 'Development', or 'Sales' ", "What should the team be called? For example, say 'Marketing', 'Development', or 'Sales' ");
        }
        var options = {
            url: 'https://api.ciscospark.com/v1/teams',
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'application/json'
            },
            form: {
                'name': teamTitle
            }
        };
        request.post(options, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', httpResponse.statusCode);
            self.emit(':tell', "Ok. I've created a new team called " + teamTitle);
        });
    }
};

exports.handler = function (event, context, callback) {
    console.log('my email: ', event.email);
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.registerHandlers(handlers);
    alexa.execute();
};
