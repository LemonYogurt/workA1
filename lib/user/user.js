var DB = require('../../db').user;
var Util = require('../util');
var AccountSetting = require('./accountSetting');
var Result = Util.result;
var ErrorMessage = Util.errorMessage;
var async = require('async');
var url = require("url");
var ObjectID = require('bson').ObjectID;
var _ = require('underscore');

function User(){

}

User.prototype.authorize = function(req,res,next){
	var basicAuthBase64 = req.headers.authorization;
	if(basicAuthBase64){
		basicAuthBase64= new Buffer(basicAuthBase64, 'base64').toString();
		basicAuthBase64= basicAuthBase64.split(':');
		if(basicAuthBase64.length == 2){
			var userID = basicAuthBase64[0];
			var authorizationSecret = basicAuthBase64[1];
			DB.findOne({_id:userID},function(err,doc){
				if(doc && doc.authorize
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

/**
 * 创建用户
 */
User.prototype.create = function(req,res){
	var auth = res.auth;
	var body = req.body;
	if(!body.email){
		return res.json(403,ErrorMessage[1002]);
	}else if(!body.password){
		return res.json(403,ErrorMessage[1003]);
	}else if(!body.name){
		return res.json(403,ErrorMessage[1004]);
	}

	var email = body.email;
	var name = body.name;
	DB.findOne({email:body.email},function(err,doc){
		if(err){
			return Result.getResult(res,err,data);
		}else if(doc){
			return res.json(403,ErrorMessage[1005]);
		}else{
			var data = formatBody(body, auth._id);
			async.series({
				dspId:function(done){
					if(body.isDsp){
						var dspData = formatDspData(body);
						dspData.email = email;
						dspData.name = name;
						dspData.bidType = body.bidType;
						dspData.admType = body.admType;
						AccountSetting.addDSP(dspData, function(err,doc){
							if(err || !doc){
								done("addDSP error!");
							}else{
								data.dspId = doc[0]._id.toString();
								done();
							}
						});
					}else{
						done();
					}
				},
				sspId:function(done){
					if(body.isSsp && (data.authorize.type >= 4)){
						var sspData = {
							settlement:body.settlement || {},
							email:email,
							name:name,
							bidType : body.bidType,
							admType : body.admType,
							platform_bid:body.platform_bid
						};
						AccountSetting.addSSP(sspData,function(err,doc){
							if(err || !doc){
								done("addSSP error!");
							}else{
								data.sspId = doc[0]._id.toString();
								done();
							}
						});
					}else{
						done();
					}
				}
			},function(err){
				if(err){
					return res.json(403,{error:err});
				}else{
					DB.insert(data, function (error, result) {
						return Result.createResult(res,err,result);
					});
				}
			});

		}
	});
};

/*
 SSP结构
 {
 "_id" : ObjectId("5641bea4bff38506004082a3"),
 "settlement" : {
 "type" : "share",
 "value" : 66
 },
 "email" : "mediapro@pro.cn",
 "name" : "mediaPro",
 "bidType" : "cpm",
 "admType" : "json",
 "platform_bid" : {
 "android" : 1,
 "ios" : 1
 },
 "dspList" : [
 "56322ca7f353200600519460"
 ]
 }
 */

/*
 PUBSLOT结构
 {
 slotID:
 pubID:
 sspID:
 dspList:[]
 }
 */

/*{
 "_id" : ObjectId("5620dad3788e31e0eba99118"),
 "adproID" : "5620616515d21701007c72c8",
 "hostname" : "103.249.254.126",
 "path" : "/openrtb?ac=4a040337d7b600088fcbc55387182d0c",
 "port" : 80,
 "type" : "protobuf",
 "name" : "oem",
 "e_key" : "53e14eca2feb4bf1e19b9e159ca192ca9a004b2c2fc3ed086ea223300ecf36d3",
 "i_key" : "ae2108e8a22961aa8175fa599c64cec43a3e901b1329bd9fd4c7a7229e270b7a",
 "contentType" : "application/x-protobuf",
 "version" : "v2_2",
 "bidType" : "cpm",
 "abbreviation" : "test",
 "bidders" : [
 {
 "id" : "5620dad3788e31e0eba99118",
 "name" : ""
 }
 ]

 }*/

// upsertAccount => upsertSSP => upsertPubSlot => upsertDsp
// function upsertBidder (bidder,bidderName) {

// 	AccountSetting.findOne({'bidders.id':bidder},function (err, doc) {
// 		if(err){
// 			return 'insert  bidder failsed';
// 		}
// 		if(!doc){
// 			//insert
// 			var bidderObj = {
// 				id:bidder,
// 				name: 
// 			}
// 			db.main.update()
// 		}
// 		else{
// 			return 'bidder exists';
// 		}
// 	})
// 	// body...
// }
function upsertPub(argument){
	// body...
}
User.prototype.addOEM = function(req,res){
	var auth = res.auth;
	var body = req.body;
	// var mediaproID = body.sspId;
	var bidderID = body.dspID;

	var oemID = body.oemID;
	console.log('body:',req.headers);
	var oemData = _.pick(body,'email','name','oemID', 'dspID', 'sspID','slotID','pubID');
	AccountSetting.addOEM(oemData,function(err, result) {
		return res.json({success:1});
	});

	// //generate ssp
	// var sspData = {
	// 	oemID:oemID,
	// 	settlement : {
	// 		type : 'share',
	// 		value : 100
	// 	},
	// 	bidType:'cpm',
	// 	admType:'json',
	// 	dspList:[oemID]
	// };

	// //generate pubID
	// var pubSlot ={
	// 	pubID: body.pubID,
	// 	slotID: body.slotID,
	// 	sspID: oemID,
	// 	dspList: [oemId],
	// };
	// var bidders = {
	// 	id: bidderID
	// };
	// var dspData = {
	// 	oemId: oemId,
	// 	hostname : "103.249.254.126",
	// 	path : "/openrtb?ac=4a040337d7b600088fcbc55387182d0c",
	// 	port : 80,
	// 	type : "protobuf",
	// 	e_key : "53e14eca2feb4bf1e19b9e159ca192ca9a004b2c2fc3ed086ea223300ecf36d3",
	// 	i_key : "ae2108e8a22961aa8175fa599c64cec43a3e901b1329bd9fd4c7a7229e270b7a",
	// 	contentType : "application/x-protobuf",
	// 	version : "v2_2",
	// 	bidType : "cpm",
	// 	bidders : [
	// 		{
	// 			id : bidderID,
	// 			name : "oem"
	// 		}
	// 	]
	// };
	// // DB.findOne({})
	// //upsertPub
	// //upsertBidder
	// //upsertAccount
	// async.series({
	// 	createSSP: function(done) {
	// 		AccountSetting.addSSP(sspData, function(err, doc) {
	// 			if (err || !doc) {
	// 				done("addSSP error!");
	// 			} else {
	// 				// data.sspId = doc[0]._id.toString();
	// 				done();
	// 			}
	// 			// done();
	// 		});
	// 	},


	// 	createPubSlot:function (done) {
	// 		// body...
	// 		AccountSetting.addPubSlot(pubSlot,function(err, doc) {
	// 			// body...
	// 			if(err || !doc){
	// 				done("add pub slot error");
	// 			}else{
	// 			}
	// 			done();
	// 		})
	// 	},
	// 	createDSP:function(done){
	// 		AccountSetting.addDSP(dspData,function(err, doc) {
	// 			// body...
	// 			done();
	// 		})

	// 	},
	// 	createAccount:function(done){
	// 		DB.findOne({oemId:oemId},function(err,doc){
	// 			if(!err && !doc){
	// 				var oemAccount ={}
	// 				oemAccount.oemId = oemId;
	// 				oemAccount.email  = body.email;
	// 				oemAccount.name = body.name;
	// 				DB.insert(oemAccount,function(err, content) {
	// 					// body...
	// 					console.log('content')
	// 				});	
	// 			}
	// 			done();
	// 		})
	// 	}		
	// },function(err){
	// 	res.json({success:1});	
	// })
};

User.prototype.login = function(req, res){
	var email = req.body.email;
	var password = req.body.password;
	if(!email){
		return res.json(403,ErrorMessage[1002]);
	}else if(!password){
		return res.json(403,ErrorMessage[1003]);
	}
	DB.findOne({email:email, passwd:Util.getTokenPasswd(password)}, function(err, doc){
		if(err){
			console.log("login error: ",err);
			var errorCode = err.code || 1000;
			return res.json(403,ErrorMessage[errorCode]);
		} else if(doc && doc.authorize){
			if(doc.state === 0){
				res.json({
					userId: doc._id,
					secret: [doc._id, Util.getSimpleSign(doc._id, doc.passwd)].join(':'),
					authorize: doc.authorize
				});
			}else if(doc.state === 1){
				res.json(403,ErrorMessage[1006]);
			}else if(doc.state === 2){
				res.json(403,ErrorMessage[1007]);
			}else if(doc.state === 3){
				res.json(403,ErrorMessage[1008]);
			}else{
				res.json(403,ErrorMessage[1009]);
			}
		}else if(doc && !doc.authorize){
			res.json(403,ErrorMessage[1010]);
		}else{
			res.json(403,ErrorMessage[1011]);
		}
	});
};

User.prototype.get = function(req, res){
	var auth = res.auth;
	var accountID = req.params.accountID;
	if(!checkAuth(auth,accountID)){
		return res.json(401,ErrorMessage[1010]);
	}
	var query = { _id: accountID};
	DB.findOne(query, {passwd:0,state:0,"authorize.secret":0}, function(err, result) {
		return Result.getResult(res,err,result);
	})
};

User.prototype.getDetail = function(req, res){
	var auth = res.auth;
	var accountID = req.params.accountID;
	if(!checkAuth(auth,accountID)){
		return res.json(401,ErrorMessage[1010]);
	}
	var query = { _id: accountID};
	DB.findOne(query, {passwd:0,state:0,"authorize.secret":0}, function(err, result) {
		if(err){
			return Result.getResult(res,err,result);
		}else{
			async.series({
				dspId:function(finish){
					if(result.dspId){
						AccountSetting.getDsp(result.dspId,function(err,doc){
							result.dspDetail = doc;
							finish(err, result);
						});
					}else{
						finish(null);
					}
				},
				sspId:function(finish){
					if(result.sspId){
						AccountSetting.getSsp(result.sspId,function(err,doc){
							result.sspDetail = doc;
							finish(err, result);
						});
					}else{
						finish(null);
					}
				}
			},function(err, results){
				return Result.getResult(res,err,result);
			});
		}
	})
};

User.prototype.update = function(req, res){
	var auth = res.auth;
	var accountID = req.params.accountID;
	if(!checkAuth(auth,accountID)){
		return res.json(401,ErrorMessage[1010]);
	}
	var body = req.body;
	var sspId = body.sspId;
	var dspId = body.dspId;
	var accountData = _.pick(body,'name','info');
	var settlement = body.settlement;

	DB.update({_id:accountID},{$set:accountData},function(err,doc){
		if(sspId && settlement){
			var sspData = _.pick(body,'settlement','bidType','admType','platform_bid','abbreviation');
			AccountSetting.updateSSP(sspId,sspData,function(err,doc){
				return Result.updateResult(res,err,doc);
			});
		}else if(dspId){
			var dspData = formatDspData(body);
			AccountSetting.updateDSP(dspId,dspData,function(err,doc2){
				return Result.updateResult(res,err,doc2);
			});
		}else{
			return Result.updateResult(res,err,doc);
		}
	});
};

User.prototype.resetPassword = function(req, res){
	var auth = res.auth;
	var accountID = req.params.accountID;
	if(!checkAuth(auth,accountID)){
		return res.json(401,ErrorMessage[1010]);
	}
	var body = req.body;
	var oldPsw = body.oldPassword;
	var newPassword = Util.getTokenPasswd(body.password);
	DB.findOne({_id:accountID},function(err,doc){
		if(doc && doc.passwd == Util.getTokenPasswd(oldPsw)){
			DB.update({_id:accountID},{$set:{passwd:newPassword}},function(err,doc){
				if(!err){
					return res.json({success:1});
				}else{
					return res.json(ErrorMessage[1101]);
				}
			});
		}else{
			return res.json(ErrorMessage[1100]);
		}
	});
};

User.prototype.updateSSP = function(req, res){
	var auth = res.auth;
	var sspId = req.params.sspId;
	if(auth && auth.authorize && auth.authorize.type !== 1 && auth.sspId !== sspId){
		return res.json(401,ErrorMessage[1010]);
	}
	var body = req.body;
	var mediaproID = body.mediaproID;
	var dspList = body.dspList;
	if(dspList){
		dspList = Array.isArray(dspList)?dspList:[dspList];
	}
	AccountSetting.updateSSP(sspId,{mid:mediaproID,dspList:dspList},function(err,result){
		if(err){
			return res.json(403,{error:err});
		}else{
			return res.json({success:1});
		}
	})
};

function formatBody(body,mid){
	var state = 1;
	if (body.accountType <= 2) {
		state = 0;
	}
	var data = {
		_id:Util.getUniqueId(20),
		email:body.email,
		passwd:Util.getTokenPasswd(body.password),
		name:body.name,
		created:new Date(),
		state:body.state || state,
		authorize:{
			managerID:[mid],
			//type:5,
			type:body.accountType,
			secret:Util.getUniqueId(32)
		}
	};
	if(body.info){
		data.info={
			telphone:body.info.telphone,
			company	:body.info.company,
			address	:body.info.address,
			website	:body.info.website
		}
	}
	return data;
}

function formatDspData(body) {
	var data = _.pick(body,'contentType','version','bidType','admType','abbreviation');
	if (body.accountType == 5) {
		var urlobj = url.parse(body.path);
		data.hostname = urlobj.hostname;
		data.port = urlobj.port || 80;
		data.path = urlobj.path;
		data.bidders = [];
		for (var i = 0, len = body.bidders.length; i < len; i++) {
			if (body.bidders[i].id == 'new') {
				body.bidders[i].id = (new ObjectID()).toString();
			}
			data.bidders.push(body.bidders[i]);
		}
	}
	return data;
}

function checkAuth(auth,accountID){
	if(auth && auth.authorize && auth.authorize.type <= 4 || auth._id == accountID){
		return true;
	}else{
		return false;
	}
}

module.exports = new User();
