define([
	"text!templates/ssp/report/realtime.html"
	, "text!templates/ssp/report/realtime-table.html"
	, "util/compareChart"
	],function(indexTemplate,tableTemplate,CompareChart){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
			this.tableTemplate = _.template(tableTemplate);
			this.siteList = [];
			this.sizeList = [];
			this.query = {};
			this.yesterday = moment().subtract('days', 1);
			this.lastweek = moment().subtract('days', 7);
			this.dataMap={}
			this.dataMap[this.yesterday.format("YYYY-MM-DD")] = "昨天";
			this.dataMap[this.lastweek.format("YYYY-MM-DD")] = "上周同日"
			this.dateOption = {
	        	ele:"#compareDate",
	        	singleDatePicker:true,
	        	startDate: this.yesterday
	        };
	        this.choseDateStr = this.yesterday.format("YYYY-MM-DD");
	        this.compareChart = new CompareChart();
	        this.percntage = app.getSettlementPercntage() || 1;
		},
		events:{
			"click #searchSize,#searchSite,#compareDate":"clickInput",
			"keyup #searchSize,#searchSite":"searchInput",
			"click #selectSiteDev a,#selectSizeDev a":"choseItem",
			"click .dateBtn"				:"choseDate",
			"mouseenter .columnarGroup"		:"showMoneyNum",
			"mouseleave .columnarGroup"		:"hideMoneyNum",
			"change #comSelect"				:"changeComSelect"
		},
		render:function(){
			var self = this;
			app.leftNav.show("sspreport","realtime");
			this.$el.html(this.indexTemplate({
				yesterday:this.yesterday,
				lastweek:this.lastweek 
			}));
			$("#compareDate").val(this.choseDateStr);
			$('#compareDate').daterangepicker(this.dateOption, function(start, end, label) {
				var start = moment(start).format("YYYY-MM-DD");
            	$(".compareDateText").text(self.dataMap[start] || start);
            	self.choseDateStr = start;
            	self.renderState();
          	});
          	setTimeout(function(){
          		self.renderState();
          	},200);
          	this.$el.find(".tips").popover();
		},
		clickInput:function(event){
			event.stopPropagation();
		},
		searchInput:function(event){
			var str = $.trim($(event.target).val());
		},
		choseItem:function(event){
			var dom = $(event.target);
			var text = dom.attr("data-value") || "";
			var span = dom.parents(".dropdown").find("button>span:first");
			var type = span.attr("data-type");
			span.text(text || dom.text());
			this.query[type] = text;
			this.renderState();
		},
		choseDate:function(event){
			var dom = $(event.target); 
			var date = moment(+dom.attr("data-date")).format("YYYY-MM-DD");

			this.choseDateStr = date;
			$(".compareDateText").text(dom.text());
			this.renderState();
		},
		showMoneyNum:function(){
			this.$(".moneyNum").show();
			this.$(".moneyText").hide();
		},
		hideMoneyNum:function(){
			this.$(".moneyNum").hide();
			this.$(".moneyText").show();
		},
		renderState:function(){
			var self = this;
			var p = this.percntage;
			var query = $.extend({},this.query);
			var today = moment().format("YYYY-MM-DD");
			query.start =today; 
			app.Util.get("/ssp/"+app.account.sspId+"/report/realtime",query,function(err,todayData){
				if(!err){
					query.start = self.choseDateStr;
					app.Util.get("/ssp/"+app.account.sspId+"/report/realtime",query,function(err,cData){
						var nowHH = moment().format("HH")+1; 
						if(!err){
							todayData.reverse();
							cData.reverse();
							self.sumState(todayData,cData);
							todayData.map(function(item){
								item.money*=p;
								return item;
							});
							cData.map(function(item){
								item.money*=p;
								return item;
							});
							self.todayData = _.clone(todayData);
							self.cData = _.clone(cData);
							self.renderChart(self.todayData,self.cData);
							cData = cData.filter(function(item){
								return moment(item.date).format("HH") < nowHH;
							});
							todayData = todayData.filter(function(item){
								return moment(item.date).format("HH") < nowHH;
							});
							self.$("#compareTable-body").html(self.tableTemplate({data:todayData,data2:cData}));
						}else{
							return app.Message.error("查询数据失败");
						}
					});
				}else{
					return app.Message.error("查询数据失败");
				}
			});
		},
		changeComSelect:function(event){
			this.renderChart();
			this.columnarStats($("#comSelect").val());
		},
		renderChart:function(todayData,cData){
			todayData = todayData || this.todayData;
			cData = cData || this.cData;
			var type = $("#comSelect").val();
			this.compareChart.setOption($("#compareChart"),{data:[_.clone(todayData),_.clone(cData)],enabled:[type],title:{money:"收益（元）"}});
			this.compareChart.render();
		},
		sumState:function(todayData,cData){
			var h = +moment().format("HH");
			var p = this.percntage;
			var d1 = todayData;
			var d2 = cData;

			var d1Sum={
				pv:0,
				click:0,
				money:0
			};
			var d2Sum = {
				pv:0,
				click:0,
				money:0
			};
			for(var i = 0;i <= h;i++){
				d1Sum.pv+=(d1[i].pv || 0);
				d1Sum.click+=(d1[i].click || 0);
				d1Sum.money+=(d1[i].money || 0);
				d2Sum.money += (d2[i].money || 0);
				d2Sum.pv += (d2[i].pv || 0);
				d2Sum.click += (d2[i].click || 0);
			}
			d1Sum.money = d1Sum.money*p;
			d2Sum.money = d2Sum.money*p;
			var ctr = app.Util.formatData(d1Sum.pv?d1Sum.click/d1Sum.pv*100:0,3).split(".");
			ctr = ctr[0]+".<span class='em8'>"+ctr[1]+"%</span>"

			var cpc = app.Util.formatData(d1Sum.click?d1Sum.money/d1Sum.click:0,2).split(".");
			cpc = cpc[0]+".<span class='em8'>"+cpc[1]+"</span>"

			var cpm = app.Util.formatData(d1Sum.pv?d1Sum.money/d1Sum.pv*1000:0,2).split(".");
			cpm = cpm[0]+".<span class='em8'>"+cpm[1]+"</span>"

			var money = app.Util.formatData(d1Sum.money || 0,2).split(".");
			money = money[0]+".<span class='em8'>"+money[1]+"</span>"
			this.$(".totalPv").html(app.Util.formatData(d1Sum.pv));
			this.$(".totalClick").html(app.Util.formatData(d1Sum.click));
			this.$(".totalCtr").html(ctr);
			this.$(".avgTotalMoney").html(cpc);
			this.$(".pvTotalMoney").html(cpm);
			this.$(".totalMoney").html("￥"+money);
			d1Sum.money = +d1Sum.money.toFixed(3);
			d2Sum.money = +d2Sum.money.toFixed(3);
			this.d1Sum = d1Sum;
			this.d2Sum = d2Sum;
			this.columnarStats($("#comSelect").val());
		},
		columnarStats:function(type){
			var d1 = 0;
			var d2 = 0;
			if(type == "ctr"){
				d1 = this.d1Sum.pv?this.d1Sum.click/this.d2Sum.pv*100:0;
				d2 = this.d2Sum.pv?this.d2Sum.click/this.d2Sum.pv*100:0;
			}else{
				d1 = this.d1Sum[type];
				d2 = this.d2Sum[type];
			}

			var maxSum = Math.max(d1,d2);
			var baseNum = 0;
			if(maxSum){
				 baseNum = 150/(maxSum*1.2);
			}
			var c1h = ~~d1*baseNum;
			var c2h = ~~d2*baseNum;
			this.$(".todayColumnar").css("height",c1h+"px")
			this.$(".comColumnar").css("height",c2h+"px")
			var IncreaseRatio = d2?(d1-d2)/d2*100:0;
			if(IncreaseRatio > 0){
				this.$("#IncreaseRatio").text(app.Util.formatData(IncreaseRatio,3)+"%");
			}else{
				this.$("#IncreaseRatio").text("-"+app.Util.formatData(-IncreaseRatio,3)+"%");
			}

			if(type == "money"){
				d1 = app.Util.formatData(d1,2);
				d2 = app.Util.formatData(d2,2);
			}else if(type == "ctr"){
				d1 = app.Util.formatData(d1,3);
				d2 = app.Util.formatData(d2,3);
			}else{
				d1 = app.Util.formatData(d1);
				d2 = app.Util.formatData(d2);
			}
			if(type == "ctr"){
				d1 = d1+"%";
				d2 = d2+"%";
			}else if(type=="money"){
				d1 = "￥"+d1;
				d2 = "￥"+d2;
			}
			this.$(".moneyNum:eq(0)").html(d2);
			this.$(".moneyNum:eq(1)").html(d1);
		}
	});
});