var DB = require('../../db').ssp.reportStats;
var Util = require('../util');
var async = require('async');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

module.exports = new ReportStats();

function ReportStats(){

}

ReportStats.prototype.total = function(req, res){
	var sspId = req.params.sspId;
	var dateNow = new Date();
	var querySSPID = {sspId:sspId};
	var result = {
		yesterday:0,
		curMonth:0,
		lastMonth:0
	};
	async.series({
		yesterday:function(finish){
			var yest = dateNow.setDate(dateNow.getDate()-1);
			var start = Util.getStartDate(yest);
			var end = Util.getEndDate(yest);
			var query = Util.getStatsQuery(querySSPID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					var money =  data && data[0] && data[0].sumMoney || 0;
					if(money){
						money = money/100000;
					}
					result.yesterday = money;
					finish();
				}
			});
		},
		curMonth:function(finish){
			var start = Util.getStartMonthDate(dateNow);
			var end = Util.getEndMonthDate(dateNow);
			var query = Util.getStatsQuery(querySSPID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					var money =  data && data[0] && data[0].sumMoney || 0;
					if(money){
						money = money/100000;
					}
					result.curMonth =money;
					finish();
				}
			})
		},
		lastMonth:function(finish){
			dateNow.setMonth(dateNow.getMonth()-1);
			var start = Util.getStartMonthDate(dateNow);
			var end = Util.getEndMonthDate(dateNow);
			var query = Util.getStatsQuery(querySSPID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					var money =  data && data[0] && data[0].sumMoney || 0;
					if(money){
						money = money/100000;
					}
					result.lastMonth = money;
					finish();
				}
			})
		}
	},function(err){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			return res.json(result);
		}
	});
};

ReportStats.prototype.realtime = function(req, res){
	var sspId = req.params.sspId;
	var querySSPID = {sspId:sspId};
	var query = req.query;
	query.end = query.start;
	var query = Util.getStatsQuery(querySSPID,req.query);
	DB.find(query,{date:1,pv:1,click:1,money:1}).toArray(function(err,list){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			list = list.map(function(item){
				item.money = item.money/100000;
				return item;
			});
			var data = Util.formatResult("hour",list,query,getData);
			return res.json(data);
		}
	});
};

ReportStats.prototype.history = function(req, res){
	var sspId = req.params.sspId;
	var querySSPID = {sspId:sspId};
	var query = Util.getStatsQuery(querySSPID,req.query);
	DB.find(query,{date:1,pv:1,click:1,money:1}).toArray(function(err,list){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			list = list.map(function(item){
				item.money = item.money/100000;
				return item;
			});
			var data = Util.formatResult("day",list,query,getData);
			return res.json(data);
		}
	});
};

ReportStats.prototype.group = function(req, res){
	var sspId = req.params.sspId;
	var querySSPID = {sspId:sspId};
	var groupType = req.params.groupType;
	var query = Util.getStatsQuery(querySSPID,req.query);
	var funs= 'function(o, t){t.pv+= o.pv|| 0; t.click+= o.click || 0;}';
	DB.group([groupType], query, { pv: 0, click: 0,money:0}, funs, function (err, data){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			return res.json(data);
		}
	});
};

function getSumMoney(query,callback){
	var funs= 'function(o, t){t.sumMoney+= o.money|| 0;}';
	DB.group([], query,{sumMoney:0}, funs, function (err, data){
		return callback(err,data);
	});
}

function getData(dataMap,date,data){
	if(!dataMap[date]){
		dataMap[date] = {
			date:date,
			req:data.req || 0,
			pv:data.pv || 0,
			click:data.click || 0,
			money:data.money || 0
		};
	}else{
		dataMap[date].req += (data.req || 0);
		dataMap[date].pv += (data.pv || 0);
		dataMap[date].click += (data.click || 0);
		dataMap[date].money += (data.money || 0);
	}
	return dataMap;
}


