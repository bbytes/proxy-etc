/*
 * Dao for routes
 */

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
				var key = result[i].prefix;
				routesJson[key] = result[i];
			}
		}
	});
};

exports.getRoutesJson = function(){
	return routesJson;
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
exports.getByPrefix = function(prefix, callback) {
	collection.findOne({
		prefix : prefix
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