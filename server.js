const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();
//Specify port
const { port }  = require('./config/config');

const server = http.createServer(app);
//Starts Server
server.listen(port, () => {
    console.log("Listening on port " + port);
});

module.exports = server;