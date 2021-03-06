const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const mysql = require('mysql');
const mdhash = require('md5');

const pid = process.pid;
var apphtml=(fs.readFileSync('./index.htm'));
var jqueryfile=(fs.readFileSync('./jquery.js'));
var loginhtml=(fs.readFileSync('login.html'));
var page = "<HTML>"
var hits=0;

const connection = mysql.createConnection({
    host:'localhost',
    SSL : {
    rejectUnauthorized: false
    },
    user:'root',
    database:'server'
});



const app = function (req,res){
    var session=""
    var uuid="";


    requrl=req.url;

    //get id from cookie
    if (req.headers.cookie!=undefined){
        cookie=req.headers.cookie;
        cookies=cookie.split("; ");
        cookiesplit=cookies[0].split('=');
        uuid=cookiesplit[1];
        cookiesplit=cookies[1].split('=');
        session=cookiesplit[1];

        console.log("UUID: "+uuid+" session: "+session);

    }
    



 
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
        query="select * from tokens where session='"+session+"' and uuid='"+uuid+"';";
        connection.query(query, function (error, results,fields){
            //get data 
            var postdata='';
            req.on('data', function (chunk){
                console.log("Receiving");
                postdata += chunk;
            });
            req.on('end', function(){
                console.log("Finished receiving");
                var post=qs.parse(postdata);
                var authenticated=false;
                var username="";
                var goals="";
                if (results.length>0){ //confirms a match has been found in the databse
                    console.log("authenticated");
                    authenticated=true;
                    username=results[0].username;
                    
                }
                switch(req.url){
                    case '/login' :
                        if(authenticated){
                            res.writeHead(302,{'location' : '/'});
                            res.end();
                        }else{
                            res.writeHead(200,{'content-type' : 'text/html'});
                            res.end(loginhtml);
                        }
                        break;
    
                    case '/loginattempt':
                        username=post['username'];
                        password=post['password'];
                        post=qs.parse(postdata);
                        query="SELECT * FROM users WHERE username= '"+username+"';";
    
                        var now= new Date;
                        var year= now.getFullYear();
                        year =year+1;
                        now.setYear(year);
                        
                        connection.query(query, function (error, results,fields){
                            if (results.length>0){
                                if (password==results[0].password){
                                    console.log("login success");
                                    uuid=mdhash(username);
                                    session=mdhash(username+now);
    
    
                                    query="INSERT INTO tokens (uuid,session,username) VALUES ('"+uuid+"','"+session+"','"+username+"');"
                                    connection.query(query);
                                    res.writeHead(302,{'location': "/",
                                    'set-cookie' : ['uuid='+uuid+";  expires=' "+ now.toUTCString(),"session="+session+'; expires=' + now.toUTCString() ]
                                    });
                                    res.end();
                                }else{
                                    res.writeHead(302,{'location' : '/'})
                                    res.end();
                                }
                            }
                        });
                        break;
                    case "/deletegoal" :
                        ID=post['ID'];
                        query="delete from goals where ID='"+ID+"';";
                        connection.query(query);
                        break;
    
                    case '/aibot' :
                        // AIparse
                        text=post["text"];
                        textsplit=text.split(" ");
                        l=textsplit.length;
                        endword=l-1;
    
                        for (var i=0; i<=endword; i++){
                            //catch date reference
                            if (textsplit[i]=="today"){when=0;}
                            if (textsplit[i]=="tomorrow"){when=1; console.log("tomorrow")} //if i find the word tomorrow
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
                                what=textsplit[i+2];
                            }
            
                            if (textsplit[i]=="at" || textsplit[i]=="@"){
                                if ((isNaN(textsplit[i+1]))!=true && textsplit[i+1].length==4){
                                    //break 24 hour time into hours and minutes
                                    time=textsplit[i+1];
                                    timesplit=time.split("");
                                    hours=timesplit[0]+timesplit[1];
                                    minutes=timesplit[2]+timesplit[3];
                                }
                            }
            
                
                        }           
    
    
    
                        //converts date reference to explicit daTE				
                        Today= new Date();
                        gdate= new Date();
    
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
    
                        //######
                        gdate.setHours(hours);
                        gdate.setMinutes(minutes);
                    
                        
    
                        
    
                        //reconstruct variables from gdate
                        month =gdate.getMonth();
                        day   =gdate.getDate();
                        year  =gdate.getFullYear();
    
                        hours =gdate.getHours();
                        minutes=gdate.getMinutes();
                        //create goal
    
                        if( typeof month!="undefined" && typeof day!="undefined" && typeof year!="undefined" && typeof hours!="undefined"
                        && typeof minutes!="undefined" && typeof what!="undefined"){
                            goal=month+","+day+","+year+","+hours+","+minutes+","+what;
                        }
                        console.log(goal);
                        //add to database
                        query="insert into goals (username,goal) values('"+username+"','"+goal+"');";
                        connection.query(query);
                        res.end(goal);
                        break;
    
            
                    case '/':
                        if (authenticated==true){
                            //get date for cookie expiration
    
                            res.writeHead(200, {'content-type': 'text/html',});
                            res.end(apphtml);
                            hits=Number(hits+1);
                            console.log("Index served by PID"+pid);
                        }else{
                            res.writeHead(302,{'location' : 'login'})
                            res.end();
                        }
                        
                        break;
            
                    case '/getgoals' :
                        if (authenticated){
                            query=" select * from goals where username='"+username+"';";
                            connection.query(query,function(error,results,fields){
                                console.log(results);
                                for (var i=0; i<results.length;i++){
                                    console.log(results[i].goal);
                                    goals+=results[i].goal+":"+results[i].ID+";";
                                }
                                res.end(goals);
                            });
                        }else{
                            res.end("Authentication Error");
                        }
                        break;
            
                    default :
                        res.end('404 error. No idea what you looking for.');
                        break;
    
    
                }



            });


        });
    }
        
        
  



    
    
   

    
    

};

const server = http.createServer(app);

server.listen(80, function(){
    console.log('server is running....');
});