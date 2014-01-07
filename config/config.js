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
		hostname : '0.0.0.0',
		port : 3333,
	},
	
	//proxy
	http : {
		hostname : '0.0.0.0',
		port : 80,
	},
	// https : {
	//	hostname : 'localhost',
	//	port : 443,
	//	keyPath : '/opt/bbytes/proxy-etc/config/keys/errzero.private.pem',
	//	certPath : '/opt/bbytes/proxy-etc/config/keys/errzero.public.pem'
	// },
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
