define([
	"text!templates/dsp/report/preference.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
		},
		events:{

		},
		render:function(){
			app.leftNav.show("report","preference");
			this.$el.html(this.indexTemplate());
		}
	});

});