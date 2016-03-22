define(["highcharts"],function(highcharts){
	function CompareChart(){
         this.seriesNameMap={
            pv: '展示量',
            iclick:'无效点击量',
            click: '点击量',
            ctr: '点击率',
            money: '花费（元）',
            tclick: '总点击量',
            request: '竞价请求数',
            bsr:'竞价成功率',
            cr:'转换率', 
            cpm:'CPM',
            cpc:'CPC',
            cpa:'CPA'
        }
    };

	CompareChart.prototype.setOption = function(element, option) {
        this.element = element;
        this.data = option.data || [];
        this.scale = option.scale || "hour";
        this.idName = option.idName || "";
        this.enabled = option.enabled || ["money"];
        this.seriesNameMap = _.extend(this.seriesNameMap,option.title || {});
        this.header = option.header || this.seriesNameMap[this.enabled[0]];
        this.legendEnabled = option.legendEnabled == undefined ? false : option.legendEnabled;
        this.seriesTypes = $.extend({
            pv: 'spline',
            click: 'spline',
            ctr: 'spline',
            money: 'spline',
            iclick: 'spline',
            tclick: 'spline',
            ecpm: 'spline',   //千次展示收入
            totalPostfee: 'spline' //预估总收入
        }, option.seriesTypes);
        this.seriesColor = $.extend({
            pv: 'rgb(0, 0, 192)',
            click: 'rgb(160, 160, 160)',
            ctr: 'rgb(170, 70, 67)',
            money: 'rgb(0, 100, 0)',
            iclick: 'rgb(160, 160, 160)',
            tclick: 'rgb(160, 160, 160)',
            ecpm: 'rgb(156, 119, 242)',
            totalPostfee: 'rgb(254, 124, 28)',
        }, option.seriesColor);
        this.config = this.getConfig();
    }

    CompareChart.prototype.render = function() {
        this.formatChatData(this.data);
        this.setSeries(this.data);
        this.setCategories(this.data);
        this.element.highcharts(this.config);

    }

    CompareChart.prototype.formatChatData = function(){
        var self = this;
        var lists = [];
        var datas =  this.data;
        for(var j = 0;j< datas.length;j++){
        	var dataList = datas[j];
        	var list = []
	        for(var i=0;i<dataList.length;i++){
	            var data = dataList[i];
	            var date = data.date;
	            var id = data[self.idName] || "-";
	            var pv = parseInt(data.pv);
	            var click = parseInt(data.click);
	            var iclick = parseInt(data.iclick);
	            var tclick = click + iclick;
	            var money = parseFloat(data.money.toFixed(2));
	            var ctr = (pv > 0) ? (click / pv * 100).toFixed(3) : "0.000";
	            var ctr = parseFloat(ctr);
	            list.push({
	                id:id,
	                date: date,
	                pv: pv,
	                click: click,
	                iclick: iclick,
	                tclick: tclick,
	                money: money,
	                ctr: ctr
	            });
	        }
	        lists.push(list);
        }
        this.data = lists;
    } 
    //设置图标x轴数据
    CompareChart.prototype.setCategories = function(data) {
        var self = this;
        var categories = [];
        data = data[0];
        if(self.isGroupClolumn){
            for (var i = 0; i < data.length; i++) {
                var idName = data[i].id;
                categories.push(idName);
            }
            this.config.xAxis.categories = categories;
        }else{
            for (var i = 0; i < data.length; i++) {
                var time = data[i].date;
                categories.push(time);
            }
            this.config.xAxis.categories = categories;
            var interval = (categories.length / 12).toFixed(0);
            this.config.xAxis.minTickInterval = interval;
            if (this.scale == "hour") {
                this.config.xAxis.labels.formatter = function() {
                    var time = this.value.split(" ");
                    var day = moment(this.value).format("MM-DD");
                    var hour = moment(this.value).format("HH:mm");
                    if (hour == "00:00") {
                        return day;
                    } else {
                        return hour;
                    }
                }
                this.config.tooltip.headerFormat = self.header;//'<b>{point.key} 时</b>';
            }
        }
    }

    //设置图表数据
    CompareChart.prototype.setSeries = function(data) {
        var self = this;
        var series = [];
        var datas=[];

        var showClolumn = [];
        for(var j = 0;j < data.length;j++){
        	var d ={
	        	pvData :[],
	            clickData :[],
	            ctrData :[],
	            iclickData :[],
	            moneyData :[],
	            tclickData :[],
	            ecpmData :[],
	            totalPostfeeData :[]
	        };
            for (var i = 0; i < 24; i++) {
	            d.pvData.push(data[j][i].pv || 0);
	            d.clickData.push(data[j][i].click || 0);
	            d.ctrData.push(data[j][i].ctr || 0);
	            d.iclickData.push(data[j][i].iclick || 0);
	            d.moneyData.push(data[j][i].money || 0);
	            d.tclickData.push(data[j][i].tclick || 0);
	            d.ecpmData.push(data[j][i].ecmp || 0);
	            d.totalPostfeeData.push(data[j][i].totalPostfee || 0);
        	}
        	d.date = data[j][0].date.substring(0,10);
        	showClolumn.push(d.date);
        	datas.push(d);
        };
        var seriesData = {};
        var tt=["money","pv"];//使用不同的颜色和类型
        for(var k = 0;k < this.enabled.length;k++){
        	var t = this.enabled[k];
        	for(var x = 0;x < datas.length;x++){
        		seriesData[datas[x].date] = {
        			name: datas[x].date,
	                data: datas[x][t+"Data"],
	                type: this.seriesTypes[tt[x]],
	                color: this.seriesColor[tt[x]]
        		}
        		if(["money"].indexOf(t) !== -1){
        			seriesData[datas[x].date].tooltip ={
	                    valuePrefix: '¥ '
	                }
        		}else if(["ctr"].indexOf(t) !== -1){
	                seriesData[datas[x].date].tooltip ={
	                    valueSuffix: ' %',
	                }
        		}

        	}
        }
        var yAxis = [];
        this.config.yAxis = yAxis;
        _.each(showClolumn, function(a, b) {
            yAxis.push(yAxisConfig());
            //seriesData[a]["yAxis"] = b;
            series.push(seriesData[a]);
        });
        this.config.series = series;
    }

    function yAxisConfig() {
    	return {
                title: {
                    text: ""
                },
                labels: {
                    enabled: false
                },
                min: 0
            };
    }

    CompareChart.prototype.getConfig = function () {
        var self = this;
        var config = {
            chart: {
                animation: false,
            },
            title: {
                text: ' '
            },
            subtitle: {
                text: ' '
            },

            series: [],
            yAxis: [],
            xAxis: {
                
            },
            legend: {
                enabled: self.legendEnabled,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'top',
                borderWidth: 0,
                y: 0
            },
            plotOptions: {
               
            },
            tooltip: {
                
            },
            credits: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            }
        }
        if(self.isGroupClolumn){
            var dataLength = self.data.length;
            config.xAxis = {
                categories: [],
                max:dataLength > 7?7:dataLength-1
            };
            if(dataLength > 7){
             config.scrollbar.enabled = true;

            }
        }else{
            config.tooltip = {
                shared: true,
                borderColor: '#ccc',
                crosshairs: [{
                    width: 1,
                    color: 'Gray'
                }],
                useHTML: true,
                headerFormat: '<b>{point.key}</b>',
                pointFormat: '<div><span style="color: {series.color}">{series.name}: </span>' +
                    '<span style="text-align: right">{point.y}</span></div>',
            };
            config.xAxis = {
                type: 'datetime',
                tickmarkPlacement: 'on',
                dateTimeLabelFormats: {
                    second: '%H:%M:%S',
                    minute: '%H:%M',
                    hour: '%H:%M',
                    day: '%m-%e',
                    week: '%e. %b',
                    month: '%b %y',
                    year: '%Y'
                },
                labels: {
                    formatter: function() {
                        var mmdd = moment(this.value).format("MM-DD");
                        return mmdd;
                    }
                },
                offset: 0,
                categories: []
            };
            config.plotOptions = {
                 dataLabels: {
                    enabled: true
                },
                column: {
                    grouping: false,
                    shadow: false,
                    borderWidth: 0
                },

                series: {
                    marker: {
                        enabled: false,
                        radius: 1
                    }
                }
            }
        }
        return config;
    }
    return CompareChart;
});