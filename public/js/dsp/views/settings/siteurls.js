define([
	"text!templates/dsp/settings/siteurls.html"
	],function(siteurlsTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.siteurlsTemplate = _.template(siteurlsTemplate);
			this.siteUrls = [];
		},
		events:{
			"click .delete_siteurls":"deleteSiteUrl",
			"click #saveSiteUrlBtn"	:"saveSiteUrl"
		},
		render:function(){
			var self = this;
			app.leftNav.show("settings","siteurls");
			this.$el.html(this.siteurlsTemplate());
			this.$("#siteTypeTable").bootstrapTable(this.getTableOptions([]));
			self.getSiteUrls(function(){
				var siteurlsMap = self.siteUrls.map(function(url){
						return {
							_id:url,
							name:url
						}
					});
				self.$("#siteTypeTable").bootstrapTable("load",siteurlsMap);
			});
		},
		saveSiteUrl:function(){
			var self = this;
			var siteUrls = $.trim($("#siteUrlTextarea").val()).split("\n").filter(function(url){return url;});
			var len = siteUrls.length;
			var siteUrlsOk = siteUrls.filter(function(url){
				return app.Util.isUrl(url);
			});

			if(len !== siteUrlsOk.length){
				return app.Message.warning("有"+(len-siteUrlsOk.length)+"个URL格式错误");
			}

			siteUrls = self.siteUrls.concat(siteUrls);
			self.save(siteUrls);
		},
		deleteSiteUrl:function(event){
			var url = $(event.target).attr('data-id');
			var urls = this.siteUrls.filter(function(u){return u !== url});
			this.save(urls);
		},
		save:function(urls){
			var self = this;
			urls = _.uniq(urls);
			app.Util.put("/dsp/settings/siteurls",{siteurls:urls},function(err,data){
				if(err){
					return app.Message.error(app.ErrorCode[err.error]);
				}else{
					self.siteUrls = urls;
					var siteurlsMap = urls.map(function(url){
						return {
							_id:url,
							name:url
						}
					});
					self.$("#siteTypeTable").bootstrapTable("load",siteurlsMap);
					$("#addSiteUrlModal").modal("hide");	
					$("#siteUrlTextarea").val("");				
				}
			});
		},
		getSiteUrls:function(callback){
			var self = this;
			app.Util.get("/dsp/settings/siteurls",{},function(err,data){
				var list = data && data.siteurls || [];
				self.siteUrls = list
				self.$(".selectedOptionsNum").text(list.length);
				return callback && callback(list);
			});
		},
		getTableOptions:function (data){
			var self = this;
			var tableOptions = {
		    	columns: [
		    		{
		    			field: 'name',
		    			sortable: true
		    		},
		    		{
		    			field:"options",
		    			formatter:function(value,row){
		    				return "<a class='delete_siteurls' data-id="+row._id+" href='javascript:;'>删除</a>";
		    			}	
		    		}
		    	],
		    	data:data
			};
			return tableOptions;
		}
	});
});