//Get bot setup
var Botkit = require('botkit');
var myToken = require('./token').token;
var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: myToken
})

//Load other modules
var weather = require('./weather');
var math = require('./math');

//Fire up bot
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

controller.hears(['^jarvis', '^butler'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.api.users.list({exclude_archived: 1}, function (err, res) {
  		messageUser = getUser(res.members, message.user);
  		bot.startConversation(message, startConvo);
	});
});

controller.hears(["^hello", "^hi", "^hey"],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.api.users.list({exclude_archived: 1}, function (err, res) {
  		messageUser = getUser(res.members, message.user);
		bot.reply(message, 'Hello ' + messageUser.profile.first_name);
	});
});

controller.hears(['weather in'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	var location = message.text.substring(message.text.indexOf('in')+3);
	weather.getWeather(location, function(err, returnMessage){
		if(returnMessage){
			bot.reply(message, returnMessage);
		}
	});
});

controller.on('channel_leave',function(bot,message) {
  	bot.reply(message, "Goodbye " + getUserName(message));
});

controller.on('user_channel_join',function(bot,message) {
  	bot.reply(message, "Welcome " + getUserName(message));
});

//Helper Functions
startConvo = function(err, convo){
	convo.ask('What can I do for you ' + messageUser.profile.first_name + '?', function(response, convo){
		if(response.text.includes('math')){
			mathConvo(response, convo, function(){
				console.log("callback");
				convo.ask('Is there anything else I can do for you?', function(response, convo){
					if(response.text.includes('yes')){
						startConvo(null, convo); //Continue conversation
					}else{
						convo.say("Ok, sounds good");
					}
					convo.next();
				});
			});
		}else{
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

function getUser(memberList, memberID){
	var toReturn = memberList.filter(function(v){
		return v.id === memberID;
	})[0];
	return toReturn;
}

