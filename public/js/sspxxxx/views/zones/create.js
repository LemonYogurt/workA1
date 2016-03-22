define([
	"text!templates/ssp/zones/create.html"
	],function(createTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.createTemplate = _.template(createTemplate);
		},
		events:{	
			"change input[name='platform']":"changePlatform",
			"change .zonetype>select":"changeType",
			"change #window_position":"changeWindowPosition",
			"click .insets>div":"clickInsets",
			"click .insets>div>img":"clickImg",
			"submit #step1Form":"submitStep1Form"
		},
		render:function(){
			app.leftNav.show("zones").open();
			this.$el.html(this.createTemplate());
			//this.$("#zonesTable").bootstrapTable(this.getTableOptions([]));
		},
		changePlatform:function(event){
			var platform = $(event.target).val();
			this.$(".zonetype>select").hide();
			this.$("#"+platform+"Type").show().find("option:first").prop("selected",true).change();
		},
		changeType:function(event){
			var type = $(event.target).val();
			this.$(".sample>img").hide();
			this.$(".special-setting").hide();
			this.$(".sample>img[data-type="+type+"]").show();
			this.$(".special-setting[data-type="+type+"]").show();
		},
		changeWindowPosition:function(event){
			var type = $(event.target).val();
			this.$(".sample>img").hide();
			if(type == "bottom"){
				this.$(".sample>img[data-type='202-bottom']").show();
			}else{
				this.$(".sample>img[data-type='202']").show();
			}
		},
		//点击小图样式
		clickInsets:function(event){
			this.$(".insets>div").removeClass("active");
			$(event.target).addClass("active");
			var type = $(event.target).attr("data-id");
			$("#insetsType").val(type);
		},
		clickImg:function(event){
			event.stopPropagation();
			$(event.target).parent().click();
		},
		submitStep1Form:function(event){
			var data = $(event.target).serializeArray();
			console.log(data);
		}
	});
});