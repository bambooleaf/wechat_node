//var io = require('socket.io');
var express = require('express');
var path = require('path');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
	res.render('index', {});
});

var chatRoom = function() {

	if (!(this instanceof chatRoom)) {
		return new chatRoom();
	}

}

var userNames = {};
var userNum = 0;
chatRoom.prototype.init = function() {
	var server = app.listen(7000, function() {
		console.log("chatRoom init on port* 7000");
	});

	var io = require('socket.io').listen(server);
	io.on('connection', function(socket) {
		//console.log(socket);
		//console.log('a new user connected');
		socket.on('chat message', function(msg) {
			io.emit('chat message', msg);
		});
		//新用户加入
		socket.on('user join',function(name,callback){
			if(userNames.name!=null){
				callback(false);
			}else{
				callback(true);
				userNames[name]=name;
				userNum++;
				socket.userName = name;
				console.log(name + " join the room");
				io.emit('sys message',{userName:name,userNum:userNum});
			}
		});
		//用户离线
		socket.on('disconnect', function() {
			console.log(socket.userName + " left the room");
			if(userNames[socket.userName]!=null){
				delete userNames[socket.userName];
				userNum--;
				//console.log(socket.userName + " removed");
			}
			
			//console.log('a  user disconnect');
		});

	});
}




module.exports = chatRoom;