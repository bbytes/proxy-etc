/**
 * Configuration for application
 */

module.exports = {
	environment : 'development',
	development : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc',
			hostname : 'localhost'
		},
		http : {
			port : 80,
		},
/*		https : {
			port : 443,
			keyPath : './config/keys/4946453_localhost.key',
			certPath : './config/keys/4946453_localhost.cert'
		},*/
		credentials : {
			username : "admin",
			password : "admin"
		}
	},
	test : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc',
			hostname : 'localhost'
		},
		http : {
			port : 80,
		},
/*		https : {
			port : 443,
			keyPath : './config/keys/4946453_localhost.key',
			certPath : './config/keys/4946453_localhost.cert'
		},*/
		credentials : {
			username : "admin",
			password : "admin"
		}
	},
	production : {}
};