define([
	"text!templates/dsp/report/bid.html"
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
	            ele:"#bidRangeDate",
	            startDate:self.start,
	            endDate:self.end
	        };
			this.chart = new Chart();
		},
		events:{

		},
		render:function(){
			var self = this;
			app.leftNav.show("report","bid");
			this.$el.html(this.indexTemplate());
			app.Util.daterangepicker(self.dateOption,function(dateStart, dateEnd){
	        	self.start = dateStart;
	        	self.end = dateEnd;
	        	$("#bidRangeDate").val(self.start +" ~ "+self.end);
	        	self.renderChart();
	        });
	        $("#bidRangeDate").val(this.start +" ~ "+this.end);
			this.renderChart();
		},
		renderChart:function(data){
			var self = this;
			var query = {
				start:self.start,
				end:self.end
			}
			var bidderId = app.getBidder();
			app.Util.get("/dsp/"+ bidderId + "/report/bid",query,function(err,list){
				//var a = [{"date":"2015-09-29","req":0,"timeout":0,"malformed":0,"contentError":0,"success":0,"empty":0,"valid":1,"networkError":0},{"date":"2015-09-28","req":289908,"timeout":2769,"malformed":1,"contentError":0,"success":21847,"empty":265182,"valid":0,"networkError":109},{"date":"2015-09-27","req":2362813,"timeout":46984,"malformed":0,"contentError":0,"success":24677,"empty":2290935,"valid":0,"networkError":217},{"date":"2015-09-26","req":2098460,"timeout":20526,"malformed":0,"contentError":0,"success":20929,"empty":2057005,"valid":0,"networkError":0},{"date":"2015-09-25","req":942396,"timeout":8958,"malformed":0,"contentError":0,"success":10718,"empty":921839,"valid":0,"networkError":881},{"date":"2015-09-24","req":981317,"timeout":7401,"malformed":0,"contentError":0,"success":2441,"empty":971468,"valid":0,"networkError":0},{"date":"2015-09-23","req":380549,"timeout":1689,"malformed":0,"contentError":0,"success":462,"empty":378400,"valid":0,"networkError":0},{"date":"2015-09-22","req":1947813,"timeout":14354,"malformed":0,"contentError":0,"success":58,"empty":1933341,"valid":0,"networkError":0},{"date":"2015-09-21","req":2468817,"timeout":1596714,"malformed":0,"contentError":0,"success":949,"empty":871154,"valid":0,"networkError":0}];

				var data = list || [];
				if(!err){
					data = data.map(function(item){
						item.rmcPvc = (item.req || 0)-(item.malformed || 0)-(item.contentError || 0);
						return item;
					});
					self.renderSum(data);
					self.chart.setOption($("#dspBidChart"),{scale:"hour",data:data.reverse(),enabled:["req","rmcPvc","success","valid"]});
					self.chart.render();
				}

			});
			
		},
		renderSum:function(list){
			var datas = _.clone(list);
			var total = datas.reduce(function(pre,next,index,array){
				pre.req+=next.req;
				pre.timeout+=next.timeout;
				pre.malformed+=next.malformed;
				pre.contentError += next.contentError;
				pre.success += next.success;
				pre.valid += next.valid;
				pre.networkError += next.networkError;
				return pre;
			},{req:0,timeout:0,malformed:0,contentError:0,success:0,valid:0,networkError:0});
			var rmcPvc = (total.req || 0)-(total.malformed || 0)-(total.contentError || 0);

			var vrmc = app.Util.formatData(rmcPvc?total.valid/rmcPvc*100:0,2).split(".");
			vrmc = vrmc[0]+".<span class='em8'>"+vrmc[1]+"%</span>"

			var successValid = app.Util.formatData(total.valid?total.success/total.valid*100:0,2).split(".");
			successValid = successValid[0]+".<span class='em8'>"+successValid[1]+"%</span>"


			var networkError = app.Util.formatData(total.req?total.networkError/total.req*100:0,2).split(".");
			networkError = networkError[0]+".<span class='em8'>"+networkError[1]+"%</span>"
			var timeout = app.Util.formatData(total.req?total.timeout/total.req*100:0,2).split(".");
			timeout = timeout[0]+".<span class='em8'>"+timeout[1]+"%</span>"

			var malformed = app.Util.formatData(total.req?total.malformed/total.req*100:0,2).split(".");
			malformed = malformed[0]+".<span class='em8'>"+malformed[1]+"%</span>"

			this.$(".reqPv").html(app.Util.formatData(total.req || 0));
			this.$(".validPv").html(app.Util.formatData(total.valid || 0));
			this.$(".successPv").html(app.Util.formatData(total.success || 0));

			this.$(".rmcPv").html(app.Util.formatData(rmcPvc) );
			this.$(".vrmc").html(vrmc);
			this.$(".successValid").html(successValid);
			this.$(".networkError").html(networkError);
			this.$(".timeout").html(timeout);
			this.$(".malformed").html(malformed);
		},
	});

});