$(document).ready(function ()
{
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
                console.log('Response: ' + res.status);
                var images = res.imagePaths;
                console.log("Images: " + images);

                var path = '../backend/uploads/';
                displayImage(path + images[0]);
                generateGallery(images);
            },
            error: function ()
            {
               console.log("Error in ajax call");
            }
        });
        return false;
    });


    $('.uploadForm').submit(function (e)
    {
        e.preventDefault();
    });


/****************** Gallery Image Clicked *******************/

    $(document).on('click','.thumbnail',function()
    {
        console.log('Clicked');
        var src = $(this).children("img").attr("src");
        var imageID = $(this).children("img").attr("id");
        displayImage(src);

        $("html, body").animate({ scrollTop: 0 }, 200);

        classifyImage(imageID);
    });

});

function classifyImage(imageID)
{
    getProbability(imageID,function)
}

function getProbability(imageID,callBack)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/car_detector",
        dataType: "json",
        data: {imageID:imageID},
        success: function(res)
        {
            var prob = res.probability;

           if(prob > 80)
           {
             getColour(imageID);
           }
           else
           {
               alert("Image is not a car (" + prob + ")")
           }
        },
        error: function(jqXHR,exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);
            return -1;
        }
    });
}

function getColour(imageID)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/color_detector",
        dataType: "json",
        data: {imageID:imageID},
        success: function(res)
        {
            var colour = res.color;
            console.log("Car Colour: " + colour);

            $('#colourItem').text(colour);

            getMake(imageID);
        },
        error: function(jqXHR,exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);

        }
    });
}
function getMake(imageID)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/car_classifier",
        dataType: "json",
        data: {imageID:imageID},
        success: function(res)
        {
            var make = res.make;
            var confidence = res.confidence;
            console.log("Car Make: " + make);

            $('#makeItem').text(make + " (" + confidence + "%)");

            getNumberPlate(imageID);
        },
        error: function(jqXHR,exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);

        }
    });
}
function getNumberPlate(imageID)
{
    $.ajax({
        method: "POST",
        url: "http://localhost:3000/classify/number_plate",
        success: function(res)
        {
            var plate = res.numberPlate;
            console.log("Car Plate: " + plate);

            $('#plateItem').text(plate);
        },
        error: function(jqXHR,exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);

        }
    });
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
        if(numImagesOnRow === 3)
        {
            html += '</div>';
          html +='<div class="row">';
            numImagesOnRow = 0;
        }

    }

    html+= '</div>';
    gallery.append(html);
}

function generateImageHTML(image)
{
    var path = '../backend/uploads/' + image;
    var html = '<div class="col-md-4"> <div class="thumbnail"> <img id="'+image+'" src="' + path + '" alt="" style="width:100%"> </div> </div>';

    return html;
}

function displayImage(imagePath)
{

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