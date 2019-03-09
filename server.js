const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const mysql = require('mysql');
const mdhash = require('md5');

const pid = process.pid;
var apphtml=(fs.readFileSync('./index.htm'));
var jqueryfile=(fs.readFileSync('./jquery.js'));
var loginhtml=(fs.readFileSync('login.html'));
var hits=0;
var calendarhtml=(fs.readFileSync("./calendar.htm"));
var packimg=(fs.readFileSync("./pack.jpg"));
var bottleimg=(fs.readFileSync("./bottle.jpg"));
const connblob= {
    host:'localhost',
    SSL : {
    rejectUnauthorized: false
    },
    user:'root',
    database:'server'
}


async function tokenauthenticate(request){
    var connection = mysql.createConnection(connblob);


    //get id from cookie
    if (request.headers.cookie!=undefined){
        cookie=request.headers.cookie;
        cookies=cookie.split("; ");
        cookiesplit=cookies[0].split('=');
        uuid=cookiesplit[1];
        cookiesplit=cookies[1].split('=');
        session=cookiesplit[1];

        query="select * from tokens where session='"+session+"' and uuid='"+uuid+"';";
        user = new Promise(function (resolve,reject){
            connection.query(query, function (error, results,fields){
                connection.end();
                if (results){ //confirms a match has been found in the databse
                    

                    if (results.length>0){
                        authenticated=true;
                        resolve(results[0].username);
                    }
                    else {
                        resolve("unauthenticated");
                    }
                    
                    
                }else{
                    resolve("Error");
                }
            });
        });

        return await user;
        
    }
}

async function getpostdata(request){
    post = new Promise(function(resolve,reject){
        //get data 
        var postdata='';
        request.on('data', function (chunk){
            postdata += chunk;
        });
        request.on('end', function(){
            resolve(qs.parse(postdata));
        });
    });
    return await post;
}

function airespond(req,res){
    var connection = mysql.createConnection(connblob);



    // AIparse
    text=req.post["text"];
    textsplit=text.split(" ");
    l=textsplit.length;
    endword=l-1;
    var when
    for (var i=0; i<=endword; i++){
        //catch date reference
        if (textsplit[i]=="today"){when=0;}
        if (textsplit[i]=="tomorrow"){when=1;}
        if (textsplit[i]=="yesterday"){when=2;} //if i find the word tomorrow

        if (textsplit[i]=="next"){
            if (textsplit[i+1]=="monday"){when=3;}
            if (textsplit[i+1]=="tuesday"){when=4;}
            if (textsplit[i+1]=="wednesday"){when=5;}
            if (textsplit[i+1]=="thursday"){when=6;}
            if (textsplit[i+1]=="friday"){when=7;}
            if (textsplit[i+1]=="saturday"){when=8;}
            if (textsplit[i+1]=="sunday"){when=9;}
        }

        if (textsplit[i]=="i" && textsplit[i+1]=="have"){
            var what=textsplit[i+2];
        }

        if (textsplit[i]=="at" || textsplit[i]=="@"){
            if ((isNaN(textsplit[i+1]))!=true && textsplit[i+1].length==4){
                //break 24 hour time into hours and minutes
                var time=textsplit[i+1];
                var timesplit=time.split("");
                var hours=timesplit[0]+timesplit[1];
                var minutes=timesplit[2]+timesplit[3];
            }
        }


    }           
    //converts date reference to explicit daTE				
    var Today= new Date();
    var gdate= new Date();
    if (typeof(when)!="undefined"){
        switch(when){
            case 0:
                gdate=Today;
                break;
            case 1:
                gdate.setDate(Today.getDate()+1);
                break;
            case 2:
                gdate.setDate(Today.getDate()-1);
                break;
            case 3:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+1;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 4:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+2;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 5:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+3;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 6:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+4;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 7:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+5;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 8:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+6;
                gdate.setDate(Today.getDate()+addon);
                break;
            case 9:
                dayofweek=Today.getDay();
                addon=(7-dayofweek)+7;
                gdate.setDate(Today.getDate()+addon);
                break;
    
        }
    }
    

    //######
    gdate.setHours(hours);
    gdate.setMinutes(minutes);

    //reconstruct variables from gdate
    var month =gdate.getMonth();
    var day   =gdate.getDate();
    var year  =gdate.getFullYear();


    //create goal

    if( typeof month!="undefined" && typeof day!="undefined" && typeof year!="undefined" && typeof hours!="undefined"
    && typeof minutes!="undefined" && typeof what!="undefined"){
        var goal=month+","+day+","+year+","+hours+","+minutes+","+what;
    }else {goal="fail";}
   
    //add to database
    if (goal!="fail"){
        var query="insert into goals (username,goal) values('"+req.username+"','"+goal+"');";
    }
    connection.query(query, function(){
        connection.end();
        res.end(goal);
    });
    

}

