define([], function() {
	var userModel = Backbone.Model.extend({
		url: "/account",
		idAttribute:'_id',
		defaults:{
			name:'',
			email:'',
			remarks:"",
			info:{},
			dspId:'',
			sspId:''
		}
	});
	return userModel;
});
