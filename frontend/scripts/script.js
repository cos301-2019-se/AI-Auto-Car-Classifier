$(document).ready(function ()
{
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




});


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
    var html = '<div class="col-md-4"> <div class="thumbnail"> <img src="' + path + '" alt="" style="width:100%"> </div> </div>';

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