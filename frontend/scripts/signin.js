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
			console.log('something went wrong!');
			console.log(`${exception}`);
			return false;
        }
    });
}