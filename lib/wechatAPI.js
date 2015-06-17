var wechatConfig = require('../lib/wechatConfig')();
var http = require('urllib');
var Promise = require("bluebird");

var express = require('express');
var path = require('path');

var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();


app.use(logger('dev'));
app.use(bodyParser.json());
app.use('/service', function(req, res, next) {
	/*上送参数为此类型
	{url:"sendCustomerMsg",
	data:{
			"touser": "OPENID",
			"msgtype": "text",
			"text": {
				"content": "Hello World"
			}
		}
	}
	*/
	var postData = req.body;

	var url = postData.url;
	var data = postData.data;
	sendAPI(url, data, function(result) {
		res.send(result.toString());
	});
	//console.log(req.body);
})

var wechatAPI = function() {

	if (!(this instanceof wechatAPI)) {
		return new wechatAPI();
	}

}

wechatAPI.prototype.init = function() {
	/*app.listen(8000, function() {
		console.log("wechatAPI init on port* 8000");
	})*/
	console.log("wechatAPI init");

}

wechatAPI.prototype.getFullURL = function(url) {
	var type = url;
	var resolve =  new Promise(function(resolve,reject) {
		if (URL[type] != null && URL[type] != undefined) {
			var url = URL[type];
			wechatConfig.getAccessToken(function(access_token) {
				url += access_token;
				resolve(url);
			})
		} else {
			resolve("error URL");
		}
	});
	return resolve;
}




var URL = {
	"createMenu": "https://api.weixin.qq.com/cgi-bin/menu/create?access_token=", //创建菜单
	"sendCustomerMsg": "https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=", //发送客服消息
	"uploadnews": "https://api.weixin.qq.com/cgi-bin/media/uploadnews?access_token=", //上传图文素材
	"masssend": "https://api.weixin.qq.com/cgi-bin/message/mass/sendall?access_token=", //根据分组群发消息
	"uploadimg": "https://api.weixin.qq.com/cgi-bin/media/upload?type=image&access_token=" //上传图片
}

wechatAPI.prototype.sendAPI = function(url, data, options) {
	var type = url;
	return new Promise(function(resolve, reject) {
		if (URL[type] != null && URL[type] != undefined) {
			var options = options ? options : {
				dataType: 'json',
				type: 'POST',
				data: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			}
			
			var url = URL[type];
			wechatConfig.getAccessToken(function(access_token) {
				url += access_token;
				http.request(url, options).then(function(result) {
					//console.log(result);
					var statusCode = result.res.statusCode;
					var data = result.data;
					
					resolve(data);
				}).catch(function(err) {
					reject(err);
					console.log(err);
				});
			})
		} else {
			resolve("error URL");
		}
	});
}

/*var sendAPI = function(url, data, callback) {
	if (URL[url] != null || URL[url] != undefined) {
		var options = {
			dataType: 'json',
			type: 'POST',
			data: data.toString(),
			headers: {
				'Content-Type': 'application/json'
			}
		}
		var url = URL[url];
		wechatConfig.getAccessToken(function(access_token) {
			if (url != null || nul != undefined) {
				url += access_token;
				http.request(url, options).then(function(result) {
					console.log(result);
					var statusCode = result.res.statusCode;
					var data = result.data;
					callback(data);
				}).catch(function(err) {
					console.log(err);
				});
			} else {
				callback("无效url");
			}

		})
	} else {
		callback("error URL");
	}
}*/


module.exports = wechatAPI;