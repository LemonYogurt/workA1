define([
	"text!templates/dsp/report/history-site.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{

		},
		render:function(){
			app.leftNav.show("report","history-site");
			this.$el.html(this.indexTemplate());
		}
	});

});