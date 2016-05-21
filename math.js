var parseString = require('xml2js').parseString;
var wolframKey = require('./token').wolframKey;
var https = require('https');
//console.log(wolframKey)

var solveEquation = function(equation, callback){
	if(equation.includes('+')){
		equation = swapPlus(equation);
	}

	var url = "https://api.wolframalpha.com/v2/query?input=" + equation + "&appid=" + wolframKey;
	var resultXML = "";
	https.get(url, function(result){
		result.on('data', function(chunk){
			resultXML += chunk;
		});

		result.on('end', function(){
			//console.log(resultXML);
			var answer = "";
			parseString(resultXML, function(err, resultJSON){
				//console.log(resultJSON.queryresult.pod[1].subpod[0].plaintext[0]);
				answer = resultJSON.queryresult.pod[1].subpod[0].plaintext[0];
			});
			if(answer != ""){
				callback(null, answer);
			}else{
				callback(null, "Please ask a different question");
			}
		});
	});
}

function swapPlus(string){
	return string.replace("+", "plus");
}

//solveEquation("seventyfive / 74");

module.exports.solveEquation = solveEquation;