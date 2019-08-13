var IMAGE_PATH = './images/';

$(document).ready(function ()
{
    $("#loadingImage").css('visibility', 'hidden');


    const uploadButton = document.querySelector('#uploadBtn');

    uploadButton.addEventListener('click', (e) =>
    {
        cloudinary.openUploadWidget({cloud_name: 'dso2wjxjj', upload_preset: 'zfowrq1z'},
            function (error, results)
            {
                //console.log(error, result)
                if (typeof results !== 'undefined')
                {
                    var imageUrl = results[0].secure_url;

                    displayImage(imageUrl);
                      classifyImage(imageUrl);
                    var imageUrls = [];

                    for (let i = 0; i < results.length; i++)
                    {
                        imageUrls.push(results[i].secure_url);
                    }

                    generateGallery(imageUrls);
                }

            });
    });

    /****************** Gallery Image Clicked *******************/

    $(document).on('click', '.thumbnail', function ()
    {
        console.log('Clicked');
        var src = $(this).children("img").attr("src");
        var imageID = $(this).children("img").attr("id");
        displayImage(imageID);

        $("html, body").animate({scrollTop: 0}, 200);

        classifyImage(imageID);
    });

});

function classifyImage(imageUrl)
{
    detectCar(imageUrl,function (imageUrl)
    {
        getMake(imageUrl);
        getNumberPlate(imageUrl, function (hasPlate, coords, imageID)
        {

            getColour(imageID, hasPlate, coords);
        });
    });

}

