var express = require('express');
const router = express.Router();
const request = require("request");
const path = require('path');

const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs-extra');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'image' + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });
const MODEL_ENDPOINT = 'http://a5deb1f4-0ca6-433e-bd75-b81b447fdee4.westeurope.azurecontainer.io/score';
const BOOLEAN_MODEL_ENDPOINT = 'http://6da32a8d-2d25-4f29-ad22-fa2351cd85e0.westeurope.azurecontainer.io/score';

router.post('/submit', upload.single('image'), submitImage);
router.post('/submit_multiple',upload.array('imageMultiple'),submitMultipleImages);
router.post('/submit64',submitImage64);
router.post('/color_detector', getImageColor);
router.post('/car_detector', imageContainsCar);
router.post('/get_car_details', getMakeAndModel);
router.post('/number_plate', getNumberPlate);
router.get('/', serverRunning);


function serverRunning(req, res){
    res.status(200).json({
        message: 'server running'
    });
}

function submitImage(req,res)
{
    var statusVal = "success";
    var mess = "Image Received";

    const files = req.files;
    if (!files)
    {
        statusVal = "fail";
        mess = "No Image Data received";

    }


    res.status(200).json({
        status: statusVal,
        imageID: mess
    });
}

function submitMultipleImages(req,res)
{
    var statusVal = "success";
    var data = [];

    const files = req.files;


    if (!files)
    {
        statusVal = "fail";
    }
    else
    {
        var paths = [];
        for(var i = 0; i < files.length; i++)
        {
            paths.push(files[i].filename);
        }

        data = paths;
    }


    res.status(200).json({
        status: statusVal,
        imagePaths: data
    });
}

function submitImage64(req, res)
{
    var imageBase64 = req.body.image;

    var numFiles = countFiles("images/");
    var fileName = "images/Image" + (numFiles + 1) + ".jpg";
    var statusVal = "success";
    var mess = "Image Received";
    if (imageBase64 == null || imageBase64.length === 0)
    {
        statusVal = "fail";
        mess = "No Image Data received";
        res.status(401).json({
            status: statusVal
        });
    }
    else
    {
        var data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(fileName, data, {encoding: 'base64'}, writeToFile);
        mess = 'Image'+ (numFiles + 1) + '.jpg';
    }

    res.status(200).json({
        status: statusVal,
        imageID: mess
    });
}

function writeToFile(err)
{
    if (err)
    {
        mess = err.message;
        status = "fail";
    }
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

function getMakeAndModel(req, res) {

    //read image as numpy array, turn it into numpy list and send an api call to the model
    let numpyArray = nj.images.read(`images/${req.body.imageID}`);
    numpyArray = numpyArray.tolist();

    request.post({
        headers: {
            'content-type' : 'application/json'
        },
        url: MODEL_ENDPOINT,
        body: {
            data: numpyArray
        },
        json: true,
        }, function(error, response, body){
            if( response && response.statusCode == 200){
                sendMakeAndModel(res, `${response.body.car}-${response.body.confidence}`);
            } else {
                res.status(500).json({
                    error: error
                });
            }

    });

  }

  function imageContainsCar(req, res) {

    //read image as numpy array, turn it into numpy list and send an api call to the model
    let numpyArray = nj.images.read(`images/${req.body.imageID}`);
    numpyArray = numpyArray.tolist();

    request.post({
        headers: {
            'content-type' : 'application/json'
        },
        url: BOOLEAN_MODEL_ENDPOINT,
        body: {
            data: numpyArray
        },
        json: true,
        }, function(error, response, body){
            if( response && response.statusCode == 200){
                res.status(200).json({
                    ...response.body
                })
            } else {
                res.status(500).json({
                    error: error
                });
            }

    });

  }

  const sendColor = (res) => (data) => {
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
 /**The functions below get the numberplate from an image of a car */
 function getNumberPlate(req, res)
 {
     var imageID = req.body.imageID;
     var file = ".\\images\\" + imageID;
     if (fs.existsSync(file))
     {
         var image = fs.readFileSync(file);
 
         const {exec} = require('child_process');
         var command = '.\\openalpr_64\\alpr -c eu -d -j -n 1 ' + file;
         exec(command, (err, stdout, stderr) =>
         {
             if (err)
             {
                 res.status(200).json({
                     status: "failed",
                 });
 
                 return;
             }
 
             var object = JSON.parse(stdout);
 
             var results = object.results;
             if(results.length <= 0){
                  res.status(200).json({
                    status: "failed",
                });

                return;
             }
             var plate = results[0].plate;
 
             var coords = results[0].coordinates;
 
             res.status(200).json({
                 status: "success",
                 numberPlate: plate,
                 coordinates: coords
             });
 
 
         });
 
 
     }
     else
     {
         res.status(200).json({
 
             status: "fail",
             message: "Image Not Found"
 
         });
     }
 }
  /**The below functions get the car make and model */

  const getNumWords = (word) => {
      return word.split(' ').length;
  }
  function sendMakeAndModel(res, data) {
    const numWords = getNumWords(data.toString());
    let extendedModel;
    data = data.toString();
    const make = data.substr(0, data.indexOf(' '));
    data = data.replace(make+' ', '');
    let model = data.substr(0, data.indexOf(' '));
    data = data.replace(model+' ', '');
    if(numWords > 4){
      extendedModel = data.substr(0, data.indexOf(' '));
      data = data.replace(extendedModel+' ', '');
      model = model+' '+extendedModel;
    }
    const bodyStyle = data.substr(0, data.indexOf(' '));
    data = data.replace(bodyStyle+' ', '');
    const year = data.substr(0, data.indexOf('-'));
    data = data.replace(year+'-', '');
    const confidence = parseFloat(data);
      res.status(200).json({
          make: make,
          model: model,
          bodyStyle: bodyStyle,
          year: year,
          confidence: confidence
      })
  };
module.exports = router;