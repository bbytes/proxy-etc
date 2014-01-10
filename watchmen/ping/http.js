var http = require('http');
var https = require('https');

/*---------------
 Apply validation rules to a HTTP request to determine if it is valid.
 Valid status code, expected text.
-----------------*/
function validate_http_response (target, body, res){
  if (target.config.expectedData){
    if (res.statusCode != target.config.expectedStatuscode){
      return 'FAILED! expected status code :' + target.config.expectedStatuscode +
        ' at ' + target.config.url + ' but got ' + res.statusCode;
    }
    else if (target.config.expectedData && (!body ||
        (body.indexOf(target.config.expectedData)==-1))){
      return 'FAILED! expected text "' + target.config.expectedData +
        '" but it wasn\'t found';
    }
    else{
      return ''; //ok
    }
  }
  return ''; //nothing to check for
}


function ping (target, callback){
  // record start time
  var startTime = new Date();

  var method = target.config.method;
  if (!target.config.expectedData){
    method = "HEAD";
  }

  var options = {
    port: target.port,
    host: target.host,
    path: target.config.url,
    method: method,
    agent:false
  };

  var request;
  if(target.config.ping_service === "https") {
    request = https.request(options);
    https.globalAgent.maxSockets=500;
  } else  {
    request = http.request(options);
    http.globalAgent.maxSockets=500;
  }

  var handled_callback = false;
  var error = null;

  request.setTimeout(target.config.timeout || 10000, function(){
    if (!handled_callback){
      handled_callback = true;
      callback('Timeout');
    }
  });

  request.addListener('error', function(connectionException){
    error = connectionException.errno || 'Error establishing connection';
    if (!handled_callback){
      handled_callback = true;
      callback(error);
    }
  });

  request.on('response', function(response) {
    response.setEncoding('utf-8');
    var body = '';

    response.on('data', function(chunk) {
      body += chunk;
    });

    response.on('end', function() {
      var timeDiff = (new Date() - startTime);
      if (!handled_callback){
        handled_callback = true;
        callback(validate_http_response(target, body, response), body, response, timeDiff);
      }
    });

    response.on('error', function(e) {
      error = e.message;
    });
  });

  request.on('error', function(e) {
    if (!handled_callback){
      handled_callback = true;
      callback(e.message + '. Details :' + target.host + target.config.url);
    }
  });

  request.write(JSON.stringify(target.config.input_data) || '');
  request.end();
}

module.exports.ping = ping;