const cluster = require('cluster');
const os = require('os');
const pid = process.pid;




if (cluster.isMaster){

    var stdin = process.openStdin();
    stdin.addListener("data",function(d){
        if (d="Launchrep"){cluster.fork();}
    });
    console.log(cluster.workers);
    for (i=0;i<8;i++){
        cluster.fork();
    }

} else {
    console.log('Worker launched pid: ' +pid);
    require('./server')
}