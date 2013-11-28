
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , Db = require('tingodb')().Db;

var app = express();

var env = process.env.NODE_ENV || 'development'
, config = require('./config/config')[env]
, db = new Db(config.dbPath, {});

var expressConfig = require('./config/express');
expressConfig(app, express, path, __dirname, passport, config);

var passportConf =  require('./config/passport');
passportConf(passport, db, config);

var auth =  require('./config/auth')(passport, express);

var reqmap = require('./config/reqmap');
reqmap(app, db, passport, auth);


/*var emitter =  require('events').EventEmitter;*/

var server = http.createServer(app);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
