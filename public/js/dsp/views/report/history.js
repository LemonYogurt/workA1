define([
	"text!templates/dsp/report/history.html"
	, "util/chart"
	],function(indexTemplate,Chart){
	return Backbone.View.extend({
		el:"#right-body",
		initialize:function(){
			this.indexTemplate = _.template(indexTemplate);
        	this.start = moment().subtract('days', 6).format("YYYY-MM-DD");
	        this.end = moment().format("YYYY-MM-DD");
	        this.dateOption = {
	            ele:"#historyRangeDate",
	            startDate:self.start,
	            endDate:self.end
	        };
	        this.chart = new Chart();
		},
		events:{

		},
		render:function(){
			var self = this;
			app.leftNav.show("report","history");
			this.$el.html(this.indexTemplate());
          	app.Util.daterangepicker(self.dateOption,function(dateStart, dateEnd){
	        	self.start = dateStart;
	        	self.end = dateEnd;
	        	$("#historyRangeDate").val(self.start +" ~ "+self.end);
	        	self.renderTable();
	        });
	        $("#historyRangeDate").val(this.start +" ~ "+this.end);
	       
	        self.renderTable();
		},
		renderTable:function(){
			$("#dspHistoryTables").bootstrapTable(this.getTableOptions([]));
			var self = this;
			var query = {
				start:self.start,
				end:self.end
			}
			app.Util.get("/dsp/"+app.getBidder()+"/report/history",query,function(err,list){
				if(!err){
					$("#dspHistoryTables").bootstrapTable("load",list);
					self.renderChart(list);
					self.renderSum(list);
				}

			});
		},
		renderChart:function(data){
			this.chart.setOption($("#dspHistoryChart"),{data:data.reverse()});
			this.chart.render();
		},
		renderSum:function(list){
			var datas = _.clone(list);
			var total = datas.reduce(function(pre,next,index,array){
				pre.pv+=next.pv;
				pre.click+=next.click;
				pre.money+=next.money;
				return pre;
			},{pv:0,click:0,money:0});

			var ctr = app.Util.formatData(total.pv?total.click/total.pv*100:0,3).split(".");
			ctr = ctr[0]+".<span class='em8'>"+ctr[1]+"%</span>"

			var cpc = app.Util.formatData(total.click?total.money/total.click:0,2).split(".");
			cpc = cpc[0]+".<span class='em8'>"+cpc[1]+"</span>"

			var cpm = app.Util.formatData(total.pv?total.money/total.pv*1000:0,2).split(".");
			cpm = cpm[0]+".<span class='em8'>"+cpm[1]+"</span>"

			var money = app.Util.formatData(total.money || 0,2).split(".");
			money = money[0]+".<span class='em8'>"+money[1]+"</span>"
			this.$(".totalPv").html(app.Util.formatData(total.pv));
			this.$(".totalClick").html(app.Util.formatData(total.click));
			this.$(".totalCtr").html(ctr);
			this.$(".totalCpc").html(cpc);
			this.$(".totalCpm").html(cpm);
			this.$(".totalMoney").html("￥"+money);
		},
		getTableOptions:function(data){
			var self = this;
            var tableOptions = {
                columns: [{
                    field: "date",
                    title:"日期",
                    sortable: true,
                    formatter: function(value, row) {
                    	return value;
                    }
                },{
                	field:"pv",
                	title:"展示量",
                	sortable: true,
                	formatter:function(value){
                		return app.Util.formatData(value || 0);
                	}
                },{
                	field:"click",
                	title:"点击量",
                	sortable: true,
                	formatter:function(value){
                		return app.Util.formatData(value || 0);
                	}
                },{
                	field:"ctr",
                	title:"点击率",
                	sortable: true,
                	formatter:function(value,row){
                		var ctr = row.pv?row.click/row.pv*100 :0;
                		return app.Util.formatData(ctr,3)+"%";
                	}
                },{
                	field:"cpc",
                	title:"平均点击费用",
                	sortable: true,
                	formatter:function(value,row){
                		var cpc = row.click?row.money/row.click:0;
                		return "￥"+app.Util.formatData(cpc ,3);
                	}
                },{
                	field:"cpm",
                	title:"千次展示费用",
                	sortable: true,
                	formatter:function(value,row){
                		var cpm = row.pv?row.money/row.pv*1000:0;
                		return "￥"+app.Util.formatData(cpm ,3);
                	}
                },{
                	field:"money",
                	title:"消费",
                	sortable: true,
                	formatter:function(value){
                		return "￥"+app.Util.formatData(value || 0,2);
                	}
                }]
            }
            return tableOptions;
		}
	});

});