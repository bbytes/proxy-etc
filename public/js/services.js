app.service('login', function(httpService) {
	this.authenticate = function(data, callback) {
		httpService.postRequest('authenticate', data, 'application/x-www-form-urlencoded', callback);
	};
	
	this.isAuthenticated = function(callback){
		httpService.getRequest('isAuthenticated', callback);
	};
});

app.service('logout', function(httpService) {
	this.logout = function(callback) {
		httpService.getRequest('logout', callback);
	};
});

app.service('route', function(httpService) {
	this.getAllRoutes = function(callback) {
		httpService.getRequest('routes/allRoutes', callback);
	};
	
	this.save = function(data, callback) {
		httpService.postRequest('routes/save', data, 'application/json', callback);
	};
	
	this.update = function(data, callback) {
		httpService.postRequest('routes/update', data, 'application/json', callback);
	};
	
	this.deleteRoute = function(data, callback) {
		httpService.postRequest('routes/delete', data, 'application/x-www-form-urlencoded', callback);
	};
});

app.service('target', function(httpService) {
	this.getAllTargets = function(callback) {
		httpService.getRequest('target/allTargets', callback);
	};
	this.updateTargetConfig = function(data, callback){
		httpService.postRequest('target/updateConfig', data, 'application/json', callback);
	};
	this.changeEnabled = function(data, callback){
		httpService.postRequest('target/changeEnabled', data, 'application/json', callback);
	};
});