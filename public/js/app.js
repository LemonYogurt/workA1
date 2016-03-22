define(["Message","./util/errorCode","./util/util","./util/page"],function(Message,ErrorCode,Util,Page){
	var app = _.extend({}, Backbone.Events, {
		Message:Message,
		secret:"",
		ErrorCode:ErrorCode,
		accountList:[],
		Util:Util,
		PageUtil:Page,
		switchAdMap:{},
		slotType:{
			"static":"静态",
			"couplet":"对联",
			"mImagePlus":"移动图加",
			"mobile":"移动",
			"fixed":"固定"
		},
		dsp_version_list:[
			"v2_2",
			"v2_3",
			"v2_4",
			"v2_5",
			"v2_6",
			"v2_7",
			"v2_8",
			"v2_9",
			"v3_0",
			"v3_1",
			"v3_2",
			"v3_3",
			"v3_4",
			"v3_5"
		],
		setCookie:function(c_name, value, expiredays){
			var exdate=new Date();
			exdate.setDate(exdate.getDate() + expiredays);
			document.cookie=c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
		},
		delCookie: function(c_name){
			var cval=this.getCookie(c_name);
			if(cval){
				var exdate=new Date();
				exdate.setTime(exdate.getTime()-1);
				document.cookie=c_name+ "=" + cval +";expires="+exdate.toGMTString();
			}
		},
		setAppType:function(type){
			this.setCookie("appType",type,7);
			app.type = type;
		},
		getAppType:function(){
			var type = this.getCookie("appType") || "dsp";
			app.type = type;
			return type;
		},
		setBidder:function(bidderId){
			sessionStorage.setItem("Bidder",bidderId, 7);
			app.bidder = bidderId;
		},
		getBidder:function(){
			var bidder = sessionStorage.getItem("Bidder");
			app.bidder = bidder;
			return bidder;
		},
		getCookie:function(c_name){
			if (document.cookie.length>0){
				c_start=document.cookie.indexOf(c_name + "=");
				if (c_start!=-1){
					c_start=c_start + c_name.length+1;
					c_end=document.cookie.indexOf(";",c_start);
					if (c_end==-1) c_end=document.cookie.length;
					return unescape(document.cookie.substring(c_start,c_end));
				}
			}
			return ""
		},
		setAccount:function(account, switchFlag){
			if (switchFlag) {
				account.desc = '当前用户：';
			}
			this.account = account;
			var account = JSON.stringify(account);
			sessionStorage.setItem("account",account);
		},
		getAccount:function(){
			var account = sessionStorage.getItem("account");
			try{
				account = JSON.parse(account);
			}catch(e){
				account = null
			}
			this.account = account;
			return account;
		},
		isSspAndDsp:function(){
			if(app.session && app.session.authorize && (app.session.authorize.type == 1 || app.session.authorize.type == 2)){
				return true;
			}else if(app.account && app.account.sspId && app.account.dspId){
				return true;
			}else{
				return false;
			}
		},
		isBusiness:function(){
			return app.session && app.session.authorize && app.session.authorize.type === 2;
		},
		isCommerce:function(){
			return app.session && app.session.authorize && app.session.authorize.type === 4;
		},
		isAdmin:function(){
			return app.session && app.session.authorize && app.session.authorize.type === 1;
		},
		switchAccount:function(accountID){
			var self = this;
			app.Util.get("/user/"+accountID+"/detail",{},function(err,doc){
				if(err){
					app.Message.error("切换账户失败！");
				}else{
					var type = doc.dspId?"dsp":"ssp";
					self.setAppType(type);
					self.setAccount(doc, true);
					if(doc.dspDetail && doc.dspDetail.bidders && doc.dspDetail.bidders[0]){
						self.setBidder(doc.dspDetail.bidders[0].id);
					}
					doc.desc = '当前用户：';
					app.account = doc;
					app.router.navigate("/",{trigger:true});
					location.reload();
				}
			});
		},
		getSettlementPercntage :function(){
			var settlement = app.account && app.account.sspDetail && app.account.sspDetail.settlement || {};
			if(settlement && settlement.type == "share" && settlement.value){
				return 1;
			}else{
				return null;
			}
		}
	});

	window.app = app;
	return app;
});