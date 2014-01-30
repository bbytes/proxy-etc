var app = angular.module('app', [ 'ngResource' ]);

/**
 * Configuration for ng-view
 */
app.config([ "$routeProvider", function($routeProvider) {
	$routeProvider.when('/login', {
		templateUrl : 'login',
		controller : loginController
	}).when('/home', {
		templateUrl : 'home',
		controller : homeController,
		resolve : {
			loggedin : checkLoggedin
		}
	}).when('/targets', {
		templateUrl : 'target/targets',
		controller : targetsController,
		resolve : {
			loggedin : checkLoggedin
		}
	}).when('/error', {
		templateUrl : 'login/error',
		controller : errorController
	}).otherwise({
		redirectTo : '/login'
	});
} ]);

/**
 * It will execute when app is initialized
 */
app.run(function($rootScope) {
	$rootScope.isLoggedIn = false;
	$rootScope.message = "";
	
	$rootScope.closeAlert = function(){
		$rootScope.message = "";
	};
});

app.config([ "$httpProvider", function($httpProvider) {
	var interceptor = function($location, $q, $rootScope) {
		function success(response) {
			return response;
		}
		function error(response) {
			if (response.status === 401) {
				$rootScope.isLoggedIn = false;
				$location.path('/login');
				return $q.reject(response);
			} else {
				return $q.reject(response);
			}
		}
		return function(promise) {
			return promise.then(success, error);
		};
	};

	$httpProvider.responseInterceptors.push(interceptor);
} ]);

var checkLoggedin = function($q, $timeout, $http, $location, $rootScope) {
	var deferred = $q.defer();
	$http.get('/isAuthenticated').success(function(user) {
		if (user !== '0') {
			$rootScope.isLoggedIn = true;
			$rootScope.loggedInUser = user;
			$timeout(deferred.resolve, 0);
		} else {
			$rootScope.isLoggedIn = false;
			$rootScope.loggedInUser = null;
			$timeout(function() {
				deferred.reject();
			}, 0);
			$location.url('/login');
		}
	});
};