function detectCar(imageID, callback)
{

    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/car_detector",
        dataType: "json",
        data: {imageID: imageID},
        success: function (res)
        {
            var prob = res.confidence;

            if (prob > 0.30)
            {
                callback(imageID);
            }
            else
            {
                bootbox.alert("Image is not a car");
                clearLoadingImages();
            }
        },
        error: function (jqXHR, textStatus, exception)
        {
            console.log("Error in detect Car: " + jqXHR.status);
            console.log(textStatus);
            console.log(exception);
            displayError('Unable to classify Car: ' + textStatus);
            clearLoadingImages();

            return -1;
        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}

function clearLoadingImages()
{
    $('#plateItem').html('&nbsp;');
    $('#makeItem').html('&nbsp;');
    $('#modelItem').html('&nbsp;');
    $('#colourItem').html('&nbsp;');
}

function displayError(message)
{
    // bootbox.alert(message).find('.modal-content').css({'background-color': '#f99', 'font-weight' : 'bold', color: '#F00', 'font-size': '2em'} );
    bootbox.alert(message);
}

function getColour(imageID, hasPlate, coords)
{

    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/color_detector",
        dataType: "json",
        data:
            {
                imageID: imageID,
                hasNumberPlate: hasPlate,
                coordinates: coords
            },
        success: function (res)
        {
            var colour = res.color;
            console.log("Car Colour: " + colour);

            $('#colourItem').text(colour);
        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);
            displayError('Unable to Classify Vehicle Colour');
            $('#colourItem').text('???');
        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}

function getMake(imageID)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/get_car_details",
        dataType: "json",
        data: {imageID: imageID},
        success: function (res)
        {
            var make = res.make;
            var model = res.model;
            var confidence = parseFloat(res.confidence) * 100;
            confidence = Math.round(confidence);
            console.log("Car Make: " + make);
            console.log("Car Model: " + model);
            console.log("Confidence: " + confidence);

            $('#makeItem').text(make);
            $('#modelItem').text(model);


            $('#makeProgress').addClass(getProgressBarColour(confidence));
            $('#makeProgress').css('width',confidence);
            $('#makeAccuracy').text(confidence + '%');

            $('#modelProgress').addClass(getProgressBarColour(confidence));
            $('#modelProgress').css('width',confidence);
            $('#modelAccuracy').text(confidence + '%');


        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Make: " + jqXHR.status);
            displayError('Unable to Classify Vehicle Make');
            $('#makeItem').text('???');

        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}

function getNumberPlate(imageID, cb)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/number_plate",
        data: {imageID: imageID},
        success: function (res)
        {
            var imageID = res.imageID;
            if (res.status === "success")
            {
                var plate = res.numberPlate;
                var confidence = res.confidence;
                var coordinates = res.coordinates; // Upper left [0], Upper Right [1], Lower Right [2], Lower Left [3]
                var upperLeftX = coordinates[0].x;
                var upperLeftY = coordinates[0].y;
                var lowerLeftY = coordinates[3].y;
                var upperRightX = coordinates[1].x;

                var width = upperRightX - upperLeftX + 10;
                var height = lowerLeftY - upperLeftY + 20;


                console.log("Car Plate: " + plate);

                let progressWidth = Math.round(confidence);

                $('#plateItem').text(plate);

                $('#plateProgress').addClass(getProgressBarColour(progressWidth));
                $('#plateProgress').css('width',progressWidth);
                $('#plateAccuracy').text(progressWidth + '%');

                //     createPlatePopover(imageID,width,height,upperLeftX - 10,upperLeftY - 10);
                cb('true', coordinates, imageID);
            }
            else
            {
                console.log("Car Plate FAILED");
                $('#plateItem').text("???");
                cb('false', null, imageID);
            }

        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Plate: " + jqXHR.status);
            displayError('Unable to Classify Vehicle Plate');

        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}

function getProgressBarColour(value)
{
    if(value < 51)
    {
        return "bg-gradient-danger"
    }
    else if(value < 70)
    {
        return "bg-gradient-warning";
    }
    else
    {
        return "bg-gradient-success";
    }
}
function createPlatePopover(imageID, width, height, x, y)
{
    var imgObject = new Image();
    imgObject.crossOrigin = null;
    imgObject.src = IMAGE_PATH + imageID;

    imgObject.onload = function ()
    {
        var newImg = getImagePortion(imgObject, width, height, x, y, 1);
        var imageHTML = '<img src="' + newImg + '"">';
        $('[data-toggle="popover"]').popover({
            title: 'Plate Region',
            content: imageHTML,
            html: true,
            placement: 'right'
        });
    }
}

function getImagePortion(imgObj, newWidth, newHeight, startX, startY, ratio)
{
    /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
    //set up canvas for thumbnail
    var tnCanvas = document.createElement('canvas');
    var tnCanvasContext = tnCanvas.getContext('2d');
    tnCanvas.width = newWidth;
    tnCanvas.height = newHeight;

    /* use the sourceCanvas to duplicate the entire image. This step was crucial for iOS4 and under devices. Follow the link at the end of this post to see what happens when you don’t do this */
    var bufferCanvas = document.createElement('canvas');
    var bufferContext = bufferCanvas.getContext('2d');
    bufferCanvas.width = imgObj.width;
    bufferCanvas.height = imgObj.height;
    bufferContext.drawImage(imgObj, 0, 0);

    /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
    tnCanvasContext.drawImage(bufferCanvas, startX, startY, newWidth * ratio, newHeight * ratio, 0, 0, newWidth, newHeight);
    return tnCanvas.toDataURL();
}

var numImagesOnRow = 0;

function generateGallery(imagePaths)
{
    var i;
    var gallery = $('.gallery');

    var lastRow = $('.gallery div.row:last');

    for (i = 0; i < imagePaths.length; ++i)
    {
        var imageHtml = generateImageHTML(imagePaths[i]);


        lastRow.append(imageHtml);

        numImagesOnRow++;
        if (numImagesOnRow === 3)
        {
            gallery.append('<div class="row"> </div>');

            lastRow = $('.gallery div.row:last');
            numImagesOnRow = 0;
        }

    }
}

function generateImageHTML(image)
{
    var path = image;
    var html = '<div class="col-md-4"> <div class="thumbnail"> <img id="' + image + '" src="' + path + '" alt="" style="width:100%"> </div> </div>';

    return html;
}

function displayImage(image)
{
    var loadingGif = '<img src="./resources/loading%20screen%20colour.gif" height="50px" width="50px">';
    $('.classification').html(loadingGif);

    $("#mainImage").attr("src", image);
}

function onSignIn(googleUser)
{
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}