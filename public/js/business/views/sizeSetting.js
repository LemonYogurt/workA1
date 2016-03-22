define([
	"text!templates/business/sizeSetting.html"
	, "../../util/page"
	],function(sizeSettingTemplate, Page){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.sizeSettingTemplate = _.template(sizeSettingTemplate);
			this.account = {};
			this.sspAccountList = [];
			this.sizeList = [];
			this.selectsizeList = [];
			this.page = new Page();
			this.pageNo = 1;
			this.limit = 20;
		},
		events:{
			"click #dspDropdown input" 		:"clearEven",
			"keyup #dspDropdown input" 		:"searchSSPAccount",
			"click #dspDropdown .dsp-item" 	:"selectSSP",
			"click tr>.switchSizeTr>.switch_i_size"  	:"switchTr"

		},
		render:function(){
			app.leftNav.show("businessSetting","business-dsp-size");
			this.$el.html(this.sizeSettingTemplate());
			this.$el.find("#dspSizeListTable").bootstrapTable(this.getTableOptions([]));

			var self = this;
			app.Util.get("/dictionary/sizes", {skip: (self.pageNo - 1) * self.limit, limit: 20},function(err,result){
				if(err){
					return app.Message.error("获取尺寸列表失败！");
				}else{
						self.sizeList = result.sizeListOfEveryPage;
						self.sizeListCount = result.sizeListCount;

					    self.getSSPAccount("",function(){
						self.renderTable();
					});
				}
			});
		},
		renderTable:function(){
			var self = this;
			var account = sessionStorage.getItem("dspAccount");
			if(account){
				self.account = JSON.parse(account);
			}else{
				self.account = self.sspAccountList[0] || {}
			}
			if(!self.account._id){
				return app.Message.warning("获取ssp账户失败！");
			}

			$("#dspactiveAccount").text(self.account.email+"("+self.account.name+")");
			$("#dspAccountSpan").attr("data-id",self.account._id);
			$("#dspAccountSpan").text(self.account.email+"("+self.account.name+")");

			app.Util.get("/business/sizeList/"+self.account.dspId,{},function(err,list){
				if(err){
					return app.Message.error("获取用户DSP设置失败");
				}else{
					self.selectsizeList = list || [];
					$("#sizeNum").text(self.selectsizeList.length);
					self.sizeList = self.sizeList.sort(function(a,b){
						if(self.selectsizeList.indexOf(a._id) !== -1){
							return -1;
						}else if(self.selectsizeList.indexOf(b._id) !== -1){
							return 1;
						}else{
							return -1;
						}
					});
					self.$el.find("#dspSizeListTable").bootstrapTable("load",self.sizeList);

					console.log(self.sizeList.length);
					self.page.setPage(self.pageNo, 20, self.sizeListCount, "#sizeListPage", function(pageNum){
						self.pageNo = pageNum;
						self.render();
					});
				}
			});
		},
		getSSPAccount:function(str,callback){
			var self = this;
			app.Util.get("/business/account",{type:"dsp",str:str},function(err,list){
				if(err){
					app.Message.error('获取dsp账户失败');
				}else{
					self.sspAccountList = list;
					self.renderAccountList(list);
				}
				return callback && callback();
			});
		},
		renderAccountList:function(list){
			$("#dspDropdown ul>li:first").siblings().remove();
			if(!list.length){
				$("#dspDropdown ul").append('<li style="padding:10px;">无可选项</li>');
			}
			for(var i=0;i < list.length && i < 20;i++){
				$("#dspDropdown ul").append('<li><a href="javascript:;" class="dsp-item" data-id="'+list[i]._id+'">'+list[i].email+'('+list[i].name+')</a></li>');
			}
		},
		searchSSPAccount:function(event){
			if(event.keyCode == 13){
				var str = $.trim($(event.target).val());
				this.getSSPAccount(str);
			}
		},
		selectSSP:function(event){
			var id = $(event.target).data("id");
			var text = $(event.target).text();
			var account = this.sspAccountList.filter(function(item){return item._id == id})[0];
			sessionStorage.setItem("dspAccount",JSON.stringify(account));
			this.renderTable();
		},
		switchTr:function(event){
			var self = this;
			var dom = $(event.target);
			if(dom[0].tagName == "I"){
				dom.parent().click();
				return false;
			}
			var id = dom.attr("data-id");
			var i = dom.find("i");
			if(i.hasClass("fa-toggle-on")){
				i.removeClass("fa-toggle-on").addClass("fa-toggle-off");
				self.selectsizeList = self.selectsizeList.filter(function (item){return item !== id});
			}else{
				i.removeClass("fa-toggle-off").addClass("fa-toggle-on");
				self.selectsizeList.push(id);
			}
			self.selectsizeList = self.selectsizeList.filter(function(item){return !!item;});
			app.Util.put("/business/sizeList/"+self.account.dspId,{sizeList:self.selectsizeList},function(err,result){
				if(err){
					app.Message.error("设置失败！");
				}else{
					$("#sizeNum").text(self.selectsizeList.length);
					app.Message.success("设置成功！");
				}

			});
		},
		clearEven:function(event){
			event.stopPropagation();
		},
		getTableOptions:function(data){
			var self = this;
			var tableOptions = {
	            columns: [
	                /*{
	                    field: '_id',
	                    title:"尺寸ID"
	                },*/
	                {
	                    field: 'name',
	                    title:"尺寸",
	                    sortable:true,
	                    sorter:function(a,b){
	                    	var w1 = +a.split("x")[0]
							var w2 = +b.split("x")[0]
							var h1 = +a.split("x")[1]
							var h2 = +b.split("x")[1]
							if(w1 !== w2){
								return w1 > w2 ? -1:1;
							}else{

								return h1 > h2 ? -1:1
							}
	                    }
	                },
	                {
	                    field: 'avgpv',
	                    title:"日均流量",
	                    sortable:true
	                },{
	                	field:"options",
	                	class:"switchSizeTr",
	                	width:150,
		    			formatter:function(value,row){
		    				var html = "";
		    				if(self.selectsizeList.indexOf(row._id) !== -1){
		    					html = [
		    						'<span class="">未接入</span>'
	                    			,'<a href="javascript:;" class="switch_i_size" data-id="'+row._id+'"><i class="fa fa-toggle-on"></i></a>'
	                    			,'<span class="on">接入</span>'
		    					].join(" ");
		    				}else{
		    					html = [
		    						'<span class="on">未接入</span>'
	                    			,'<a href="javascript:;" class="switch_i_size" data-id="'+row._id+'"><i class="fa fa-toggle-off"></i></a>'
	                    			,'<span class="">接入</span>'
		    					].join(" ");
		    				}
		    				return html;
		    			}
	                }
	            ],
	            data:data
	        };
	        return tableOptions;
		}
	}); 
});