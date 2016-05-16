var https = require('https');

var getWeather = function (location, callback){
	var url = 'https://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid in (select woeid from geo.places where text=' + '\'' + location + '\'' + ')&format=json';

	https.get(url, function(res){
		res.setEncoding('binary');
		var resData = "";
		res.on('data', function(chunk){
			return resData += chunk;
		});

		res.on('end', function(){
			var result = JSON.parse(resData);
			if (Array.isArray(result.query.results.channel)) {
                var returnMessage = 'It is currently ' + result.query.results.channel[0].item.condition.temp + ' degrees and ' + result.query.results.channel[0].item.condition.text;
                callback(null, returnMessage);
            } else {
                var returnMessage = 'It is currently ' + result.query.results.channel.item.condition.temp + ' degrees and ' + result.query.results.channel.item.condition.text;
                callback(null, returnMessage);
            }
		})
	});
}

/*getWeather('Chicago', function (err, message) {
    if (message) console.log(message);
});*/

module.exports.getWeather = getWeather;