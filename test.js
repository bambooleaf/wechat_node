var fs = require('fs');

fs.readFile('access_token.txt',function(err,data){
	if(err){
		console.log(err);
	}
	console.log(data.toString());
});