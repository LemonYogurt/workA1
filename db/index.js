"use strict";
var mongoskin = require('mongoskin');
var settings = require('../settings');
var db_maps = {};

function getCollection(mongodb_uri, collection_name) {
    if (!mongodb_uri)
        throw new Error('mongodb connect error: mongodb_uri is null.');
    if (!db_maps[mongodb_uri]){
        console.log('connect mongodb uri:', mongodb_uri);
        db_maps[mongodb_uri] = mongoskin.db(mongodb_uri, {
            numberOfRetries: 1,
            retryMiliSeconds: 500,
            safe: true,
            native_parser: true
        }, {
            socketOptions: {
                timeout: 5000
            }
        });
    }

    return db_maps[mongodb_uri].collection(collection_name || 'main');
}

module.exports = {
    user:getCollection(settings.dbs.userDB, 'main'),
    dsp :{
        main        : getCollection(settings.dbs.dspDB, 'main'),
        reportStats : getCollection(settings.dbs.dspDB, 'reportStats'),
        monitorStats: getCollection(settings.dbs.dspDB, 'monitorStats'),
        dspSetting  : getCollection(settings.dbs.dspDB, 'dspSetting'),
        reqInfoStats  : getCollection(settings.dbs.dspDB, 'reqInfo'),
    },
    ssp :{
        main        : getCollection(settings.dbs.sspDB, 'main'),
        pubSlot     : getCollection(settings.dbs.sspDB, 'pubSlot'),
        reportStats : getCollection(settings.dbs.sspDB, 'reportStats'),
        sspSetting  : getCollection(settings.dbs.sspDB, 'sspSetting'),
        reqInfoStats  : getCollection(settings.dbs.sspDB, 'reqInfo'),
        oem         : getCollection(settings.dbs.sspDB, 'oem')
    },
    dictionary  : {
        sizes   :getCollection(settings.dbs.dictionary, 'sizes'),       //推广位尺寸
        types   :getCollection(settings.dbs.dictionary, 'types'),       //推广位类型
        screens :getCollection(settings.dbs.dictionary, 'screens'),     //推广位屏数
        sitetypes:getCollection(settings.dbs.dictionary, 'sitetypes')  //网站类型
    },
    global : {
        global :getCollection(settings.dbs.globalDB , 'main')
    }
};