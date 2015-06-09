var wechatProcess = function(){
	
	if (!(this instanceof wechatProcess)) {
		return new wechatProcess();
	}
	console.log("new wechatProcess");
}

wechatProcess.prototype.init = function(){
	console.log("wechatProcess init");
}


module.exports = wechatProcess;