var DB = require('../../db').ssp.reqInfoStats;
var Util = require('../util');
var async = require('async');
var ErrorMessage = Util.errorMessage;

module.exports = new ReqInfoStats();

function ReqInfoStats(){

}

ReqInfoStats.prototype.bid = function(req, res){
	var sspId = req.params.sspId;
	var querySSPID = {sspId:sspId};
	var query = Util.getStatsQuery(querySSPID,req.query);
	DB.find(query,{date:1,req:1,success:1,empty:1}).toArray(function(err,list){
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
function getData(dataMap,date,data){
	if(!dataMap[date]){
		dataMap[date] = {
			date:date,
			req:data.req || 0,
			success:data.success || 0,
			empty:data.empty || 0
		};
	}else{
		dataMap[date].req += (data.req || 0);
		dataMap[date].success += (data.success || 0);
		dataMap[date].empty += (data.empty || 0);
	}
	return dataMap;
}
