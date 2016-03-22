var DB = require('../../db');
var crypto = require('crypto');
var Util = require('../util');
var ObjectID = require('bson').ObjectID;

function AccountSetting(){
	this.dspDB = DB.dsp.main;
	this.sspDB = DB.ssp.main;
	this.pubSlot = DB.ssp.pubSlot;
	this.oem = DB.ssp.oem;
}

AccountSetting.prototype.addDSP = function(data, callback) {
	var i_key = crypto.randomBytes(32).toString('hex');
	var e_key = crypto.randomBytes(32).toString('hex');
	data.i_key = i_key;
	data.e_key = e_key;
	this.dspDB.insert(data, function(err,result){
		callback(err, result)
	})
};

AccountSetting.prototype.addSSP = function(data,callback){
	this.sspDB.insert(data, function(err, result){
		callback(err,result);
	})
};

AccountSetting.prototype.getDsp = function(id,callback){
	this.dspDB.findOne({'_id': new ObjectID(id.toString())}, function(err,result){
		callback(err, result)
	});
};
AccountSetting.prototype.addPubSlot = function(data,callback){
	console.log('data: ' , data);
	this.pubSlot.insert(data, function(err, result){
		callback(err,result);
	});	
};

AccountSetting.prototype.addOEM = function(data, callback) {
	console.log('data: ', data);
	this.oem.insert(data,function (err, result) {
		callback(err,result);
	})
};
AccountSetting.prototype.getSsp = function(id,callback){
	this.sspDB.findOne({'_id': new ObjectID(id.toString())}, function(err,result){
		callback(err, result)
	});
};

AccountSetting.prototype.updateSSP = function(id,data,callback){
	this.sspDB.update({_id:new ObjectID(id)},{$set:data},function(err,result){
		callback(err,result);
	});
};

AccountSetting.prototype.updateDSP = function(id,data,callback){
	this.dspDB.update({_id:new ObjectID(id)},{$set:data},function(err,result){
		callback(err,result);
	});
};


module.exports = new AccountSetting();