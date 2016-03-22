var DB = require('../../db').ssp.slot;
var Util = require('../util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function Slot(){}

Slot.prototype.create = function(req, res){

};

Slot.prototype.find = function(req, res){
	var accountID = res.auth._id;
	DB.find({accountID:accountID,state:"avtive"}).toArray(function(err,list){
		return Result.findResult(res,err,list);
	});
};

module.exports = new Slot();
