/*
 * Reverse Proxy
 */

var httpProxy = require("http-proxy");
var proxy = new httpProxy.RoutingProxy();
var routesDao = require("../dao/routes");

var routesJson = {'errzero' : {prefix : 'errzero', host : 'localhost', port : 8080},
		'endure' : {prefix : 'endure', host : '203.196.144.235', port : 8089}};

exports.init = function(db){
	routesDao.init(db);
};

exports.forward = function(req, res, next) {
	var url = decodeURI(req.url).toLowerCase(), host = null;
	var prefix = url.split("/")[1];

	if (routesJson == null) {
		routesJson = {};
		routesDao.getAll(function(error, result) {
			for ( var i = 0; i < result.length; i++) {
				var key = result[i].prefix;
				routesJson[key] = result[i];
			}
			host = routesJson[prefix];

			if (!host) {
				next();
			} else {
				req.host = Object.create(host);
				res.setHeader("x-served-by", "http://" + host.host + ":"
						+ host.port + host.prefix);
				proxy.proxyRequest(req, res, host);
			}
		});
	} else {
		host = routesJson[prefix];

		if (!host) {
			next();
		} else {
			req.host = Object.create(host);
			res.setHeader("x-served-by", "http://" + host.host + ":"
					+ host.port + host.prefix);
			proxy.proxyRequest(req, res, host);
		}
	}
};
