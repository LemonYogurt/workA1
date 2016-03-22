var AccountSetting = require('./accountSetting');
var Util = require('../util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function Ssp(){

}

Ssp.prototype.getDspList = function(req, res){
	var sspID = req.params.sspID || "";

	AccountSetting.getSsp(sspID,function(err,doc){
		return Result.getResult(res,err,doc && doc.dspList ||  []);
	});
};


Ssp.prototype.dspList = function(req, res){
	var sspID = req.params.sspID || "";
	var body = req.body;
	if(!Array.isArray(body.dspList)){
		return res.json(403,ErrorMessage[1200]);
	}

	var dspList = body.dspList;
	AccountSetting.updateSSP(sspID,{dspList:dspList},function(err,doc){
		return Result.updateResult(res,err,doc);
	});
};

module.exports = new Ssp(); 