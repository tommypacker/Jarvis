//Get bot setup
var Botkit = require('botkit');
var myToken = require('./Token').token;
var controller = Botkit.slackbot();
var bot = controller.spawn({
	token: myToken
})

//Fire up bot
bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

controller.hears(['hello', 'hi', 'hey'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.reply(message, 'Hello ' + getUserName(message));
});

controller.hears(['jarvis', 'butler'],'direct_message,direct_mention,mention,ambient', function(bot, message){
	bot.reply(message, 'What can I do for you ' + getUserName(message) + '?');
});

controller.on('channel_leave',function(bot,message) {
  	bot.reply(message, "Goodbye " + getUserName(message));
});

controller.on('user_channel_join',function(bot,message) {
  	bot.reply(message, "Welcome " + getUserName(message));
});

controller.hears(['weather'],'ambient', function(bot, message){
	bot.reply(message, 'It is 72 Degrees and Sunny');
});



function getUserName(message){
	return "<@" + message.user + "|cal>"
}