var AccountSetting = require('./accountSetting');
var Util = require('../util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function Dsp(){

}

Dsp.prototype.getSizeList = function(req, res){
	var dspID = req.params.dspID || "";

	AccountSetting.getDsp(dspID,function(err,doc){
		return Result.getResult(res,err,doc && doc.sizeList || []);
	});
};


Dsp.prototype.sizeList = function(req, res){
	var dspID = req.params.dspID || "";
	var body = req.body;
	if(!Array.isArray(body.sizeList)){
		return res.json(403,ErrorMessage[1201]);
	}

	var sizeList = body.sizeList;
	AccountSetting.updateDSP(dspID,{sizeList:sizeList},function(err,doc){
		return Result.updateResult(res,err,doc);
	});
};

module.exports = new Dsp(); 