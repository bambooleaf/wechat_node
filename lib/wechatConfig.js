var crypto = require('crypto');
var ejs = require('ejs');
var urllib = require('urllib');
var Promise = require("bluebird");
//a=1;
//b=1;
var accessToken = null;
var expireTime = null;
//var web_accessToken = null; //网页获取用户信息使用
var wechatConfig = function() {
	//	console.log("b="+b++);

	if (!(this instanceof wechatConfig)) {
		//console.log(accessToken);
		return new wechatConfig();
	}

	/*this.accessToken = accessToken;
	this.expireTime = expireTime;*/
}


Object.defineProperty(wechatConfig, "_name", {
	configurable: false,
	writable: false,
	value: "gh_6e5730266b52"
});

Object.defineProperty(wechatConfig, "_appId", {
	configurable: false,
	writable: false,
	value: "wx8a85c0859bc24a1d"
});

Object.defineProperty(wechatConfig, "_appScret", {
	configurable: false,
	writable: false,
	value: "8f513a7bb53855eac141a09fc101e8d5"
});

Object.defineProperty(wechatConfig, "_token", {
	configurable: false,
	writable: false,
	value: "zhuyewei"
});

wechatConfig.prototype.getSignature = function(timestamp, nonce) {
	var token = wechatConfig._token;
	var shasum = crypto.createHash('sha1');
	var arr = [token, timestamp, nonce].sort();
	shasum.update(arr.join(''));

	return shasum.digest('hex');
}

wechatConfig.prototype.getAccessToken = function() {

	//console.log("a="+accessToken);
	if (accessToken && (new Date().getTime()) < expireTime) {
		callback(accessToken);
	}
	//console.log(wechatConfig._appId);
	/*	urllib.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+wechatConfig._appId+'&secret='+wechatConfig._appScret+'', function(err, data, res) {
		if (err) {
			console.log(err);
			throw err; // you need to handle error
		}
	    console.log(res.statusCode);
		console.log(res.headers);
		// data is Buffer instance
		console.log(data.toString());
		//console.log(data);
		if(res.statusCode==200){
			data = JSON.parse(data.toString());
		//	console.log(data);
			accessToken = data.access_token;
			expireTime = (new Date().getTime()) + (data.expires_in - 10) * 1000;
			console.log(accessToken);
			//console.log(expireTime);
			return accessToken;
		}
	
	});*/
	urllib.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wechatConfig._appId + '&secret=' + wechatConfig._appScret + '').then(function(result) {

		console.log(result);
		var statusCode = result.res.statusCode;
		var data = result.data;
		if (result.res.statusCode == 200) {
			data = JSON.parse(data.toString());
			//	console.log(data);
			accessToken = data.access_token;
			expireTime = (new Date().getTime()) + (data.expires_in - 10) * 1000;
			//console.log(accessToken);
			//console.log(expireTime);
			callback(accessToken);
		}
	}).catch(function(err) {
		console.log(err);
	});

}

wechatConfig.prototype.getWebAccessToken = function(code) {
	return new Promise(function(resolve, reject) {

		urllib.request('https://api.weixin.qq.com/sns/oauth2/access_token?appid='+wechatConfig._appId+'&secret='+wechatConfig._appScret+'&code='+code+'&grant_type=authorization_code').then(function(result) {

			console.log(result);
			var statusCode = result.res.statusCode;
			var data = result.data;
			if (result.res.statusCode == 200) {
				data = JSON.parse(data.toString());
				resolve(data);
			}
		}).catch(function(err) {
			reject(err);
		});
	});


}



module.exports = wechatConfig;