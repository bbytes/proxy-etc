/*
 * Dao for routes
 */

var collection = null;
exports.init = function(db) {
	collection = db.collection("routes");
};

exports.save = function(jsonData, callback) {
	collection.insert([ jsonData ], function(error, result) {
		callback(error, result);
	});
};

exports.update = function(query, jsonData, callback) {
	collection.update(query, jsonData, function(error, result) {
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
		callback(error, result);
	});
};