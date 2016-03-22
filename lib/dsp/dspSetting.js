var DB = require('../../db').dsp.dspSetting;
var Util = require('../util');
var Result = Util.result;

function DspSetting(){

}

DspSetting.prototype.get = function(req, res){
	var type = req.params.dictionaryType;
	var accountID = req.params.accountID;
	var field = {};
	if(type){
		field[type] = true;
	}

	DB.findOne({_id:accountID},field,function(err,data){
		return Result.getResult(res,err,data || {});
	});
}

DspSetting.prototype.update = function(req, res){
	var type = req.params.dictionaryType;
	var accountID = req.params.accountID;
	var body = validate(req.body);

	if(!body){
		return res.json(403,ErrorMessage[4001]);
	}

	var set = {};
	if(type){
		set[type] = body[type] || [];
	}else{
		set = body;
	}
	DB.update({_id:accountID},{$set:set},{upsert:true},function(err,data){
		return Result.updateResult(res,err,data);
	});
}

function validate(body){
	var data = {};
	["sizes","types","screens","sitetypes","siteurls"].forEach(function(type){
		if(Array.isArray(body[type])){
			data[type] = body[type];
		}
	});

	return data;
}

module.exports = new DspSetting();