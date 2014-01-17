var events = require('events'), fs = require('fs'), http = require('./ping/http'), targetsDao = require('../dao/targets'), routesDao = require('../dao/routes');

function WatchMen(){
  this.daemon_status = 0; //0=stopped, 1=running
}

require('util').inherits(WatchMen, events.EventEmitter);

/*---------------
 Ping service
-----------------*/
WatchMen.prototype.ping = function (params, callback){
  var self = this;
  var timestamp = params.timestamp || +new Date(); //allow timestamp injection for easy testing

  targetsDao.findById(params.target.id, function (err, target){
      if (err) {return callback (err);}
      
      if(target.config.ping_service){
	      if(target.config.ping_service == 'http' || target.config.ping_service == 'https'){
		      http.ping (target, function(error, body, response, elapsed_time){
		      var targetConfig = target.config;
		      var prev_state = target.state || {};
		      delete prev_state.prev_state; //make sure we don't store nested state
		
		      var state = {
		        elapsed_time : elapsed_time,
		        timestamp : timestamp,
		
		        outages : prev_state.outages || 0,
		        prev_state : prev_state,
		        down_time_acc : prev_state.down_time_acc || 0 ,
		        down_timestamp : prev_state.down_timestamp,
		        up_since: prev_state.up_since || timestamp,
		        running_since: prev_state.running_since || timestamp
		      };
		
		      //-------------------------------------
		      // Decide if service is down (or the response is invalid)
		      //-------------------------------------
		      state.error = error;
		
		      state.status = state.error ? "error" : "success";
		
		      //next interval depends on if the request was successfull or not
		      state.next_attempt_secs = targetConfig.ping_interval;
		
		      //-------------------------------------
		      // Calculate uptime
		      //-------------------------------------
		      var running = (timestamp - state.running_since) / 1000; //seconds
		      var downtime = state.down_time_acc || 0;
		      if (state.down_timestamp){
		        downtime += (timestamp - state.down_timestamp)/1000;
		      }
		      state.uptime = (Math.round((100000 * (running - downtime)) / running) / 1000) || 0;
		
		      //-------------------------------------
		      // Service is down
		      //-------------------------------------
		      if (state.error){
		        //-------------------------------------
		        // Record event and outage only if this is the first error for this service.
		        //-------------------------------------
		        if (prev_state.status !== "error") {
		          state.up_since = null;
		          state.down_timestamp = timestamp;
		          state.outages = (parseInt(prev_state.outages,10) || 0) + 1; //inc outages
		
		          self.emit('service_error', target, state);
		        }
		      }
		      //-------------------------------------
		      // Service is up
		      //-------------------------------------
		      else {
		        state.up_since = state.up_since || timestamp;
		
		        //-------------------------------------
		        // Response over the limit?
		        //-------------------------------------
		        var limit = targetConfig.warning_if_takes_more_than;
		        if (limit && (elapsed_time > limit)){ //over the limit. warning!
		          self.emit('service_warning', target, state);
		        }
		
		        //-------------------------------------
		        // If previous state was "error", emit "service is back"
		        //-------------------------------------
		        if (prev_state.status === "error"){ //service was down and now it is up again!
		          state.down_time_last_request = Math.round((timestamp - prev_state.down_timestamp) / 1000); // in sec
		          state.down_time_acc = (parseInt(state.down_time_acc,10) || 0) + state.down_time_last_request; //accumulated downtime
		          state.down_timestamp = null;
		          self.emit('service_back', target, state);
		        }
		        else { //everything ok.
		          state.down_time_last_request = null;
		          self.emit('service_ok', target, state);
		         }
		      }
		
		      target.state = state;
		      targetsDao.updateState({_id : target._id}, target, function (err, result){
		    	  if (prev_state.status !== state.status) {
			    	  routesDao.updateTargetStatus(target, function(error, result){
			    		  callback (err, state);
			    	  });
		    	  } else {
		    		  callback (err, state);
		    	  }
		      });
		    });
	      }
      }
  });
 };

/*-----------------------
 Starts the service
------------------------*/
WatchMen.prototype.start = function (){
 var self = this;
 self.daemon_status = 1;
 var timeoutIDs = [];
 var targets = [];
 var count = 0;

 
 function readTargetsJson(){
	 fs.readFile("./config/targets.json", function (err, data) {
	     if (err) {
	   	  console.error("Error reading file");
	     }
	     if(data && data != undefined && data != null){
	    	 var json = JSON.parse(data);
	    	 targets = json.targets;
	         startWatchmen();
	     }
	  });
 }
 
 fs.watchFile("./config/targets.json", function () {
	 count++;
	 for(var i=0; i<timeoutIDs.length; i++){
		 clearTimeout(timeoutIDs[i]);
	 }
	 readTargetsJson();
 });
 
 targetsDao.updateJson();

 function launch (target){
   self.ping ({target:target}, function (err, state){
    if (err){ console.error (err); }

    if (self.daemon_status && target.count == count){
     var timeoutID = setTimeout(launch, parseInt(state.next_attempt_secs, 10) * 1000, target);
     timeoutIDs[target.index] = timeoutID;
    }
   });
 }

 function startWatchmen(){
	 for(var k=0; k<targets.length; k++){
		 targets[k]['index'] = k;
		 targets[k]['count'] = count;
		 if (targets[k].enabled !== false){
			launch(targets[k]);
		 }
	 }
 }

 console.log('watchmen monitor started.');
};

/*-----------------------
 Stops the service
------------------------*/
WatchMen.prototype.stop = function (){
 this.daemon_status = 0;
 console.log('stopping watchmen...');
};

module.exports = WatchMen;