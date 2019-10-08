const http = require('http');
const app = require('./app');
//Specify port
const port = process.env.PORT;

const server = http.createServer(app.get('port'));
//Starts Server
server.listen(port, () => {
    console.log("Listening on port " + port);
});

module.exports = server;