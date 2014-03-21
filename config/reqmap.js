/**
 * Request Mappings
 */

var login = require('../controllers/login'), routes = require('../controllers/routes'), targets=require('../controllers/targets'), home=require('../controllers/home');

module.exports = function(app, db, passport, auth) {
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
	
	app.get('/api/routes/isReachable', function(req, res){
		res.send("success");
	});
	app.post('/api/routes/save', passport.authenticate('basic', { session: false }), routes.save);
	app.post('/api/routes/update', passport.authenticate('basic', { session: false }), routes.update);
	app.post('/api/routes/delete', passport.authenticate('basic', { session: false }), routes.deleteRoute);
	app.get('/api/routes/allRoutes', passport.authenticate('basic', { session: false }), routes.getAllRoutes);
	app.post('/api/target/updateConfig', passport.authenticate('basic', { session: false }), targets.updateTargetConfig);
	
	app.post('/api/routes/updateTarget', passport.authenticate('basic', { session: false }), routes.updateTarget);
	app.post('/api/routes/add', passport.authenticate('basic', { session: false }), routes.add);
	app.post('/api/routes/deleteRouteBySource', passport.authenticate('basic', { session: false }), routes.deleteRouteBySource);
	app.post('/api/routes/deleteTarget', passport.authenticate('basic', { session: false }), routes.deleteTarget);
};
