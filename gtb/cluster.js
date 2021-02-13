const cluster = require('cluster');
const os = require('os');
const pid = process.pid;




function setscreen(){

    console.log('\x1B[2J\x1B[0f');
    console.log("\x1b[31m");
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓CopyRight Christopher Watson 2019▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓')
    console.log('___________.__              __________          .___  .___.__ ');
    console.log('\__    ___/|__| _____   ____ ______    __ __  __| _/__| _/|__|');
    console.log(' |    |   |  |/      _/ __  |    |  _/  |   / __ |/ __ | |  |');
    console.log(' |    |   |  |  Y Y     ___/|    |      |  / /_/ / /_/ | |  |');
    console.log(' |____|   |__|__|_|  / ___  >______  /____/ ____  ____ | |__|');
    console.log('                      /      /        /            /     /    ');
    console.log('          +------------------------------------------+');
    console.log('          |             +---------------+            |');
    console.log('          |             |               |            |');
    console.log('          |             |      +----->  |            |');
    console.log('          |             |      |        |            |');
    console.log('          |             |      v        |            |');
    console.log('          |             |               |            |');
    console.log('          |             +---------------+            |');
    console.log('          +------------------------------------------+');
    console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓')
    console.log('\x1b[0m');
}
function refreshscreen(){


    

    setTimeout(function (){

        console.log('\x1B[2J\x1B[0f');
        console.log("\x1b[31m");
        console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓CopyRight Christopher Watson 2019▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓')
        console.log('___________.__              __________          .___  .___.__ ');
        console.log('\__    ___/|__| _____   ____ ______    __ __  __| _/__| _/|__|');
        console.log(' |    |   |  |/      _/ __  |    |  _/  |   / __ |/ __ | |  |');
        console.log(' |    |   |  |  Y Y     ___/|    |      |  / /_/ / /_/ | |  |');
        console.log(' |____|   |__|__|_|  / ___  >______  /____/ ____  ____ | |__|');
        console.log('                      /      /        /            /     /    ');
        console.log('          +------------------------------------------+');
        console.log('          |             +---------------+            |');
        console.log('          |             |               |            |');
        console.log('          |             |      +----->  |            |');
        console.log('          |             |      |        |            |');
        console.log('          |             |      v        |            |');
        console.log('          |             |               |            |');
        console.log('          |             +---------------+            |');
        console.log('          +------------------------------------------+');
        console.log('▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓')
        console.log('\x1b[0m');

        console.log("\x1b[31m","Enter command: ",'\x1b[0m');
        console.log("1: Reload Files");
        console.log("2: Rolling restart");
        console.log("3: Launch process");
    }, 3000);
}

if (cluster.isMaster){
    
    process.stdin.on("data",function(d){
        stringin=d.toString().trim();
        if (stringin=="Launchrep"){
            cluster.fork();
        }
        if (stringin=="A"){console.log("It Equals A");}

        refreshscreen();
    });

    setscreen();
    child=[];
    for (i=0;i<8;i++){
        child[i]=cluster.fork('server.js');
        cpid=child[i].process.pid;
        console.log("server launched on PID: "+cpid);
    }
    console.log("\x1b[31m","Enter command: ",'\x1b[0m');
    console.log("1: Reload Files");
    console.log("2: Rolling restart");
    console.log("3: Launch process");
} else {
    require('./server')
}