define([],function(){
	function Util(){
        
	}

	Util.prototype.isEmail = function(str){
		return /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(str);
	};

     Util.prototype.ajax = function(type, url, data, callback) {
        var self = this;
        var secret = app.secret;
        if (!secret) {
            app.Message.error("登录超时，请重新登录！")
            location.href = "/#login";
        }
        if(["post","put"].indexOf(type) !== -1){
            data = JSON.stringify(data);
        }
        $.ajax({
            url:url,
            type: type,
            data: data,
            cache: false,
            dataType:'json',
            "contentType":"application/json",
            headers: {
                "authorization": secret
            },
            error: function(req, textStatus, msg) {
                if (req.responseText) {
                    try {
                        var result = JSON.parse(req.responseText);
                        return callback(result);
                    } catch (e) {
                        return callback({error:1000});
                    }
                }
            },
            success: function(data) {
                if (data.error) {
                    return callback(data.error);
                } else {
                    return callback(null, data);
                }
            }
        });
    };
    Util.prototype.post = function(url, data, callback) {
        this.ajax("post", url, data, callback);
    };
    Util.prototype.get = function(url, data, callback) {
        this.ajax("get", url, data, callback);
    };
    Util.prototype.put = function(url, data, callback) {
        this.ajax("put", url, data, callback);
    };

    Util.prototype.delete = function(url, data, callback) {
        this.ajax("delete", url, data, callback);
    };

    Util.prototype.daterangepicker = function(options, callback) {
        options.startDate = options.startDate ? moment(options.startDate) : moment().subtract('days', 7);
        options.endDate = options.endDate ? moment(options.endDate) : moment();
        options.opens = options.opens || "right";
        options.bottom = options.bottom || false;
        options.noEnd = options.noEnd || false;
        options.format = 'YYYY-MM-DD';
        options.singleDatePicker  =options.singleDatePicker || false;
        
        $(options.ele).daterangepicker(options, function(start, end) {
            start = start.format("YYYY-MM-DD");
            end = end.format("YYYY-MM-DD");
            return callback(start, end);
        });
    };

    Util.prototype.formatData = function(s, n) {
        n = n > 0 && n <= 20 ? n : 0;
        s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
        var l = s.split(".")[0].split("").reverse(),
            r = s.split(".")[1] || "";
        t = "";
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        if(n){
            return t.split("").reverse().join("") + "." + r;
        }else{
            return t.split("").reverse().join("");
        }
    };
    
    Util.prototype.isUrl = function(str){
        var reg = /^(http:\/\/|https:\/\/)?(www\.)?\w+\.[a-zA-Z]{2,6}/;
        return reg.test(str);
    };
    Util.prototype.sorter = function(a,b){
        var a = typeof a !== "number"?a.replace(/￥|,|%/g,""):a;
        var b = typeof b !== "number"?b.replace(/￥|,|%/g,""):b;
        return a - b; 
    };

    Util.prototype.maskPanel = {
        show:function(){
            $("#mask-panel").show();
        },
        hide:function(){
            $("#mask-panel").hide();
        }
    };
    Util.prototype.loading = {
        show:function(){
            $("#loading-mask").show();
        },
        hide:function(){
            $("#loading-mask").hide();
        }
    };
	return new Util();
});