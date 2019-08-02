var express = require('express');
const router = express.Router();
const request = require("request");
const path = require('path');
const image2base64 = require('image-to-base64');
const {spawn} = require('child_process');
const multer = require('multer');
const fs = require('fs-extra');
const Jimp = require('jimp');
const glob = require('glob');
const FileSet = require('fileset');
const colour = require('color-namer');
var nj = require('numjs');
let passport = require('../config/passport');

var storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, 'unprocessedImages')
    },
    filename: function (req, file, cb)
    {
        cb(null, 'image' + '-' + Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({storage: storage});
const MODEL_ENDPOINT = 'http://fa58d627-948b-47e0-9f79-16bf04d3d271.westeurope.azurecontainer.io/score';
const BOOLEAN_MODEL_ENDPOINT = 'http://7b0640a1-4862-484f-aaef-cdcfe8fb98d3.westeurope.azurecontainer.io/score';

router.post('/submit', passport.authenticate('jwt', { session: false }), upload.single('image'), submitImage);
router.post('/submit_multiple', passport.authenticate('jwt', { session: false }), upload.array('imageMultiple'), submitMultipleImages);
router.post('/submit64', passport.authenticate('jwt', { session: false }), submitImage64);
router.post('/color_detector', passport.authenticate('jwt', { session: false }), getImageColor);
router.post('/color_detector_sample', passport.authenticate('jwt', { session: false }), getImageColorBySample);
router.post('/car_detector', passport.authenticate('jwt', { session: false }), imageContainsCar);
router.post('/get_car_details', passport.authenticate('jwt', { session: false }), getMakeAndModel);
router.post('/number_plate', passport.authenticate('jwt', { session: false }), getNumberPlate);
router.get('/', serverRunning);
router.post('/resize_images', passport.authenticate('jwt', { session: false }), resizeImages);


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

function submitMultipleImages(req, res)
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
        for (var i = 0; i < files.length; i++)
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

function resizeImages(req, res)
{
    console.log("Resizing Images");
    resizeDirectoryImages('./unprocessedImages', {width: 1000})  // Resize all png, jpg, and bmp images in the example directory to be at max 500 wide
        .then(() =>
        {
            console.log('Resizing Done!');
            moveProcessedImages(res);
        });

}

function moveProcessedImages(res)
{
    console.log("Moving Images");
    FileSet('**/unprocessedImages/*.jpg **/unprocessedImages/*.png **/unprocessedImages/*.jpeg **/unprocessedImages/*.JPG', '', function (err, files)
    {
        if (err) return console.error(err);


        console.log(files);

        for (var i = 0; i < files.length; i++)
        {
            console.log("files[i]: " + files[i]);
            let oldPath = './' + files[i];

            let newPath = './images/' + oldPath.split("/")[2];
            fs.renameSync(oldPath, newPath);
        }

        res.status(200).json({
            status: "success",

        });
    });

}

/**
 * Resizes images in the directory. Only operates on .png, .jpg, and .bmp.
 * @param {string} dirPath - Path to directory. Can be relative or absolute.
 * @param {Object} options
 * @param {int|Jimp.AUTO} [options.width=Jimp.AUTO]
 * @param {int|Jimp.AUTO} [options.height=Jimp.AUTO]
 * @param {boolean} [options.recursive=false] - Whether or not to also resize recursively.
 * @return {Promise}
 */
function resizeDirectoryImages(dirPath, {width = Jimp.AUTO, height = Jimp.AUTO, recursive = false})
{
    return new Promise((resolve, reject) =>
    {
        glob((recursive ? "**/" : "") + "*.@(png|jpg|bmp)", {
            nocase: true,
            nodir: true,
            realpath: true,
            cwd: dirPath
        }, (err, files) =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve(files);
            }
        });
    }).then(files =>
    {
        return Promise.all(files.map(path =>
        {
            return new Promise((resolve, reject) =>
            {
                return Jimp.read(path).then(image =>
                {
                    image
                        .resize(width, height)
                        .quality(50)
                        .write(path, (err) =>
                        {
                            if (err)
                            {
                                reject(err);
                            }
                            else
                            {
                                resolve(path);
                            }
                        });
                })
            }).then(console.log)
        }));
    });
}


function resize(files, callback)
{
    for (var i = 0; i < files.length; i++)
    {
        console.log("In FOr loop");
        let filename = files[i].toString();
        console.log("resizing File: " + filename);
        let filePath = './images/' + filename;
        let newPath = './imagesResized/' + filename;
        console.log("Path: " + filePath);

        Jimp.read(filePath, function (err, img)
        {
            if (err)
            {
                console.log("Err in jimp: " + err);
                throw err;
            }
            img.scaleToFit(1000, Jimp.AUTO, Jimp.RESIZE_BEZIER).quality(50).write(newPath);

            callback();
        });


    }
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
        mess = "No Image Data received";
        res.status(401).json({
            status: statusVal
        });
    }
    else
    {
        var data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFile(fileName, data, {encoding: 'base64'}, writeToFile(req));
        mess = 'Image' + (numFiles + 1) + '.jpg';
    }

    res.status(200).json({
        status: statusVal,
        imageID: mess
    });
}

const writeToFile = (response) => (error) => {
    if (err){
        response.status(500).json({
            error: 'Something went wrong with uploading the image, please try again'
        });
    }
}

function countFiles(dir)
{
    var files;
    try{
        files = fs.readdirSync(dir);
    } catch(exception){
        return -1;
    }
    return files.length;
}

