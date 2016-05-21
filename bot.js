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

var mathConvo = function(response, convo){
	convo.ask('Ok, give me a problem to solve', function(response, convo){
		//console.log(response);
		var answer = "";
		math.solveEquation(response.text, function(err, answer){
			console.log(answer);
			convo.say("The answer is " + answer);
			convo.next();
		});
	});
	convo.next();
}

controller.hears(["^hello", "^hi", "^hey"],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.api.users.list({exclude_archived: 1}, function (err, res) {
  		messageUser = getUser(res.members, message.user);
		bot.reply(message, 'Hello ' + messageUser.profile.first_name);
	});
});

controller.hears(['^jarvis', '^butler'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.api.users.list({exclude_archived: 1}, function (err, res) {
  		messageUser = getUser(res.members, message.user);
  		bot.startConversation(message, function(err, convo){
  			convo.ask('What can I do for you ' + messageUser.profile.first_name + '?', function(response, convo){
  				if(response.text.includes('math')){
  					mathConvo(response, convo);
  				}
  			});
  		});
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

controller.hears(['do some math'], 'direct_message, direct_mention', function(bot, message){
	bot.startConversation(message, mathConvo);
});

//Helper Functions
function getUserName(message){
	return "<@" + message.user + "|cal>";
}

function getUser(memberList, memberID){
	var toReturn = memberList.filter(function(v){
		return v.id === memberID;
	})[0];
	return toReturn;
}

function parseMathString(string){
	
}