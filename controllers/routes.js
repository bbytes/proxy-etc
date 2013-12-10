/*
 * Routes controller
 */

var routesDao = require("../dao/routes");

exports.init = function(db) {
	routesDao.init(db);
};

exports.save = function(req, res) {
	var route = req.body.route;
	var jsonData = {
		source : route.source,
		targets : route.targets,
		sessionType : route.sessionType
	};
	routesDao.getBySource(route.source, function(error, data){
		if(data == null){
			routesDao.save(jsonData, function(error, data) {
				if(error){
					res.send("Error");
				} else {
					res.send(data);
				}
			});
		} else {
			res.send("Route with source : "+ route.source +" already exists");
		}
	});
};

exports.deleteRoute = function(req, res){
	routesDao.deleteById(req.body.id, function(error, data) {
		if(error){
			res.send("Error");
		} else {
			res.send({id : data});
		}
	});
};

exports.update = function(req, res) {
	var route = req.body.route;
	routesDao.getBySource(route.source, function(error, data){
		if(data == null || data._id == route._id){
			routesDao.update({
				_id : route._id
			}, route, function(error, result) {
				if(error){
					res.send("Error");
				} else {
					res.send({id : data});
				}
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
