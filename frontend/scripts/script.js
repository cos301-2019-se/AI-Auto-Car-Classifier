
$( document ).ready(function()
{
    const uploadButton = document.querySelector('.browse-btn');
    const fileInfo = document.querySelector('.file-info');
    const realInput = document.getElementById('real-input');

    uploadButton.addEventListener('click', (e) => {
        realInput.click();
    });

    realInput.addEventListener('change', () => {
        const name = realInput.value.split(/\\|\//).pop();
        const truncated = name.length > 20
            ? name.substr(name.length - 20)
            : name;

        fileInfo.innerHTML = truncated;

        var title = $('#title').val();

        $('.uploadForm').ajaxSubmit({
            data: {title: title},
            contentType: 'multipart/form-data',
            success: function(response){
                console.log('image uploaded and form submitted');
            }
        });
        return false;
    });


    $('.uploadForm').submit(function(e){
        e.preventDefault();


    });


});

/*function uploadImages()
{
    var files = $('#input-file').prop('files');

    $.ajax({
        type: "POST",
        url: "http://localhost:3000/classify/submit_multiple",
        data: files,
        processData: false,
        contentType: false,
        success: function(r){
            console.log("result",r)
        },
        error: function (e) {
            console.log("some error", e);
        }
    });

}*/

function displayImage(imagePath)
{
    console.log( "ready!" );
    var canvas = $("#pictureCanvas");
    var context = canvas.getContext("2d");
    var image = new Image();
    image.src = imagePath;

    image.onload = function(){drawImageProp(context, image, 0, 0, canvas.width, canvas.height);}

}

function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
}


function onSignIn(googleUser)
{
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}