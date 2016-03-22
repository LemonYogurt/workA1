var DB = require('../db').user;
var Util = require('./util');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;

function Admin(){

}

Admin.prototype.authorize = function(req,res,next){
	var basicAuthBase64 = req.headers.authorization;
	if(basicAuthBase64){
		basicAuthBase64= new Buffer(basicAuthBase64, 'base64').toString();
	    basicAuthBase64= basicAuthBase64.split(':');
	    if(basicAuthBase64.length == 2){
			var userID = basicAuthBase64[0];
			var authorizationSecret = basicAuthBase64[1];
			DB.findOne({_id:userID},function(err,doc){
				if(doc && doc.authorize && doc.authorize.type === 1
					&& authorizationSecret === Util.getSimpleSign(doc._id, doc.passwd)){
					res.auth = doc;
					return next();
				}else{
					return res.json(401,ErrorMessage[1010]);
				}
			});
	    }else{
			return res.json(401,ErrorMessage[1010]);
	    }
	}else{
		return res.json(401,ErrorMessage[1010]);
	}
};

Admin.prototype.findAll = function(req,res){
	var query = getQuery(req);
	var skip = +req.query.skip || 0
	var limit = +req.query.limit || 20;
	DB.find(query).sort({created:-1}).skip(skip).limit(limit).toArray(function(err,list){
		return Result.findResult(res,err,list);
	});
};

Admin.prototype.count = function(req,res){
	var query = getQuery(req);
	DB.count(query,function(err,count){
		return Result.countResult(res,err,count);
	});
};
Admin.prototype.authorizeType = function(req, res){
	var query = {};
	var id = req.params.id;
	var type = req.body && req.body.type;
	if([2,4,5].indexOf(+type) === -1){
		return res.json(403,ErrorMessage[4001]);
	}
	DB.update({_id:id},{$set:{"authorize.type":+type}},function(err,doc){
		return Result.updateResult(res,err,doc);
	});
};

Admin.prototype.updateState = function(req, res){
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


Admin.prototype.updateManager = function(req ,res){
	var id = req.params.id;
	var managerID = req.body.managerID;
	if(!managerID){
		return res.json(403,ErrorMessage[4001]);
	}

	if(!Array.isArray(managerID)){
		managerID = [managerID];
	}
	DB.update({_id:id},{$set:{"authorize.managerID":managerID}},function(err,doc){
		return Result.updateResult(res,err,doc);
	});
};


function getQuery(req){
	var str = req.query.str || "";
	var state = req.query.state || "";
	var type = req.query.type;
	var query = {};
	
	if(str.length == 20){
		query._id = str;
	}else if(str.length == 24){
		query.sspId = str;
	}else if(str){
		query.$or = [{name:{$regex:str}},{email:{$regex:str}}]
	}
	if(state !== ""){
		state = +state;
		query.state = state;
	}
	if(type !== ""){
		type = +type;
		query["authorize.type"] = type;
	}
	return query;
}
module.exports = new Admin();