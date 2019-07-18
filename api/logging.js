var express = require('express');
const router = express.Router();
const request = require("request");
var fs = require('fs');

router.post('/sign-in', logSignIn);
router.post('/classification', logClassification);
router.post('/classification-failure', logClassificationFailure);


function logSignIn(req, res)
{
    //TODO: Implement Function

    console.log("In function logSignIn");

    res.status(200).json({

        message: "logSignIn Function"

    });
}

function logClassification(req, res)
{
    //TODO: Implement Function

    console.log("In function logClassification");

    res.status(200).json({

        message: "logClassification Function"

    });
}

function logClassificationFailure(req, res)
{
    //TODO: Implement Function

    console.log("In function logClassificationFailure");

    res.status(200).json({

        message: "logClassificationFailure Function"

    });
}

module.exports = router;