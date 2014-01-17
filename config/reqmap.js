/**
 * Request Mappings
 */

var login = require('../controllers/login'), revproxy = require('../controllers/revproxy'), routes = require('../controllers/routes'), targets=require('../controllers/targets'), home=require('../controllers/home');

module.exports = function(app, db, passport, auth) {
	revproxy.init(db);
	routes.init(db);

	app.get('/login', login.login);
	app.get('/', function(req, res){
		res.redirect('/proxy');
	});
	app.get('/proxy', login.index);

	app.post('/authenticate', auth, passport.authenticate('local', {
		failureRedirect : '/'
	}), function(req, res){
		//res.send(req.user);
		res.send("success");
	});
	
	app.get('/home', auth, home.getHomePage);
	app.post('/routes/save', auth, routes.save);
	app.post('/routes/update', auth, routes.update);
	app.post('/routes/delete', auth, routes.deleteRoute);
	app.get('/routes/allRoutes', auth, routes.getAllRoutes);
	app.get('/target/targets', auth, home.getTargetsPage);
	app.get('/target/allTargets', auth, targets.getAllTargets);
	app.post('/target/updateConfig', auth, targets.updateTargetConfig);
	app.post('/target/changeEnabled', auth, targets.changeEnabled);
	
	
	app.get('/logout', function(req, res){
		req.logout();
		res.send("success");
	});
	
	app.get('/isAuthenticated', function(req, res){
		res.send(req.isAuthenticated() ? req.user : '0');
	});
};
