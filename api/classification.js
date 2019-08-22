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
var download = require('download-to-file');


//get models
const db = require('../models/index');
const User = db.sequelize.models.User;
const Car = db.sequelize.models.Car;
const inventory = db.sequelize.models.Inventory;

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
const MODEL_ENDPOINT = 'http://21616aee-bf95-4402-bf1b-284eb0739dcf.westeurope.azurecontainer.io/score';
const BOOLEAN_MODEL_ENDPOINT = 'http://04f7a584-8a70-4b64-9bd6-acc277ed8282.westeurope.azurecontainer.io/score';

router.post('/submit', passport.authenticate('jwt',{session:false}),upload.single('image'), submitImage);
router.post('/submit_multiple',passport.authenticate('jwt',{session:false}), upload.array('imageMultiple'), submitMultipleImages);
router.post('/submit64', passport.authenticate('jwt',{session:false}), submitImage64);

router.post('/color_detector', passport.authenticate('jwt',{session:false}), getImageColorBySample);
router.post('/car_detector', passport.authenticate('jwt',{session:false}), imageContainsCar);
router.post('/get_car_details', passport.authenticate('jwt',{session:false}), getMakeAndModel);
router.post('/number_plate', passport.authenticate('jwt',{session:false}), getNumberPlate);
router.get('/', serverRunning);
router.post('/resize_images', passport.authenticate('jwt',{session:false}), resizeImages);
router.post('/upload_image', passport.authenticate('jwt',{session:false}), uploadImage);

router.post('/save_car', passport.authenticate('jwt',{session:false}), saveCar);
router.get('/get_inventory', passport.authenticate('jwt',{session:false}), getInventory);
router.post('/get_car', passport.authenticate('jwt',{session:false}), getCarByImageURL);


function serverRunning(req, res)
{
    res.status(200).json({
        message: 'server running'
    });
}

function uploadImage(req, res,)
{
    cloudinary.uploader.upload(req.body.imagePath, function (error, result)
    {
        console.log(result, error);

        res.status(200).json({
            message: result
        });
    });


}
async function saveCar(req, res){
    if(!req.body.make || !req.body.model){
        res.status(400).json({
            error: "The make and model are compulsory"
        });
    } else {
        let newCar;
        try{
            await Car.create({
                ...req.body
            })
            .then(car => {
                newCar = car;
            })
            addToInventory(req.user.id, newCar.id)
            res.status(200).json({
                success: "Car added to inventory"
            });
        } catch(error){
            console.log("Save car error: " + error);
            res.status(500).json({
                error
            });
        }
    }
}
async function addToInventory(userId, carId){
    try{
        await inventory.create({
            company: "AI-Cars",
            userId,
            carId
        })
    } catch(err){
        throw err;
    }
}

async function getUserInventories(userId){
    let temp = [];
    try{
        await inventory.findAll({
            where: {
                userId: userId
            }
        })
        .then(entries => {
            temp = entries
        });
        return temp;
    } catch(err){
        console.log("Error fetching inventories", err);
    }
}

async function getCar(carId){
    let temp = {}
    try{
        await Car.findOne({
            where: {
                id: carId
            }
        })
        .then(car => {
            temp = car
        })
        return temp;
    } catch(err){
        console.log("Error fetching cars", err);
    }
}

async function getInventory(req, res){
    let inventories = []
    let allCars = [];
    let car = null;
    try{
        inventories = await getUserInventories(req.user.id);
        for(c = 0; c < inventories.length; c++) {
            car = await getCar(inventories[c].carId)
            allCars.push(car);
        }
        res.status(200).json({
            allCars
        });
    } catch(err){
        res.status(500).json({
            err
        });
    }
}

async function getCarByImageURL(req, res){
    try{
        if(!req.body.imageURL){
            throw "No property imageURL in request body";
        }
        await Car.findOne({
            where: {
                imageURL: req.body.imageURL
            }
        })
        .then(car => {
            res.status(200).json({
                car
            });
        })
    } catch(err){
        console.log("Error fetching car by imageURL", err);
    }
}

function submitImage(req, res)
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

const writeToFile = (response) => (error) =>
{
    if (err)
    {
        response.status(500).json({
            error: 'Something went wrong with uploading the image, please try again'
        });
    }
}

