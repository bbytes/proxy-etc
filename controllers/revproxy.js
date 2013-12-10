/*
 * Reverse Proxy controller
 */

var httpProxy = require("http-proxy");
var proxy = new httpProxy.RoutingProxy();
var routesDao = require("../dao/routes");
var configObj = require('../config/config'), config = configObj[configObj.environment];

exports.init = function(db) {
	routesDao.init(db);
};

exports.forward = function(req, res, next) {
	var url = decodeURI(req.url).toLowerCase(), host = null, route = null, key = null;
	var prefix = url.split("/")[1];
	var hostname = req.headers.host.split(':')[0];
	/*
	 * var subDomainName = req.headers.host.split('.')[0]; if(prefix == null ||
	 * prefix == ""){ if(subDomainName != null && subDomainName != "" &&
	 * subDomainName != "www"){ url = "/" + subDomainName + url; req.url = url; } }
	 */

	var routesJson = routesDao.getRoutesJson();
	if (routesJson != null) {
		route = routesJson[hostname];
		key = hostname;
		if (route == null) {
			key = hostname + "/" + prefix;
			route = routesJson[key];
		}
		if (route == null) {
			key = prefix;
			route = routesJson[key];
		}
		if (route == null) {
			key = "/" + prefix;
			route = routesJson[key];
		}

		if (route != null && route.source == config.app.hostname) {
			route = null;
		}

	}

	if (!route) {
		console.log("No routes found");
		next();
	} else {
		var target = null;
		if (route.targets.length > 1) {
			var cookie = req.headers.cookie;
			if (route.sessionType == "Non Sticky" || cookie == undefined) {
				target = route.targets[0];
				host = {
					host : target.host,
					port : target.port
				};

				route.targets.splice(0, 1);
				route.targets.push(target);
				routesJson[key] = route;
				routesDao.setRoute(key, route);

				if (route.sessionType == "Sticky") {
					res.setHeader('Set-Cookie', "SERVERID=" + host.host + ":"
							+ host.port);
					res.setHeader('Cache-Control', 'nocache');
				}
			} else if (route.sessionType == "Sticky") {
				var serverId = req.cookies['SERVERID'];
				var values = serverId.split(":");
				var persistedHost = values[0];
				var persistedPort = values[1];
				host = {
					host : persistedHost,
					port : persistedPort
				};
			}
		} else {
			target = route.targets[0];
			host = {
				host : target.host,
				port : target.port
			};
		}
		console.log("proxy------" + "host : " + host.host + ", port : " + host.port);
		req.host = Object.create(host);
		res.setHeader("x-served-by", "http://" + host.host + ":" + host.port);
		proxy.proxyRequest(req, res, host);
	}

};
