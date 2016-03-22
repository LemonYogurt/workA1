define([
	'text!templates/dsp/home/index.html'
	, "util/chart"
	],function(homeTemplate,Chart){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.homeTemplate = _.template(homeTemplate),
			this.pageNo = 1;
			this.start = moment().format("YYYY-MM-DD");
        	this.end = moment().format("YYYY-MM-DD");
	        this.statsData30 = [];
	        this.chart = new Chart();
		},
		events:{
		},

		render:function(){
			app.leftNav.hide();
			this.$el.html(this.homeTemplate());
			this.getTotal();
			this.getToday();
			this.getDay30();
		},
		getTotal:function(){
			var self = this;
			console.log('bidder: ', app.getBidder());
			app.Util.get("/dsp/"+app.getBidder()+"/report/total",{},function(err,result){
				if(!err){
					var yesCharge = app.Util.formatData(result.yesterday,2).split(".");
					yesCharge = yesCharge[0]+".<span class='em8'>"+yesCharge[1]+"</span>"
					var curMonthCharge = app.Util.formatData(result.curMonth,2).split(".");
					curMonthCharge = curMonthCharge[0]+".<span class='em8'>"+curMonthCharge[1]+"</span>"
					var lastMonthCharge = app.Util.formatData(result.lastMonth,2).split(".");
					lastMonthCharge = lastMonthCharge[0]+".<span class='em8'>"+lastMonthCharge[1]+"</span>"
					$(".yesCharge").html(yesCharge);
					$(".curMonthCharge").html(curMonthCharge);
					$(".lastMonthCharge").html(lastMonthCharge);
				}
			});
		},
		getToday:function(){
			var self = this;
			var start = moment().format("YYYY-MM-DD");
			app.Util.get("/dsp/"+app.getBidder()+"/report/realtime",{start:start},function(err,result){
				if(!err){
					self.renderChart($("#dspHomeChart"),result,"hour");
					var sumMoney = self.getSumMoney(result);
					var todayCharge = app.Util.formatData(sumMoney,2).split(".");
					todayCharge = todayCharge[0]+".<span class='em8'>"+todayCharge[1]+"</span>"

					$(".todayCharge").html(todayCharge);
				}
			});
		},
		getDay30:function(){
			var self = this;
			var start = moment().subtract(30, "day").format("YYYY-MM-DD");
			var end = moment().format("YYYY-MM-DD");
			app.Util.get("/dsp/"+app.getBidder()+"/report/history",{start:start,end:end},function(err,result){
				if(!err){
					self.renderChart($("#historyChart"),result,"day");
					var sumMoney = self.getSumMoney(result);
					$(".money30").text(sumMoney);
				}
			});
		},
		getSumMoney:function(datas){
			datas = datas.map(function(item){return item.money});
			var sum = eval(datas.join("+"));
			sum = app.Util.formatData(sum,2);
			return sum;
		},
		renderChart:function(ele,data,scale){
			data = data.reverse();
			this.chart.setOption(ele,{data:data,scale:scale});
			this.chart.render();
		}
	});
});