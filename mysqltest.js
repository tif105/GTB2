mysql= require("mysql");




const connection = mysql.createConnection({
    host:'localhost',
    SSL : {
    rejectUnauthorized: false
    },
    user:'root',
    database:'server'
});

connection.query("select * from users;", function (error,results,fields){
    if (results){
        

        console.log(error);
        console.log("success");
        console.log(results.length);
        console.log(results);
        
    }else {
        console.log("fail");
    }

});