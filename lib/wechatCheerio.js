var cheerio = require('cheerio');
var request = require('request');
var wechatAPI = require('./wechatAPI')();

var fs = require('fs');
var formstream = require('formstream');
var http = require('urllib');
var Promise = require("bluebird");
var iconv = require('iconv-lite');
var path = require('path');

var later = require('later');

var wechatCheerio = function() {

	if (!(this instanceof wechatCheerio)) {
		return new wechatCheerio();
	}

}



wechatCheerio.prototype.init = function() {
	later.date.localTime();

	var composite = [{
		h: [14],
		m: [05],
		s: [30]
	}];
	var sched = {
		schedules: composite
	}


	var t = later.setInterval(function() {
			cheerioHTML();
		}, sched)
	



};

var cheerioHTML = function() {
	//console.log("time2");
	var url = "http://it.ithome.com/ityejie/";
	var current = Promise.resolve();
	var headers = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
	};
	var options = {
		encoding: null,
		headers: headers
	}
	http.request(url, options).then(function(body) {
		var html = iconv.decode(body.data, 'gb2312');
		var data = analysisHTML(html);
		
		var list = [];
		
		for (var i = 1; i < ((data.length > 7) ? 7 : data.length); i++) {
			var temp = data[i]
			list.push(temp);
		}
		fs.writeFile('newslist.txt', JSON.stringify(list));
	})
};
/*wechatCheerio.prototype.massSend = function() {
	var url = "http://it.ithome.com/ityejie/";
	var current = Promise.resolve();
	var headers = {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.65 Safari/537.36'
	};
	var options = {
			encoding: null,
			headers: headers
		}
		//	Promise.promisifyAll(downloadImg);
	http.request(url, options).then(function(body) {
		var html = iconv.decode(body.data, 'gb2312');
		var data = analysisHTML(html);

		var list = [];
		for (var i = 1; i < ((data.length > 7) ? 7 : data.length); i++) {
			list.push(data[i].url);
		}
		return list;
	}).map(function(URL) { //请求主页面
		current = current.then(function() {
			return http.request(URL, options);
		});
		return current;
	}).map(function(body) {
		var html = iconv.decode(body.data, 'gb2312'); //此页面编码为gb2312
		return analysisNews(html); //分别分析每个新闻页面
	}).map(function(imgurl) {
		return downloadImg(imgurl); //下载新闻图片
	}).map(function(imgName) {
		return uploadImg(imgName); //上传素材
	}).then(function(data) {
		for (var i = 0; i < data.length; i++) {
			for (var j = 0; j < massData.length; j++) {
				if (data[i].filename == massData[j].thumb_media_id)
					massData[j].thumb_media_id = data[i].thumb_media_id;
			}
		}
		massData = {
			"articles": massData
		}
		return wechatAPI.sendAPI("uploadnews", massData); //上传群发素材
	}).then(function(result) {
		mass_media = result.media_id;
		return wechatAPI.sendAPI("getUserlist"); //获取关注者列表
	}).then(function(result) {
		console.log(result);
		console.log(mass_media);
		var openlist = result.data.openid;
		var postData = {
			"touser": openlist,
			"mpnews": {
				"media_id": mass_media
			},
			"msgtype": "mpnews"
		}
		return wechatAPI.sendAPI("masssendByID", postData); //群发
	}).then(function(result) {
		console.log(result);
	}).catch(function(e) {
		console.log(e);
	});
};*/

function analysisNews(body) {
	var $ = cheerio.load(body, {
		decodeEntities: false
	});
	var contentdiv = $("div.content.fl");
	var title = $(contentdiv).find("div.post_title").find("h1").text();
	var content = $(contentdiv).find("div#paragraph");
	var img = $(contentdiv).find("img").attr("src");
	
	var aticles = {
		"thumb_media_id": path.basename(img),
		"author": "it之家",
		"title": title,
		"content": $(content).html()
	}
	massData.push(aticles);
	return img;

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


var downloadImg = function(url) {

	return new Promise(function(resolve, reject) {
		var imgpipe = request(url);
		var imgName = path.basename(url);
		imgpipe.pipe(fs.createWriteStream(path.join(__dirname, 'temp/') + imgName));
		imgpipe.on('end', function() {
			resolve(imgName);
		});
	});

};
var uploadImg = function(filename) {
	return new Promise(function(resolve, reject) {
		wechatAPI.getFullURL("uploadimg").then(function(result) {
			var filepath = path.join(__dirname, 'temp/') + filename;
			fs.stat(filepath, function(err, stat) {
				if (err) {

					reject(err);
					return false;
				}
				var form = formstream();
				form.file('media', filepath, path.basename(filepath), stat.size);
				var url = result;
				var opts = {
					dataType: 'json',
					type: 'POST',
					timeout: 60000, // 60秒超时
					headers: form.headers(),
					stream: form
				};
				http.request(url, opts).then(function(result) {
					
					var thumb_media_id = result.data.media_id;
					resolve({
						filename: filename,
						thumb_media_id: thumb_media_id
					});
				});
			});
		});
	});

}


module.exports = wechatCheerio;