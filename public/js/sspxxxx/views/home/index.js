define([
	"text!templates/ssp/home/index.html"
	, "util/chart"
	],function(homeTemplate,Chart){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			var self = this;
			this.homeTemplate = _.template(homeTemplate),
			this.accountList = [];
			this.pageNo = 1;
			this.start = moment().subtract('days', 8).format("YYYY-MM-DD");
        	this.end = moment().subtract('days', 1).format("YYYY-MM-DD");
	        this.statsData30 = [];
	        this.chart = new Chart();
	        this.dateOption = {
	        	ele:"#homeRangeDate",
	        	startDate: self.start,
                endDate: self.end,
                ranges: {
                   '昨天': [moment().subtract('days', 1), moment().subtract('days', 1)],
                   '最近7天': [moment().subtract('days', 6), moment()],
                   '最近30天': [moment().subtract('days', 29), moment()],
                   '本月': [moment().startOf('month'), moment().endOf('month')],
                   '上个月': [moment().subtract('month', 1).startOf('month'), moment().subtract('month', 1).endOf('month')]
                }
	        }
		},
		events:{
			"mouseover .tips>i":"showTips",
			"mouseout .tips>i":"hideTips",
		},
		render:function(){
			var self = this;
			app.leftNav.hide();
			this.$el.html(this.homeTemplate());
			this.$el.find(".tips").popover();
			this.$el.find("#homeRangeDate").val(this.start +" - "+this.end);
			app.Util.daterangepicker(this.dateOption,function(dateStart, dateEnd){
				self.getStats(dateStart,dateEnd);
			});
			this.getTotal();
			this.getStats(this.start,this.end);
		},
		//预估
		getTotal:function(){
			var self = this;
			app.Util.get("/ssp/"+app.account.sspId+"/report/total",{},function(err,result){
				if(!err){
					var lastDayAmount = app.Util.formatData(result.lastDay,2).split(".");
					lastDayAmount = lastDayAmount[0]+".<span class='em8'>"+lastDayAmount[1]+"</span>"
					var curMonthAmount = app.Util.formatData(result.curMonth,2).split(".");
					curMonthAmount = curMonthAmount[0]+".<span class='em8'>"+curMonthAmount[1]+"</span>"
					var lastMontAmount = app.Util.formatData(result.lastMonth,2).split(".");
					lastMontAmount = lastMontAmount[0]+".<span class='em8'>"+lastMontAmount[1]+"</span>"
					$(".lastDayAmount").html(lastDayAmount);
					$(".curMonthAmount").html(curMonthAmount);
					$(".lastMontAmount").html(lastMontAmount);
				}
			});
		},
		getStats:function(start,end){
			var self = this;
			app.Util.get("/ssp/"+app.account.sspId+"/report/slot",{start:start,end:end},function(err,result){
				if(!err){
					self.renderChart($("#sspHomeChart"),result);
					self.getSumStats(result);
				}
			});
		},
		getSumStats:function(data){
			var pv = 0,click=0;
			data.forEach(function(item){
				pv += item.pv;
				click += item.click;
			});
			var ctr = pv?click/pv*100:0;
			ctr = (app.Util.formatData(ctr,3)+"%").split(".");
			ctr = ctr[0]+".<span class='em8'>"+ctr[1]+"</span>"
			this.$(".totalPv").text(pv);
			this.$(".totalClick").text(click);
			this.$(".totalCtr").html(ctr);
		},
		renderChart:function(ele,data,scale){
			data = data.reverse();
			this.chart.setOption(ele,{data:data,enabled:["pv","click","ctr","ecpm","totalPostfee"]});
			this.chart.render();
		}
	});
});