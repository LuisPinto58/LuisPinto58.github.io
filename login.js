// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';



// Your web app's Firebase configuration
const firebaseConfig = {
  ${{ secrets.FIREBASECONFIG }}
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const auth = getAuth(app)


document.getElementById("LogInForm").addEventListener("submit", (event) => logIn(event)) //log in function

function logIn(event) {
  event.preventDefault()
  const email = document.getElementById("InputEmail").value
  const password = document.getElementById("InputPassword").value
  signInWithEmailAndPassword(auth, email, password)
    .then((user) => {
      console.log(user)
      window.location.href = "index.html"
    })
    .catch(error => {
      console.log(error.code)
      document.getElementById("errorMessage").classList.remove("d-none") //for showing error message
    })
}

//for forgetting password, uses firebase password reset
document.getElementById("forgotPassword").addEventListener("click", () => passwordReset())

function passwordReset() {
  const email = prompt("Enter email.")
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Password reset email sent.")
    })
    .catch((error) => {
      console.log(error.code);
      HTMLFormControlsCollection.log(error.message)
    });

}





