module.exports = function(passport, express) {
	return [ express.json(), express.urlencoded(), isAuthenticated ];
};

function isAuthenticated(req, res, next) {
	var url = decodeURI(req.url).toLowerCase();
	if (url === '/authenticate')
		return next();

	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
}