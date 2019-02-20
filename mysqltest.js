mysql= require("mysql");
const connection = mysql.createConnection({
    host:'localhost',
    SSL : {
    rejectUnauthorized: false
    },
    user:'nodeuser@localhost',
    password : 'eDinburgh@09',
    database:'server'
});

connection.query("select * from users;", function (error,results,fields){
    if (typeof(results)==undefined){
        console.log("fail");
        
    }else {
        console.log(error);
        console.log("success");
        console.log(results.length);
    }

});