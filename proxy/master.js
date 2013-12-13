/**
 * Master
 */

var cluster = require('cluster'),
    util = require('util'),
    numCPUs = require('os').cpus().length,
    fs = require('fs'),
    collection = require('strong-store-cluster').collection('routes'),
    config = require('../config/config');

function Master() {
    if (!(this instanceof Master)) {
        return new Master();
    }
    var self = this;

    collection.configure({ expireKeys: 0 });

    fs.watchFile("./config/routes.json", function () {
    	self.readRoutesJson();
    });

    this.spawnWorkers(config.workers);
}

Master.prototype.readRoutesJson = function(){
    fs.readFile("./config/routes.json", function (err, data) {
        if (err) {
      	  console.error("Error reading file");
        }
        var routes = JSON.parse(data);
        for(var key in routes){
      	    collection.set(key, routes[key], function(err) {
      	    	  if (err) {
      	    	    console.error('There was an error');
      	    	    return;
      	    	  }
      	    });
        }
     });
};

Master.prototype.spawnWorkers = function (number) {
    var spawnWorker = function () {
        var worker = cluster.fork();
    };

    // Spawn all workers
    var noOfWorkers = 1;
    if(number){
    	noOfWorkers = number;
    } else {
    	noOfWorkers = numCPUs;
    }
    
    for (var n = 0; n < noOfWorkers; n++) {
        util.log('Spawning worker #' + n);
        spawnWorker();
    }
    
    this.readRoutesJson();

    // When one worker is dead, let's respawn one
    cluster.on('exit', function (worker, code, signal) {
        var m = 'Worker died (pid: ' + worker.process.pid + ', suicide: ' +
                (worker.suicide === undefined ? 'false' : worker.suicide.toString());
        if (worker.suicide === false) {
            if (code !== null) {
                m += ', exitcode: ' + code;
            }
            if (signal !== null) {
                m += ', signal: ' + signal;
            }
        }
        m += '). Spawning a new one.';
        util.log(m);
        spawnWorker();
    });

    // Set an exit handler
    var onExit = function () {
        util.log('Exiting, killing the workers');
        for (var id in cluster.workers) {
            var worker = cluster.workers[id];
            util.log('Killing worker #' + worker.process.pid);
            worker.destroy();
        }
        process.exit(0);
    }.bind(this);
    process.on('SIGINT', onExit);
    process.on('SIGTERM', onExit);
};

module.exports = Master;