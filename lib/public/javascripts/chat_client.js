(function() {

    /*

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8a85c0859bc24a1d&redirect_uri=http://yuchengweibank.wicp.net/html/chatRoom.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
    */

    /*临时测试数据*/
    var client = {
        "openid": "o5XYxtwRmBdhtb8ny1Be9YX1TyOw",
        "nickname": "zyw",
        "sex": 1,
        "language": "zh_CN",
        "city": "长春",
        "province": "吉林",
        "country": "中国",
        "headimgurl": "http:\/\/wx.qlogo.cn\/mmopen\/ibeooQPd2gXl4T40Y1WpbkfPYXFZtvrZFib9c1ZlrGL7v8ZXpvHvWib6auPsP45TcxWpgUU2U11WRRISXICIhdvUq2f5DDicibR53\/0",
        "privilege": []
    }
    alert("欢迎光临聊天室：" + client.nickname);
    //var client = null;
    var code = getUrlParam("code");
    client.openid = code;
    // alert(location.href);
    var data = {
        code: code
    };
    var socket = io();
    socket.emit('user join', client.openid, client.nickname); 

    socket.on('user list', function(list) {
        refreshUserIntoRoom(list);
    });
    socket.on('sys message', function(msg) {

        newSysMsg(msg);
    });
    socket.on('chat message',function(data){
        if(client.openid==data.openid){//自己发的消息
            newMyChatMsg(data.msg);

        }else{//其他人发的消息
            newOtherChatMsg(data.msg);
        }
    });
    /*    $.ajax({
        type: "get",
        url: "/getUserInfo?code="+code,
        contentType: 'application/json;charset=UTF-8',
        //data: JSON.stringify(data),
        //dataType:"jsonp",
        success: function(data) {
           client = data;
            alert("欢迎光临聊天室："+data.nickname);
        },
        error: function(e) {
           console.log(e);
        }
    });*/


    var refreshUserIntoRoom = function(list) {
        $("#userList").empty();
        var num = list.length;
        console.log(list);
        $.each(list, function(key, value) {
            $("#userList").append("<tr><td>" +
                value.name + "</td></tr>");
        });
        $("#list-count").html("当前在线："+num+"人");
    };
    var newSysMsg = function(msg) {

        $("#jp-container").append("<div class='talk_recordboxsys'>" + msg + "</div>");

    };
    var newMyChatMsg = function(name,head,msg) {
        $("#jp-container").append("<div class='talk_recordboxme'><div class='user'><img src="+head+"/>"+name+"</div>
                            <div class='talk_recordtextbg'>&nbsp;</div>
                            <div class='talk_recordtext'>
                                <h3>"+msg+"</h3>
                            </div>
                        </div>");


    };
    var newOtherChatMsg = function(name,head,msg) {
        $("#jp-container").append("<div class='talk_recordbox'><div class='user'><img src="+head+"/>"+name+"</div>
                            <div class='talk_recordtextbg'>&nbsp;</div>
                            <div class='talk_recordtext'>
                                <h3>"+msg+"</h3>
                            </div>
                        </div>");
    };


    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }


})();