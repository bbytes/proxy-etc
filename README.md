proxy-etc
=========

Dynamic reverse proxy based on node js.  It uses [etcd](https://github.com/coreos/etcd) to dynamically switch application

Feature :
 1. Configure via REST.
 2. TCP proxy [for mysql]
 3. HTTP/HTTPS reverse proxy
 4. Avoid dog pile effect.
 5. It uses etcd to dynamically switch application 
 6. Load balancing (support sticky and non sticky with auto update of failed nodes)
 7. UI for viewing and editing URL mappings.
 8. Auto detection of server node failure and send alert as email 
 9. Store mapping info in a file or inbuilt lightweight db to persist the URL mappings (to get back mapping info after proxy server restart or crash )
 
 
How to get going :
 
 1. Install Node.js for your operating system.
 2. Create a folder for tingoDB local system.
 3. Get a copy of code - https://github.com/bbytes/proxy-etc.git to your local directory.
 4. Run the command - npm install -d - in Node command prompt after changing to your cloned directory.
    This should install the dependencies currently added in package.json file.
 5. Set path of your tingoDB folder to dbPath property in config/config.js.
 6. You can change for port and user credentials for the application in config.js file.
    
 
Running the application : 

 1. From the command prompt run - node app.js . You should be able to see a Login page at http://localhost:3000/
 2. Login with Admin user credentials : Username : admin, Password : admin
 3. Add routes to proxy-etc. For example : prefix : errzero, host : 192.168.1.179, port : 8080
 4. Now you can access errzero running on 192.168.1.179 machine from proxy-etc which is running on localhost 3000 with url  : http://localhost:3000/errzero
              
              
              
              
              
 
 
 
