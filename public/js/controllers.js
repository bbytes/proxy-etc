function loginController($scope, $location, login) {
	$scope.username = "";
	$scope.password = "";
	$scope.login = function() {
		$scope.username = $("#username").val();
		$scope.password = $("#password").val();
		
		var data = "username=" + $scope.username + "&password="
				+ $scope.password;
		login.authenticate(data, function(data) {
			if (data == "success") {
				$location.path("/home");
			}
		});
		return false;
	};
}

function homeController($scope, $location, route, $rootScope) {
	$scope.routes = null;
	$scope.selectedRoute = null;
	$scope.action = "";

	$scope.getAllRoutes = function(){
		route.getAllRoutes(function(data) {
			$scope.routes = data;
		});
	};

	$scope.getAllRoutes();

	$scope.openModal = function(route, action) {
		if(route == null){
			$scope.selectedRoute = {source : "", targets : [{host : "", port : ""}], sessionType : "Sticky"};
		} else {
			$scope.selectedRoute = route;
		}
		$scope.action = action;
	};
	
	$scope.addRemoveTarget = function(index){
		if(index == 0){
			$scope.selectedRoute.targets.push({host : "", port : ""});
		} else {
			$scope.selectedRoute.targets.splice(index, 1);
		}
	};

	$scope.saveRoute = function() {
		var data = {route : $scope.selectedRoute};
		if ($scope.action == "add") {
			$scope.action = "";
			route.save(data, function(data) {
				if(data.error){
					$rootScope.message = data.error;
				}
				$scope.getAllRoutes();
			});
		} else if ($scope.action == "edit") {
			$scope.action = "";
			route.update(data, function(data) {
				if(data.error){
					$rootScope.message = data.error;
				}
				$scope.getAllRoutes();
			});
		}
	};
	
	$scope.cancelSave = function(){
		$scope.getAllRoutes();
	};
	
	$scope.deleteRouteId = null;
	$scope.deleteRoute = function(){
		var data = "id=" + $scope.deleteRouteId;
		route.deleteRoute(data, function(data) {
			$scope.deleteRouteId = null;
			$scope.getAllRoutes();
		});
	};
	
	$scope.deleteRouteModal = function(id){
		$scope.deleteRouteId = id;
	};
}

function logoutController($scope, $rootScope, logout, $location) {
	$scope.logout = function() {
		logout.logout(function(data) {
			if (data == "success") {
				$rootScope.isLoggedIn = false;
				$rootScope.loggedInUser = null;
				$location.path("/login");
			}
		});
	};
}

function targetsController($scope, $rootScope, target, $timeout){
	$scope.targets = [];
	var getAllTargets = function(){
		target.getAllTargets(function(data) {
			$scope.targets = data;
		});
	};
	
	getAllTargets();
	
	var refresh = function(){
	    $timeout(function(){
			target.getAllTargets(function(data) {
				$scope.targets = data;
			});
	    }, 10000);
	};
	refresh();

	$scope.openModal = function(target){
		$scope.selectedTarget = target;
		$scope.config = target.config;
	};
	
	$scope.updateTargetConfig = function(){
		var data = {config : $scope.config, id : $scope.selectedTarget._id};
		target.updateTargetConfig(data, function(data){
			getAllTargets();
		});
	};
	
	$scope.changeEnabled = function(targetId, enabled){
		var data = {id: targetId, changeEnabled : ''};
		if(enabled == 'true'){
			data = {id: targetId, changeEnabled : true};
		} else if('false'){
			data = {id: targetId, changeEnabled : false};
		}
		target.changeEnabled(data, function(data){
			getAllTargets();
		});
	};
}

function errorController($scope, $http, $location, $rootScope) {
	$scope.status = $rootScope.status;
	$rootScope.status = "";
	$scope.data = $rootScope.data;
	$rootScope.data = "";
	$scope.message = "";

	switch ($scope.status) {
	case 404:
		$scope.message = "Not found 404 ";
		break;
	case 500:
		$scope.message = "Internal Error 500";
		break;
	case 400:
		$scope.message = "Bad request 400";
		break;
	case 401:
		$scope.message = "401 Unauthorized";
		break;
	default:
		$scope.message = "Error";
	}
}
