define([
	"text!templates/business/index.html"
	, "text!templates/business/account.html"
	, "text!templates/business/stateSelect.html"
	,"business/collections/account"
	,"models/session/session"
],function(indexTemplate, accountTemplate, selectTemplate,accountCollections,Session){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.indexTemplate = _.template(indexTemplate);
			this.accountTemplate = _.template(accountTemplate);
			this.selectTemplate = _.template(selectTemplate);
			this.accountCollections = new accountCollections();
			this.session = new Session;
			this.pageData = new app.PageUtil({
				collection:self.accountCollections,
				countUrl:"/business/account/count"
			});
			this.pageNo = 1;
			this.stateMap = ["可用","待审核","禁用","删除"];
			this.searchStr = "";
			this.searchType = "";
		},
		events:{
			"click #accountSerchBtn":"accountSerch",
			"click #addAccountBtn,.editAccount":"editAccount",
			"click #saveAccountBtn"	:"saveAccount2",
			"click .editState"		:"editState",
			"click .saveBtn"		:"saveEdit",
			"click .canclBtn"		:"canclEdit",
			"click .switchAccount"	:"switchAccount",
			"change #settlementType":"changeSettlementType",
			"click #sspCheckbox"	:"changeSspCheckbox",
			"click #dspCheckbox"	:"changeDspCheckbox",
			"click .editBidder"     :"editBidder",
			"click #addBidder"      :"addBidder",
			"click #userRadio"		:"changeUserAuthType",
			"click #commerceRadio"  :"changeCommerceAuthType",
			"click #businessRadio"	:"changeBusinessRadioAuthType",
			"click #adminRadio"		:"changeAdminRadioAuthType"
		},
		render:function(type){
			app.leftNav.show("businessSetting","business-account");
			this.$el.html(this.indexTemplate({
				currentUser: app.session
			}));
			this.$el.find("#accountListTable").bootstrapTable(this.getTableOptions([]));
			this.renderTable(type);
		},

		renderTable:function(type){
			var self = this;
			if(type){
				this.searchType = type;
			}
			self.accountCollections.url = "/business/account?str="+this.searchStr+"&type="+this.searchType;
			this.pageData.setUrl("/business/account/count?str="+this.searchStr+"&type="+this.searchType);
			this.pageData.getPageData(self.pageNo,function(err,result){
				if(!err){
					self.accountList = result.datas;
					self.$el.find("#accountListTable").bootstrapTable('load', result.datas);

					self.pageData.setPage(self.pageNo,"",result.count,"#accountListPage",function(pageNum){
						self.pageNo = pageNum;
						self.renderTable();
					});
				}
				// $("#loading-mask").hide();
				app.Util.loading.hide();
			});
		},

		accountSerch:function(){
			this.pageNo = 1;
			var str = $.trim($("#accountInput").val());
			var type = $("#state").val();
			this.searchStr = str;
			this.searchType = type || "";
			this.renderTable();
		},
		changeAdminRadioAuthType: function (event) {
			this.hideFun(true);
		},
		changeBusinessRadioAuthType: function (event) {
			this.hideFun(true);
		},
		changeCommerceAuthType: function (event) {
			this.hideFun(false);
			$('#bussinessType').show();
		},
		hideFun: function (flag) {
			if (flag) {
				$('#bussinessType').hide();
			}
			$("#dspSettingDiv").hide();
			$('#settlementDiv').hide();
			$('.addNormal').hide();
			$("#bidType").hide();
			$("#admType").hide();
		},
		changeUserAuthType: function () {
			$('#bussinessType').show();
			this.changeDspCheckbox({target: '#dspCheckbox'});
			this.changeSspCheckbox({target: '#sspCheckbox'});
		},
		changeDspCheckbox:function(event){
			if($(event.target).prop("checked") && $('#userRadio').prop("checked")){
				$("#dspSettingDiv").show();
				$('.addNormal').show();
				$('#settlementDiv').hide();
				this.showBidAndAdmTypeDiv();
			}
		},
		changeSspCheckbox:function(event){
			if($(event.target).prop("checked") && $('#userRadio').prop("checked")){
				$("#settlementDiv").show();
				$('.addNormal').show();
				$("#dspSettingDiv").hide();
				this.showBidAndAdmTypeDiv();
			}
		},
		showBidAndAdmTypeDiv:function(){
			if($("#dspCheckbox").prop("checked") || $("#sspCheckbox").prop('checked')){
				$("#bidType").show();
				$("#admType").show();
			}else{
				$("#bidType").hide();
				$("#admType").hide();
			}
		},
		changeSettlementType:function(event){
			$(".settlementValue").hide();
			$(".percentage").hide();
			$(".fen").hide();
			$(".settlementValue input").val("");
			var v = $(event.target).val();
			if(v == "share"){
				$(".settlementValue").show();
				$(".settlementValue input").val("66");
				$(".percentage").show();
			}else if(v == "fixed"){
				$(".settlementValue").show();
				$(".settlementValue input").val("");
				$(".fen").show();
			}
		},
		// business/views/index.js
		editAccount:function(event){
			var account = {};
			var self = this;
			var id = $(event.target).attr("data-id");
			if(id){
				app.Util.get("/user/"+id+"/detail",{},function(err,doc){
					if(err){
						return app.Message.error("获取用户信息详情失败！");
					}else{
						console.log(doc);
						showModel(doc);
					}
				});
			}else{
				showModel({});
			}
			function showModel(data){
				self.$("#accountForm").html(self.accountTemplate({
					account:data
				}));
				self.$("#accountModal").modal("show");

				self.changeDspCheckbox({target: '#dspCheckbox'});
				self.changeSspCheckbox({target: '#sspCheckbox'});
			}
		},
		editState:function(event){
			if (app.session.authorize.type >= 4) {
				return app.Message.warning("对不起，您权限不足");
			} else {
				$("#accountListTable").find("select,.saveBtn,.canclBtn").remove();
				$("#accountListTable").find(".editState").show();
				var dom = $(event.target);
				dom.hide();
				var tr = dom.parent();
				var id = dom.attr("data-id");
				var state = dom.attr("data-state");
				tr.append(this.selectTemplate({state:state}));
			}
		},
		switchAccount:function(event){
			var id = $(event.target).attr("data-id");
			console.log('switch id: ', id);
			app.switchAccount(id);
		},
		saveEdit:function(event){
			var self = this;
			var dom = $(event.target);
			var v = dom.prev().val();
			var a = dom.prev().prev();
			//var parentTr = a.parent().parent();
			dom.parent().find("select,.saveBtn,.canclBtn").remove();
			var accountId = a.attr("data-id");
			app.Util.put("/business/account/"+accountId+"/state",{state:v},function(err,doc){
				if(!err){
					a.attr("data-state",v);
					a.text(self.stateMap[v]);
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
			dom.parent().find("select,.saveBtn,.canclBtn").remove();
		},
		saveAccount2: function () {
			var self = this;
			var email = $.trim(this.$("#regemail").val());
			var password = $.trim(this.$("#regpassword").val());
			var name = $.trim(this.$("#name").val());
			var id = $.trim(this.$("#_id").val());
			if(!email){
				this.$("#regemail").focus();
				return app.Message.warning(app.ErrorCode[1001]);
			}
			if(!app.Util.isEmail(email)){
				this.$("#regemail").focus();
				return app.Message.warning(app.ErrorCode[1004]);
			}
			if(!password && !id){
				this.$("#regpassword").focus();
				return app.Message.warning(app.ErrorCode[1002]);
			}
			if(password.length < 6 && !id){
				this.$("#regpassword").focus();
				return app.Message.warning(app.ErrorCode[1016]);
			}
			if(!name){
				this.$("#name").focus();
				return app.Message.warning(app.ErrorCode[1003]);
			}
			var accountType = 5;
			self.$el.find('input[name="accountType"]').each(function (k, v) {
				if ($(v).prop('checked')) {
					accountType = $(v).data('type');
				}
			});

			var data = null;
			switch (accountType) {
				case 1:
				case 2:
					data = {
						email:email,
						password:password,
						name:name,
						accountType: accountType
					};
					self.saveAccount(email, password, name, accountType, data);
					break;
				case 4:
					var isSsp = this.$("#sspCheckbox").prop("checked");
					var isDsp = this.$("#dspCheckbox").prop("checked");
					data = {
						email:email,
						password:password,
						name:name,
						accountType: accountType,
						isSsp: isSsp,
						isDsp: isDsp
					};
					self.saveAccount(email, password, name, accountType, data);
					break;
				case 5:
					self.saveAccount(email, password, name, accountType, null);
					break;
				default:
					return app.Message.error(app.ErrorCode[1010]);
			}
		},
		saveAccount:function(email, password, name, accountType, data){
			var self = this;
			var isSsp = this.$("#sspCheckbox").prop("checked");
			var isDsp = this.$("#dspCheckbox").prop("checked");
			var id = $.trim(this.$("#_id").val());
			if (!data) {
				var bidType = $("#bidType :checked").val();
				var admType = $("#admType :checked").val();
				var abbreviation = $.trim(this.$("#abbreviation").val());
				var telphone = $.trim(this.$("#telphone").val());
				var company = $.trim(this.$("#company").val());
				var address = $.trim(this.$("#address").val());
				var website = $.trim(this.$("#website").val());
				var settlement = this.$("#settlementType").val();
				var settlementValue = +this.$(".settlementValue input").val();
				var android = +$("#android").val();
				var ios = +$("#ios").val();

				var path = $.trim(this.$("#path").val());
				var contentType = $.trim(this.$("#contentType").val());
				var version = $.trim(this.$("#version").val());

				var bidderList = $('.bidderInfo');
				var bidders =[];
				for(var i = 0, len = bidderList.length; i < len; i++){
					bidders.push({
						id:$(bidderList[i]).attr('id').slice(3),
						name:$(bidderList[i]).val()
					});
				}

				data = {
					email:email,
					password:password,
					name:name,
					abbreviation : abbreviation,
					isSsp:isSsp,
					isDsp:isDsp,
					bidType :bidType || null,
					admType : admType || null,
					accountType: accountType,
					//state:+state,
					info:{
						telphone:telphone,
						company:company,
						address:address,
						website:website
					}
				};
				if(isSsp){
					data.settlement = {
						type:settlement,
						value:settlementValue
					};
					data.platform_bid = {
						android:android || null,
						ios:ios || null
					};
					if((settlement == "share" || settlement == "fixed") && settlementValue <= 0){
						return app.Message.warning("请设置结算的分成比或价格！");
					}
				}else if(isDsp){
					var reg = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/;
					if(!reg.test(path)){
						return app.Message.warning("地址格式不正确！");
					}
					data.path = path;
					data.contentType = contentType;
					data.version = version;
					data.bidders = bidders;
				}

			}
			if(id){
				/*
				 name:'',
				 email:'',
				 remarks:"",
				 info:{},
				 dspId:'',
				 sspId:''
				 */
				var accountModel = this.accountCollections.get(id);
				console.log(accountModel);
				delete data.password;
				delete data.isSsp;
				delete data.isDsp;
				data.sspId = accountModel.get("sspId");
				data.dspId = accountModel.get("dspId");
				app.Util.put("/user/"+id, data, function(err,d){
					if(err){
						app.Message.error("账户修改失败！");
					}else{
						self.$el.find("#regform input").val("");
						app.Message.success("账户修改成功！");
						self.renderTable();
						self.updateSwitchAccount(id);
					}
					self.$("#accountModal").modal("hide");
				});
			}else{
				this.session.reg(data, function(errCode, result){
					if(errCode){
						return app.Message.error(app.ErrorCode[errCode]);
					}else{
						self.$el.find("#regform input").val("");
						app.Message.success("账户添加成功！");
						self.$("#accountModal").modal("hide");
						self.renderTable();
					}
				});
			}
		},
		updateSwitchAccount:function(id){
			if(id == app.account._id){
				app.Util.get("/user/"+id+"/detail",{},function(err,doc){
					if(!err){
						app.setAccount(doc);
					}
				});
			}
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
						field:"dspId",
						title:"dspId"
					},{
						field:"sspId",
						title:"sspId"
					},{
						field:"state",
						title:"状态",
						width:250,
						class:"stateTr",
						formatter:function(value,row){
							var state = Number.isInteger(row.state)?row.state : 1;
							var str = self.stateMap[state];
							if(app.isBusiness() && row.authorize && row.authorize.type <= 2){
								return str;
							}else{
								return "<a href='javascript:;' data-state = '"+row.state+"' data-id='"+row._id+"' class='editState'>"+str+"</a>";
							}
						}
					},{
						field:"option",
						title:"操作",
						width:120,
						formatter:function(value,row){
							var s = '<a href="javascript:;" title="切换至此账户" id="switchAccount" data-id="'+row._id+'" class="switchAccount" style="margin-left:20px;">切换</a>';
							var option = [];
							if(app.account._id == row._id || row.authorize.type <= 4){
								s = '<span class="text-muted spanSwitchAccount"  data-id="'+row._id+'" style="margin-left:20px;">切换</span>';
							}
							if (app.session.authorize.type >= 4) {
								option.push(s.replace(/style=.+\"/, ''));
							} else {
								option = ['<a href="javascript:;" data-id="'+row._id+'" class="editAccount">修改</a>',s].join("");
							}
							return option;
						}
					}
				],
				data:data
			};
			return tableOptions;
		},
		editBidder:function(e){
			var selecter = '#tx-' +$(e.target).attr("data-id");
			if($(e.target).attr("func") == 'edit'){
				console.log('ee: ', $(e.target));
				$(selecter).removeAttr('disabled');
				$(e.target).text('保存');
				$(e.target).attr('func','save');
			}
			else{
				console.log('es: ', $(e.target).attr('func'));
				$(selecter).attr('disabled','disabled');
				$(e.target).text('修改');
				$(e.target).attr('func','edit');
			}
		},
		addBidder:function(){
			var bidderInput ="<div class=\"col-sm-8 form-group\"><input type=\"text\" class=\"form-control bidderInfo\"  style=\"width:150px; display:inline\" id=\"tx-new\" value=\"\"><a class=\"editBidder\"  func=\"edit\" data-id=\"new\">保存</a><a class=\"deleteBidder\" data-id=\"<%=bidders[i].id%>\">删除</a></div>";
			$('#bidders').append(bidderInput);
		}
	});
});