function countFiles(dir)
{
    var files;
    try
    {
        files = fs.readdirSync(dir);
    }
    catch (exception)
    {
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
        await image2base64(req.body.imageID) // you can also to use url
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

        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: MODEL_ENDPOINT,
            body: {
                data: bas64Image
            },
            json: true,
        }, function (error, response, body)
        {
            if (response && response.statusCode == 200)
            {
                sendMakeAndModel(res, `${response.body.car}-${response.body.confidence}`);
            }
            else
            {
                console.log(error)
                res.status(500).json({
                    error: 'Car classifier returned an error trying to classify the image. Please try again'
                });
            }
        });
    }
    catch (exception)
    {
        res.status(500).json({
            error: 'An error occured trying to classify the image, please try again'
        });
    }

}

async function imageContainsCar(req, res)
{
    var imageUrl = req.body.imageID;

    console.log("Image: " + imageUrl);

       //read image as numpy array, turn it into numpy list and send an api call to the model
        await image2base64(imageUrl) // you can also to use url
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

        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: BOOLEAN_MODEL_ENDPOINT,
            body: {
                data: bas64Image
            },
            json: true,
        }, function (error, response, body)
        {
            if(response && response.statusCode == 200)
            {
                res.status(200).json(
                    {
                        ...response.body
                    });
            }
            else
            {
                res.status(500).json({
                    message: 'An error occurred trying to classify the image, please try again',
                    error: error
                });
            }

        });


}


function imageContainsCarMock(req, res)
{
    console.log("Detect Car Mock Function");
    res.status(200).json({
        probability: "0.9216358"
    });
}

function commonColourMapper(col)
{
    switch (col)
    {
        case "pink":
            return "red";
        case "teal":
            return "blue";
        case "gold":
            return "yellow";
        default:
            return col;
    }
}

function testColourAccuracy(req, res)
{
    let rawdata = fs.readFileSync('test/imagesWithPlates/carDetails.json');

    let details = JSON.parse(rawdata);
    var itemsProcessed = 0;
    var correct = 0;
    details.forEach(function (car)
    {
        let file = car.fileName;
        let colour = car.colour;
        let coordinates = car.coordinates;

        colourTest('test/imagesWithPlates/' + file, coordinates, function (matchedColour)
        {
            if (colour.toUpperCase() === matchedColour.toUpperCase())
            {
                correct++;

            }
            else
            {
                console.log("Failed: " + file + " -> " + " Expected: " + colour + " but got " + matchedColour);
            }

            itemsProcessed++;
            if (itemsProcessed === details.length)
            {
                getAccuracy(correct, details.length);
            }
        });

    });

    res.status(200).json({
        status: "success",
        accuracy: "acc"
    });
}

function getAccuracy(correct, total)
{
    console.log("************** Accuracy **************");
    console.log("Correct: " + correct);
    console.log("Total: " + total);
    let acc = correct / total * 100;
    console.log(acc + "%");
}

class Colour
{
    constructor(name)
    {
        this.name = name;
        this.count = 1;
    }

    get getName()
    {
        return this.name;
    }

    get getCount()
    {
        return this.count;
    }

    addOccurance()
    {
        this.count++;
    }
}

function colourTest(imagePath, coordinates, cb)
{
    let hasPlate = 'true';

    Jimp.read(imagePath, function (err, image)
    {
		if(err)
			console.log(err);

        var startX, startY;
        var regionWidth, regionHeight;
        if (hasPlate === 'true')
        {
            var upperLeftX = coordinates[0].x;
            var upperLeftY = coordinates[0].y;
            var lowerLeftY = coordinates[3].y;
            var upperRightX = coordinates[1].x;

            var width = upperRightX - upperLeftX + 20;
            var height = lowerLeftY - upperLeftY;

            height *= 2;

            var endY = upperLeftY - height;

            startY = endY - 100;
            startX = upperLeftX - 20;

            regionWidth = 100;
            regionHeight = 100;
        }
        else
        {
            var midpointX = image.bitmap.width / 2;
            var midpointY = image.bitmap.height / 2;
            startX = midpointX - 100;
            startY = midpointY - 100;
            regionWidth = 200;
            regionHeight = 200;
        }
        var samples = [];

        getRegion(startX, startY, regionWidth, regionHeight, image, samples); //Midpoint box

        var colourCount = [];

        for (var i = 0; i < samples.length; i++)
        {
            var rgba = Jimp.intToRGBA(samples[i]);
            var rgbString = "rgb(" + rgba.r + "," + rgba.g + "," + rgba.b + ")";
            var names = colour(rgbString, {pick: ['basic']});

            var colourName = names.basic[0].name;

            let existingColour = colourCount.filter(c => c['name'] === colourName);

            if (existingColour.length === 0)
            {
                colourCount.push(new Colour(colourName));
            }
            else
            {
                existingColour[0].addOccurance();
            }
        }

        colourCount.sort(compareColour);

        //     console.log(colourCount);
        var col = colourCount[0].name;
        if (col === 'gray' || col === 'silver' || col === 'black')
        {
            if (colourCount[0].count - colourCount[1].count < 50)
            {
                col = colourCount[1].name;
            }
        }

        var c = commonColourMapper(col);
        cb(c);
    });
}

