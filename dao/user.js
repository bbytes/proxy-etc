/*
 * Dao for routes
 */

var collection = null;
exports.init = function(db) {
	collection = db.collection("user");
};

exports.save = function(jsonData, callback) {
	collection.insert([ jsonData ], function(error, result) {
		callback(error, result);
	});
};
exports.getAll = function(callback) {
	collection.find().toArray(function(error, result) {
		callback(error, result);
	});
};
exports.findById = function(id, callback) {
	collection.findOne({
		_id : id
	}, function(error, result) {
		callback(error, result);
	});
};
exports.findByRole = function(role, callback) {
	collection.findOne({
		role : role
	}, function(error, result) {
		callback(error, result);
	});
};
exports.findOne = function(json, callback) {
	collection.findOne(json, function(error, result) {
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

exports.deleteAll = function(callback) {
	collection.remove({}, function(error, result) {
		callback(error, result);
	});
};

exports.update = function(query, jsonData, callback) {
	collection.update(query, jsonData, function(error, result) {
		callback(error, result);
	});
};