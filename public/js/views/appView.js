define([
	'models/session/session'
	,'views/nav/nav'
],function(Session,NavView){
	var AppView = Backbone.View.extend({
		initialize:function(){
		},
		render:function(){
			new NavView().render();
            if(app.account){
            	if(_.isEmpty(location.hash)){
            		app.getAppType();
		          	return app.router.navigate(app.type+"/home",{trigger:true});
		        }else{
		          	return app.router.navigate(location.hash.slice(1),{trigger:true});
		        }
            }else{
                return app.router.navigate('login', { trigger : true }) 
            }
			this.delegateEvents();
		}
		
	});

	return AppView;
});