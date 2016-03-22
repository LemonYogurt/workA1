var DB = require('../db').user;
var DspDB = require('../db').dsp.main;
var Util = require('./util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function Business(){

}

Business.prototype.authorize = function(req,res,next) {
	var basicAuthBase64 = req.headers.authorization;
	if (basicAuthBase64) {
		basicAuthBase64 = new Buffer(basicAuthBase64, 'base64').toString();
		basicAuthBase64 = basicAuthBase64.split(':');
		if (basicAuthBase64.length == 2) {
			var userID = basicAuthBase64[0];
			var authorizationSecret = basicAuthBase64[1];
			DB.findOne({_id: userID}, function (err, doc) {
				if (doc && doc.authorize && doc.authorize.type <= 4
					&& authorizationSecret === Util.getSimpleSign(doc._id, doc.passwd)) {
					res.auth = doc;
					return next();
				} else {
					return res.json(401, ErrorMessage[1010]);
				}
			});
		} else {
			return res.json(401, ErrorMessage[1010]);
		}
	} else {
		return res.json(401, ErrorMessage[1010]);
	}
};

Business.prototype.findAll = function(req,res){
	var query = getQuery(req,res);
	var skip = +req.query.skip || 0;
	var limit = +req.query.limit || 100;
	DB.find(query,{passwd:false}).sort({created:-1}).skip(skip).limit(limit).toArray(function(err,list){
		return Result.findResult(res,err,list);
	});
};

Business.prototype.findAllDsp = function(req,res){
	// var query = getQuery(req,res);
	var query = {};
	var skip = +req.query.skip || 0;
	var limit = +req.query.limit || 100;
	query.name = {$ne:'oem'};
	DspDB.find(query).sort({created:-1}).skip(skip).limit(limit).toArray(function(err,list){
		return Result.findResult(res,err,list);
	});
};
Business.prototype.count = function(req,res){
	var query = getQuery(req,res);
	DB.count(query,function(err,count){
		return Result.countResult(res,err,count);
	});
};

Business.prototype.updateState = function(req, res){
	var query = {};
	var emailOrID = req.params.emailOrID;
	var state = req.body && req.body.state;
	//console.log(+state,["0",1,2,3].indexOf(state));
	if([0,1,2,3].indexOf(+state) === -1){
		return res.json(403,ErrorMessage[4001]);
	}
	if(emailOrID.length == 20){
		query = {_id:emailOrID};
	}else{
		query = {email:emailOrID}
	}
	DB.update(query,{$set:{state:+state}},function(err,doc){
		return Result.updateResult(res,err,doc);
	});
};

function getQuery(req, res){
	var auth = res.auth;
	var str = req.query.str || "";
	var state = req.query.state || "";
	var type = req.query.type || ""; //dsp | ssp
	var query = {};

	if(str.length == 20){
		query._id = str;
	}else if(str){
		query.$or = [{name:{$regex:str}},{email:{$regex:str}}]
	}
	if(state !== ""){
		state = +state;
		query.state = state;
	}
	if(type == "ssp"){
		query.sspId = {$nin:["",null]};
	}else if(type == "dsp"){
		query.dspId = {$nin:["",null]};
	}
	/*if(auth.authorize.type > 1){
	 query["authorize.managerID"] = {$in:[auth._id]};
	 }*/
	return query;
}
module.exports = new Business();