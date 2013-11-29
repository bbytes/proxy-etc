
/*
 * Login Controller
 */

exports.index = function(req, res){
  res.render('jade/index');
};

exports.login = function(req, res){
  res.render('jade/login');
};