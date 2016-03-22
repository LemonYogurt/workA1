define([
	"text!templates/admin/globalSetting.html"
	],function(globalSettingTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.globalSettingTemplate = _.template(globalSettingTemplate);
		},
		events:{
			"click #saveGlobal":"saveGlobal"
		},
		render:function(){
			var self = this;
			app.leftNav.show("adminSetting","admin-global");
			app.Util.get("/admin/global",{},function(err,doc){
				if(err){
					app.Message.error("全局设置获取失败！");
				}else{
					var global = doc || {};
					self.$el.html(self.globalSettingTemplate({global:global}));
				}
			});
		},
		
		saveGlobal:function(){
			var self = this;
			var bidPCT = +$("#bidPCT").val();
			var secondPCT = +$("#secondPCT").val();
			var sspPCT = +$("#sspPCT").val();

			if(!bidPCT || !secondPCT || !sspPCT){
				return app.Message.warning("请输入正确的值");
			}

			if(bidPCT <=0 || secondPCT<= 0 || sspPCT <= 0){
				return app.Message.warning("输入的值必须大于0");
			}

			var data = {
				bidPCT:bidPCT/100,
				secondPCT:secondPCT/100,
				sspPCT:sspPCT/100
			};
			app.Util.post("/admin/global",data,function(err,doc){
				if(err){
					return app.Message.error("设置失败！");
				}else{
					return app.Message.success("设置成功！");
				}
			});
		}
	}); 
});