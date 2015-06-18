var express = require('express');
var logger = require('morgan');
var xmlparser = require('express-xml-bodyparser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var http = require('urllib');
var Promise = require("bluebird");
var wx = require('./wechatConfig')();
var fs = require('fs');

var app = express();

app.use(logger('dev'));
app.use(xmlparser());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use('/weixin', function(req, res, next) {

	var param = req.query;
	var signature = param["signature"];
	var timestamp = param["timestamp"];
	var nonce = param["nonce"];

	if (signature == null || timestamp == null || nonce == null) {
		//next();
		res.send("非法请求");
		//throw new Error("非法请求");
	} else if (signature != wx.getSignature(timestamp, nonce)) {
		res.send("请求认证失败");
	}

	if (req.method == 'GET') {

		var echostr = param["echostr"];
		res.send(echostr);

	} else if (req.method == 'POST') {
		var xmlBody = req.body;
		msgProcess(xmlBody.xml).then(function(result) {

			res.send(result.toString());
		}).catch(function(err) {
			console.log(err);
		});
		//res.send(req.method);
	} else {
		next();
	}
	//console.log(req);

});

var wechatProcess = function() {

	if (!(this instanceof wechatProcess)) {
		return new wechatProcess();
	}
}

wechatProcess.prototype.init = function() {
	app.listen('9000', function() {
		console.log('listen wechatProcess on * : 9000');
	});
}



var msgProcess = function(xml) {

	return new Promise(function(resolve, reject) {

		if (xml.msgtype[0] == 'text') {
			textProcess(xml).then(function(result) {
				resolve(result);
			}).catch(function(err) {
				// reject(err);
				console.log(err);
			});
		} else if (xml.msgtype[0] == 'event') {
			eventProcess(xml).then(function(result) {
				resolve(result);
			}).catch(function(err) {
				// reject(err);
				console.log(err);
			});
		}
	})



	// console.log(xml);

}

var textProcess = function(xml) {
	return new Promise(function(resolve) {
		var fromUsername = xml.tousername[0];
		var toUsername = xml.fromusername[0];
		var getContent = xml.content[0];

		var data = {
			"key": "9b46f52767c04c49ed1369b2ba579be8",
			"info": getContent,
			"userid": toUsername
		}
		var options = {
			dataType: 'json',
			type: 'GET',
			data: data,
			headers: {
				'Content-Type': 'text/json',
				'charset': 'utf-8'
			}
		}
		var url = "http://www.tuling123.com/openapi/api"
		http.request(url, options).then(function(result) {
			// console.log(result);
			//console.log(result.data);
			var statusCode = result.res.statusCode;
			var data = result.data;
			/*
      var info = {};
      info.msgType = 'text';
      info.createTime = new Date().getTime();
      info.toUsername = toUsername;
      info.fromUsername = fromUsername;
      info.content = data.text;*/
			resolve(robotFormat(xml, data));

		}).catch(function(err) {
			console.log(err);
		});
		//Without new Promise, this throwing will throw an actual exception


	});



};

var eventProcess = function(xml) {
	return new Promise(function(resolve) {
		var retContent = "success";
		//Without new Promise, this throwing will throw an actual exception
		if (xml.event[0] == 'subscribe') {
			retContent = subscribeFormat(xml);
			resolve(retContent);
		} else if (xml.event[0] == 'CLICK') {
			if (xml.eventkey[0] == 'it_news') {
				fs.readFile('newslist.txt', function(err, data) {
					if (err) {
						console.log(err);
					}
					if (data != null) {
						data = JSON.parse(data.toString());
						retContent = itNewsFormat(xml,data);
						resolve(retContent);
					}
				});
			}
		}

	});
};



/*!
 * 响应模版
 */
var tpl = ['<xml>',
	'<ToUserName><![CDATA[<%-toUsername%>]]></ToUserName>',
	'<FromUserName><![CDATA[<%-fromUsername%>]]></FromUserName>',
	'<CreateTime><%=createTime%></CreateTime>',
	'<MsgType><![CDATA[<%=msgType%>]]></MsgType>',
	'<% if (msgType === "news") { %>',
	'<ArticleCount><%=content.length%></ArticleCount>',
	'<Articles>',
	'<% content.forEach(function(item){ %>',
	'<item>',
	'<Title><![CDATA[<%-item.title%>]]></Title>',
	'<Description><![CDATA[<%-item.description%>]]></Description>',
	'<PicUrl><![CDATA[<%-item.picUrl || item.picurl || item.pic %>]]></PicUrl>',
	'<Url><![CDATA[<%-item.url%>]]></Url>',
	'</item>',
	'<% }); %>',
	'</Articles>',
	'<% } else if (msgType === "music") { %>',
	'<Music>',
	'<Title><![CDATA[<%-content.title%>]]></Title>',
	'<Description><![CDATA[<%-content.description%>]]></Description>',
	'<MusicUrl><![CDATA[<%-content.musicUrl || content.url %>]]></MusicUrl>',
	'<HQMusicUrl><![CDATA[<%-content.hqMusicUrl || content.hqUrl %>]]></HQMusicUrl>',
	'<ThumbMediaId><![CDATA[<%-content.thumbMediaId || content.mediaId %>]]></ThumbMediaId>',
	'</Music>',
	'<% } else if (msgType === "voice") { %>',
	'<Voice>',
	'<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
	'</Voice>',
	'<% } else if (msgType === "image") { %>',
	'<Image>',
	'<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
	'</Image>',
	'<% } else if (msgType === "video") { %>',
	'<Video>',
	'<MediaId><![CDATA[<%-content.mediaId%>]]></MediaId>',
	'<Title><![CDATA[<%-content.title%>]]></Title>',
	'<Description><![CDATA[<%-content.description%>]]></Description>',
	'</Video>',
	'<% }  else { %>',
	'<Content><![CDATA[<%-content%>]]></Content>',
	'<% } %>',
	'</xml>'
].join('');

/*!
 * 编译过后的模版
 */
var compiled = ejs.compile(tpl);

var itNewsFormat = function(xml,data) { //读取爬虫返回报文
	var fromUsername = xml.tousername[0];
	var toUsername = xml.fromusername[0];
	var info = {};
	info.createTime = new Date().getTime();
	info.toUsername = toUsername;
	info.fromUsername = fromUsername;
	info.msgType = 'news';
	info.content = new Array();
	var items = 0;
	for (var i = 0; i < data.length; i++) {
		items++;
		var temp = {};
		temp.title = data[i].title;
		temp.description = data[i].title;
		temp.pic = data[i].img;
		temp.url = data[i].url;
		info.content.push(temp);
		if (items >= 10) break;
	}

	return compiled(info);
}

var subscribeFormat = function(xml) { //关注事件回复报文处理
	var fromUsername = xml.tousername[0];
	var toUsername = xml.fromusername[0];
	var info = {};


	info.createTime = new Date().getTime();
	info.toUsername = toUsername;
	info.fromUsername = fromUsername;
	info.msgType = 'text';
	info.content = "欢迎关注朱烨炜的测试号";
	return compiled(info);
}

var robotFormat = function(xml, result) { //图灵机器人回复报文处理
	var fromUsername = xml.tousername[0];
	var toUsername = xml.fromusername[0];

	var code = result.code;
	var text = result.text;


	var info = {};

	info.createTime = new Date().getTime();
	info.toUsername = toUsername;
	info.fromUsername = fromUsername;

	var items = 0; //防止子图文过多
	if (code == 100000) { //文本回复
		info.msgType = 'text';
		info.content = text;

	} else if (code == 200000) { //链接回复
		info.msgType = 'text';
		info.content = "\<a href='" + result.url + "'\>" + text + "\</a\>";
		//<a href="www.baidu.com">请点击此处进行绑定</a>
	} else if (code == 302000) { //新闻回复
		info.msgType = 'news';
		info.content = new Array();
		for (var i = 0; i < result.list.length; i++) {
			items++;
			var temp = {};
			temp.title = result.list[i].article;
			temp.description = result.list[i].source;
			temp.pic = result.list[i].icon;
			temp.url = result.list[i].detailurl;
			info.content.push(temp);
			if (items >= 10) break;
		}
	} else if (code == 305000) { //列车回复
		info.msgType = 'news';
		info.content = new Array();
		for (var i = 0; i < result.list.length; i++) {
			items++;
			var temp = {};
			var finalTitle = result.list[i].trainnum + "发车时间：" + result.list[i].starttime + " 到达时间：" + result.list[i].endtime;
			temp.title = finalTitle;
			temp.description = result.list[i].trainnum;
			temp.pic = result.list[i].icon;
			temp.url = result.list[i].detailurl;
			info.content.push(temp);
			if (items >= 10) break;
		}

	} else if (code == 306000) { //航班回复
		info.msgType = 'news';
		info.content = new Array();
		for (var i = 0; i < result.list.length; i++) {
			items++;
			var temp = {};
			var finalTitle = result.list[i].flight + "起飞时间：" + result.list[i].starttime + " 到达时间：" + result.list[i].endtime;
			temp.title = finalTitle;
			temp.description = result.list[i].state;
			temp.pic = result.list[i].icon;
			temp.url = result.list[i].detailurl;
			info.content.push(temp);
			if (items >= 10) break;
		}
	} else if (code == 308000) { //菜谱
		info.msgType = 'news';
		info.content = new Array();
		for (var i = 0; i < result.list.length; i++) {
			items++;
			var temp = {};
			temp.title = result.list[i].name;
			temp.description = result.list[i].info;
			temp.pic = result.list[i].icon;
			temp.url = result.list[i].detailurl;
			info.content.push(temp);
			if (items >= 10) break;
		}
		console.log(info);
	}

	items = 0;
	return compiled(info);

}



module.exports = wechatProcess;