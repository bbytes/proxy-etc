proxy-etc
=========

Dynamic reverse proxy based on node js.  It uses [etcd](https://github.com/coreos/etcd) to dynamically switch application

Feature :
 1. Configure via REST.
 2. TCP proxy [for mysql]
 3. HTTP reverse proxy
 4. Avoid dog pile effect.
 5. It uses etcd to dynamically switch application 
 6. Load balancing (support sticky and non sticky with auto update of failed nodes)
