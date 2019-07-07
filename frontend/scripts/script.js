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
            success: function (response)
            {
                console.log('image uploaded and form submitted');
            },
            complete: function ()
            {
                displayImage("D:\\Pictures\\Cars\\370z.jpg");
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
    gallery.append('<div class="row">');
    var numImagesOnRow = 0;
    for (i = 0; i < imagePaths.length; ++i)
    {
        var imageHtml = generateImageHTML(imagePaths[i]);
        gallery.append(imageHtml);

        if(numImagesOnRow === 3)
        {
            gallery.append('</div>');
            gallery.append('<div class="row"> <div class="col-md-4">');
            numImagesOnRow = 0;
        }
    }
}

function generateImageHTML(path)
{
    var html = '<div class="col-md-4"> <div class="thumbnail"> <img src="' + path + '" alt="" style="width:100%"> </div> </div>'

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