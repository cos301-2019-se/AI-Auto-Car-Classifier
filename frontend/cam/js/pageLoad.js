
function loadCam(){
    document.write( '<html>\n' );
    document.write( '<head>\n' );
    document.write( '  <meta charset=\"utf-8\">\n' );
    document.write( '  <meta name=\"viewport\" content=\"width=device-width, user-scalable=yes, initial-scale=1, maximum-scale=1\">\n' );
    document.write( '  <meta name=\"description\" content=\"Smart Device Camera Template for HTML, CSS, JS and WebRTC\">\n' );
    document.write( '  <meta name=\"keywords\" content=\"HTML,CSS,JavaScript, WebRTC, Camera\">\n' );
    document.write( '  <title>CameraView</title>\n' );
    document.write( '  <link rel=\"stylesheet\" type=\"text/css\" href=\"style.css\">\n' );
    document.write( '</head>\n' );
    document.write( '<body>\n' );
    document.write( '  <div id=\"container\">\n' );
    document.write( '    <div id=\"vid_container\">\n' );
    document.write( '        <video id=\"video\" autoplay playsinline></video>\n' );
    document.write( '        <div id=\"video_overlay\"></div>\n' );
    document.write( '    </div>\n' );
    document.write( '    <div id=\"gui_controls\">\n' );
    document.write( '        <button id=\"switchCameraButton\" name=\"switch Camera\" type=\"button\" aria-pressed=\"false\"></button>\n' );
    document.write( '        <button id=\"takePhotoButton\" name=\"take Photo\" type=\"button\"></button>\n' );
    document.write( '        <button id=\"toggleFullScreenButton\" name=\"toggle FullScreen\" type=\"button\" aria-pressed=\"false\"></button>\n' );
    document.write( '    </div>\n' );
    document.write( '  </div> \n' );
    document.write( '  <script>comsole.log(\'Loading\')</script>\n' );
    document.write( '  <script src=\"js/DetectRTC.min.js\"></script>\n' );
    document.write( '  <script src=\"js/adapter.min.js\"></script>  \n' );
    document.write( '  <script src=\"js/screenfull.min.js\"></script>\n' );
    document.write( '  <script src=\"js/main.js\"></script>\n' );
    document.write( '  <script src=\"js/howler.core.min.js\"></script> \n' );
    document.write( '</body>\n' );
    document.write( '</html>' );
}

