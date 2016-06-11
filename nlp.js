var sentiment = require('sentiment');

var getSentiment = function(phrase, callback){
	var analysis = sentiment(phrase);
	var returnScore = analysis.comparative;
	callback(returnScore);
	//console.log(analysis);
}

module.exports.getSentiment = getSentiment;