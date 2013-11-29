/*
 * Reverse Proxy controller
 */

var httpProxy = require("http-proxy");
var proxy = new httpProxy.RoutingProxy();
var routesDao = require("../dao/routes");

exports.init = function(db) {
	routesDao.init(db);
};

exports.forward = function(req, res, next) {
	var url = decodeURI(req.url).toLowerCase(), host = null;
	var prefix = url.split("/")[1];

	var routesJson = routesDao.getRoutesJson();
	if (routesJson != null) {
		host = routesJson[prefix];
	}

	if (!host) {
		next();
	} else {
		req.host = Object.create(host);
		res.setHeader("x-served-by", "http://" + host.host + ":" + host.port
				+ host.prefix);
		proxy.proxyRequest(req, res, host);
	}

};
