var express = require('express');
const router = express.Router();
const request = require("request");
var fs = require('fs');

router.post('/sign-in', logSignIn);
router.post('/classification', logClassification);
router.post('/classification-failure', logClassificationFailure);
router.post('/logger', logthis);

const db = require('../models/index');
const Logger = db.sequelize.models.Logger;


function logthis(req, res)
{
    var user_name=req.body.user;
    const { user,numberplate,make,model,colour,description,mileage,sold } = req.body;
      console.log("User name = "+user_name);

     console.log("In function log this");
     Logger.create({user,numberplate,make,model,colour,description,mileage,sold});

        res.status(200).json({

            message: "Log success"

        });
}

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