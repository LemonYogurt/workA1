var DB = require('../db').global;

exports.setGlobal = function(req, res){
	var body = req.body;
	var bidPCT = +body.bidPCT || 0;
	var secondPCT = +body.secondPCT || 0;
	var sspPCT = +body.sspPCT || 0;
	var data = {
		bidPCT:bidPCT,
		secondPCT:secondPCT,
		sspPCT:sspPCT
	};

	if(!bidPCT || !secondPCT || !sspPCT){
		return res.json(403,{error:"value must greater than 0"});
	}

	DB.global.remove({},function(err,doc){
		if(err){
			return res.json(403,{error:"delete global fail"});
		}else{
			DB.global.insert(data,function(err,result){
				if(err){
					return res.json(403,{error:"insert global fail"});
				}else{
					return res.json(result && result[0]);
				}
			});
		}
	});
};

exports.getGlobal = function(req,res){
	DB.global.findOne({},function(err,doc){
		if(err){
			return res.json(403,{error:"get global fail"});
		}else{
			return res.json(doc || {});
		}
	});
};