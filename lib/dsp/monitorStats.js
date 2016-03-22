var DB = require('../../db').dsp.monitorStats;
var Util = require('../util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function MonitorStats(){

}

MonitorStats.prototype.stats = function(req,res,next){
	var accountID = req.params.dspId;
	var query = Util.getStatsQuery(accountID,req.query);
	DB.find(query,{date:1,pv:1,click:1}).toArray(function(err,list){
		if(err){
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		}else{
			var data = Util.formatResult("day",list,query,getData);
			return res.json(data);
		}
	});
}

function getData(dataMap,date,data){
	var timeOut = 1000;
	if(!dataMap[date]){
		dataMap[date] = {
			date:date,
			pv:data.pv || 0,
			click:data.click || 0,
			timeout:data.timeout || 0,
			sendPv:data.sendPv || 0,
			bidOkPv:data.bidOkPv || 0,
			netExceptionPv:data.netExceptionPv || 0,
			time99:0,
			time85:0,
			time50:0
		};
		var timeoutPv = data.timeout/timeOut;
		if(timeoutPv >= 0.99){
			data["time99"] = 1;
		}else if(timeoutPv >= 0.85){
			data["time85"] = 1;
		}else if(timeoutPv >= 0.50){
			data["time50"] = 1;
		}
	}else{
		dataMap[date].pv += data.pv;
		dataMap[date].click += data.click;
		dataMap[date].timeout += data.timeout;
		dataMap[date].sendPv += data.sendPv;
		dataMap[date].bidOkPv += data.bidOkPv;
		dataMap[date].netExceptionPv += netExceptionPv.bidOkPv;

		var timeoutPv = data.timeout/timeOut;
		if(timeoutPv >= 0.99){
			data["time99"] ++;
		}else if(timeoutPv >= 0.85){
			data["time85"] ++;
		}else if(timeoutPv >= 0.50){
			data["time50"] ++;
		}
	}
	return dataMap;
}
module.exports = new MonitorStats();
