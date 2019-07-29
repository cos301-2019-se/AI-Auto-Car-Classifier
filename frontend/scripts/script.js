var IMAGE_PATH = './images/';

$(document).ready(function ()
{
    $("#loadingImage").css('visibility','hidden');
    /****************** Create Upload Form **********************/

    const uploadButton = document.querySelector('.browse-btn');
    const fileInfo = document.querySelector('.file-info');
    const realInput = document.getElementById('real-input');

    uploadButton.addEventListener('click', (e) =>
    {
        realInput.click();
    });

    realInput.addEventListener('change', () =>
    {
        const name = realInput.value.split(/\\|\//).pop();
        const truncated = name.length > 20
            ? name.substr(name.length - 20)
            : name;

        fileInfo.innerHTML = truncated;


        var title = $('#title').val();

        /************** Upload Images ***************/

        $('.uploadForm').ajaxSubmit({
            data: {title: title},
            contentType: 'multipart/form-data',
            success: function (res)
            {
                $("#loadingImage").css('visibility','visible');
                console.log('Response: ' + res.status);
                var images = res.imagePaths;
                console.log("Images: " + images);

                var path = './imagesResized/';

                resizeImages(images);


            },
            error: function (jqXHR, textStatus, exception)
            {
                console.log("Error in Upload: " + jqXHR.status);
                console.log(textStatus);
                console.log(exception);

            }
        });
        return false;
    });


    $('.uploadForm').submit(function (e)
    {
        e.preventDefault();
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

function resizeImages(images)
{
    console.log("Resizing images AJAX Call");
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/resize_images",
        dataType: "json",
        data: {images: images},
        success: function (res)
        {
            displayImage(images[0]);
            generateGallery(images);
            detectCar(images[0],classifyImage);
        },
        error: function (jqXHR, textStatus, exception)
        {
            console.log("Error in Resize Image: " + jqXHR.status);
            console.log(textStatus);
            console.log(exception);
            return -1;
        }
    });
}

function classifyImage(imageID)
{
    getMake(imageID);

    getNumberPlate(imageID,function(hasPlate,coords)
    {
        getColour(imageID,hasPlate,coords);
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

            if (prob > 0.20)
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
        }
    });
}

function clearLoadingImages()
{
    $('#plateItem').html('&nbsp;');
    $('#makeItem').html('&nbsp;');
    $('#colourItem').html('&nbsp;');
}

function displayError(message)
{
    // bootbox.alert(message).find('.modal-content').css({'background-color': '#f99', 'font-weight' : 'bold', color: '#F00', 'font-size': '2em'} );
    bootbox.alert(message);
}

function getColour(imageID,hasPlate,coords)
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
            var confidence = parseFloat(res.confidence) * 100;
            confidence = Math.round(confidence * 100) / 100;
            console.log("Car Make: " + make);
            console.log("Confidence: " + res.confidence);

            $('#makeItem').text(make + " (" + confidence + "%)");


        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Make: " + jqXHR.status);
            displayError('Unable to Classify Vehicle Make');
            $('#makeItem').text('???');

        }
    });
}

function getNumberPlate(imageID,cb)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/number_plate",
        data: {imageID: imageID},
        success: function (res)
        {
            if (res.status === "success")
            {
                var plate = res.numberPlate;
                var coordinates = res.coordinates; // Upper left [0], Upper Right [1], Lower Right [2], Lower Left [3]
                var upperLeftX = coordinates[0].x;
                var upperLeftY = coordinates[0].y;
                var lowerLeftY = coordinates[3].y;
                var upperRightX = coordinates[1].x;

                var width = upperRightX - upperLeftX + 10;
                var height = lowerLeftY -  upperLeftY + 20;

                console.log("Car Plate: " + plate);

                $('#plateItem').text(plate);

                createPlatePopover(imageID,width,height,upperLeftX - 10,upperLeftY - 10);
                cb('true',coordinates);
            }
            else
            {
                console.log("Car Plate FAILED");
                $('#plateItem').text("???");
                cb('false',null);
            }

        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Plate: " + jqXHR.status);
            displayError('Unable to Classify Vehicle Plate');

        }
    });
}

function createPlatePopover(imageID,width,height,x,y)
{
    var imgObject = new Image();
    imgObject.crossOrigin = null;
    imgObject.src = IMAGE_PATH + imageID;

    imgObject.onload = function ()
    {
        var newImg = getImagePortion(imgObject, width, height, x, y, 1);
        var imageHTML = '<img src="' + newImg + '"">';
        $('[data-toggle="popover"]').popover({title: 'Plate Region', content: imageHTML, html: true,placement: 'right'});
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


function generateGallery(imagePaths)
{
    var i;
    var gallery = $('.gallery');
    var html = '<div class="row">';


    var numImagesOnRow = 0;
    for (i = 0; i < imagePaths.length; ++i)
    {
        var imageHtml = generateImageHTML(imagePaths[i]);
        html += imageHtml;

        numImagesOnRow++;
        if (numImagesOnRow === 3)
        {
            html += '</div>';
            html += '<div class="row">';
            numImagesOnRow = 0;
        }

    }

    html += '</div>';
    gallery.append(html);
}

function generateImageHTML(image)
{
    var path = IMAGE_PATH + image;
    var html = '<div class="col-md-4"> <div class="thumbnail"> <img id="' + image + '" src="' + path + '" alt="" style="width:100%"> </div> </div>';

    return html;
}

function displayImage(image)
{
    $("#loadingImage").css('visibility','hidden');
    var loadingGif = '<img src="./resources/loading%20screen%20colour.gif" height="50px" width="50px">';
    $('.listElement').html(loadingGif);

    var imagePath = IMAGE_PATH + image;
    $("#mainImage").attr("src", imagePath);


}

function onSignIn(googleUser)
{
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}