const sendProbability = (res) => (data) =>
{
    res.status(200).json({
        probability: parseFloat(data)
    })
};

const logErrors = (label) => (data) =>
{
    console.log(`${label} ${data}`);
};

async function getMakeAndModel(req, res)
{
    let bas64Image = null;
    try{
        //read image as numpy array, turn it into numpy list and send an api call to the model
        await image2base64(`images/${req.body.imageID}`) // you can also to use url
            .then(
                (response) => {
                    bas64Image = response;
                }
            )
            .catch(
                (error) => {
                    console.log(error); //Exepection error....
                }
            );
        console.log(bas64Image);
        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: MODEL_ENDPOINT,
            body: {
                data: bas64Image
            },
            json: true,
        }, function (error, response, body){
            console.log(response.body)
            if (response && response.statusCode == 200){
                sendMakeAndModel(res, `${response.body.car}-${response.body.confidence}`);
            }
            else{
                console.log(error)
                res.status(500).json({
                    error: 'Car classifier returned an error trying to classify the image. Please try again'
                });
            }
        });
    } catch(exception) {
        res.status(500).json({
            error: 'An error occured trying to classify the image, please try again'
        });
    }

}

function imageContainsCar(req, res)
{
    try{
        //read image as numpy array, turn it into numpy list and send an api call to the model
        let numpyArray = nj.images.read(`images/${req.body.imageID}`);
        numpyArray = numpyArray.tolist();

        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: BOOLEAN_MODEL_ENDPOINT,
            body: {
                data: numpyArray
            },
            json: true,
            }, function(error, response, body){
              //  console.log(response.body)
                if( response && response.statusCode == 200){
                    res.status(200).json({
                        ...response.body
                    })
                } else {
                  //  console.log(response.body);
                //    console.log(response.statusCode);
                    res.status(500).json({
                        message: 'Boolean classifier returned an error trying to classify the image. Please try again',
                        error: error
                    });
                }
        });
    } catch(error){
        res.status(500).json({
            message: 'An error occured trying to classify the image, please try again',
            error: error 
        });
    }

}


function imageContainsCarMock(req, res)
{
    console.log("Detect Car Mock Function");
    res.status(200).json({
        probability: "0.9216358"
    });
}

const sendColor = (res) => (data) =>
{
    res.status(200).json({
        color: data.toString()
    })
};

function getImageColor(req, response)
{
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

function getImageColorBySample(req, res)
{
    var imagePath = './images/' + req.body.imageID;

    Jimp.read(imagePath, function (err, image)
    {
        var midpointX = image.bitmap.width / 2;
        var midpointY = image.bitmap.height / 2;

        var samples = [];

        samples.push(image.getPixelColor(midpointX, midpointY));

        getRegion(midpointX - 100,midpointY - 100,200,200,image,samples); //Midpoint box

        var colourCount = [];

        for (var i = 0; i < samples.length; i++)
        {
            var rgba = Jimp.intToRGBA(samples[i]);
            var rgbString = "rgb(" + rgba.r + "," + rgba.g + "," + rgba.b + ")";
            var names = colour(rgbString, {pick: ['basic']});

            var colourName = names.basic[0].name;


            if( colourCount[colourName] === undefined)
            {

                colourCount[colourName] = 1;
            }
            else
            {

                colourCount[colourName]++;
            }

        }

        console.log(colourCount);

        var keys = Object.keys(colourCount);
        var max = -1;
        var matchedColour = "";
        for(var key in colourCount)
        {
            if(colourCount[key] > max)
            {
                max = colourCount[key];
                matchedColour = key.toString();
            }
        }

     console.log("COLOUR IS: " + matchedColour);


        res.status(200).json({
            status: "success",
            color: matchedColour
        });
    });


}

function getRegion(startX,startY, width, height, image, samples)
{

    for(let i = startY ; i < (height+startY); i+=5)
    {
        for(let k = startX ; k < (width+startX); k+=5)
        {
            samples.push(image.getPixelColor(k,i));
        }
    }
}

function getImageColorMock(req, res)
{
    console.log("Get Colour Mock Function");
    res.status(200).json({
        color: "black"
    });
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
            if (results.length <= 0)
            {
                console.log("Unable to determine number plate");
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

const getNumWords = (word) =>
{
    try{
        return word.split(' ').length;
    } catch(exception){
        return -1;
    }
}

function sendMakeAndModel(res, data)
{
    try{
        const numWords = getNumWords(data.toString());
        if(numWords <= 0){
            throw 'There is only one word in the annotation of the car';
        }
        let extendedModel;
        data = data.toString();
        const make = data.substr(0, data.indexOf(' '));
        data = data.replace(make + ' ', '');
        let model = data.substr(0, data.indexOf(' '));
        data = data.replace(model + ' ', '');
        if (numWords > 4)
        {
            extendedModel = data.substr(0, data.indexOf(' '));
            data = data.replace(extendedModel + ' ', '');
            model = model + ' ' + extendedModel;
        }
        const bodyStyle = data.substr(0, data.indexOf(' '));
        data = data.replace(bodyStyle + ' ', '');
        const year = data.substr(0, data.indexOf('-'));
        data = data.replace(year + '-', '');
        const confidence = parseFloat(data);
        res.status(200).json({
            make: make,
            model: model,
            bodyStyle: bodyStyle,
            year: year,
            confidence: confidence
        });
    } catch(exception) {
        console.log(error);
        res.status(200).json({
            message: 'Something went wrong decoding the response from classify car',
            error: exception
        });
    }
};

module.exports = router;