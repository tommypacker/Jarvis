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

controller.hears(['hello', 'hi'],'direct_message,direct_mention,mention', function(bot, message){
	bot.reply(message, 'Hello Sir');
});

controller.hears(['weather'],'ambient', function(bot, message){
	bot.reply(message, 'It is 72 Degrees and Sunny');
});

controller.on('channel_leave',function(bot,message) {
  	bot.reply(message, "Goodbye " + message.text.substr(0, message.text.indexOf(' ')));
})

controller.on('user_channel_join',function(bot,message) {
  	bot.reply(message, "Welcome " + message.text.substr(0, message.text.indexOf(' ')));
})