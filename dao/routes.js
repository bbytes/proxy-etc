/*
 * Dao for routes
 */

var jf = require('jsonfile');
var collection = null;
var routesJson = {};

exports.init = function(db) {
	collection = db.collection("routes");
	updateRoutesJson();
};

var updateRoutesJson = function() {
	collection.find().toArray(function(error, result) {
		routesJson = {};
		if (result != null) {
			for ( var i = 0; i < result.length; i++) {
				var key = result[i].source;
				routesJson[key] = result[i];
			}
			
			jf.writeFile("./config/routes.json", routesJson, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file is saved!");
			    }
			}); 
		}
	});
};

exports.getRoutesJson = function(){
	return routesJson;
};

exports.setRoute = function(key, route){
	routesJson[key] = route;
};

exports.save = function(jsonData, callback) {
	collection.insert([ jsonData ], function(error, result) {
		if (!error) {
			updateRoutesJson();
		}
		callback(error, result);
	});
};

exports.update = function(query, jsonData, callback) {
	collection.update(query, jsonData, function(error, result) {
		if (!error) {
			updateRoutesJson();
		}
		callback(error, result);
	});
};

exports.getAll = function(callback) {
	collection.find().toArray(function(error, result) {
		callback(error, result);
	});
};
exports.getBySource = function(source, callback) {
	collection.findOne({
		source : source
	}, function(error, result) {
		callback(error, result);
	});
};
exports.deleteById = function(id, callback) {
	collection.remove({
		_id : id
	}, function(error, result) {
		if (!error) {
			updateRoutesJson();
		}
		callback(error, result);
	});
};