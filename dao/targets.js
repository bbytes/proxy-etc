/*
 * Dao for routes
 */

var jf = require('jsonfile');
var collection = null;
var targetsJson = {};

exports.init = function(db) {
	collection = db.collection("targets");
};

var updateTargetsJson = function() {
	collection.find().toArray(function(error, result) {
		var targets = [];
		if (result && result != null) {
			for(var i=0; i<result.length; i++){
				targets.push({host : result[i].host, port : result[i].port, source : result[i].source, id : result[i]._id, enabled : result[i].config.enabled});
			}
			targetsJson = {targets : targets};
			jf.writeFile("./config/targets.json", targetsJson, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file is saved!");
			    }
			}); 
		}
	});
};

exports.updateJson = function(){
	collection.find().toArray(function(error, result) {
		var targets = [];
		if (result && result != null) {
			for(var i=0; i<result.length; i++){
				targets.push({host : result[i].host, port : result[i].port, source : result[i].source, id : result[i]._id, enabled : result[i].config.enabled});
			}
			targetsJson = {targets : targets};
			jf.writeFile("./config/targets.json", targetsJson, function(err) {
			    if(err) {
			        console.log(err);
			    } else {
			        console.log("The file is saved!");
			    }
			}); 
		}
	});
};

exports.getTargetsJson = function(){
	return targetsJson;
};

exports.setRoute = function(key, route){
	targetsJson[key] = route;
};

exports.save = function(jsonData, callback) {
	collection.insert([ jsonData ], function(error, result) {
		if (!error) {
			updateTargetsJson();
		}
		callback(error, result);
	});
};

exports.update = function(query, jsonData, callback) {
	collection.update(query, jsonData, function(error, result) {
		if (!error) {
			updateTargetsJson();
		}
		callback(error, result);
	});
};

exports.updateState = function(query, jsonData, callback) {
	collection.update(query, jsonData, function(error, result) {
		if (!error) {
		}
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

exports.findOne = function(json, callback) {
	collection.findOne(json, function(error, result) {
		callback(error, result);
	});
};

exports.deleteById = function(id, callback) {
	collection.remove({
		_id : id
	}, function(error, result) {
		if (!error) {
			updateTargetsJson();
		}
		callback(error, result);
	});
};