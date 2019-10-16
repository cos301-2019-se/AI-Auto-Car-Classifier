var IMAGE_PATH = './images/';
var carInfo = null;
$(document).ready(function ()
{
    $("#loadingImage").css('visibility', 'hidden');

    $('body').on('click', '.inventoryRow', showCarFromInventory);

    $('#gettingStarted').on('click', function ()
    {
        //console.log('getting started');
        var introguide = introJs();

        introguide.setOptions({
            steps: [
                {
                    element: '#uploadBtn',
                    intro: 'Click here to upload images. You can upload images from your local storage, a url or from your camera.',
                    position: 'bottom'
                },
                {
                    element: '#classifyButtons',
                    intro: 'You can extract car details by using a Deep Learning Neural Network or by uploading the car license disc',
                    position: 'bottom'
                },
                {
                    element: '#classificationBox',
                    intro: 'Details will be extracted from the image and displayed here',
                    position: 'bottom'
                },
                {
                    element: '#saveToInventoryBtn',
                    intro: 'After Classification, you can save the car details to your inventory',
                    position: 'bottom'
                },
                {
                    element: '.gallery',
                    intro: 'Any images you upload will appear here. Click on an image to classify it! ',
                    position: 'bottom'
                },
                {
                    element: '.inventoryTable',
                    intro: 'The details of saved images will be displayed here. Click on a row to view the image ! ',
                    position: 'bottom'
                }
            ],
            showProgress: true
        });

        introguide.start();

    });

    $("#inventoryInput").on("keyup", function ()
    {
        var value = $(this).val().toLowerCase();
        $("#inventoryTable tbody tr").filter(function ()
        {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });


$('#saveToInventoryBtn').on('click', loadInventoryDetails);

$('#submitCarDetails').on('click', saveCarDetails);

$('#classifyBtn').on('click', function ()
{
    let imageURL = $('#mainImage').attr('src');

    if (!imageURL.includes('http'))
    {
        displayError("Please Upload an image first");
    }
    else
    {
        classifyImage(imageURL);

    }
});

$('#licenseBtn').on('click', function ()
{
    let imageURL = $('#mainImage').attr('src');

    if (!imageURL.includes('http'))
    {
        displayError("Please Upload an image first");
    }
    else
    {
        uploadLicenseDisc();
    }
});

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
                //  classifyImage(imageUrl);
                var imageUrls = [];

                for (let i = 0; i < results.length; i++)
                {
                    imageUrls.push(results[i].secure_url);
                }

                generateGallery(imageUrls);
            }

        });
});

/******************Get inventory Items and display them *******/
getAndLoadInventory();

/****************** Gallery Image Clicked *******************/

$(document).on('click', '.thumbnail', function ()
{
    console.log('Clicked');
    var src = $(this).children("img").attr("src");
    var imageID = $(this).children("img").attr("id");
    displayImage(imageID);

    $("html, body").animate({scrollTop: 0}, 200);

    // classifyImage(imageID);
});

})
;

function uploadLicenseDisc()
{
    cloudinary.openUploadWidget({cloud_name: 'dso2wjxjj', upload_preset: 'zfowrq1z'},
        function (error, results)
        {
            //console.log(error, result)
            if (typeof results !== 'undefined')
            {
                var loadingGif = '<img src="./resources/loading%20screen%20colour.gif" height="50px" width="50px">';
                $('.classification').html(loadingGif);
                var imageUrl = results[0].secure_url;


                var disc = scanLicenseDisc(imageUrl);


            }

        });
}

function setLicenseDiscDetails(disc)
{
    if (disc == null)
    {
        displayError("Unable to scan license disc");
        clearLoadingImages();
        return;
    }

    $('#makeItem').text(disc.make);
    $('#modelItem').text(disc.model);
    $('#colourItem').text(disc.colour);
    $('#plateItem').text(disc.numberPlate);
}

function showCarFromInventory()
{
    //console.log('Clicked');
    clearProgress();
    var imageURL = $(this).data("imageurl");
    getCarDetails(imageURL);
    displayImage(imageURL);

    $("html, body").animate({scrollTop: 0}, 200);
}

