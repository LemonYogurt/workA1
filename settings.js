'use strict';

var MONGO_HOST = process.env.MONGO_HOST || 'mongodb://127.0.0.1:27017';

console.log('MONGO_HOST:', MONGO_HOST)
module.exports = {
    worker: {
        port: process.env.PORT || 3010
    },
    dbs: {
    	slotDB     :MONGO_HOST + "/slot",
    	userDB     :MONGO_HOST + "/adxAccount",
    	dspDB      :MONGO_HOST + "/dsp",
    	sspDB      :MONGO_HOST + "/ssp",
    	dictionary :MONGO_HOST + "/dictionary",
        globalDB   :MONGO_HOST + "/global"
    }
};
