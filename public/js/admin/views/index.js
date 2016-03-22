define([
	"text!templates/admin/account.html"
	, "text!templates/admin/authorizeType.html"
	,"business/collections/account"
	,"models/session/session"
],function(indexTemplate,selectTemplate,accountCollections,Session){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.indexTemplate = _.template(indexTemplate);
			this.selectTemplate = _.template(selectTemplate);
			this.accountCollections = new accountCollections();
			this.session = new Session;
			this.pageData = new app.PageUtil({
				collection:self.accountCollections,
				countUrl:"/business/account/count"
			});
			this.pageNo = 1;
			this.authorizeMap = ["","管理员","运营","","商务","用户"];
			this.searchStr = "";
			this.searchType = "";
		},
		events:{
			"click #accountSerchBtn":"accountSerch",
			"click #saveAccountBtn"	:"saveAccount",
			"click .editAuthorizeType"	:"editAuthorizeType",
			"click .saveTypeBtn"		:"saveEdit",
			"click .cancleTypeBtn"		:"canclEdit",
			"change #atype"			:"accountSerch"
		},
		render:function(){
			app.leftNav.show("adminSetting","admin-account");
			this.$el.html(this.indexTemplate());
			this.$el.find("#accountListTable").bootstrapTable(this.getTableOptions([]));
			this.renderTable();
		},
		renderTable:function(){
			var self = this;
			self.accountCollections.url = "/admin/account?str="+this.searchStr+"&type="+this.searchType;
			this.pageData.setUrl("/admin/account/count?str="+this.searchStr+"&type="+this.searchType);
			this.pageData.getPageData(self.pageNo,function(err,result){
				if(!err){
					self.accountList = result.datas;
					self.$el.find("#accountListTable").bootstrapTable('load', result.datas);
					self.pageData.setPage(self.pageNo,"",result.count,"#accountListPage",function(pageNum){
						self.pageNo = pageNum;
						self.renderTable();
					});
				}
				app.Util.loading.hide();
			});
		},
		accountSerch:function(){
			this.pageNo = 1;
			var str = $.trim($("#accountInput").val());
			var type = $("#atype").val();
			this.searchStr = str;
			this.searchType = type || "";
			this.renderTable();
		},
		editAuthorizeType:function(event){
			$("#accountListTable").find("select,.saveTypeBtn,.cancleTypeBtn").remove();
			$("#accountListTable").find(".editAuthorizeType").show();
			var dom = $(event.target);
			//dom.find("select,.saveBtn,.canclBtn").remove();
			dom.hide();
			var td = dom.parent();

			var id = dom.attr("data-id");
			var type = dom.attr("data-type");
			td.append(this.selectTemplate({type:type}));
		},
		saveEdit:function(event){
			var self = this;
			var dom = $(event.target);
			var v = dom.prev().val();
			var a = dom.prev().prev();
			dom.parent().find("select,.saveTypeBtn,.cancleTypeBtn").remove();
			var accountId = a.attr("data-id");
			app.Util.put("/admin/account/"+accountId+"/authorizeType",{type:v},function(err,doc){
				if(!err){
					a.attr("data-type",v);
					a.text(self.authorizeMap[v]);
					a.show();
					return app.Message.success("修改成功！");
				}else{
					a.show();
					return app.Message.error("修改失败！");
				}
			})
		},
		canclEdit:function(event){
			var dom = $(event.target);
			dom.prev().prev().prev().show();
			dom.parent().find("select,.saveTypeBtn,.cancleTypeBtn").remove();
		},

		getTableOptions:function(data){
			var self = this;
			var tableOptions = {
				columns: [
					{
						field: 'name',
						title:"账户名称",
						class:"ellipsis120"
					},
					{
						field: 'email',
						title:"email",
						class:"ellipsis120"
					},{
						field:"authorizeType",
						title:"权限",
						width:250,
						class:"authorizeTypeTr",
						formatter:function(value,row){
							var t = row.authorize && row.authorize.type || 5;
							var str = self.authorizeMap[t];
							if(t == 1){
								return self.authorizeMap[t];
							}else{
								return "<a href='javascript:;' data-type = '"+t+"' data-id='"+row._id+"' class='editAuthorizeType'>"+str+"</a>";
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