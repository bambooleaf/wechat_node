(function() {

    /*

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8a85c0859bc24a1d&redirect_uri=http://yuchengweibank.wicp.net/html/chatRoom.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
    */

    var tempOpenid = new Date().getTime();

    var visitor = {
        "openid": tempOpenid,
        "nickname": "游客" + tempOpenid,
        "sex": 0,
        "language": "zh_CN",
        "city": "未知",
        "province": "未知",
        "country": "中国",
        "headimgurl": "../images/user.jpg",

    }

    var client = null;


    var socket = io();


    $("#sendMessage").on("click", function() {

        var msg = $("#input-edit").val();
        //alert(msg);
        socket.emit('chat message', client, msg);
        $("#input-edit").val("");
    });


    var code = getUrlParam("code");
    var data = {
        code: code
    };
    if (code != null) {
        $.ajax({
            type: "get",
            url: "/getUserInfo?code=" + code,
            contentType: 'application/json;charset=UTF-8',
            //data: JSON.stringify(data),
            //dataType:"jsonp",
            success: function(data) {
                client = data;
                init();
                alert("欢迎光临聊天室：" + data.nickname);

            },
            error: function(e) {
                client = visitor;
                init();
                console.log(e);
            }
        });
    } else {
         client = visitor;
        init();
       
    }


    function init() {
        socket.emit('user join', client.openid, client.nickname);

        socket.on('user list', function(list) {
            refreshUserIntoRoom(list);
        });
        socket.on('sys message', function(msg) {
            console.log(msg);
            newSysMsg(msg);
        });
        socket.on('chat message', function(data, msg) {

            if (client.openid == data.openid) { //自己发的消息
                newMyChatMsg(data, msg);

            } else { //其他人发的消息
                newOtherChatMsg(data, msg);
            }
        });
    };



    var refreshUserIntoRoom = function(list) {
        $("#userList").empty();
        var num = list.length;
        console.log(list);
        $.each(list, function(key, value) {
            $("#userList").append("<tr><td>" +
                value.name + "</td></tr>");
        });
        $("#list-count").html("当前在线：" + num + "人");
    };
    var newSysMsg = function(msg) {

        $("#jp-container").append("<div class='talk_recordboxsys'>" + msg + "</div>");

    };
    var newMyChatMsg = function(data, msg) {
        
        $("#jp-container").append("<div class='talk_recordboxme'><div class='user'><img  style='height:inherit' src=" + data.headimgurl + " />" + data.nickname + "</div><div class='talk_recordtextbg'>&nbsp;</div><div class='talk_recordtext'><h3>" + msg + "</h3> <span class='talk_time'>" + getLocalHMS() + "</span></div></div>");


    };
    var newOtherChatMsg = function(data, msg) {
        $("#jp-container").append("<div class='talk_recordbox'><div class='user'><img style='height:inherit' src=" + data.headimgurl + " />" + data.nickname + "</div><div class='talk_recordtextbg'>&nbsp;</div><div class='talk_recordtext'><h3>" + msg + "</h3> <span class='talk_time'>" + getLocalHMS() + "</span></div></div>");
    };



    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }

    function appendZero(obj) {
        if (obj < 10) return "0" + "" + obj;
        else return obj;
    }

    function getLocalHMS() {
        var time = (new Date()).getTime();
        var d = new Date();
        return appendZero(d.getHours()) + ":" + appendZero(d.getMinutes()) + ":" + appendZero(d.getSeconds());
    }


})();