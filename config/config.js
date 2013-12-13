/**
 * Configuration for application
 */

module.exports = {
	dbPath : 'C://tingoDB//data',
	maxSockets : 100,
	workers : 4,
	tcpTimeout : 90,
	httpKeepAlive : true,
	//UI
	app : {
		name : 'proxy-etc',
		hostname : 'localhost',
		port : 3000,
	},
	
	//proxy
	http : {
		hostname : 'localhost',
		port : 80,
	},
	https : {
		hostname : 'localhost',
		port : 443,
		keyPath : './config/keys/4946453_localhost.key',
		certPath : './config/keys/4946453_localhost.cert'
	},
	memoryMonitor : {
		memoryLimit : 100, //MBs
		gracefulWait : 30, //seconds
		checkInterval : 60 //seconds
	},
	credentials : {
		username : "admin",
		password : "admin"
	}
};