function addtogoals(req,res){
    var connection = mysql.createConnection(connblob);

    
    var date=req.post["date"];
    var datespl=date.split('-');
    var year=datespl[0];
    var month=Number(datespl[1]);
    month--;
    var day=datespl[2];
    var what=req.post['description']; 
    var hour=req.post['hours']; 
    var minutes=req.post['minutes']; 
    var goal=month+","+day+","+year+","+hour+","+minutes+","+what;
    var query="insert into goals (username,goal) values('"+req.username+"','"+goal+"');";

    connection.query(query, function(){
        connection.end();
        res.end();
    });
    
}

const app = function (req,res){
    // create connection
    var connection = mysql.createConnection(connblob);



    user= new Promise(function (resolve,reject){
        resolve(tokenauthenticate(req));   
    });
    post = new Promise(function(resolve,reject){
        resolve(getpostdata(req));
    });

    Promise.all([user,post]).then( function(data){
        req.username=data[0,0];
        req.post=data[0,1];

        if (req.username=="unauthenticated" || typeof(req.username)=="undefined"){req.authenticated=false;}else{req.authenticated=true;}
        if (req.url=='/favicon.ico' || req.url=='/style.css' || req.url=='/jquery.js'){
            switch(req.url){
                case '/favicon.ico' : 
                res.writeHead(200, {
                    'content-type': 'image/x-icon'
                });
                res.end(fs.readFileSync('./favicon.ico'));
                break;
    
            case '/jquery.js' :
                res.writeHead(200, {
                    'content-type' : 'application/javascript'
                });
                res.end(jqueryfile);
                break;
            
            case '/style.css':
                res.writeHead(200, {
                    'content-type' : 'text/css'
                });
                res.end(fs.readFileSync('./style.css'));
                break;
    
            }
    
        }else{

            switch(req.url){
                case '/':
                    if (req.authenticated==true){
                        //get date for cookie expiration

                        res.writeHead(200, {'content-type': 'text/html',});
                        res.end(apphtml);
                        hits=Number(hits+1);
                    }else{
                        res.writeHead(302,{'location' : 'login'});
                        res.end();
                    }
                    
                    break;
                    
                case '/login' :
                    if(req.authenticated){
                        res.writeHead(302,{'location' : '/'});
                        res.end();
                    }else{
                        res.writeHead(200,{'content-type' : 'text/html'});
                        res.end(loginhtml);
                    }
                    break;
                case '/calendar' :
                    if (req.authenticated){
                        res.writeHead(200,{'content-type' : 'text/html'});
                        res.end(calendarhtml);
                        
                    }else{
                        res.writeHead(302,{'location' : 'login'});
                        res.end();
                    }
                    break;
                case '/addgoal' : if (req.authenticated){
                        addtogoals(req,res)
                    }else{
                        res.end("Fail");
                    }
                    break;
    
                case '/loginattempt':
                    username=req.post['username'];
                    password=req.post['password'];
                    
                    query="SELECT * FROM users WHERE username= '"+username+"';";
    
                    var now= new Date;
                    var year= now.getFullYear();
                    year =year+1;
                    now.setYear(year);
                    
                    connection.query(query, function (error, results,fields){
                        
                        
                        if (results.length>0){
                            if (password==results[0].password){
                                console.log("success");
                                uuid=mdhash(username);
                                session=mdhash(username+now);
    
                                
                                query="INSERT INTO tokens (uuid,session,username) VALUES ('"+uuid+"','"+session+"','"+username+"');"
                                connection.query(query, function(){connection.end();});
                                res.writeHead(302,{'location': "/",
                                'set-cookie' : ['uuid='+uuid+";  expires=' "+ now.toUTCString(),"session="+session+'; expires=' + now.toUTCString() ]
                                });
                                
                                res.end();
                            }else{
                                res.writeHead(302,{'location' : '/'})
                                res.end();
                                connection.end();
                            }
                        }
                    });
                    break;
                case "/deletegoal" :
                    ID=req.post['ID'];
                    query="delete from goals where ID='"+ID+"' and username='"+req.username+"';";
                    connection.query(query, function(){
                        connection.end();
                        res.end("success");
                        
                    });
                    
                    break;
    
                case '/aibot' :
                    airespond(req,res);
                    break;
    
        
                case '/getgoals' :
                    if (req.authenticated){
                        query=" select * from goals where username='"+req.username+"';";
                        connection.query(query,function(error,results,fields){
                            connection.end();
                            var goals="";
                            for (var i=0; i<results.length;i++){
                                goals+=results[i].goal+":"+results[i].ID+";";
                            }
                            res.end(goals);
                        });
                    }else{
                        res.end("Authentication Error");
                    }
                    break;
                case '/pack.jpg' :
                    res.writeHead(200,{'content-type' : 'image/jpeg'});
                    res.end(packimg);
                    break;
                case '/bottle.jpg' : 
                    res.writeHead(200,{'content-type' : 'image/jpeg'});
                    res.end(bottleimg);
        
                default :
                    res.end('404 error. No idea what you looking for.');
                    break;
    
    
            }
        }
    });

};

const server = http.createServer(app)

server.listen(80, function(){console.log('server is running....🚀');});