/**
 * Initialization of application
 */

module.exports = function(app, express, path, dirname, passport, config) {

	// all environments
	app.set('port', process.env.PORT || config.app.port);
	app.set('title', config.app.name);
	app.set('views', dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		secret : 'keyboard cat'
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(dirname, 'public')));
	app.use(require('connect-restreamer')());

	app.use(express.static(dirname + '/public'));

	// development only
	if ('development' == app.get('env')) {
		app.use(express.errorHandler());
	}
};
