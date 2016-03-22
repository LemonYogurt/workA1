var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var settings = require("./settings");
var routes = require('./routes');
var multer = require('multer'); 

var app = express();

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(multer());
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', require('ejs').__express);  
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.listen(settings.worker.port);
console.log('ADX api runing listen in '+ settings.worker.port);
