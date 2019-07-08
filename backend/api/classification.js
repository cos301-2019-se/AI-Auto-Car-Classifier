var express = require('express');
const router = express.Router();
const request = require("request");
const path = require('path');

const { spawn } = require('child_process');
const multer = require('multer');
const fs = require('fs-extra');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, 'image' + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

router.post('/submit', upload.single('image'), submitImage);
router.post('/submit_multiple',upload.array('imageMultiple'),submitMultipleImages);
router.post('/submit64',submitImage64);
router.post('/color_detector', getImageColor);
router.post('/car_detector', imageContainsCar);
router.post('/car_classifier', getCarMakeAndModel);
router.post('/number_plate', getNumberPlate);
router.post('/', imageContainsCar);

function submitImage(req,res)
{
    console.log("Image Submitted");
    var statusVal = "success";
    var mess = "Image Received";

    const files = req.files;
    if (!files)
    {
        console.log("Error in Submit Image");
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
    console.log("Multiple Images Submitted");
    var statusVal = "success";
    var data = [];

    const files = req.files;


    if (!files)
    {
        console.log("Error in Submit Multiple Images");
        statusVal = "fail";


    }
    else
    {
        var paths = [];
        for(var i = 0; i < files.length; i++)
        {
            console.log("Image Uploaded: " + files[i].filename);
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
        imageID: mess
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
    const process = spawn('python', ['boolean_car_detection/model/predictions.py', `--file=images/${req.body.imageID}`]);
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
 /**The functions below get the numberplate from an image of a car */
 function getNumberPlate(req, res)
 {
     console.log("In Number plate function");
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
                 console.log(err);
 
                 res.status(200).json({
                     status: "failed",
                 });
 
                 return;
             }
 
             var object = JSON.parse(stdout);
 
             var results = object.results;
             if(results.length <= 0)
             {
                 console.log("Unable to determine number plate");
                  res.status(200).json({
                    status: "failed",
                });

                return;
             }
             var plate = results[0].plate;
 
             var coords = results[0].coordinates;
 
             //console.log("Plate: " + JSON.stringify(plate));
             console.log("Plate: " + plate);
             console.log("Coords: " + JSON.stringify(coords));
 
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
  function getCarMakeAndModel(req, response) {
      const process = spawn('python', ['car_detection/demo.py', req.body.imageID]);
      process.stdout.on(
        'data',
        sendMakeAndModel(response)
      );
  
      process.stderr.on(
        'data',
        logErrors('stderr')
      );
    }
  const getNumWords = (word) => {
      return word.split(' ').length;
  }
  const sendMakeAndModel = (res) => (data) => {
    const numWords = getNumWords(data.toString());
    console.log(numWords);
    let extendedModel;
    console.log(data.toString());
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