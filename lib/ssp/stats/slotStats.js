var DB = require('../../../db').ssp.zoneStats;
var Util = require('../../util');
var async = require('async');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

module.exports = new ZoneStats();

function ZoneStats(){

}

ZoneStats.prototype.total = function(req, res){
	var accountID = res.auth._id;
	var dateNow = new Date();

	var result = {
		lastDay:0,
		curMonth:0,
		lastMonth:0
	};
	async.series({
		yesterday:function(finish){
			var yest = dateNow.setDate(dateNow.getDate()-1);
			var start = Util.getStartDate(yest);
			var end = Util.getEndDate(yest);
			var query = Util.getStatsQuery(accountID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					result.lastDay = data && data[0] && data[0].sumMoney || 0;
					finish();
				}
			});
		},
		curMonth:function(finish){
			var start = Util.getStartMonthDate(dateNow);
			var end = Util.getEndMonthDate(dateNow);
			var query = Util.getStatsQuery(accountID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					result.curMonth = data && data[0] && data[0].sumMoney || 0;
					finish();
				}
			})
		},
		lastMonth:function(finish){
			dateNow.setMonth(dateNow.getMonth()-1);
			var start = Util.getStartMonthDate(dateNow);
			var end = Util.getEndMonthDate(dateNow);
			var query = Util.getStatsQuery(accountID,{start:start,end:end});
			getSumMoney(query,function(err,data){
				if(err){
					finish(err);
				}else{
					result.lastMonth = data && data[0] && data[0].sumMoney || 0;
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
}

ZoneStats.prototype.chart = function(req, res){
	var accountID = res.auth._id;
	var query = Util.getStatsQuery(accountID,req.query);
	DB.find(query,{date:1,pv:1,click:1,money:1}).toArray(function(err,list){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			var data = Util.formatResult("day",list,query,getData);
			return res.json(data);
		}
	});
}

ZoneStats.prototype.group = function(req, res){
	var accountID = res.auth._id;
	var groupType = req.params.groupType;
	var query = Util.getStatsQuery(accountID,req.query);
	var funs= 'function(o, t){t.pv+= o.pv|| 0; t.click+= o.click || 0;}';
	DB.group([groupType], query, { pv: 0, click: 0,money:0}, funs, function (err, data){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			return res.json(data);
		}
	});
}

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
			pv:data.pv || 0,
			click:data.click || 0,
			money:data.money || 0
		};
	}else{
		dataMap[date].pv += data.pv;
		dataMap[date].click += data.click;
		dataMap[date].money += data.money;
	}
	return dataMap;
}
