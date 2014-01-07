/**
 * Module dependencies.
 */

var master = require('./proxy/master')
  , worker = require('./proxy/worker')
  , config = require('./config/config')
  , cluster = require('cluster');

if (cluster.isMaster) {
	// Run the master
	master();
	
	var express = require('express')
		, http = require('http')
		, path = require('path')
		, passport = require('passport')
		, Db = require('tingodb')().Db
	    , app = express()
	    , db = new Db(config.dbPath, {});

	var expressConfig = require('./config/express');
	expressConfig(app, express, path, __dirname, passport, config);

	var passportConf = require('./config/passport');
	passportConf(passport, db, config);

	var auth = require('./config/auth')(passport, express);

	var reqmap = require('./config/reqmap');
	reqmap(app, db, passport, auth);
    
	var httpServer = http.createServer(app);
	httpServer.listen(config.app.port, config.app.hostname, function(req,
			res, next) {
		console.log('Http server on port : ' + config.app.port);
	});
} else {
	// Run the worker
	worker();
}




