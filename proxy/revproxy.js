/*
 * Reverse Proxy
 */

var config = require('../config/config');
var collection = require('strong-store-cluster').collection('routes');
var fs = require('fs');
var httpProxy = require("http-proxy");
var proxy = new httpProxy.RoutingProxy();
var routesJson = {};

exports.init = function() {
    if (config.httpKeepAlive !== true) {
        // Disable the http Agent of the http-proxy library so we force
        // the proxy to close the connection after each request to the backend
        httpProxy._getAgent = function () {
            return false;
        };
    }
    httpProxy.setMaxSockets(config.maxSockets);
	
    function readRoutesJson(){
        fs.readFile("./config/routes.json", function (err, data) {
            if (err) {
          	  console.error("Error reading file");
            }
            routesJson = JSON.parse(data);
         });
    }
    readRoutesJson();
    fs.watchFile("./config/routes.json", function () {
    	readRoutesJson();
    });
};

exports.forwardRequest = function(req, res) {
	var route = getRoute(req);
	if (!route) {
		console.log("No routes found");
	} else {
		var target = null;
		if (route.targets.length > 1) {
			var cookie = req.headers.cookie;
			if (route.sessionType == "Non Sticky" || cookie == undefined) {

				collection.get(route.source, function(err, routeData) {
					if (err) {
						console.error('There was an error in collection.get.');
					} else {
						route = routeData;
					}
					target = route.targets[0];

					route.targets.splice(0, 1);
					route.targets.push(target);
					routesJson[route.source] = route;

					if (route.sessionType == "Sticky") {
						res.setHeader('Set-Cookie', "SERVERID=" + target.host
								+ ":" + target.port);
						res.setHeader('Cache-Control', 'nocache');
					}

					collection.set(route.source, route, function(err) {
						if (err) {
							console.error('There was an error');
						}
						proxyRequest(req, res, target);
					});
				});
			} else if (route.sessionType == "Sticky") {
				var cookieJson = parseCookies(req);
				var serverId = cookieJson['SERVERID'];
				var values = serverId.split(":");
				var persistedHost = values[0];
				var persistedPort = values[1];
				var target = {
					host : persistedHost,
					port : persistedPort
				};
				proxyRequest(req, res, target);
			}
		} else {
			var target = route.targets[0];
			proxyRequest(req, res, target);
		}
	}
};

function proxyRequest(req, res, target) {
	var host = {
			host : target.host,
			port : target.port
		};
	//console.log("proxy------" + "host : " + host.host + ", port : " + host.port);
	req.host = Object.create(host);
	res.setHeader("x-served-by", "http://" + host.host + ":" + host.port);
	proxy.proxyRequest(req, res, host);
    // TODO proxy.on('proxyError', proxyErrorHandler);
    // TODO proxy.on('start', startHandler);
}

function getRoute(req){
	var url = decodeURI(req.url).toLowerCase(), route = null;
	var prefix = url.split("/")[1];
	var hostname = req.headers.host.split(':')[0];

	if (routesJson != null) {
		route = routesJson[hostname];
		key = hostname;
		if (route == null) {
			route = routesJson[hostname + "/" + prefix];
		}
		if (route == null) {
			route = routesJson[prefix];
		}
		if (route == null) {
			route = routesJson["/" + prefix];
		}
	}
	return route;
}

function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = unescape(parts.join('='));
    });

    return list;
}

exports.forwardWSRequest = function(req, socket, head){
	var route = getRoute(req);
	if (!route) {
		console.log("No routes found");
	} else {
		var target = null;
		if (route.targets.length > 1) {
				collection.get(route.source, function(err, routeData) {
					if (err) {
						console.error('There was an error in collection.get.');
					} else {
						route = routeData;
					}
					target = route.targets[0];

					route.targets.splice(0, 1);
					route.targets.push(target);
					routesJson[key] = route;

					collection.set(route.source, route, function(err) {
						if (err) {
							console.error('There was an error in collection.set');
						}
						proxyWSRequest(req, socket, head, target);
					});
				});

		} else {
			target = route.targets[0];
			proxyWSRequest(req, socket, head, target);
		}
	}
};

function proxyWSRequest(req, socket, head, host) {
	//console.log("proxy ws------" + "host : " + host.host + ", port : " + host.port);
	req.host = Object.create(host);
	res.setHeader("x-served-by", "http://" + host.host + ":" + host.port);
	
    var proxy = new httpProxy.HttpProxy({
        target: {
            host: backend.hostname,
            port: backend.port
        }
    });
    proxy.proxyWebSocketRequest(req, socket, head);
}


function startHandler(req, res) {
    var remoteAddr = getRemoteAddress(req);

    // TCP timeout to 30 sec
    req.connection.setTimeout(config.tcpTimeout * 1000);
    // Make sure the listener won't be set again on retry
    if (req.connection.listeners('timeout').length < 2) {
        req.connection.once('timeout', function () {
            req.error = 'TCP timeout';
        });
    }

    // Set forwarded headers
    if (remoteAddr === null) {
        return errorMessage(res, 'Cannot read the remote address.');
    }
    if (remoteAddr.slice(0, 2) !== '::') {
        remoteAddr = '::ffff:' + remoteAddr;
    }
    // Play nicely when behind other proxies
    if (req.headers['x-forwarded-for'] === undefined) {
        req.headers['x-forwarded-for'] = remoteAddr;
    }
    if (req.headers['x-real-ip'] === undefined) {
        req.headers['x-real-ip'] = remoteAddr;
    }
    if (req.headers['x-forwarded-protocol'] === undefined) {
        req.headers['x-forwarded-protocol'] = req.connection.pair ? 'https' : 'http';
    }
    if (req.headers['x-forwarded-proto'] === undefined) {
        req.headers['x-forwarded-proto'] = req.connection.pair ? 'https' : 'http';
    }
    if (req.headers['x-forwarded-port'] === undefined) {
        // FIXME: replace by the real port instead of hardcoding it
        req.headers['x-forwarded-port'] = req.connection.pair ? '443' : '80';
    }
};

function getRemoteAddress(req) {
    if (req.connection === undefined) {
        return null;
    }
    if (req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
    if (req.connection.socket && req.connection.socket.remoteAddress) {
        return req.connection.socket.remoteAddress;
    }
    return null;
};