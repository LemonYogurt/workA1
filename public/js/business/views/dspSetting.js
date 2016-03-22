define([
	"text!templates/business/dspSetting.html"
	],function(dspSettingTemplate){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.dspSettingTemplate = _.template(dspSettingTemplate);
			this.account = {};
			this.sspAccountList = [];
			this.dspList = [];
			this.selectDspList = [];
			// this.accountCollections = new accountCollections();
			// this.pageData = new Page({
			// 	collection:self.accountCollections,
			// 	countUrl:"/business/account/count?type=dsp",
			// });
			// this.pageNo = 1;
		},
		events:{
			"click #sspDropdown input" :"clearEven",
			"keyup #sspDropdown input" :"searchSSPAccount",
			"click #sspDropdown .ssp-item" :"selectSSP",
			"click tr>.switchTr>.switch_i" :"switchTr"

		},
		render:function(){
			app.leftNav.show("businessSetting","business-dsp");
			this.$el.html(this.dspSettingTemplate());
			this.$el.find("#dspSelectListTable").bootstrapTable(this.getTableOptions([]));

			this.renderPage();
		},

		renderPage:function(){
			var self = this;
			// self.accountCollections.url = "/business/account?type=dsp";
			
			app.Util.get("/business/getAllDspList",{type:"dsp"},function(err,result){
				console.log('result: ', result);
		// console.log('list:', list)

				if(err){
					return app.Message.error("获取DSP列表失败！");
				}
				var bidderList = [];
				for (var i = 0, len = result.length; i < len; i++) {
					console.log('list i:', result[i].name, result[i].bidders)
					if (result[i].bidders) {
						for (var j = 0, jLen = result[i].bidders.length; j < jLen; j++) {
							bidderList.push({
								name: result[i].name + '('+ result[i].bidders[j].name +')',
								dspId: result[i].bidders[j].id
							})
						}
					}
				}
				if(!err){
					list = bidderList;
					self.getSSPAccount("",function(){
						self.dspList = list;
						self.renderTable();
					});
					
	                // self.pageData.setPage(self.pageNo, "",result.count,"#dspListPage",function(pageNum){
	                //     self.pageNo = pageNum;
	                //     self.renderPage();
	                // });
				}
			});
		},

		renderTable:function(){
			var self = this;
			var account = sessionStorage.getItem("sspAccount");
			if(account){
				self.account = JSON.parse(account);
			}else{
				self.account = self.sspAccountList[0] || {}
			}
			if(!self.account._id){
				return app.Message.warning("获取ssp账户失败！");
			}
			$("#activeAccount").text(self.account.email+"("+self.account.name+")");
			$("#accountSpan").attr("data-id",self.account._id);
			$("#accountSpan").text(self.account.email+"("+self.account.name+")");
			app.Util.get("/business/dspList/"+self.account.sspId,{},function(err,list){
				if(err){
					return app.Message.error("获取用户DSP设置失败");
				}else{
					self.selectDspList = list || [];
					$("#dspNum").text(self.selectDspList.length);

					self.dspList = self.dspList.sort(function(a,b){
						if(self.selectDspList.indexOf(a.dspId) !== -1){
							return -1;
						}else if(self.selectDspList.indexOf(b.dspId) !== -1){
							return 1;
						}else{
							return -1;
						}
					});
					self.$el.find("#dspSelectListTable").bootstrapTable("load",self.dspList);
				}
			});
		},
		getSSPAccount:function(str,callback){
			var self = this;
			app.Util.get("/business/account",{type:"ssp",str:str},function(err,list){
				if(err){
					app.Message.error('获取ssp账户失败');
				}else{
					self.sspAccountList = list;
					self.renderAccountList(list);
				}
				return callback && callback();
			});
		},
		renderAccountList:function(list){
			$("#sspDropdown ul>li:first").siblings().remove();
			if(!list.length){
				$("#sspDropdown ul").append('<li style="padding:10px;">无可选项</li>');
			}
			for(var i=0;i < list.length && i < 20;i++){
				$("#sspDropdown ul").append('<li><a href="javascript:;" class="ssp-item" data-id="'+list[i]._id+'">'+list[i].email+'('+list[i].name+')</a></li>');
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
			sessionStorage.setItem("sspAccount",JSON.stringify(account));
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
				self.selectDspList = self.selectDspList.filter(function (item){return item !== id});
			}else{
				i.removeClass("fa-toggle-off").addClass("fa-toggle-on");
				self.selectDspList.push(id);
			}
			self.selectDspList = self.selectDspList.filter(function(item){return !!item;});
			app.Util.put("/business/dspList/"+self.account.sspId,{dspList:self.selectDspList},function(err,result){
				if(err){
					app.Message.error("设置失败！");
				}else{
					$("#dspNum").text(self.selectDspList.length);
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
	                {
	                    field: 'name',
	                    title:"DSP名称"
	                },
	                {
	                    field: 'dspId',
	                    title:"DSPID"
	                },{
	                	field:"options",
	                	class:"switchTr",
	                	width:150,
		    			formatter:function(value,row){
		    				var html = "";
		    				if(self.selectDspList.indexOf(row.dspId) !== -1){
		    					html = [
		    						'<span class="">未接入</span>'
	                    			,'<a href="javascript:;" class="switch_i" data-id="'+row.dspId+'"><i class="fa fa-toggle-on"></i></a>'
	                    			,'<span class="on">接入</span>'
		    					].join(" ");
		    				}else{
		    					html = [
		    						'<span class="on">未接入</span>'
	                    			,'<a href="javascript:;" class="switch_i" data-id="'+row.dspId+'"><i class="fa fa-toggle-off"></i></a>'
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