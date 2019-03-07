const cluster = require('cluster');
const os = require('os');
const pid = process.pid;




if (cluster.isMaster){

    
    process.stdin.on("data",function(d){
        stringin=d.toString().trim();
        if (stringin=="Launchrep"){cluster.fork();}
        if (stringin=="A"){console.log("It Equals A");}
        console.log(stringin);
    });


    console.log(cluster.workers);
    for (i=0;i<8;i++){
        cluster.fork();
    }

} else {
    console.log('Worker launched pid: ' +pid);
    require('./server')
}