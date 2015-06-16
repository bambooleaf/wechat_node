var cheerio = require('cheerio');
var request = require('request');
var wechatAPI = require('./wechatAPI')();
var fs = require('fs');
var formstream = require('formstream');
var http = require('urllib');
var Promise = require("bluebird");
var iconv = require('iconv-lite');
var path = require('path');

var wechatCheerio = function() {

	if (!(this instanceof wechatCheerio)) {
		return new wechatCheerio();
	}

}

var massData = [];



wechatCheerio.prototype.init = function() {
	var url = "http://it.ithome.com/ityejie/";
	
	
	var current = Promise.resolve();
	var headers = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
	};
	var options = {
		encoding: null,
		headers: headers
	}
	Promise.promisifyAll(downloadImg);
	http.request(url,options).then(function(body){
		var html = iconv.decode(body.data, 'gb2312');
		var data = analysisHTML(html);
		//console.log(data);
		var list = [];
		for(var i =1;i<((data.length>7)?7:data.length);i++){
			//downloadImg(data[i].img,i+".png");//下载新闻图片
			list.push(data[i].url);

		}
		//console.log(list);
		return list;
	}).map(function(URL){
		current = current.then(function() {
			return http.request(URL,options);
		});
		return current;

	}).map(function(body){
		var html = iconv.decode(body.data, 'gb2312');
		//console.log(html);
		analysisNews(html);

	}).then(function(){
		console.log("finish");
	});
/*	Promise.map(url,function(URL){
		console.log(URL);
		options.url = URL;
		current = current.then(function() {
			return http.request(URL,options);
		});
		return current;
	}).map(function(body){
		var html = iconv.decode(body.data, 'gb2312');
		return analysisHTML(html);
	}).map(function(data){
		return newsList(data);
	}).map(newsList,function(URL){
		console.log(URL);
		return URL
	}).then(function(data){
		//console.log(data);
	});*/
	/*Promise.map(urls, function(URL) {
		options.url = URL;
		current = current.then(function() {
			return http.request(URL,options);
		});
		return current;

	}).map(function(body) {
		console.log("====================");
		console.log(body.data.toString());
	}).then(function(){
		console.log("finish");
	}).catch(function(e){
		console.log(e);
	})*/
	/*	this.requestBody(url).then(function(body) {
		var $ = cheerio.load(body);
		var newList = $("ul.ulcl li");
		for(var i =1;i<((list.length>7)?7:list.length);i++){
			urls.push(list[i].url);
			//downloadImg(list[i].img,i+".png");//下载新闻图片
		}
		return urls;

	}).then(function(urls){
		console.log(urls);

	}).catch(function(e) {
		console.log(e);
	});*/


	/*Promise.promisifyAll(needle);
	var options = {};

	var current = Promise.resolve();
	Promise.map(URLs, function(URL) {
		current = current.then(function() {
			return needle.getAsync(URL, options);
		});
		return current;
	}).map(function(responseAndBody) {
		return JSON.parse(responseAndBody[1]);
	}).then(function(results) {
		return processAndSaveAllInDB(results);
	}).then(function() {
		console.log('All Needle requests saved');
	}).catch(function(e) {
		console.log(e);
	});*/


};

wechatCheerio.prototype.massSend = function() {
	/*
	{
                        "thumb_media_id":"qI6_Ze_6PtV7svjolgs-rN6stStuHIjs9_DidOHaj0Q-mwvBelOXCFZiq2OsIU-p",
                        "author":"xxx",
			 "title":"Happy Day",
			 "content_source_url":"www.qq.com",
			 "content":"content",
			 "digest":"digest",
                        "show_cover_pic":"1"
		 },
	*/
};

function analysisNews(body) {
	var $ = cheerio.load(body,{decodeEntities: false});
	var contentdiv = $("div.content.fl");
	var title = $(contentdiv).find("div.post_title").find("h1").text();
	var content = $(contentdiv).find("div#paragraph p");
	var img = $(contentdiv).find("img").attr("src");
	
	//console.log(content);
	for(var i=0;i<content.length;i++){
		console.log($(content[i]).html());
	}
	//console.log(content);
}



function analysisHTML(body) {
	var $ = cheerio.load(body);
	var newList = $("ul.ulcl li");
	return newList.map(function(i, el) {
		var img = $(el).find("img.lazy").attr("data-original");
		var title = $(el).find("h2").find("a").text();
		var url = $(el).find("h2").find("a").attr("href");
		var data = {
				img: img,
				title: title,
				url: url
			}
		return data;
	});
};


/*function uploadImg(filepath, type){
	return new Promise(resolve, reject){
		
	}

};*/
var downloadImg = function(url, imgName) {
	request(url).pipe(fs.createWriteStream(path.join(__dirname, 'temp/') + imgName));
};


module.exports = wechatCheerio;