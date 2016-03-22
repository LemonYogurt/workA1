var express = require('express');
var router = express.Router();
var global = require("../lib/global");

var admin = require("../lib/admin");
var business = require("../lib/business");
var user = require("../lib/user/user");
var userSsp = require("../lib/user/ssp");
var userDsp = require("../lib/user/dsp");
var sspSettings = require("../lib/ssp/settings");

var dictionary = require("../lib/dictionary");
var dspSetting = require("../lib/dsp/dspSetting");
var dspReportStats = require("../lib/dsp/reportStats");
var dspReqInfoStats = require("../lib/dsp/reqInfoStats");
var sspReqInfoStats = require("../lib/ssp/reqInfoStats");
var sspReportStats = require("../lib/ssp/reportStats");
var monitorStats = require("../lib/dsp/monitorStats");

//var sspStats = require("../lib/ssp/stats");
var slot = require("../lib/ssp/slot");

router.get("/",function(req,res){
  res.render("index");
});

router.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val){
      var captures;
      if (fn.test(String(val))) {
        req.params[name] = val;
        next();
      } else {
        next('route');
      }
    }
  }
});
router.all('/register', business.authorize.bind(business));
router.post('/register',user.create.bind(user));
router.post('/user',user.login.bind(user));
router.all('/*', user.authorize.bind(user));
router.all('/admin*', admin.authorize.bind(admin));
router.all('/business*', business.authorize.bind(business));

router.route("/admin/global")
  .get(global.getGlobal.bind(global))
  .post(global.setGlobal.bind(global));
router.get("/admin/account",admin.findAll.bind(admin));
router.get("/admin/account/count",admin.count.bind(admin));
router.put("/admin/account/:id/authorizeType",admin.authorizeType.bind(admin));

router.get("/business/account",business.findAll.bind(business));
router.get("/business/getAllDspList",business.findAllDsp.bind(business));
router.get("/business/account/count",business.count.bind(business));
router.put('/business/account/:emailOrID/state',business.updateState.bind(business));
//ssp setting
router.route("/business/dspList/:sspID")
  .get(userSsp.getDspList.bind(userSsp))
  .put(userSsp.dspList.bind(userSsp));

//dsp setting
router.route("/business/sizeList/:dspID")
  .get(userDsp.getSizeList.bind(userDsp))
  .put(userDsp.sizeList.bind(userDsp));

router.get("/business/dspList/:sspID",userSsp.getDspList.bind(userSsp));
router.put("/business/dspList/:sspID",userSsp.dspList.bind(userSsp));
router.param('dictionaryType', /^(sizes|types|screens|sitetypes|siteurls)$/);
router.route('/admin/dictionary/:dictionaryType/:id?')
  .post(dictionary.create)
  .delete(dictionary.delete);


/**
 * User
 */
router.route("/user/:accountID")
  .get(user.get.bind(user))
  .put(user.update.bind(user));
router.put("/user/:accountID/resetPassword",user.resetPassword.bind(user));
router.get("/user/:accountID/detail",user.getDetail.bind(user));
router.put("/user/:sspId/updateSSP",user.updateSSP.bind(user));

//查询所有可用的尺寸、类型、屏数、网站类型等
router.get('/dictionary/:dictionaryType/',dictionary.find);
router.get('/dictionary/:dictionaryType/:id',dictionary.get);

/**
 * dsp
 */
//设置过滤项目
router.route('/dsp/settings/:dictionaryType/:accountID')
  .get(dspSetting.get.bind(dspSetting))
  .put(dspSetting.update.bind(dspSetting));

//查询统计报表
router.get('/dsp/:dspId/report/total',dspReportStats.total.bind(dspReportStats));
router.get('/dsp/:dspId/report/realtime',dspReportStats.realtime.bind(dspReportStats));
router.get('/dsp/:dspId/report/history',dspReportStats.history.bind(dspReportStats));
router.get('/dsp/:dspId/report/bid',dspReqInfoStats.bid.bind(dspReqInfoStats));

router.param('groupType', /^(size|url)$/);
router.get('/dsp/:dspId/report/:groupType',dspReportStats.group).bind(dspReportStats);

//竞价监控
router.get('/dsp/:dspId/monitor/stats',monitorStats.stats.bind(monitorStats));
router.post('/oem/add', user.addOEM.bind(user));

/**
 * ssp
 */
router.param('sspSettingsType', /^dsp$/);
router.route("/ssp/settings/:sspSettingsType/:accountID")
  .get(sspSettings.get.bind(sspSettings))
  .put(sspSettings.saveOrUpdate.bind(sspSettings));
router.route("/ssp/slot")
  .get(slot.find.bind(slot));
//查询统计报表
//
router.get('/ssp/:sspId/report/bid',sspReqInfoStats.bid.bind(sspReqInfoStats));
router.get('/ssp/:sspId/report/total',sspReportStats.total.bind(sspReportStats));
router.get('/ssp/:sspId/report/realtime',sspReportStats.realtime.bind(sspReportStats));
router.get('/ssp/:sspId/report/history',sspReportStats.history.bind(sspReportStats));
//router.get('/ssp/:sspId/report/total',sspStats.slotStats.total.bind(sspStats));
//router.get('/ssp/:sspId/report/slot',sspStats.slotStats.chart.bind(sspStats));
//router.get('/ssp/report/site',sspStats.site.bind(sspStats));
//router.get('/ssp/report/channel',sspStats.channel.bind(sspStats));

module.exports = router;
