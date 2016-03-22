var SALT = 'dfdsak';
//var qs= require('querystring');
//var url= require('url');
var crypto= require('crypto');
var SIGN_SAFE= "h!f@t#n$l";

exports.result = require("./result");
exports.errorMessage = require("./error");

exports.getSimpleSign= function (accountID, secret_key) {
	return crypto.createHash('sha1').update(accountID+SIGN_SAFE+secret_key).digest('hex').toUpperCase();
};

exports.getTokenPasswd=function (password) {
	if(!password)
		throw new Error('util.getTokenPasswd(password) error: require password a string argument.');

	return exports.getMd5( password + SALT, 'base64');
};

exports.getMd5= function(str, encoding) {
	if(!str)
		throw new Error('util.getMd5(str, [encoding]) error: require str a string argument.');

    return crypto.createHash('md5').update(str).digest(encoding || 'hex');
};

exports.getUniqueId = function(length) {
    if (typeof length !== 'number')
        throw new Error('util.getUniqueId() require length a number argument.');

    var uid = Date.now().toString(16);
    var len = length ? length - uid.length : 20 - uid.length;
    while (len--)
        uid = ((Math.random() * 16) | 0).toString(16) + uid;
    return uid.toLowerCase();
};

exports.getStartDate= function(date){
	date= date instanceof Date? date : date?new Date(date):new Date();
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
};

exports.getEndDate= function(date){
	date= date instanceof Date? date : date?new Date(date):new Date();
	date.setHours(23);
	date.setMinutes(59);
	date.setSeconds(59);
	date.setMilliseconds(999);
	return date;
};

exports.getStartMonthDate= function(date){
	date= date instanceof Date? new Date(date.getTime()) : date?new Date(date):new Date();
	date.setDate(1);
	date = exports.getStartDate(date);
	return date;
};

exports.getEndMonthDate= function(date){
	date= date instanceof Date? new Date(date.getTime()) : date?new Date(date):new Date();
	date.setMonth(date.getMonth()+1);
	date.setDate(0);
	date = exports.getEndDate(date);
	return date;
};


exports.getYYYYMMDD= function(date, split){
	date= date instanceof Date? date : new Date(date || '');
	return [date.getFullYear(), ('00'+ (date.getMonth()+1)).slice(-2), ('00'+ date.getDate()).slice(-2)].join(split || '-');
};

exports.getYYYYMMDDHH= function(date, split){
	date= date instanceof Date? date : new Date(date || '');
	return [date.getFullYear(), ('00'+ (date.getMonth()+1)).slice(-2), ('00'+ date.getDate()).slice(-2)].join(split || '-') + " "+('00'+ date.getHours()).slice(-2);
};


exports.formatResult = function(type,list,query,getData){
	getData = getData || getDataDefault;
	var getFormatDate = type == "hour"?exports.getYYYYMMDDHH:exports.getYYYYMMDD;
	var dataList = [];
	var hourMap = {};
	for(var i = 0;i < list.length;i ++){
		var data = list[i];
		var date = getFormatDate(data.date);
		hourMap = getData(hourMap,date,data)
	}
	var fullData = exports.getFullDate(query,type,getData);

	for(item in fullData){
		if(hourMap[item]){
			fullData[item] = hourMap[item];
		}
		dataList.push(fullData[item]);
	}

	dataList = dataList.sort(function(a,b){
		return a.date > b.date?-1:1;
	});

	return dataList;
};

exports.getFullDate = function(query,type,getData){
	var getFormatDate = exports.getYYYYMMDD;
	var interval = 86400000;
	if(type == "hour"){
		interval = 3600000;
		getFormatDate =exports.getYYYYMMDDHH
	}
	var start = query.date.$gte;
	var end = query.date.$lte;
	var data= {};
	for(var s= start.getTime(), e= end.getTime(); s <= e; s+= interval){
		var date = getFormatDate(s);
		data = getData(data,date,{});
	}
	return data;
};


exports.getStatsQuery= function(query,params){
	var query = query || {};
	var start = exports.getStartDate(params.start); 
	var end = exports.getEndDate(params.end || params.start); 
	var url = params.url || "";
	var size = params.size || "";
	query.date = {$gte:start, $lte:end};
	if(url){
		query.url = url;
	}
	if(size){
		query.size = size;
	}
	return query;
};

function getDataDefault(dataMap,date,data){
	if(!dataMap[date]){
		dataMap[date] = {
			date:date,
			req:data.req || 0,
			pv:data.pv || 0,
			click:data.click || 0,
			money:data.money || 0
		};
	}else{
		dataMap[date].pv += data.pv;
		dataMap[date].req += data.req;
		dataMap[date].click += data.click;
		dataMap[date].money += data.money;
	}
	return dataMap;
}