function getImageColorBySample(req, res)
{
    var imagePath = './images/' + req.body.imageID;
    var coordinates = [];
    var hasPlate = req.body.hasNumberPlate;

    if (hasPlate === 'true')
    {
        coordinates = req.body.coordinates;
    }

    Jimp.read(imagePath, function (err, image)
    {
        var startX, startY;
        var regionWidth, regionHeight;

        if (hasPlate === 'true')
        {
            var upperLeftX = coordinates[0].x;
            var upperLeftY = coordinates[0].y;
            var lowerLeftY = coordinates[3].y;
            var upperRightX = coordinates[1].x;

            var width = upperRightX - upperLeftX + 20;
            var height = lowerLeftY - upperLeftY;

            height *= 2;

            var endY = upperLeftY - height;

            startY = endY - 100;
            startX = upperLeftX - 20;

            regionWidth = 100;
            regionHeight = 100;
        }
        else
        {
            var midpointX = image.bitmap.width / 2;
            var midpointY = image.bitmap.height / 2;
            startX = midpointX - 100;
            startY = midpointY - 100;
            regionWidth = 200;
            regionHeight = 200;
        }
        var samples = [];

        getRegion(startX, startY, regionWidth, regionHeight, image, samples); //Midpoint box

        var colourCount = [];

        for (var i = 0; i < samples.length; i++)
        {
            var rgba = Jimp.intToRGBA(samples[i]);
            var rgbString = "rgb(" + rgba.r + "," + rgba.g + "," + rgba.b + ")";
            var names = colour(rgbString, {pick: ['basic']});

            var colourName = names.basic[0].name;

            let existingColour = colourCount.filter(c => c['name'] === colourName);

            if (existingColour.length === 0)
            {
                colourCount.push(new Colour(colourName));
            }
            else
            {
                existingColour[0].addOccurance();
            }
        }

        colourCount.sort(compareColour);

        var col = colourCount[0].name;
        if (col === 'gray' || col === 'silver' || col === 'black') // Decreases likelihood of grill/windscreen match
        {
            if (colourCount[0].count - colourCount[1].count < 50)
            {
                col = colourCount[1].name;
            }
        }

        var matchedColour = commonColourMapper(col); // Change name to more common colour

        //   console.log(colourCount);

        res.status(200).json({
            status: "success",
            color: matchedColour
        });
    });
}

function compareColour(a, b)
{
    const col1 = a.count;
    const col2 = b.count;

    let comparison = 0;
    if (col1 > col2)
    {
        comparison = 1;
    }
    else if (col1 < col2)
    {
        comparison = -1;
    }
    return comparison * -1; //sort in reverse order
}


function getRegion(startX, startY, width, height, image, samples)
{
    for (let i = startY; i < (height + startY); i += 5)
    {
        for (let k = startX; k < (width + startX); k += 5)
        {
            samples.push(image.getPixelColor(k, i));
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

    var fileName = 'image' + '-' + Date.now() + '.jpg';
    download(imageID, './images/' + fileName, function (err, filepath)
    {
        if (err) throw err;

        console.log('Download finished:', filepath);
        var file = filepath;

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
                        imageID: fileName
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
                        imageID: fileName
                    });

                    return;
                }
                var plate = results[0].plate;

                var coords = results[0].coordinates;

                var con = results[0].confidence;

                res.status(200).json({
                    status: "success",
                    numberPlate: plate,
                    coordinates: coords,
                    imageID: fileName,
                    confidence: con
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
    });
}

/**The below functions get the car make and model */

const getNumWords = (word) =>
{
    try
    {
        return word.split(' ').length;
    }
    catch (exception)
    {
        return -1;
    }
}

function sendMakeAndModel(res, data)
{
    try
    {
        const numWords = getNumWords(data.toString());
        if (numWords <= 0)
        {
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
    }
    catch (exception)
    {
        console.log(error);
        res.status(200).json({
            message: 'Something went wrong decoding the response from classify car',
            error: exception
        });
    }
};

module.exports = router;