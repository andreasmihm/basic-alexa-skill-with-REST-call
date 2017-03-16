// This code sample shows how to call and receive external rest service data, within your skill Lambda code.

// var AWS = require('aws-sdk');

var https = require('https');



exports.handler = function( event, context ) {
    var say = "";
    var shouldEndSession = true;
    var sessionAttributes = {};

    if (event.session.attributes) {
        sessionAttributes = event.session.attributes;
    }

    if (event.request.type === "LaunchRequest") {
        say = "Willkommen im Skill";
        context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

    } else {
        var IntentName = event.request.intent.name;

        if (IntentName === "CustomIntent") {

            if (event.request.intent.slots.day.value) {
            
            var day = event.request.intent.slots.day.value;
            var path = '/prod/restapi?day=' + day;
            console.log(path);
            

            var get_options = {
                host:  'host.domain.com',
                port: '443',
                path: path,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }};
                var get_req = https.request(get_options, function(res) {
                    res.setEncoding('utf8');
                    var statusCode = res.statusCode;
                    var returnData = "";
                    res.on('data', function (chunk) {
                        returnData += chunk;
                    });
                    res.on('end', function () {

                        if (statusCode == 200) {

                            var allTitles = "";
                            var allItems = JSON.parse(returnData).Items;
                            var arrayLength = allItems.length;
                            console.log("found titles: " + arrayLength);
                            for (var i = 0; i < arrayLength; i++) {
                                var nextTitle = allItems[i].title;
                                allTitles = allTitles + "; " + nextTitle;
                            }
                            say = "Folgende Elemente wurden gefunden "+ day + " : " + allTitles;
                        }

                        // This line concludes the lambda call.  Move this line to within any asynchronous callbacks that return and use data.
                        context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

                    });
                  });
            get_req.end();

            }    

        } else if (IntentName === "AMAZON.StopIntent" || IntentName === "AMAZON.CancelIntent") {
            say = "OK und tschüss";
            shouldEndSession = true;
            context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });


        } else if (IntentName === "AMAZON.HelpIntent" ) {
            say = "Ich erzähle Dir hier, wie das SKill zu benutzen ist."
            shouldEndSession = true;
            context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(say, shouldEndSession) });

        }
    }
};

function buildSpeechletResponse(say, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + say + "</speak>"
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>Please try again. " + say + "</speak>"
            }
        },
        card: {
            type: "Simple",
            title: "Test Skill",
            content: say
        },
        shouldEndSession: shouldEndSession
    };
}