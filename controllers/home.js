/*
 * Home controller
 */

exports.getHomePage = function(req, res) {
	res.render('jade/home');
};

exports.getTargetsPage = function(req, res){
	res.render('jade/targets');
};