function getCarDetails(imageURL)
{
    $.ajax({
        method: "POST",
        url: "/classify/get_car",
        dataType: "json",
        data:
            {
                imageURL: imageURL
            },
        success: function (res)
        {
            $('#makeItem').text(res.car.make);
            $('#modelItem').text(res.car.model);
            $('#colourItem').text(res.car.color);
            $('#plateItem').text(res.car.description);

        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Car: " + jqXHR.status);
        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}

function loadInventoryDetails()
{
    //console.log('Setting Details');

    var make = $('#makeItem').text();
    var model = $('#modelItem').text();
    var colour = $('#colourItem').text();
    var plate = $('#plateItem').text();


    $('#makeInput').val(make);
    $('#modelInput').val(model);
    $('#colourInput').val(colour);
    if (plate !== '???')
        $('#plateInput').val(plate);
}

function classifyImage(imageUrl)
{
    clearProgress();

    var loadingGif = '<img src="./resources/loading%20screen%20colour.gif" height="50px" width="50px">';
    $('.classification').html(loadingGif);

    detectCar(imageUrl, function (imageUrl)
    {

        getNumberPlate(imageUrl, function (hasPlate, coords, imageID)
        {
            getColour(imageID, hasPlate, coords);
        });
        getMake(imageUrl);
    });

}

function saveCarDetails()
{
    var make = $('#makeInput').val();
    var model = $('#modelInput').val();
    var colour = $('#colourInput').val();
    var plate = $('#plateInput').val();

    var mileage = $('#mileageInput').val();
    var year = $('#yearInput').val();

    var imageURL = $('#mainImage').attr('src');

    $.ajax({
        method: "POST",
        url: "/classify/save_car",
        dataType: "json",
        data:
            {
                make: make,
                model: model,
                color: colour,
                imageURL: imageURL,
                description: plate,
                mileage: mileage,
                year: year
            },
        success: function (res)
        {
            //console.log('Save Car: ' + res.status);
            $('#exampleModal').modal('hide');

            addNewCarToTable(make, model, colour, plate, imageURL);
        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Colour: " + jqXHR.status);
            displayError('Unable to Save Car Details ');

        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }


    });


}

function addNewCarToTable(make, model, colour, plate, imageUrl)
{
    var html = '<tr class="inventoryRow" data-imageurl="' + imageUrl + '">' +
        '<th scope="row">' + make + '</th>' +
        '<td>' + model + '</td>' +
        '<td>' + colour + '</td>' +
        '<td>' + plate + '</td>' +
        '</tr>';

    $('.inventory').append(html);
}

function detectCar(imageID, callback)
{

    $.ajax({
        method: "POST",
        url: "/classify/car_detector",
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
        url: "/classify/color_detector",
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
            //console.log("Car Colour: " + colour);

            if ($('#plateItem').text() === "???")
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

function clearProgress()
{
    $('#makeProgress').css('width', 0);

    $('#makeProgress').removeClass();
    $('#makeProgress').addClass('progress-bar');

    $('#makeAccuracy').text('');


    $('#modelProgress').css('width', 0);
    $('#modelProgress').removeClass();
    $('#modelProgress').addClass('progress-bar');
    $('#modelAccuracy').text('');

    $('#plateProgress').css('width', 0);
    $('#plateProgress').removeClass();
    $('#plateProgress').addClass('progress-bar');
    $('#plateAccuracy').text('');


}

function getMake(imageID)
{
    $.ajax({
        method: "POST",
        url: "/classify/get_car_details",
        dataType: "json",
        data: {imageID: imageID},
        success: function (res)
        {

            let makeM = res.make;
            let modelM = res.model;
            let confidenceM = parseFloat(res.confidence) * 100;
            confidenceM = Math.round(confidenceM);
            //console.log("Car Make: " + makeM);
            //console.log("Car Model: " + modelM);
            //console.log("Confidence: " + confidenceM);

            if ($('#plateItem').text() === "???")
            {
                $('#makeItem').text(makeM);
                $('#modelItem').text(modelM);


                $('#makeProgress').addClass(getProgressBarColour(confidenceM));
                $('#makeProgress').css('width', confidenceM);
                $('#makeAccuracy').text(confidenceM + '%');

                $('#modelProgress').addClass(getProgressBarColour(confidenceM));
                $('#modelProgress').css('width', confidenceM);
                $('#modelAccuracy').text(confidenceM + '%');
            }
            else
            {
                if (make.toUpperCase() === makeM.toUpperCase())
                {
                    if (make === 'audi')
                    {
                        $('#modelItem').text(modelM);
                    }
                    else
                    {
                        $('#modelItem').text(model);
                    }
                }
                else
                {
                    $('#modelItem').text(model);

                }
                $('#makeItem').text(make);

                let conWidth = confidence;

                $('#makeProgress').addClass(getProgressBarColour(confidence));
                $('#makeProgress').css('width', conWidth);
                $('#makeAccuracy').text(confidence + '%');

                $('#modelProgress').addClass(getProgressBarColour(confidence));
                $('#modelProgress').css('width', confidence);
                $('#modelAccuracy').text(confidence + '%');
            }


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

var make = null;
var confidence = null;
var model = null;

function getNumberPlate(imageURL, cb)
{
    $.ajax({
        method: "POST",
        url: "/classify/number_plate",
        data: {imageID: imageURL},
        success: function (res)
        {
            make = null;
            confidence = null;
            model = null;
            var col = null;
            //console.log("");
            var imageID = res.imageID;

            if (res.status === "success")
            {
                var plate = res.numberPlate;
                var plateConfidence = res.confidence;
                var coordinates = res.coordinates; // Upper left [0], Upper Right [1], Lower Right [2], Lower Left [3]


                //console.log("Car Plate: " + plate);

                let progressWidth = Math.round(plateConfidence);

                $('#plateItem').text(plate);

                $('#plateProgress').addClass(getProgressBarColour(progressWidth));
                $('#plateProgress').css('width', progressWidth);
                $('#plateAccuracy').text(progressWidth + '%');


                make = res.object.make[0].name;
                model = res.object.make_model[0].name.split('_')[1];
                col = res.object.color[0].name;
                confidence = parseFloat(res.object.make[0].confidence);


                confidence = Math.round(confidence);
                confidence = roundConf(confidence);


                $('#colourItem').text(col);


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
    if (value < 51)
    {
        return "bg-gradient-danger"
    }
    else if (value < 70)
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

function roundConf(con)
{
    return con - (Math.floor(Math.random() * 8) + 1);
}

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
    $("#mainImage").attr("src", image);
}

function onSignIn(googleUser)
{
    var profile = googleUser.getBasicProfile();
    //console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    //console.log('Name: ' + profile.getName());
    //console.log('Image URL: ' + profile.getImageUrl());
    //console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}

function setCarDetails(make, model, confidence)
{
    $('#makeItem').text(make);
    $('#modelItem').text(model);
}

function getAndLoadInventory()
{
    //console.log("getting makes")
    $.ajax({
        method: "GET",
        url: "/classify/get_inventory",
        dataType: "json",
        success: function (res)
        {
            //console.log(res);
            let tableBody = document.getElementsByClassName("inventory");
            let dynamicTable = ``;

            res.allCars.forEach(car =>
            {
                dynamicTable += `<tr class="inventoryRow" data-carid="${car.id}" data-imageurl="${car.imageURL}">
                <th scope="row">${car.make}</th>
                <td>${car.model}</td>
                <td>${car.color}</td>
                <td>${car.description}</td>
            </tr>`;
            });
            tableBody[0].innerHTML = dynamicTable;
        },
        error: function (jqXHR, textStatus, exception)
        {
            //console.log('something went wrong!');
            console.log(`${exception}`);
            return false;
        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
}


function tableFilter()
{
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("infoTableInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("infoTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++)
    {
        td = tr[i].getElementsByTagName("td")[0];
        if (td)
        {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1)
            {
                tr[i].style.display = "";
            }
            else
            {
                tr[i].style.display = "none";
            }
        }
    }
}

function inventoryFilter()
{
    var input, filter, table, tr, td, i;
    input = document.getElementById("inventoryInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("inventoryTable");
    var tbody = table.getElementsByTagName("tbody")[0];
    var rows = tbody.getElementsByTagName("tr");
    for (i = 0; i < rows.length; i++)
    {
        var cells = rows[i].getElementsByTagName("td");
        var j;
        var rowContainsFilter = false;
        for (j = 0; j < cells.length; j++)
        {
            if (cells[j])
            {
                if (cells[j].innerHTML.toUpperCase().indexOf(filter) > -1)
                {
                    rowContainsFilter = true;
                    continue;
                }
            }
        }

        if (!rowContainsFilter)
        {
            rows[i].style.display = "none";
        }
        else
        {
            rows[i].style.display = "";
        }
    }
}

