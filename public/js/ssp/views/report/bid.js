define([
	"text!templates/ssp/report/bid.html"
	, "util/chart"
	],function(indexTemplate,Chart){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
			//this.start = moment().subtract('days', 6).format("YYYY-MM-DD");
			this.start = moment().format("YYYY-MM-DD");
	        this.end = moment().format("YYYY-MM-DD");
	        this.dateOption = {
	            ele:"#sspbidRangeDate",
	            startDate:self.start,
	            endDate:self.end
	        };
			this.chart = new Chart();
		},
		events:{

		},
		render:function(){
			var self = this;
			app.leftNav.show("sspreport","bid");
			this.$el.html(this.indexTemplate());
			app.Util.daterangepicker(self.dateOption,function(dateStart, dateEnd){
	        	self.start = dateStart;
	        	self.end = dateEnd;
	        	$("#sspbidRangeDate").val(self.start +" ~ "+self.end);
	        	self.renderChart();
	        });
	        $("#sspbidRangeDate").val(this.start +" ~ "+this.end);
			this.renderChart();
		},
		renderChart:function(data){
			var self = this;
			var query = {
				start:self.start,
				end:self.end
			}
			app.Util.get("/ssp/"+app.account.sspId+"/report/bid",query,function(err,list){
				//var a = [{"date":"2015-09-29","req":0,"timeout":0,"malformed":0,"contentError":0,"success":0,"empty":0,"valid":1,"networkError":0},{"date":"2015-09-28","req":289908,"timeout":2769,"malformed":1,"contentError":0,"success":21847,"empty":265182,"valid":0,"networkError":109},{"date":"2015-09-27","req":2362813,"timeout":46984,"malformed":0,"contentError":0,"success":24677,"empty":2290935,"valid":0,"networkError":217},{"date":"2015-09-26","req":2098460,"timeout":20526,"malformed":0,"contentError":0,"success":20929,"empty":2057005,"valid":0,"networkError":0},{"date":"2015-09-25","req":942396,"timeout":8958,"malformed":0,"contentError":0,"success":10718,"empty":921839,"valid":0,"networkError":881},{"date":"2015-09-24","req":981317,"timeout":7401,"malformed":0,"contentError":0,"success":2441,"empty":971468,"valid":0,"networkError":0},{"date":"2015-09-23","req":380549,"timeout":1689,"malformed":0,"contentError":0,"success":462,"empty":378400,"valid":0,"networkError":0},{"date":"2015-09-22","req":1947813,"timeout":14354,"malformed":0,"contentError":0,"success":58,"empty":1933341,"valid":0,"networkError":0},{"date":"2015-09-21","req":2468817,"timeout":1596714,"malformed":0,"contentError":0,"success":949,"empty":871154,"valid":0,"networkError":0}];

				var data = list || [];
				if(!err){
					data = data.map(function(item){
						item.rmcPvc = (item.req || 0)-(item.malformed || 0)-(item.contentError || 0);
						return item;
					});
					self.renderSum(data);
					self.chart.setOption($("#sspBidChart"),{scale:"hour",data:data.reverse(),enabled:["req","success","rsrc"],title:{req:"实际请求",success:"请求成功",rsrc:"请求成功率"}});
					self.chart.render();
				}
			});
			
		},
		renderSum:function(list){
			var datas = _.clone(list);
			var total = datas.reduce(function(pre,next,index,array){
				pre.req+=next.req;
				pre.success += next.success;
				return pre;
			},{req:0,timeout:0,success:0});
			var rmcPvc = (total.req || 0)-(total.malformed || 0)-(total.contentError || 0);

			var rsrc = app.Util.formatData(total.success?total.success/total.req*100:0,2).split(".");
			rsrc = rsrc[0]+".<span class='em8'>"+rsrc[1]+"%</span>"
			this.$(".reqPv").html(app.Util.formatData(total.req || 0));
			this.$(".successPv").html(app.Util.formatData(total.success || 0));
			this.$(".rsrc").html(rsrc);
		},
	});
});