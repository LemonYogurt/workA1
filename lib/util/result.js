var ErrorMessage = require('./error');

exports.createResult = function(res,err,data){
	if(err){
		var errorCode = err.code || 1000;
		return res.json(403,ErrorMessage[errorCode]);
	}else{
		return res.json(data && data[0]);
	}
};

exports.findResult = function(res,err,data){
	if(err){
		var errorCode = err.code || 1000;
		return res.json(403,ErrorMessage[errorCode]);
	}else{
		return res.json(data);
	}
};

exports.getResult = function(res,err,data){
	if(!data){
		return res.json(404,ErrorMessage[4004]);
	}else{
		return res.json(data);
	}
};

exports.deleteResult = function(res, err, data){
	if(err){
		return res.json(403,ErrorMessage[4002]);
	}else{
		return res.json(204);
	}
};

exports.updateResult = function(res, err, data){
	if(err){
		return res.json(403,ErrorMessage[4003]);
	}else{
		return res.json(data);
	}
};
exports.countResult = function(res, err, data){
	if(err){
		return res.json(403,ErrorMessage[4003]);
	}else{
		return res.json({count:data});
	}
};