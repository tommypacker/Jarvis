var https = require('https');

var getWeather = function (location, callback){
	var url = 'https://query.yahooapis.com/v1/public/yql?q=select item from weather.forecast where woeid in (select woeid from geo.places where text=' + '\'' + location + '\'' + ')&format=json';
	console.log(url);

	https.get(url, function(res){
		res.setEncoding('binary');
		var resultJSON = "";
		res.on('data', function(chunk){
			resultJSON += chunk;
		});

		res.on('end', function(){
			var result = JSON.parse(resultJSON);
			if(result.query.results == null){
				callback(null, "Sorry, that's an invalid location");
			}
			else if(Array.isArray(result.query.results.channel)) {
				var locationString = result.query.results.channel[0].item.title;
				//console.log(parseLocation(locationString));
                var returnMessage = 'It\'s currently ' + result.query.results.channel[0].item.condition.temp + ' degrees and ' + result.query.results.channel[0].item.condition.text + ' in ' + parseLocation(locationString);
                callback(null, returnMessage);
            }else{
            	var locationString = result.query.results.channel.item.title;
                var returnMessage = 'It\'s currently ' + result.query.results.channel.item.condition.temp + ' degrees and ' + result.query.results.channel.item.condition.text  + ' in ' + parseLocation(locationString);
                callback(null, returnMessage);
            }
		})
	});
}

function parseLocation(string){
	if(string){
		return string.substring(string.indexOf('for')+4, getNthLocation(string, ',', 2));
	}else{
		return "";
	}
}

function getNthLocation(str, m, i){
	return str.split(m, i).join(m).length;
}

/*getWeather('Chicago', function (err, message) {
    if (message) console.log(message);
});*/

module.exports.getWeather = getWeather;