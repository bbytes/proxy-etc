/*
 * Routes controller
 */

var targetsDao = require("../dao/targets");

exports.init = function(db) {
	targetsDao.init(db);
};
/*
exports.save = function(req, res) {
	
};

exports.deleteTarget = function(req, res){
	
};

exports.update = function(req, res) {
	
};*/

exports.updateTargetConfig = function(req, res){
	var config = req.body.config;
	var id = req.body.id;
	targetsDao.findById(id, function(error, target){
		if(target){
			target.config = config;
			targetsDao.update({_id : id}, target, function(error, data){
				if(error){
					res.send("");
				} else {
					res.send({id : data});
				}
			});
		}
	});
};

exports.changeEnabled = function(req, res){
	var changeEnabled = req.body.changeEnabled;
	var id = req.body.id;
	targetsDao.findById(id, function(error, target){
		if(target){
			if(changeEnabled == true){
				target.config.enabled = true;
			} else if (changeEnabled == false){
				target.config.enabled = false;
			}
			targetsDao.update({_id : id}, target, function(error, data){
				if(error){
					res.send("");
				} else {
					res.send({id : data});
				}
			});
		}
	});
};


exports.getAllTargets = function(req, res) {
	targetsDao.getAll(function(error, data) {
		if(error){
			res.send("");
		} else {
			res.send(data);
		}
	});
};
