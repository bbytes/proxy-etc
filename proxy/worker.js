/**
 * Worker
 */

var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    memoryMonitor = require('./memorymonitor'),
    revproxy = require('./revproxy'),
    config = require('../config/config');

// Ignore SIGUSR
process.on('SIGUSR1', function () {});
process.on('SIGUSR2', function () {});


function Worker() {
    if (!(this instanceof Worker)) {
        return new Worker();
    }
    revproxy.init();
    this.runServer();
}

Worker.prototype.runServer = function () {
	var options = {};
	if(config.memoryMonitor.memoryLimit){
		options['memoryLimit'] = config.memoryMonitor.memoryLimit;
	}
	if(config.memoryMonitor.gracefulWait){
		options['gracefulWait'] = config.memoryMonitor.gracefulWait;
	}
	if(config.memoryMonitor.checkInterval){
		options['checkInterval'] = config.memoryMonitor.checkInterval;
	}
	
    var monitor = memoryMonitor(options);

    // The handler configure the client socket for every new connection
    var tcpConnectionHandler = function (connection) {
        var remoteAddress = connection.remoteAddress,
            remotePort = connection.remotePort,
            start = Date.now();

        var getSocketInfo = function () {
            return JSON.stringify({
                remoteAddress: remoteAddress,
                remotePort: remotePort,
                bytesWritten: connection._bytesDispatched,
                bytesRead: connection.bytesRead,
                elapsed: (Date.now() - start) / 1000
            });
        };

        connection.setKeepAlive(false);
        connection.setTimeout(config.tcpTimeout * 1000);
        connection.on('error', function (error) {
        	console.log('TCP error from ' + getSocketInfo() + '; Error: ' + JSON.stringify(error));
        });
        connection.on('timeout', function () {
            console.log('TCP timeout from ' + getSocketInfo());
            connection.destroy();
        });
    };

    //Http
    if (config.http) {
            var httpServer = http.createServer(revproxy.forwardRequest);
            //httpServer.on('connection', tcpConnectionHandler);
            httpServer.on('upgrade', revproxy.forwardWSRequest);
            httpServer.listen(config.http.port, config.http.hostname);
            monitor.addServer(httpServer);
    }
    
    //Https
    if (config.https) {     
    	var pk = fs.readFileSync(config.https.keyPath);
    	var pc = fs.readFileSync(config.https.certPath);
    	var options = { key: pk, cert: pc };
    	
        var httpsServer =  https.createServer(options, revproxy.forwardRequest);
        //httpServer.on('connection', tcpConnectionHandler);
        httpsServer.on('upgrade', revproxy.forwardWSRequest);
        httpsServer.listen(config.https.port, config.https.hostname);
        monitor.addServer(httpsServer);
    }
};

module.exports = Worker;