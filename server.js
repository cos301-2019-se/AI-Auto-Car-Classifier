const http = require('http');
const app = require('./app');
const request = require("request");
const passport = require('passport');

//Specify port
const port  = process.env.PORT || 3000;

const server = http.createServer(app);
//Starts Server
server.listen(port, () => {
    console.log("Listening on port " + port);
});

module.exports = server;