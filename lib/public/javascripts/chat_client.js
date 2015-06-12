(function() {

    /*

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8a85c0859bc24a1d&redirect_uri=http://yuchengweibank.wicp.net/html/chatRoom.html&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect
    */

    var client = null;
    var code = getUrlParam("code");

    alert(location.href);
    var data = {code:code};
    $.ajax({
        type: "get",
        url: "/getUserInfo?code="+code,
        contentType: 'application/json;charset=UTF-8',
        //data: JSON.stringify(data),
        //dataType:"jsonp",
        success: function(data) {
           
            alert(data.nickname);
        },
        error: function(e) {
           console.log(e);
        }
    });



    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
        var r = window.location.search.substr(1).match(reg); //匹配目标参数
        if (r != null) return unescape(r[2]);
        return null; //返回参数值
    }


})();