define([
	"text!templates/session/login.html",
	"models/session/session",
	"views/appView",
    "views/nav/nav"
],function(LoginTemplate,Session,AppView,NavView){
	var LoginView = Backbone.View.extend({
		el:"#main",
		initialize:function(){
        	this.loginTemplate = _.template(LoginTemplate);
        	this.session = new Session()
      	},
		events:{
			"submit #loginForm":"login",
			"click #goreg":"goreg",
			"submit #regform":"reg",
			"click #gologin":"gologin"
		},
		render:function(){
			this.$el.html(this.loginTemplate);
		},
		gologin:function(){
			$("#registerDiv").slideUp();
			this.$("#loginDiv").slideDown();
            this.$("#registerOKDiv").slideUp();
		},
		goreg:function(){
            this.$("#registerDiv").slideDown();
            this.$("#loginDiv").slideUp();
            this.$("#registerOKDiv").slideUp();
        },
        goregok:function(){
			this.$("#registerOKDiv").slideDown();
			this.$("#registerDiv").slideUp();
		},
		login:function(){
            var self = this;
			var email = $.trim(this.$("#email").val());
			var password = $.trim(this.$("#password").val());
			
            if(!email){
                return app.Message.warning(app.ErrorCode[1001]);
            }
            if(!password){
                return app.Message.warning(app.ErrorCode[1002]);
            }
			this.session.login({email:email,password:password},function(result){
                self.session.getAuth(function(result){
                    if(app.account && app.account.dspId){
                        app.router.navigate("dsp/home",{trigger:true});
                    }else if(app.account && app.account.sspId){
                        app.router.navigate("ssp/home",{trigger:true});
                    }else if(app.isSspAndDsp()){
                        app.router.navigate("dsp/home",{trigger:true});
                    }else{
                        app.Message.error("账户没有开通对应权限");
                        return;
                    }
				    return location.reload();
                });
			});
		},
		reg:function(){
			var self = this;
			var email = $.trim(this.$("#regemail").val());
			var password = $.trim(this.$("#regpassword").val());
			var name = $.trim(this.$("#name").val());
			var telphone = $.trim(this.$("#telphone").val());
			var company = $.trim(this.$("#company").val());
			var address = $.trim(this.$("#address").val());
			var website = $.trim(this.$("#website").val());
			if(!email){
				this.$("#regemail").focus();
                return app.Message.warning(app.ErrorCode[1001]);
            }
            if(!app.Util.isEmail(email)){
            	this.$("#regemail").focus();
                return app.Message.warning(app.ErrorCode[1004]);
            }
            if(!password){
            	this.$("#regpassword").focus();
                return app.Message.warning(app.ErrorCode[1002]);
            }
            if(password.length < 6){
            	this.$("#regpassword").focus();
                return app.Message.warning(app.ErrorCode[1016]);
            }
            if(!name){
            	this.$("#name").focus();
                return app.Message.warning(app.ErrorCode[1003]);
            }
            var data = {
            	email:email,
            	password:password,
            	name:name,
            	info:{
            		telphone:telphone,
            		company:company,
            		address:address,
            		website:website
            	}
            };
            this.session.reg(data,function(errCode,result){
            	if(errCode){
            		return app.Message.error(app.ErrorCode[errCode]);
            	}else{
            		self.$el.find("#registerForm input").val("");
            		app.Message.success("注册成功，请等待审核！");
            		return self.goregok();
            	}
            });
		}

	});
	return LoginView;
});