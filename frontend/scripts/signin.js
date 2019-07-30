//import { resolve } from "path";

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	$.ajax({
        method: "POST",
        url: "http://localhost:3000/auth/login",
        dataType: "json",
        data: {
			name: profile.getName(),
			email: profile.getEmail()
		},
        success: function (res) {
            window.location = '/index.html';
        },
        error: function (jqXHR, textStatus, exception){
            /**
             * Tell the user we could not log them in. Do not redirect them to index
             */
			console.log('something went wrong!');
			console.log(`${exception}`);
			return false;
        }
    });
}