/**
 * Request Mappings
 */

var login = require('../controllers/login'), revproxy = require('../controllers/revproxy'), routes = require('../controllers/routes'), home=require('../controllers/home');

module.exports = function(app, db, passport, auth) {
	revproxy.init(db);
	routes.init(db);

	app.get('/login', login.login);
	app.get('/', login.index);

	app.post('/authenticate', auth, passport.authenticate('local', {
		failureRedirect : '/'
	}), function(req, res){
		//res.send(req.user);
		res.send("success");
	});
	
	app.get('/home', auth, home.getHomePage);
	app.get('/routes/allRoutes', auth, routes.getAllRoutes);
	app.post('/routes/save', auth, routes.save);
	app.post('/routes/update', auth, routes.update);
	app.post('/routes/delete', auth, routes.deleteRoute);
	
	app.get('/logout', function(req, res){
		req.logout();
		res.send("success");
	});
	
	app.get('/isAuthenticated', function(req, res){
		res.send(req.isAuthenticated() ? req.user : '0');
	});
	
	app.all('*', revproxy.forward);
};
