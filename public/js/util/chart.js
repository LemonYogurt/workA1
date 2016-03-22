define(["highcharts"],function(highcharts){
	function Chart(){};

	Chart.prototype.setOption = function(element, option) {
        this.element = element;
        this.data = option.data || [];
        this.scale = option.scale || "day";
        this.idName = option.idName || "";
        this.isGroupClolumn = option.type == "groupColumn";
        this.enabled = option.enabled || ["click", "pv", "money", "ctr"];
        this.legendEnabled = option.legendEnabled == undefined ? true : option.legendEnabled;
        this.title = $.extend({
            pv: '展示量',
            click: '点击量',
            ctr: '点击率',
            money: '消耗（元）',
            iclick: '无效点击量',
            tclick: '总点击量',
            ecpm: '千次展示收入',   //千次展示收入
            totalPostfee: '预估总收入', //预估总收入
            req: '实际发送', 
            rmcPvc: '响应成功',
            valid: '有效报价',
            success: '竞价成功',
            rsrc: '请求成功率'      //请求成功 success/pv
        }, option.title);

        if(this.isGroupClolumn){
            option.seriesTypes = {
                pv: 'column',
                click: 'column',
                ctr: 'column',
                money: 'column',
                iclick: 'column',
                tclick: 'column'
            };
            option.seriesColor={
                pv: 'rgb(124, 181, 236',
                click: 'rgb(160, 160, 160)',
                ctr: 'rgb(247, 145, 59)',
                money: 'rgb(90, 166, 46)',
                iclick: 'rgb(160, 160, 160)',
                tclick: 'rgb(160, 160, 160)'
            }

        }
        this.seriesTypes = $.extend({
            pv: 'spline',
            click: 'spline',
            ctr: 'spline',
            money: 'spline',
            iclick: 'spline',
            tclick: 'spline',
            ecpm: 'spline',   //千次展示收入
            totalPostfee: 'spline', //预估总收入
            req: 'spline', 
            rmcPvc: 'spline',
            valid: 'spline',
            success: 'spline',
            rsrc: 'spline'      //请求成功 success/pv
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
            req: '#9D9735', 
            rmcPvc: '#5aa62e',
            valid: '#9C77F2',
            success: '#E6B522',
            rsrc : "#5aa62e",
        }, option.seriesColor);
        this.config = this.getConfig();
    }

    Chart.prototype.render = function() {
        this.formatChatData(this.data);
        this.setSeries(this.data);
        this.setCategories(this.data);
        this.element.highcharts(this.config);
    }

    Chart.prototype.formatChatData = function(){
        var self = this;
        var list = [];
        var dataList = this.data;
        for(var i=0;i<dataList.length;i++){
            var data = dataList[i];
            var date = data.date;
            var id = data[self.idName] || "-";
            var pv = parseInt(data.pv || 0);
            var click = parseInt(data.click);
            var iclick = parseInt(data.iclick);
            var tclick = click + iclick;
            var money = parseFloat((data.money || 0).toFixed(2));
            var ctr = (pv > 0) ? (click / pv * 100).toFixed(3) : "0.000";
            ctr = parseFloat(ctr);
            var req = parseInt(data.req || 0);
            var rmcPvc = parseInt(data.rmcPvc || 0);
            var valid = parseInt(data.valid || 0);
            var success = parseInt(data.success || 0);
            var rsrc = (req > 0) ? (success / req * 100).toFixed(3) : "0.000";
            rsrc = parseFloat(rsrc);
            list.push({
                id:id,
                date: date,
                pv: pv,
                click: click,
                iclick: iclick,
                tclick: tclick,
                money: money,
                ctr: ctr,
                req:req,
                rmcPvc:rmcPvc,
                valid:valid,
                success:success,
                rsrc:rsrc
            });
        }
        this.data = list;
    } 
    //设置图标x轴数据
    Chart.prototype.setCategories = function(data) {
        var self = this;
        var categories = [];
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
                this.config.tooltip.headerFormat = '<b>{point.key} 时</b>';
            }
        }
    }

    //设置图表数据
    Chart.prototype.setSeries = function(data) {
        var self = this;
        var series = [];
        var pvData = [],
            clickData = [],
            ctrData = [],
            iclickData = [],
            moneyData = [],
            tclickData = [];
            ecpmData = [];
            totalPostfeeData = [];
            reqData = [];
            rmcPvcData = [];
            validData = [];
            successData = [];
            rsrcData = [];
        for (var i = 0; i < data.length; i++) {
            pvData.push(data[i].pv);
            clickData.push(data[i].click);
            ctrData.push(data[i].ctr);
            iclickData.push(data[i].iclick);
            moneyData.push(data[i].money);
            tclickData.push(data[i].tclick);
            ecpmData.push(data[i].ecmp || 0);
            totalPostfeeData.push(data[i].totalPostfee || 0);
            reqData.push(data[i].req);
            rmcPvcData.push(data[i].rmcPvc);
            validData.push(data[i].valid);
            successData.push(data[i].success);
            rsrcData.push(data[i].rsrc);
        };
        var dataArrayMap = {
            pv:pvData,
            click:clickData,
            ctr:ctrData,
            iclick:iclickData,
            money:moneyData,
            tclick:tclickData,
            ecpm:ecpmData,
            totalPost:totalPostfeeData,
            req:reqData,
            rmcPv:rmcPvcData,
            valid:validData,
            success:successData,
            rsrc:rsrcData
        };
        
        var seriesData = {};
        $.each(["pv","click","iclick","tclick","money","ctr","req","rmcPvc","success","valid","rsrc"],function(i,t){
            seriesData[t] = {
                name: self.title[t],
                data: dataArrayMap[t],
                type: self.seriesTypes[t],
                color: self.seriesColor[t]
            }

            if(["rsrc","ctr"].indexOf(t) !== -1){
                 seriesData[t].min = 0;
                 seriesData[t].tooltip = {
                     valueSuffix: ' %'
                 };
            }else if(["money","ecpm","totalPostfee"].indexOf(t) !== -1){
                seriesData[t].min = 0;
                seriesData[t].tooltip = {
                    valuePrefix: '¥ '
                };
            }else {
                seriesData[t] = {
                    name: self.title[t],
                    data: dataArrayMap[t],
                    type: self.seriesTypes[t],
                    color: self.seriesColor[t]
                }
            }

            if(this.isGroupClolumn){
                seriesData[t].stack = i;
            }else{
                seriesData[t].yAxis = i;
            }

        });

        var yAxis = [];
        _.each(this.enabled, function(a) {
            yAxis.push(yAxisConfig()[a]);
        });
        this.config.yAxis = yAxis;
        _.each(this.enabled, function(a, b) {
            seriesData[a]["yAxis"] = b;
            series.push(seriesData[a]);
        });
        this.config.series = series;
    }

    function yAxisConfig() {
        var config = {};
        $.each(["pv","click","iclick","tclick","money","ctr","req","rmcPvc","success","valid","rsrc"],function(i,t){
            config[t]= {
                title: {
                    text: ""
                },
                labels: {
                    enabled: false
                },
                min: 0
            };
        });
        return config;
    }

    Chart.prototype.getConfig = function () {
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
    return Chart;
});