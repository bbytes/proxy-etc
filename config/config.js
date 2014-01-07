/**
 * Configuration for application
 */

module.exports = {
	dbPath : '/opt/bbytes/proxy-etc/data',
	maxSockets : 500,
	//workers : 4,
	tcpTimeout : 90,
	httpKeepAlive : true,
	//UI
	app : {
		name : 'proxy-etc',
		hostname : 'localhost',
		port : 3333,
	},
	
	//proxy
	http : {
		hostname : 'localhost',
		port : 80,
	},
	https : {
		hostname : 'localhost',
		port : 443,
		keyPath : './config/keys/errzero.private.pem',
		certPath : './config/keys/errzero.public.pem'
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
