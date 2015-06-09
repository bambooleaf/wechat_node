// var list = ["wechat","wechatAPI","chatroom","cheerio"];

// var fnList = {
// 	wechat : function(){
// 		//console.log("wechat");
// 		return require('./wechat')();
// 	} ,
// 	wechatAPI:function(){
// 		return require('./wechatAPI')();
// 	}
// }

// exports._init = function(){
// 	//console.log('init');

// 	for(var i in list){
// 		var fnName = list[i];

// 		if(typeof(fnList[fnName])=="function"){
// 			//console.log("function");
// 			fnList[fnName]();
// 		}
// 	}
// }

var applist=["wechatProcess", "wechatAPI", "chatroom", "cheerio"];
var app = {

	fnList: {
		wechatProcess: function() {
			//console.log("wechatProcess");
			var fn = require("./lib/wechatProcess")();
			fn.init();
		},
		wechatAPI: function() {
			//console.log("wechatAPI");
			var fn = require("./lib/wechatAPI")();
			fn.init();
		},
		chatroom: function() {
			console.log("chatroom");
		},
		cheerio: function() {
			console.log("cheerio");
		}

	},
	init: function() {
		for (var i in applist) {
			var fnName = applist[i];
			if (typeof(this.fnList[fnName]) == "function") {
				this.fnList[fnName]();
			}

		}
	}
}
app.init();