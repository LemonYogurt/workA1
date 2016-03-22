define([
	"text!templates/dsp/settings/index.html"
	],function(indexTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
			this.settingType = "sizes";
			this.allOption = [];
			this.selectedOptions = [];
		},
		events:{
			"click .switch_sizes>i":"switchOption",
			"click .switch_types>i":"switchOption",
			"click .switch_screens>i":"switchOption",
			"click .switch_sitetypes>i":"switchOption",
		},
		render:function(settingType){
			var self = this;
			self.settingType = settingType;
			self.allOption = [];
			app.leftNav.show("settings",settingType);
			this.$el.html(this.indexTemplate({type:settingType}));
			this.$("#optionsTable").bootstrapTable(this.getTableOptions([]));
			self.getAllOption(function(){
				self.getselectedOptions(function(list){
					self.$("#optionsTable").bootstrapTable("load",self.getTableOptions(self.allOption));
				});
			});
		},
		getAllOption:function(callback){
			var self = this;
			if(self.allOption.length > 0){
				return callback && callback(self.allOption);
			}else{
				app.Util.get("/dictionary/"+self.settingType,{},function(err,list){
					self.allOption = list || [];
					return callback && callback(self.allOption);
				});
			}
		},
		getselectedOptions:function(callback){
			var self = this;
			app.Util.get("/dsp/settings/"+self.settingType,{},function(err,data){
				var list = data && data[self.settingType] || [];
				self.selectedOptions = list;
				self.$(".selectedOptionsNum").text(list.length);
				return callback && callback(list);
			});
		},
		switchOption:function(event){
			var dom = $(event.target);
			dom.toggleClass("fa-toggle-on");
			dom.toggleClass("fa-toggle-off");
			dom.prev().toggleClass("on");
			dom.next().toggleClass("on");
			var optionsID = dom.attr("data-id");
			this.saveOption();
		},
		saveOption:function(){
			var self = this;
			var selected = [];
			this.$(".switch_"+self.settingType+">.fa-toggle-on").each(function(i,e){
				selected.push($(e).attr("data-id"));
			});
			this.selectedOptions = selected;
			self.$(".selectedOptionsNum").text(selected.length);
			var data = {};
			data[self.settingType] = selected;
			app.Util.put("/dsp/settings/"+self.settingType,data,function(err,list){
				if(err){
					return app.Message.error(app.ErrorCode[err.error]);
				}
			});
		},
		getTableOptions:function (data){
			var self = this;
			var classs = "switch_"+self.settingType;
			var tableOptions = {
		    	columns: [
		    		{
		    			field: 'name',
		    			sortable: true
		    		},
		    		{
		    			field:"options",
		    			class:classs,
		    			formatter:function(value,row){
		    				var html = "";
		    				if(self.selectedOptions.indexOf(row._id) !== -1){
		    					html = [
		    						'<span class="">未接入</span>'
	                    			,'<i data-id="'+row._id+'"class="fa fa-toggle-on"></i>'
	                    			,'<span class="on">接入</span>'
		    					].join(" ");
		    				}else{
		    					html = [
		    						'<span class="on">未接入</span>'
	                    			,'<i data-id="'+row._id+'"class="fa fa-toggle-off"></i>'
	                    			,'<span class="">接入</span>'
		    					].join(" ");
		    				}
		    				return html;
		    			}	
		    		}
		    	],
		    	data:data
			};

			if(self.settingType == "sizes"){
				tableOptions.columns[2] = tableOptions.columns[1];
				tableOptions.columns[1] = {
	    			field: 'avgpv',
	    			sortable: true,
	    			formatter:function(value,row){
	    				return value+"万";
	    			}
	    		};
			}
			return tableOptions;
		}
	});

});