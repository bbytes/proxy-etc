var config = require("../config/config");
var Mailgun = require('mailgun').Mailgun;

exports.sendEmail = function (params) {
	var mg = new Mailgun(config.mail.apiKey);
	
	mg.sendRaw(config.mail.from,
	        [params.to],
	        'From: ' + config.mail.from +
	          '\nTo: ' + params.to +
	          '\nContent-Type: text/html; charset=utf-8' +
	          '\nSubject: ' + config.mail.subject +
	          '\n\n' + params.message,
	        function(error, response) { 		   
			   if(error){
			       console.log(error);
			   }else{
			       console.log("Message sent");
			   } 
			});
};



