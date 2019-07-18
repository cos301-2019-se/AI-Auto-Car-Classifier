var express = require('express');
const router = express.Router();
const request = require("request");
var fs = require('fs');

router.post('/email', sendEmail);

function sendEmail(req, res)
{
    //TODO: Implement Function

    console.log("In function sendEmail");

    res.status(200).json({

        message: "sendEmail Function"

    });
}

module.exports = router;