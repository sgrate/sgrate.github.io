//creates an account using the provided information and associate the display name with it
$("#createAccountBtn").click(async function() {
	
	let email = $("#newUserEmail").val();
  if (email.split("@")[1] != "stephengould.com" ) {
    alert("You must register with a Stephen Gould email.");
    return;
  }
  let password = $("#newUserPass").val();
  let displayName = $("#newUserName").val();

  await firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
		// Handle Errors here.
   var errorCode = error.code;
   var errorMessage = error.message;
   alert("Registration failed... " + error.message);
   return;
	  // ...
	});
  var user = firebase.auth().currentUser;
  user.updateProfile({
  	displayName: displayName,
  }).then(async function() {
  		// Update successful.
  		console.log("displayName associated");
  		console.log(user.displayName, user.email);
      user.sendEmailVerification().then(function() {
        // Email sent.
        firebase.auth().signOut().then(function() {
          alert(`Account created. Check ${user.email} for a confirmation email in order to be able to log in.`);
        }).catch(function(error) {
        // An error happened.
      });
      }).catch(function(error) {
        // An error happened.
      });

    }).catch(function(error) {
  		// An error happened.
  		console.log("displayName failed");
      alert("An error occurred.");
      //delete user
    });
  });

$("#forgotPassword").click(function() {
  var emailAddress = prompt("Enter your email:");
  firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
  // Email sent.
  alert(`Password reset email sent to ${emailAddress}.`)
}).catch(function(error) {
  // An error happened.
  alert(error);
});

})

/*
 * Attempts to sign the user in.
 */
 $("#signInBtn").click(async function() {
  console.log("click");
    $("#signInSpinner").fadeIn();
    document.getElementById("signInBtn").disabled = true;
    var email = $("#loginEmail").val();
    var password = $("#loginPass").val();
    var signInAttempt; 
    try {
        signInAttempt = await firebase.auth().signInWithEmailAndPassword(email, password);
        if (signInAttempt.user) {
          if (signInAttempt.user.emailVerified === false) {
            $("#signInSpinner").hide();
            alert(`Please check your email for a verification link to be able to view and manage appointments. If you need a new confirmation email, `
              + `you may request one in the 'Resend Verification' tab.` );
          }
        }
    } catch(error) {
  		// Handle Errors here.
        $("#signInSpinner").hide();
        document.getElementById("signInBtn").disabled = false;
  		var errorCode = error.code;
  		var errorMessage = error.message;
  		if (errorCode === 'auth/wrong-password') {
            alert('Wrong password.');
        } else {
            alert(errorMessage);
        }
    }

}); // end signInBtn

$("#signOutBtn").click(function() {
  if (confirm("Are you sure you would like to log out?")) {
    firebase.auth().signOut().then(function() {
     console.log("logged out");
   }).catch(function(error) {
      // An error happened.
    });
 }
});

/*
 * Attempts to resend confirmation email or log the user in if they are already verified
 */

 $("#resendEmailBtn").click(async function() {

  var email = $("#resendEmailBox").val();
  var password = $("#resendEmailPass").val();
  console.log(`email: ${email} pass: ${password}`);
  var signInAttempt; 
  try {
    signInAttempt = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log(signInAttempt);
    if (signInAttempt.user) {
      //sign-in success
      if (signInAttempt.user.emailVerified) {
        alert("Your account has already been verified. Logging you in...");
      }
      else {
        //user not verified
        signInAttempt.user.sendEmailVerification().then(function() {
            // Email sent.
            console.log("Email sent.")
            alert(`Email sent to ${signInAttempt.user.email}. Check your inbox and confirm your email to be able to log in.`);
          }).catch(function(error) {
          // An error happened.
          alert(`ERROR: ${error}`);
        });
        }

      }
    }
    catch(error) {
      // Handle Errors here.
      console.log('caught err');
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error.code, error.message);
      if (errorCode === 'auth/wrong-password') {
        alert('Wrong password.');
      } else {
        alert(errorMessage);
      }
    }

}); //end resendEmailBtn