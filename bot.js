//Get bot setup
var Botkit = require('botkit');
var myToken = require('./token').token;
var controller = Botkit.slackbot({
	json_file_store: './database'
});
var bot = controller.spawn({
	token: myToken
})

//Load other modules
var weather = require('./weather');
var math = require('./math');
var nlp = require('./nlp');


//Get Current Date
var utc = new Date().toJSON().slice(0,10);
utc = utc.toString();

//Fire up bot
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

//Helper Functions
weatherFinder = function(bot, message){
	var location = message.text.substring(message.text.indexOf('in')+3);
	weather.getWeather(location, function(err, returnMessage){
		if(returnMessage){
			bot.reply(message, returnMessage);
		}
	});
}

startConvo = function(err, convo){
	convo.ask('What can I do for you ' + messageUserName + '?', function(response, convo){
		if(response.text.includes('math') || response.text.includes('calculation')){
			mathConvo(response, convo, function(){
				console.log("callback");
				convo.ask('Is there anything else I can do for you?', [
					{
						pattern: 'yes',
						callback: function(response, convo){
							startConvo(null, convo);
							convo.next();
						}	
					},
					{
						pattern: 'no',
						callback: function(response, convo){
							convo.say('Ok, sounds good sir');
							convo.next();
						}
					},
					{
						default: true,
						callback: function(response, convo){
							convo.say('Ok, sounds good sir');
							convo.next();
						}
					}
				]);
			});
		}else{
			convo.say("Not sure what that means sir");
			convo.next();
		}
	});
}


function mathConvo(response, convo, callback){
	convo.ask('Ok, give me a problem to solve', function(response, convo){
		//console.log(response);
		var answer = "";
		math.solveEquation(response.text, function(err, answer){
			console.log(answer);
			convo.say("The answer is " + answer);
			callback();
			convo.next();
		});
	});
	convo.next();
}

function getUserName(message){
	return "<@" + message.user + "|cal>";
}

function checkUserInStorage(controller, message, callback){
	controller.storage.users.get(message.user, function(err, user) {
		//console.log(user);
        if (user === undefined || user === '') {
        	var userTuple = {
        		isThere: false,
        		user: 'None'
        	}
        }else{
        	var userTuple = {
        		isThere: true,
        		user: user
        	}
        }
        callback(userTuple);
    });
}

function getUserFromStorage(controller, message, callback){
	controller.storage.users.get(message.user, function(err, user) {
		//console.log(user);
        callback(user.name);
    });
}

function getUser(memberList, memberID){
	var toReturn = memberList.filter(function(v){
		return v.id === memberID;
	})[0];
	return toReturn;
}

function logSentiment(message){
	nlp.getSentiment(message.text, function(returnScore){
		controller.storage.users.get(message.user, function(err, user){
			if(user[utc] != undefined){
				user[utc] += returnScore;
			}else{
				user[utc] = returnScore;
			}
			controller.storage.users.save(user, function(err, id){
				console.log(user);
			})
		});
	});
}


//Event triggers
controller.hears(['^jarvis', '^butler'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	checkUserInStorage(controller, message, function(response){
  		if(response.isThere){
  			messageUserName = response.user.name;
  			bot.startConversation(message, startConvo);
  		}else{
  			bot.api.users.list({exclude_archived: 1}, function (err, res) {
  				console.log("called");
	  			user = {
		         	id: message.user,
		        };
		        messageUser = getUser(res.members, message.user);
		        user.name = messageUser.profile.first_name;
		        controller.storage.users.save(user, function(err, id) {});
	  			messageUserName = user.name; 
	  			bot.startConversation(message, startConvo);
  			});
  		}
  	});
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I\'ll call you ' + user.name + ' from now on');
        });
    });
});

controller.hears(["^hello", "^hi", "^hey"],'direct_message,direct_mention,mention,ambient', function(bot, message){
	checkUserInStorage(controller, message, function(response){
  		if(response.isThere){
  			bot.reply(message, 'Hello ' + response.user.name);
  		}else{
  			bot.api.users.list({exclude_archived: 1}, function (err, res) {
  				console.log("called");
	  			user = {
		        	id: message.user,
		        };
	            messageUser = getUser(res.members, message.user);
	            user.name = messageUser.profile.first_name;
	        	controller.storage.users.save(user, function(err, id) {});
  				bot.reply(message, 'Hello ' + messageUser.profile.first_name);
  			});
  		}
  	});
});

controller.hears(['weather in'],'direct_message,direct_mention,mention,ambient', weatherFinder);

controller.hears('(.*?)', 'direct_message,direct_mention,mention,ambient', function(bot, message){
	logSentiment(message);
})

controller.on('channel_leave',function(bot,message) {
  	bot.reply(message, "Goodbye " + getUserName(message));
});

controller.on('user_channel_join',function(bot,message) {
  	bot.reply(message, "Welcome " + getUserName(message));
});

