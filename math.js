var wolframKey = ""
var https = require('https');


var solveEquation = function(equation, callback){
	var url = "http://api.wolframalpha.com/v2/query?input=" + equation "&appid=" + wolframKey;
	https.get(url, function(result){

	});
}




module.exports.solveEquation = solveEquation;