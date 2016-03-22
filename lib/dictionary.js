var DB = require('../db').dictionary;
var Util = require('./util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;
var crypto= require('crypto');

function Dictionary(){

}
Dictionary.prototype.create = function(req, res){
	var type = req.params.dictionaryType;
	var body = validate(req.body);
	if(!body){
		return res.json(403,ErrorMessage[4001]);
	}

	DB[type].insert(body,function(err,data){
		return Result.createResult(res,err,data);
	});
};

Dictionary.prototype.find = function(req, res){
	var type = req.params.dictionaryType;
	var skip = +req.query.skip;
	var limit = +req.query.limit;

	var sizeListCount = 0;
	DB[type].count(function(err, count){
		sizeListCount = count;
		console.log("length");
	    console.log(sizeListCount);
	    DB[type].find().sort({create: -1}).skip(skip).limit(limit).toArray(function(err,sizeListOfEveryPage){
	
		return Result.findResult(res,err,{sizeListOfEveryPage: sizeListOfEveryPage, sizeListCount: count});
	});
	});
};

Dictionary.prototype.get = function(req, res){
	var type = req.params.dictionaryType;
	var id  = req.params.id;
	DB[type].findOne({_id:id},function(err,data){
		return Result.getResult(res,err,data);
	});
};

Dictionary.prototype.delete = function(req, res){
	var type = req.params.dictionaryType;
	var id = req.params.id;
	DB[type].remove({_id:id},function(err,data){
		return Result.deleteResult(res, err, data);
	});
};

function validate(data){
	if(data && data.name){
		var validateData = {
			_id:crypto.createHash('md5').update(data.name).digest('hex'),
			name:data.name
		};
		if(data.avgpv){
			validateData.avgpv = data.avgpv;
		}
		return validateData;
	}else{
		return null;
	}
}

module.exports = new Dictionary();