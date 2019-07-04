const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');




const displayPageRoute = require('./api/displayPage');
const classifyRoute = require('./api/classification');
const notifyRoute = require('./api/notification');
const logRoute = require('./api/logging');

app.use(bodyParser.urlencoded({extended: true, limit: '25mb'}));
app.use(bodyParser.json({limit: '25mb'}));

//Prevent CORS violation
app.use(cors());

app.use('/classify', classifyRoute);
app.use('/notify', notifyRoute);
app.use('/log', logRoute);
app.use('/', displayPageRoute);


//Error handling when url doesn't exist
app.use((req, res, next) =>
{
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

//Error handling for thrown error
app.use((error, req, res, next) =>
{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
