define(["app","../../../plugs/base64"], function(app,Base64) {
    var SessionModel = Backbone.Model.extend({
        url: '/user',
        idAttribute:'_id',
        initialize: function() {
            this.accountModel = null;
            this.base64 = new Base64;
        },
        // 这里传入email和password
        login: function(creds, callback) {
            var that = this;
            // save方法是backbone自带的方法
            // 当前Model的url属性就是提交的属性
            this.save(creds, {
                wait: true,
                success: function(model) {
                    console.log('bug 3');
                    app.secret = that.base64.encode(model.get("secret"));
                    app.setCookie("secret",app.secret ,7);
                    app.setCookie("sessionAID",model.get("userId") ,7);
                    // 将权限单独拿出来，放到cookie中
                    var account = model.toJSON();
                    app.session = account;
                    that.initSession(account, callback);
                }, error:function(model, response, options){
                    try{
                        err = JSON.parse(response.responseText);
                        return app.Message.error(app.ErrorCode[err.error]);
                    }catch(e){
                        return app.Message.error(app.ErrorCode[1000]);
                    }
                }
            });
        },
        
        reg:function(data,callback){
            data = JSON.stringify(data);
            $.ajax({
                url: "/register",
                type: "POST",
                data: data,
                cache: false,
                dataType:'json',
                "contentType":"application/json",
                headers: {
                    "authorization": app.secret
                },
                error:function(req, textStatus, msg){
                    if (req.responseText) {
                        try {
                            var result = JSON.parse(req.responseText);
                            return callback(result.error);
                        } catch (e) {
                            return callback(1013);
                        }
                    }
                },
                success:function(data){
                    if (data.error) {
                        return callback(data.error);
                    } else {
                        return callback(null, data);
                    }
                }
            });
        },

        logout: function() {
            this.clear();
            app.delCookie("secret");
            app.delCookie("sessionAID");
            document.cookie = {};
            sessionStorage.clear();
            localStorage.clear();
            app.secret = null;
            app.account = null;
            app.router.navigate('login', {
                trigger: true
            });
            return location.reload();
        },
        getAuth: function(callback) {
            var self = this;
            var accountID = app.account && app.account._id || app.getCookie("sessionAID") || "";
            if(!accountID || location.hash == "#login"){
                return callback();
            }
            app.Util.get("/user/"+accountID+"/detail",{},function(err,doc){
                if(err){
                    return callback();
                }else{
                    self.initSession(doc, callback);
                }
            });
        },
        initSession: function(account, callback) {
            this.account = account;
            // 如果用户的_id与cookie中设置的相同的话，
            // 就给app.session设置account
            if(account._id == app.getCookie("sessionAID")){
                app.session = account;
            }
            // 如果app.getAccount（）没有存储用户信息
            // getAccount使用的是sessionStorage存储的
            // 而且在getAccount和setAccount方法中设置了app.account对象
            if(!app.getAccount()){
                var id = account._id || account.userId;
                app.Util.get("/user/"+id+"/detail",{},function(err,doc){
                    if(err){
                        return callback();
                    }else{
                        app.setAccount(doc);
                        app.account = doc;
                        //console.log('initSession: ', doc.dspDetail);
                        if(doc.dspDetail){
                            if (doc.dspDetail.bidders && doc.dspDetail.bidders[0]) {
                                app.setBidder(doc.dspDetail.bidders[0].id);
                                console.log('initSession: ',app.getBidder());
                            }
                        }
                        return callback(doc);
                    }
                });
            }else{
                return callback(account);
            }
        }
    });
    return SessionModel;
});
