var crypto = require('crypto');
var ejs = require('ejs');
var urllib = require('urllib');
var Promise = require("bluebird");
var fs = require('fs');
var path = require('path');

var wechatConfig = function() {

	if (!(this instanceof wechatConfig)) {

		return new wechatConfig();
	}

	this.accessToken = null;
	this.expireTime = null;
}


Object.defineProperty(wechatConfig, "_name", {
	configurable: false,
	writable: false,
	value: ""
});

Object.defineProperty(wechatConfig, "_appId", {
	configurable: false,
	writable: false,
	value: ""
});



Object.defineProperty(wechatConfig, "_appScret", {
	configurable: false,
	writable: false,
	value: ""
});



Object.defineProperty(wechatConfig, "_token", {
	configurable: false,
	writable: false,
	value: ""
});

wechatConfig.prototype.getSignature = function(timestamp, nonce) {
	var token = wechatConfig._token;
	var shasum = crypto.createHash('sha1');
	var arr = [token, timestamp, nonce].sort();
	shasum.update(arr.join(''));

	return shasum.digest('hex');
}

wechatConfig.prototype.getAccessToken = function(callback) {


	fs.readFile('access_token.txt', function(err,data) {
		if(err){
			console.log(err);
		}
		
		if (data != null) {
			data = JSON.parse(data.toString());
			this.accessToken = data.accessToken;
			this.expireTime = data.expireTime;
			if (this.accessToken && (new Date().getTime()) < this.expireTime) {
				callback(this.accessToken);
				return;
			}
		}


		urllib.request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + wechatConfig._appId + '&secret=' + wechatConfig._appScret + '').then(function(result) {

			var statusCode = result.res.statusCode;
			var data = result.data;
			if (result.res.statusCode == 200) {
				data = JSON.parse(data.toString());
				console.log(data);

				this.accessToken = data.access_token;
				this.expireTime = (new Date().getTime()) + (data.expires_in - 10) * 1000;
				var saveData = {
					accessToken: this.accessToken,
					expireTime: this.expireTime
				}
				fs.writeFile('access_token.txt', JSON.stringify(saveData));

				callback(this.accessToken);
			}
		}).catch(function(err) {
			console.log(err);
		});
	})



}

wechatConfig.prototype.getWebAccessToken = function(code) {
	return new Promise(function(resolve, reject) {

		urllib.request('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + wechatConfig._appId + '&secret=' + wechatConfig._appScret + '&code=' + code + '&grant_type=authorization_code').then(function(result) {


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