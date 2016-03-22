define([
	'text!templates/nav/nav.html'
	, "models/session/session"
	, "views/nav/left-nav"
	],function(navTemplate,Session,LeftNavView){
	return Backbone.View.extend({
		el:"#nav",
		initialize:function(){
			this.LeftNavView = new LeftNavView();
			app.leftNav = this.LeftNavView;
			this.session = new Session();
			this.navTemplate = _.template(navTemplate);
		},
		events:{
			"click #loginOut":"loginOut",
			"click #switchNav":"switchNav",
			"click .bidder":"switchBidder"
		},

		render:function(){
			this.$el.html(this.navTemplate({
				show:app.account?true:false,
				user:app.session || {},
				account:app.account || {}
			}));
			if(app.account && app.account.dspDetail){
				if (app.account.dspDetail.bidders && app.account.dspDetail.bidders.length) {
					for (var i = 0, len = app.account.dspDetail.bidders.length; i < len; i++) {
						var bidder = app.account.dspDetail.bidders[i];
						if (app.getBidder() == bidder.id) {
							$("#switchBidder").text(bidder.name);
						}
						$("#bidderList").append("<li><a class=\"bidder\" id=\"" + bidder.id + "\" href=\"#\">" + bidder.name + "</a></li>");
					}
				}
			}
			if(app.isSspAndDsp()){
				$("#switchNavLi").show();
			}else{
				$("#switchNavLi").hide();
			}
			this.LeftNavView.render();
		},
		loginOut:function(){
			this.session.logout();
		},
		switchNav:function(){
			var type = app.type=="dsp"?"ssp":"dsp";
			// app.setBidder(type);
			location.reload();
		},
		switchBidder:function(e){
			// console.log($(e.target).attr("id"))
			app.setBidder($(e.target).attr("id"));
			$("#switchBidder").text($(e.target).text());
			location.reload();
			// console.log('bidder change:', e)
			// var type = app.type=="dsp"?"ssp":"dsp";
			// app.setAppType(type);
			// location.reload();
		}
	});
});