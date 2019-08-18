const mysql = require('mysql');

var hostname = "localhost";
var username = "root";

var psswd = "";

var con = mysql.createConnection({
    host: hostname,
    user:   username,
    password: ""
});

con.connect(function(err){
    if(err) throw err;
        console.log("connected!");

    con.query("CREATE DATABASE mydb", function(err, result){
        if(err) throw err;
            console.log("Database created");
    });
});

var sqlTime = "Create TABLE classificationTime (imageId INT PRIMARY KEY,time INT ) "
var sqlAcc = "Create TABLE carAccuracy (imageId INT PRIMARY KEY,accuracy INT,  model VARCHAR(20) ) "

function insrt()
{
    sqlTime = "INSERT INTO classificationTime (imageId,time) VALUES(0,0)";
    con.query(sqlTime, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });

    sqlAcc = "INSERT INTO carAccuracy (imageId,accuracy,model) VALUES(0,0,'')";
    con.query(sqlAcc, function (err, result) {
        if (err) throw err;
            console.log("1 record inserted");
        });
    //"INSERT INTO customers (name, address) VALUES ('Company Inc', 'Highway 37')";

}
