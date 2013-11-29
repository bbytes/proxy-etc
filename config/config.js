/**
 * Configuration for application
 */

module.exports = {
	development : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc',
			port : 3000
		},
		credentials : {
			username : "admin",
			password : "admin"
		}
	},
	test : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc',
			port : 3000
		},
		credentials : {
			username : "admin",
			password : "admin"
		}
	},
	production : {}
};
