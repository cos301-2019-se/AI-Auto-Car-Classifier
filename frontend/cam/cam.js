var vid = document.getElementById('vid');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) 
{
   navigator.mediaDevices.getUserMedia({ vid: true }).then(function(stream) {
      vid.srcObject = stream;
      vid.play();
    });
}


//Take a napshot using the code below
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var vid = document.getElementById('vid');

//Take a picture
document.getElementById("snap").addEventListener("click", function() 
{
	context.drawImage(vid, 0, 0, 640, 480);
});