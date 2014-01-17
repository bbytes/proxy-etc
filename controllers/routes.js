/*
 * Routes controller
 */

var routesDao = require("../dao/routes");
var targetsDao = require("../dao/targets");
var async = require('async'); 
var runningServers = [];
var http = require('http');
var config = require('../config/config');
var httpProxy = require("http-proxy");
var proxy = new httpProxy.RoutingProxy();

exports.init = function(db) {
	routesDao.init(db);
	targetsDao.init(db);
	startServers();
};

function startServers(){
	routesDao.getAll(function(error, result){
		for(var i=0; i<result.length; i++){
			var options = {newSource : result[i].source};
			startServer(options);
		}
	});
}

exports.save = function(req, res) {
	var route = req.body.route;
	if(route.source && /^\d+$/.test(route.source)){
		testPort(config.app.hostname, route.source, function(result, data){
			if(result == "failure"){
				saveRoute(req, res, route);
			} else if(result == "success"){
				res.send({error : "This port is already in use or not existed"});
			}
		});
	} else {
		saveRoute(req, res, route);
	}
};

exports.update = function(req, res) {
	var route = req.body.route;
	if(route.source && /^\d+$/.test(route.source)){
		testPort(config.app.hostname, route.source, function(result, data){
			if(result == "failure"){
				updateRoute(req, res, route);
			} else if(result == "success"){
				res.send({error : "This port is already in use or not existed"});
			}
		});
	} else {
		updateRoute(req, res, route);
	}

};

exports.deleteRoute = function(req, res){
	routesDao.findById(req.body.id, function(error, result){
		if(result){
			routesDao.deleteById(req.body.id, function(error, deletedData) {
				if(error){
					res.send("Error");
				} else {
					var options = {oldSource : result.source};
					startServer(options);
					var targets = result.targets;
					async.eachSeries(targets, function(target, done){
						targetsDao.deleteById(target.id, function(error, data){
							if(error){
								done("Error", null);
							} else {
								done(null, deletedData);
							}
						});
					}, function(err, data){
						if(err){
							res.send(err);
						} else {
							res.send({id : data});
						}
					});
				}
			});
		}
	});
};

exports.getAllRoutes = function(req, res) {
	routesDao.getAll(function(error, data) {
		if(error){
			res.send("");
		} else {
			res.send(data);
		}
	});
};


function saveRoute(req, res, route){
	var jsonData = {
			source : route.source,
			targets : [],
			sessionType : route.sessionType
		};

		routesDao.getBySource(route.source, function(error, data){
			if(data == null){
				var targets = route.targets;
				var config = {enabled : false, ping_service : "", timeout : "", ping_interval : "",
						alert_to : "", warning_if_takes_more_than : "", method : "",
							url : "", expectedStatuscode : "", expectedData : ""};
				async.eachSeries(targets, function(target, done){
					var targetToSave = {host : target.host, port : target.port, source : route.source, config : config, state : {}};
					targetsDao.save(targetToSave, function(error, data){
						if(error){
							done("Error", null);
						} else {
							var status = "";
							if(data[0].state.status){
								status = data[0].state.status;
							}
							jsonData.targets.push({host : data[0].host, port : data[0].port, id : data[0]._id, status : status});
							done(null, data[0]);
						}
					});
				}, function(err, data){
					if(err){
						res.send("Error");
					} else {
						routesDao.save(jsonData, function(error, data) {
							if(error){
								res.send("Error");
							} else {
								var options = {newSource : jsonData.source};
								startServer(options);
								res.send({route : data[0]});
							}
						});
					}
				});
			} else {
				res.send("Route with source : "+ route.source +" already exists");
			}
		});
}

function updateRoute(req, res, route){
	var targetsToRemove = [];
	var routesTargets = [];
	var oldRoute1 = {};
	var config = {enabled : false, ping_service : "", timeout : "", ping_interval : "",
			alert_to : "", warning_if_takes_more_than : "", method : "",
				url : "", expectedStatuscode : "", expectedData : ""};
	routesDao.getBySource(route.source, function(error, data){
		if(data == null || data._id == route._id){
			routesDao.findById(route._id, function(error, oldRoute){
				oldRoute1 = oldRoute;
				var targetsMap = {};
				var updatedTargets = route.targets;
				for(var i=0; i< updatedTargets.length; i++){
					targetsMap[updatedTargets[i].id] = updatedTargets[i];
				}
				var oldTargets = oldRoute.targets;
				for(var j=0; j<oldTargets.length; j++){
					if(!targetsMap[oldTargets[j].id]){
						targetsToRemove.push(oldTargets[j]);
					}
				}

				var targets = route.targets;
				async.eachSeries(targets, function(target, done){
					if(target.id){
						targetsDao.findById(target.id, function(error, data){
							if(data == null){
								var targetToSave = {host : target.host, port : target.port, source : route.source, config : config, state : {}};
								targetsDao.save(targetToSave, function(error, data){
									if(error){
										done("Error");
									} else {
										var status = "";
										if(data[0].state.status){
											status = data[0].state.status;
										}
										routesTargets.push({host : data[0].host, port : data[0].port, id : data[0]._id, status : status});
										done(null);
									}
								});
							} else {
								data.host = target.host;
								data.port = target.port;
								data.source = route.source;
								targetsDao.update({_id : data._id}, data, function(error, result){
									if(error){
										done("Error");
									} else {
										var status = "";
										if(data.state.status){
											status = data.state.status;
										}
										routesTargets.push({host : data.host, port : data.port, id : data._id, status : status});
										done(null);
									}
								});
							}
						});
					} else {
						var targetToSave = {host : target.host, port : target.port, source:route.source, config : config, state : {}};
						targetsDao.save(targetToSave, function(error, data){
							if(error){
								done("Error");
							} else {
								var status = "";
								if(data[0].state.status){
									status = data[0].state.status;
								}
								routesTargets.push({host : data[0].host, port : data[0].port, id : data[0]._id, status : status});
								done(null);
							}
						});
					}
				}, function(err){
					if(err){
						res.send(err);
					} else {
						route.targets = routesTargets;
						routesDao.update({
							_id : route._id
						}, route, function(error, result) {
							if(error){
								res.send("Error");
							} else {
								async.eachSeries(targetsToRemove, function(targetToRemove, done){
									targetsDao.deleteById(targetToRemove.id, function(error, data){
										if(error){
											done("Error");
										} else {
											done(null);
										}
									});
								}, function(err){
									if(err){
										res.send(err);
									} else {
										var options = {oldSource : oldRoute1.source, newSource : route.source};
										startServer(options);
										res.send({id : result});
									}
								});
							}
						});
					}
				});	
			});

		} else {
			res.send("Route with source : "+ route.source +" already exists");
		}
	});
}

function startServer(options){
	if(options.oldSource){
		var oldServer = runningServers[options.oldSource];
		if(oldServer){
			oldServer.close();
		}
	}
	
	if(options.newSource){
		if(/^\d+$/.test(options.newSource)){
			var server = http.createServer(portForward);
			server.listen(options.newSource, config.app.hostname);
			runningServers[options.newSource] = server;
		}
	}
}

function portForward(req, res){
	var host = {host : config.http.hostname, port : config.http.port};
	proxy.proxyRequest(req, res, host);
}


function testPort(host, port, callback) {
	  http.get({
		  host: host, 
		  port: port 
	  }, function(res) {
		  callback("success", res); 
	  }).on("error", function(e) {
		  callback("failure", e);
	  });
}