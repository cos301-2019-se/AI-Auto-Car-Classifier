var express = require('express');
const router = express.Router();
const request = require("request");
var fs = require('fs');
const { spawn } = require('child_process');

router.post('/submit', submitImage);
router.post('/color_detector', getImageColor);
router.post('/car_detector', imageContainsCar);
router.post('/', imageContainsCar);

function submitImage(req, res)
{

    console.log("In function submitImage");

    var imageBase64 = req.body.image;

    var numFiles = countFiles("images/");
    var fileName = "images/Image" + (numFiles + 1) + ".jpg";
    var statusVal = "success";
    var mess = "Image Received";
    console.log('Found '+numFiles+' images');
    if (imageBase64 == null || imageBase64.length === 0)
    {
      statusVal = "fail";
      mess = "No Image Data received";
    }
    else
    {
        var data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(fileName, data, {encoding: 'base64'}, writeToFile);
        mess = 'Image'+ (numFiles + 1) + '.jpg';
    }

    res.status(200).json({
        status: statusVal,
        message: mess
    });
}

function writeToFile(err)
{
    if (err)
    {
        mess = err.message;
        status = "fail";
        console.log(err);
    }
    else
    {
        console.log("The file was saved!");

    }
}

function classify(req, res)
{
    //TODO: Implement Function

    console.log("In function classify");

    res.status(200).json({

        message: "classify Function"

    });
}

function countFiles(dir)
{
    var files = fs.readdirSync(dir);

    return files.length;


}
const sendProbability = (res) => (data) => {
    res.status(200).json({
        probability: parseFloat(data)
    })
};

const logErrors = (label) => (data) => {
   console.log(`${label} ${data}`);
};

function imageContainsCar(req, response) {
    const process = spawn('python', ['car_detection/demo.py', req.body.imageID]);
    process.stdout.on(
      'data',
      sendProbability(response)
    );

    process.stderr.on(
      'data',
      logErrors('stderr')
    );
  }

  const sendColor = (res) => (data) => {
    console.log('data: '+data);
    res.status(200).json({
        color: data.toString()
    })
};

  function getImageColor(req, response) {
    const process = spawn('python', ['color-extractor/getColor', 'color-extractor/color_names.npz', `images/${req.body.imageID}`]);
    process.stdout.on(
      'data',
      sendColor(response)
    );

    process.stderr.on(
      'data',
      sendColor(response)
    );
  }
module.exports = router;