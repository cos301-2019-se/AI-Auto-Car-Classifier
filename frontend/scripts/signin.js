
const firebaseConfig = {
    apiKey: "AIzaSyCB24cefzF7l0aGN2NIjGQkozZ3fA0Jx0k",
    authDomain: "fabled-gist-246121.firebaseapp.com",
    databaseURL: "https://fabled-gist-246121.firebaseio.com",
    projectId: "fabled-gist-246121",
    storageBucket: "fabled-gist-246121.appspot.com",
    messagingSenderId: "161898052209",
    appId: "1:161898052209:web:dd313493716149b3"
};

firebase.initializeApp(firebaseConfig);

function signIn(e){
    let provider;
    if(e.target.id == "google"){
        provider = new firebase.auth.GoogleAuthProvider();
    } else {
        provider = new firebase.auth.FacebookAuthProvider();
    }
    firebase.auth().signInWithPopup(provider).then(function(result) {
        // This gives you a Google Access Token. You can use it to access the Google API.
        var token = result.credential.accessToken;
        // The signed-in user info.
        var user = result.user;
        console.log(user);
        // ...
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
      });
}


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
            console.log(res);
            if(res.token){
                localStorage.setItem("authToken", res.token);
                window.location = '/dashboard.html';
            }
            /**otherwise tell the user something went wring logging them in */
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