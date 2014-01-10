/*
 * Routes controller
 */

var routesDao = require("../dao/routes");
var targetsDao = require("../dao/targets");
var async = require('async'); 

exports.init = function(db) {
	routesDao.init(db);
	targetsDao.init(db);
};

exports.save = function(req, res) {
	var route = req.body.route;
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
						jsonData.targets.push({host : data[0].host, port : data[0].port, id : data[0]._id});
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
							res.send({route : data[0]});
						}
					});
				}
			});
		} else {
			res.send("Route with source : "+ route.source +" already exists");
		}
	});
};

exports.deleteRoute = function(req, res){
	routesDao.findById(req.body.id, function(error, result){
		if(result){
			routesDao.deleteById(req.body.id, function(error, deletedData) {
				if(error){
					res.send("Error");
				} else {
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

exports.update = function(req, res) {
	var route = req.body.route;
	var targetsToRemove = [];
	var routesTargets = [];
	var config = {enabled : false, ping_service : "", timeout : "", ping_interval : "",
			alert_to : "", warning_if_takes_more_than : "", method : "",
				url : "", expectedStatuscode : "", expectedData : ""};
	routesDao.getBySource(route.source, function(error, data){
		if(data == null || data._id == route._id){
			routesDao.findById(route._id, function(error, oldRoute){
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
										routesTargets.push({host : data[0].host, port : data[0].port, id : data[0]._id});
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
										routesTargets.push({host : data.host, port : data.port, id : data._id});
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
								routesTargets.push({host : data[0].host, port : data[0].port, id : data[0]._id});
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
