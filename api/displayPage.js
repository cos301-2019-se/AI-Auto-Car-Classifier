const fs = require('fs');
var express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    fs.readFile('./frontend/index.html', function (err, html) {
        if (err) {
            console.log(err.message);
            console.log("Error reaching index path");
        }
        res.status(200).write(html);
        res.end();
    });
});


module.exports = router;