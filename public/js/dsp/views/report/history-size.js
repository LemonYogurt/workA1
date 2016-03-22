define([
	"text!templates/dsp/report/history-size.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{

		},
		render:function(){
			app.leftNav.show("report","history-size");
			this.$el.html(this.indexTemplate());
		}
	});

});