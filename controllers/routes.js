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
				res.send({error : "Port "+route.source+" is already in use or not existed"});
			}
		});
	} else {
		saveRoute(req, res, route);
	}
};

exports.update = function(req, res) {
	var route = req.body.route;
	routesDao.getBySource(route.source, function(error, data){
		if(data == null || data._id == route._id){
			routesDao.findById(route._id, function(error, oldRoute){
				if(route.source && oldRoute.source != route.source && /^\d+$/.test(route.source)){
					testPort(config.app.hostname, route.source, function(result, data){
						if(result == "failure"){
							updateRoute(req, res, route, oldRoute);
						} else if(result == "success"){
							res.send({error : "Port "+route.source+" is already in use or not existed"});
						}
					});
				} else {
					updateRoute(req, res, route, oldRoute);
				}
			});
		} else {
			res.send({error : "Route with source : "+ route.source +" already exists"});
		}
	});
};

exports.updateTarget = function(req, res){
	var source = req.body.source;
	var oldTarget = req.body.oldTarget;
	var newTarget = req.body.newTarget;
	
	if(oldTarget != null && newTarget != null && oldTarget.indexOf(":") > -1 && newTarget.indexOf(":") > -1){
		var oldTargetHostAndPort = oldTarget.split(":");
		var newTargetHostAndPort = newTarget.split(":");
		if(oldTargetHostAndPort != null && newTargetHostAndPort != null){
			routesDao.getBySource(source, function(error, oldRoute){
				if(oldRoute != null){
					var route = oldRoute;
					var targets = route.targets;
					for(var i=0; i<targets.length; i++){
						if(targets[i].host == oldTargetHostAndPort[0] && targets[i].port == oldTargetHostAndPort[1]){
							targets[i].host = newTargetHostAndPort[0];
							targets[i].port = newTargetHostAndPort[1];
							route.targets = targets;
							break;
						}
					}
					updateRoute(req, res, route, oldRoute);
				} else {
					res.send({error : "Route with source : "+ source +" not exists"});
				}
			});
		}
	} else {
		res.send({error : "parameter passed are incorrect"});
	}
};

exports.add = function(req, res){
	var source = req.body.source;
	var target = req.body.target;
	
	if(source && target != null && target.indexOf(":") > -1){
		var targetHostAndPort = target.split(":");
		if(targetHostAndPort != null){
			routesDao.getBySource(source, function(error, oldRoute){
				if(oldRoute != null){
					var route = oldRoute;
					var targets = route.targets;
					var existed = false;
					for(var i=0; i<targets.length; i++){
						if(targets[i].host == targetHostAndPort[0] && targets[i].port == targetHostAndPort[1]){
							existed = true;
						}
					}
					if(!existed){
						targets.push({"host" : targetHostAndPort[0], "port" : targetHostAndPort[1]});
						route.targets = targets;
						updateRoute(req, res, route, oldRoute);
					} else {
						res.send({error : "Target is already existed"});
					}
					
				} else {
					var route = {source : source, sessionType : "Non Sticky", targets : [{host : targetHostAndPort[0], port : targetHostAndPort[1]}]};
					if(route.source && /^\d+$/.test(route.source)){
						testPort(config.app.hostname, route.source, function(result, data){
							if(result == "failure"){
								saveRoute(req, res, route);
							} else if(result == "success"){
								res.send({error : "Port "+route.source+" is already in use or not existed"});
							}
						});
					} else {
						saveRoute(req, res, route);
					}
				}
			});
		}
	} else {
		res.send({error : "parameter passed are incorrect"});
	}
};

exports.deleteTarget = function(req, res){
	var source = req.body.source;
	var target = req.body.target;
	
	if(target != null && target.indexOf(":") > -1 ){
		var targetHostAndPort = target.split(":");
		if(targetHostAndPort != null){
			routesDao.getBySource(source, function(error, result){
				var oldRoute = result;
				if(oldRoute != null){
					var targets = oldRoute.targets;
					var newTargets = [];
					for(var i=0; i<targets.length; i++){
						if(!(targets[i].host == targetHostAndPort[0] && targets[i].port == targetHostAndPort[1])){
							newTargets.push(targets[i]);
						}
					}
					var route = {source : "", targets : [], sessionType : ""};
					route.source = oldRoute.source;
					route.targets = targets;
					route.sessionType = oldRoute.sessionType;
					
					oldRoute.targets = newTargets;
					updateRoute(req, res, oldRoute, route);
				} else {
					res.send({error : "Route with source : "+ source +" not exists"});
				}
			});
		}
	} else {
		res.send({error : "parameter passed are incorrect"});
	}
};


exports.deleteRoute = function(req, res){
	routesDao.findById(req.body.id, function(error, result){
		if(result){
			routesDao.deleteById(req.body.id, function(error, deletedData) {
				if(error || deletedData == 0){
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
							res.send({id : deletedData});
						}
					});
				}
			});
		}
	});
};

exports.deleteRouteBySource = function(req, res){
	var source = req.body.source;
	if(source != null){
		routesDao.findBySource(source, function(error, result){
			if(result){
				routesDao.deleteById(result._id, function(error, deletedData) {
					if(error || deletedData == 0){
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
								res.send({id : deletedData});
							}
						});
					}
				});
			} else {
				res.send({error : "Source with name " + source + " not existed"});
			}
		});
	} else {
		res.send({error : "parameter passed is incorrect"});
	}
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
								res.send({id : data[0]._id});
							}
						});
					}
				});
			} else {
				res.send({error : "Route with source : "+ route.source +" already exists"});
			}
		});
}

function updateRoute(req, res, route, oldRoute){
	var oldRoute1 = oldRoute;
	var targetsToRemove = [];
	var routesTargets = [];
	
	var config = {enabled : false, ping_service : "", timeout : "", ping_interval : "",
			alert_to : "", warning_if_takes_more_than : "", method : "",
				url : "", expectedStatuscode : "", expectedData : ""};
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