define([],function(){
	var views = {};
	var viewsmanage = {};

	viewsmanage.create = function(name,View){
		$(".navbar-nav>li").removeClass("active");
		nameMenu = name.substring(0,name.lastIndexOf("V"));
		$("#"+nameMenu+"Menu").addClass("active");
		if(views[name]){
			return views[name];
		}else{
			views[name] = new View();
			return views[name];
		}

	};
	
	return viewsmanage;
});