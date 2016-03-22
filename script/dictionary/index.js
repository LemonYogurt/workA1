var DB = require('../../db').dictionary;
var crypto= require('crypto');

var sizes = require('./size');
var types = require('./type');
var screens = require('./screen');
var sitetypes = require('./sitetypes');

var async = require("async");

sizes = sizes.map(function(item){
    var  avgpv = ~~(Math.random()*1000);
    return {
        _id:crypto.createHash('md5').update(item).digest('hex'),
        name:item,
        avgpv:avgpv
    }
});

var Data = {
    sizes:sizes,
    types:types,
    screens:screens,
    sitetypes:sitetypes
};

var result = {};
//avgpv
function create(db,callback) {
    DB[db].remove({},function(err,result){
        if(err){
            return callback(err);
        }else{
            var data = Data[db],len = data.length,i=0;
            async.forEach(data,function(item,finsh){
                DB[db].insert(item, function(err, result) {
                    if (err) {
                        finsh(err);
                    } else {
                        i++;
                        finsh();
                    }
                });
            },function(err){
                if(!err){
                    console.log(db+":finished");
                    return callback();
                }else{
                    return callback(db+":"+err);
                }
            });
        }
    });
}




function run() {
    console.log("\n\n");
    async.series({
        sizes:function(finish){
            create("sizes",function(err){
                finish(err);
            });
        },
        types:function(finish){
            create("types",function(err){
                finish(err);
            });
        },
        screens:function(finish){
            create("screens",function(err){
                finish(err);
            });
        },
        sitetypes:function(finish){
            create("sitetypes",function(err){
                finish(err);
            });
        }
    },function(err,result){
        if(err){
            console.log(err);
        }
        console.log("\n\n");
        process.exit();
    });
}

run();