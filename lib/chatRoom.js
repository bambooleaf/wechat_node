//var io = require('socket.io');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var urllib = require('urllib');
var wechatConfig = require('../lib/wechatConfig')();

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/getUserInfo',function(req,res,next){

	//console.log(req.query);
	var code = req.query.code;
	//console.log(code);
	wechatConfig.getWebAccessToken(code).then(function(data){
		var access_token = data.access_token;
		var openid = data.openid;
		
		return urllib.request('https://api.weixin.qq.com/sns/userinfo?access_token='+access_token+'&openid='+openid+'&lang=zh_CN');
	}).then(function(result){
	
		var user_data = JSON.parse(result.data.toString());

		res.send(user_data);
	}).catch(function(e){
		console.log(e);
	})

	

})


var chatRoom = function() {

	if (!(this instanceof chatRoom)) {
		return new chatRoom();
	}

}




var userList = [];
var userNum = 0;

function HasUser(_openID) {
    for (var i = 0; i < userList.length; i++) {
        if (userList[i] == _openID) {
            return true;
        }
    }
    return false;
}

function RemoveUser(_openID) {
    for (var i = 0; i < userList.length; i++) {
        if (userList[i] == _openID)
            userList.splice(i, 1);
    }
}

chatRoom.prototype.init = function() {
	var server = app.listen(7000, function() {
		console.log("chatRoom init on port* 7000");
	});

	var io = require('socket.io').listen(server);
	io.on('connection', function(socket) {
		/*socket.on('chat message', function(msg) {
			io.emit('chat message', msg);
		});*/
		//新用户加入
		socket.on('user join',function(user,callback){
			if(HasUser(user.openid)){
				callback(false);//基本不可能触发
			}else{
				callback(true);
				userList.push(user.openid);
				userNum++;
				socket.user = user;
				console.log(user.nickName + " join the room");
				//io.emit('sys message',{userName:name,userNum:userNum});
			}
		});
		//用户离线
		socket.on('disconnect', function() {
			console.log(socket.user.nickName + " left the room");
			if(HasUser(user.openid)){
				RemoveUser(socket.user.openid);//基本不可能触发
			}
			
		});

	});
}






module.exports = chatRoom;