define([
	"text!templates/ssp/settings/union.html"
	, "text!templates/ssp/settings/unionModel.html"
	],function(indexTemplate,unionTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
			this.unionTemplate = _.template(unionTemplate);
			this.allUnion = [];
			this.selectUnion = {};
		},
		events:{	
			"click .editUnion"			:"showUnion",
			"click #unionSaveBtn"		:"saveUnionClick",
			"click #unionPanel .close"	:"hideUnion",
			"click .switchTd>i"			:"toggleSwitch",
			"click #allCheckedBtn"	:"allChecked"
		},
		render:function(){
			var self = this;
			$("#mask-panel").unbind();
			$("#mask-panel").click(function(){
		        self.hideUnion();
		    });
			app.leftNav.show("sspSettings").open();
			self.getAllUnion(function(list){
				self.$el.html(self.indexTemplate());
				self.$("#slotTable").bootstrapTable(self.getTableOptions([]));
				self.getAllSlot(function(list){
					self.getUnion(function(data){
						self.$("#slotTable").bootstrapTable("load",list);
					});
				});
			});
		},
		getAllSlot:function(callback){
			app.Util.get("/ssp/slot",{},function(err,list){
				return callback(list || []);
			});
		},
		getAllUnion:function(callback){
			var self = this;
			app.Util.get("/dictionary/union",{},function(err,list){
				self.allUnion = list || [];
				return callback(list || []);
			});
		},
		getUnion:function(callback){
			var self = this;
			app.Util.get("/ssp/settings/union",{},function(err,data){
				self.selectUnion = data && data.union || {};
				return callback(self.selectUnion);
			})
		},
		showUnion:function(event){
			var dom = $(event.target);
			if(dom.hasClass("badge")){
				dom = dom.parent();
			}
			var slotid = dom.attr("data-id");
			var slotTitle = dom.attr("data-name");
			var unionid = this.selectUnion[slotid] || [];
			app.Util.maskPanel.show();
			this.$("#unionTable").html(this.unionTemplate({
				list:this.allUnion,
				title:slotTitle,
				slotid:slotid,
				selectedUnion:unionid
			}));
			this.$("#allCheckedBtn").prop("checked",unionid.length === this.allUnion.length);
			this.$("#unionPanel").animate({right:0});
		},
		hideUnion:function(event){
			app.Util.maskPanel.hide();
			console.log("s");
			this.$("#unionPanel").animate({right:"-260px"});
		},
		allChecked:function(event){
			var checked = $(event.target).prop("checked");
			this.$(".switchTd i").each(function(i,e){
				if(checked){
					$(e).removeClass("fa-toggle-off")
						.addClass("fa-toggle-on")
					$(e).prev().removeClass("on");
					$(e).next().addClass("on");
				}else{
					$(e).removeClass("fa-toggle-on")
						.addClass("fa-toggle-off")
					$(e).next().removeClass("on");
					$(e).prev().addClass("on");
				}
			});
		},
		saveUnionClick:function(){
			this.$("#unionPanel").animate({right:"-260px"});
			app.Util.maskPanel.hide();
			var slotId = this.$(".slot-title").attr("data-solt-id");
			var checkedId = [];
			this.$(".switchTd .fa-toggle-on").each(function(i,e){
				var unionId = $(e).parent().attr("data-id");
				checkedId.push(unionId);
			});
			if(checkedId.length){
				this.selectUnion[""+slotId] = checkedId;
			}else{
				delete this.selectUnion[slotId];
			}
			var len = checkedId.length;
			if(len){
				this.$(".editUnion[data-id="+slotId+"]").html("已接入<span class='badge'>"+len+"</span>家");
			}else{
				this.$(".editUnion[data-id="+slotId+"]").html("未接入");
			}
			this.saveUnion();
		},
		saveUnion:function(){
			var unionMap = this.selectUnion;
			app.Util.put("/ssp/settings/union",{union:unionMap},function(err,data){
				if(err){
					return app.Message.error(app.ErrorCode[err.error]);
				}
			})
		},
		toggleSwitch:function(event){
			var dom = $(event.target);
			dom.toggleClass("fa-toggle-on");
			dom.toggleClass("fa-toggle-off");
			dom.prev().toggleClass("on");
			dom.next().toggleClass("on");
		},
		getTableOptions:function (data){
			var self = this;
			var tableOptions = {
		    	columns: [
		    		{
		    			field: 'name',
		                sortable: true,
		                class:"ellipsis120"
		    		},
		    		{
		    			field: 'size',
		    			sortable: true,
		    			formatter:function(value,row){
		    				return row.width+row.widthunit+"*"+row.height+row.heightunit;
		    			}
		    		},
		    		{
		    			field: 'type',
		    			sortable: true,
		    			formatter:function(value,row){
		    				return app.slotType[value] || value;
		    			}
		    		},
		    		{
		    			field:"options",
		    			formatter:function(value,row){
		    				var len = self.selectUnion[row._id] && self.selectUnion[row._id].length || 0;
		    				if(len){
		    					return "<a class='editUnion' title='点击接入' href='javascript:;' data-name='"+row.name+"' data-id="+row._id+">已接入<span class='badge'>"+len+"</span>家</a>"
		    				}else{
		    					return "<a class='editUnion' title='点击接入' href='javascript:;' data-name='"+row.name+"' data-id="+row._id+">未接入</a>"
		    				}
		    			}
		    		}
		    	],
		    	data:data
			};
			return tableOptions;
		}
	});
});