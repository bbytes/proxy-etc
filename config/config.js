

module.exports = {
	development : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc'
		},
		credentials : {
			username : "admin",
			password : "admin"
		}
	},
	test : {
		dbPath : 'C://tingoDB//data',
		app : {
			name : 'proxy-etc'
		},
		credentials : {
			username : "proxy",
			password : "proxy"
		}
	},
	production : {}
};
