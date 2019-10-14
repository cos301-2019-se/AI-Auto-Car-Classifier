//const { apiKey, authDomain, dbUrl, projectId, senderId, appId } = require('../config/config');

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
        signInUser(result.user)
        // ...
      }).catch(function(error) {
            console.log('Could not sign in user', error)        
      });
}


function signInUser(user) {
    if(!user.email){
        //Tell user they need to have an email linked to facebook to continue
    }
	$.ajax({
        method: "POST",
        url: "/auth/login",
        dataType: "json",
        data: {
			name: user.displayName,
			email: user.email
		},
        success: function (res) {
            console.log("Hello there");
            if(res.token){
                localStorage.setItem("authToken", res.token);
                window.location = '/dashboard.html';
            }
            console.log(res);
            /**otherwise tell the user something went wring logging them in */
        },
        error: function (error){
            /**
             * Tell the user we could not log them in. Do not redirect them to index
             */
			console.log('something went wrong!', error);
			return false;
        }
    });
}

function logout() {
    firebase.auth().signOut().then(function() {
        // Sign-out successful.
        localStorage.removeItem("authToken");
        window.location = '/index.html';
    }).catch(function(error) {
        // An error happened.
        console.log("Something went wrong logging out", error)
    });
}