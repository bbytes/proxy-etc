app.service('httpService', function($http, $location, $rootScope) {
	this.postRequest = function(url, data, contentType, callback) {
		$http({
			method : 'POST',
			url : url,
			data : data,
			headers : {
				'Content-Type' : contentType
			}
		}).success(function(data) {
			callback(data);
		}).error(function(data, status, headers, config) {
			$rootScope.status = status;
			$rootScope.data = data;
			//$location.path("/error");
		});
	};

	this.getRequest = function(url, callback) {
		$http({
			method : 'GET',
			url : url
		}).success(function(data) {
			callback(data);
		}).error(function(data, status) {
			$rootScope.status = status;
			$rootScope.data = data;
			//$location.path("/error");
		});
	};
});
