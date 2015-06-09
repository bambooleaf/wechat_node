var wechatAPI = function(){
	
	if (!(this instanceof wechatAPI)) {
		return new wechatAPI();
	}
	console.log("new wechatAPI");
}

wechatAPI.prototype.init = function(){
	console.log("wechatAPI init");
}


module.exports = wechatAPI;