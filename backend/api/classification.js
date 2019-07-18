var express = require('express');
const router = express.Router();
const request = require("request");
const path = require('path');

const {spawn} = require('child_process');
const multer = require('multer');
const fs = require('fs-extra');
const Jimp = require('jimp');
const glob = require('glob');
const FileSet = require('fileset');
const colour = require('color-namer');

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
const MODEL_ENDPOINT = 'http://a5deb1f4-0ca6-433e-bd75-b81b447fdee4.westeurope.azurecontainer.io/score';
const BOOLEAN_MODEL_ENDPOINT = 'http://6da32a8d-2d25-4f29-ad22-fa2351cd85e0.westeurope.azurecontainer.io/score';

router.post('/submit', upload.single('image'), submitImage);
router.post('/submit_multiple', upload.array('imageMultiple'), submitMultipleImages);
router.post('/submit64', submitImage64);
router.post('/color_detector', getImageColor);
router.post('/color_detector_sample', getImageColor);
router.post('/car_detector', imageContainsCar);
router.post('/get_car_details', getMakeAndModel);
router.post('/number_plate', getNumberPlate);
router.get('/', serverRunning);
router.post('/resize_images', resizeImages);


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
    FileSet('**/unprocessedImages/*', '', function (err, files)
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
        fs.writeFile(fileName, data, {encoding: 'base64'},);
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
    var files = fs.readdirSync(dir);
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

function getMakeAndModel(req, res)
{
    try{
        //read image as numpy array, turn it into numpy list and send an api call to the model
        let numpyArray = nj.images.read(`images/${req.body.imageID}`);
        numpyArray = numpyArray.tolist();

        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: MODEL_ENDPOINT,
            body: {
                data: numpyArray
            },
            json: true,
        }, function (error, response, body){
            if (response && response.statusCode == 200){
                sendMakeAndModel(res, `${response.body.car}-${response.body.confidence}`);
            }
            else{
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
                if( response && response.statusCode == 200){
                    res.status(200).json({
                        ...response.body
                    })
                } else {
                    res.status(500).json({
                        error: 'Boolean classifier returned an error trying to classify the image. Please try again'
                    });
                }
        });
    } catch(exception){
        res.status(500).json({
            error: 'An error occured trying to classify the image, please try again'
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

        console.log("MidpointX: " + midpointX);
        console.log("MidpointY: " + midpointY);
        //    Jimp.intToRGBA(hex)
        console.log("Colour: " + Jimp.intToRGBA(image.getPixelColor(midpointX, midpointY)));

        var x = midpointX;
        var y = midpointY;

        //right
        for (var i = 0; i < 10; i++)
        {
            x += 10;
            samples.push(image.getPixelColor(x, midpointY));
        }
        //left
        x = midpointX;
        for (var i = 0; i < 10; i++)
        {
            x -= 10;
            samples.push(image.getPixelColor(x, midpointY));
        }
        //up
        for (var i = 0; i < 10; i++)
        {
            y -= 10;
            samples.push(image.getPixelColor(midpointX, y));
        }

        //Diagonal left
        x = midpointX;
        y = midpointY;
        for (var i = 0; i < 10; i++)
        {
            y -= 10;
            x -= 10
            samples.push(image.getPixelColor(x, y));
        }
        //Diagonal Right
        x = midpointX;
        y = midpointY;
        for (var i = 0; i < 10; i++)
        {
            y -= 10;
            x += 10
            samples.push(image.getPixelColor(x, y));
        }

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

function getImageColorMock(req, res)
{
    console.log("Get Colour Mock Function");
    res.status(200).json({
        color: "black"
    })
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
    return word.split(' ').length;
}

function sendMakeAndModel(res, data)
{
    const numWords = getNumWords(data.toString());
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
    })
};
module.exports = router;