define([
    "text!templates/session/settings.html"
    ],function(SettingsTemplate){
    return Backbone.View.extend({
        el:"#right-body",
        initialize:function(){
            this.settingsTemplate = _.template(SettingsTemplate);
            this.account = {};
        },
        events:{
            "click #savePasswordBtn":"savePassword",
            "click #settingSaveInfoBtn":"saveInfo"
        },
        render:function(){
            var self = this;
            app.leftNav.hide();
            app.Util.get("/user/"+app.account._id,{},function(err,doc){
                if(err){
                    return  app.Message.error(app.ErrorCode[err.error]);
                }else{
                    self.account = doc;
                    self.$el.html(self.settingsTemplate({user:doc}));
                }
            });
        },
        savePassword:function(){
            var old = $.trim($("#oldPassword").val());
            var newPsw = $.trim($("#newPassword").val());
            var newPsw2 = $.trim($("#newPassword2").val());

            if(!old || !newPsw || !newPsw2){
                return app.Message.warning("表单填写不完整！");
            }
            if(newPsw !== newPsw2){
                return app.Message.warning("两次密码输入不一致！");
            }

            if(newPsw.length < 6 || newPsw2.length < 6){
                return app.Message.warning("密码长度不能少于6位！");
            }

            if(!/\w+/.test(newPsw)){
                return app.Message.warning("密码格式必须为字母或数字！");
            }
            var data= {
                "oldPassword":old,
                "password":newPsw
            };

            app.Util.put("/user/"+app.account._id+"/resetPassword",data,function(err,data){
                if(!err){
                    $("#settingsPassword input").val("");
                    return app.Message.success("密码修改成功！");
                }else if(data && data.error){
                    return app.Message.warning(app.ErrorCode[data.error]);
                }else{
                    return app.Message.error("密码修改失败！");
                }
            });
        },
        saveInfo:function(){
            var self = this;
            var name = $.trim($("#name").val());
            var company = $.trim($("#company").val());
            var address = $.trim($("#address").val());
            var telphone = $.trim($("#telphone").val());
            var website = $.trim($("#website").val());
            website = website.replace(/^http[s]?:\/\//,"");
            if(!name){
                $("#name").focus();
                return app.Message.warning("请填写用户名称！");
            }
            
            var dataInfo = {
                telphone:telphone,
                company:company,
                address:address,
                website:website
            };
            app.Util.put("/user/"+app.account._id,{name:name,info:dataInfo},function(err,data){
                if(!err){
                    
                    return app.Message.success("信息修改成功！");
                }else{
                    return app.Message.error("信息修改失败！");
                }
            });
        }
    });
});