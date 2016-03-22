define([
	"text!templates/dsp/report/personal.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{

		},
		render:function(){
			app.leftNav.show("report","personal");
			this.$el.html(this.indexTemplate());
		}
	});

});