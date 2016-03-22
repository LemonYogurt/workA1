var DB = require('../../db').ssp.sspSetting;
var Util = require('../util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function sspSettings(){

}

sspSettings.prototype.get = function(req, res){
	var accountID = req.params.accountID || "";
	var type = req.params.sspSettingsType || "";
	var field = {};
	if(type){
		field[type] = true;
	}
	DB.findOne({_id:accountID},field,function(err,data){
		return Result.getResult(res,err,data || {});
	});
};

sspSettings.prototype.saveOrUpdate = function(req, res){
	var type = req.params.sspSettingsType || "";
	var accountID = req.params.accountID || "";
	var body = validate(req.body);
	
	if(!body){
		return res.json(403,ErrorMessage[4001]);
	}

	var set = {};
	if(type){
		set[type] = body[type] || null;
	}else{
		set = body;
	}
	DB.update({_id:accountID},{$set:set},{upsert:true},function(err,data){
		return Result.updateResult(res,err,data);
	});
};

function validate(body){
	var data = {};
	if(Array.isArray(body.dsp)){
		data.dsp = body.dsp;
	}else{
		return null;
	}

	return data;
}

module.exports = new sspSettings();