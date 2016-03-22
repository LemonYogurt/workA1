define([
	"text!templates/dsp/account/index.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{
		
		},
		render:function(){
			app.leftNav.show("account").open();
			this.$el.html(this.indexTemplate());
		}
	});

});