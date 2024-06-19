// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  getFirestore,
  doc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';



// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAX5YEJ3Y2hNi_47JkOuKWi0c_iEleTxLw",
  authDomain: "esmadconnect.firebaseapp.com",
  projectId: "esmadconnect",
  storageBucket: "esmadconnect.appspot.com",
  messagingSenderId: "9895829",
  appId: "1:9895829:web:a9c2013257d5b3c656809c"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize auth
const auth = getAuth(app)

// Initialize Firestore
const db = getFirestore(app);

//create user 
document.getElementById("createAccountForm").addEventListener("submit", (event) => createAccount(event))

function createAccount(event) {          
  event.preventDefault()
  const email = document.getElementById("InputEmailcreator").value
  const password = document.getElementById("InputPasswordcreator").value
  createUserWithEmailAndPassword(auth, email, password)
    .then(function (user) {
      console.log(user)
    })
    .catch((error) => {
      console.log(error.code)
      console.log(error.message)
    });
}

//add user to firestore
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await setDoc(doc(db, "users", user.uid), {
      favorites: [""],                                   //setting default information that user can edit later
      preferences: ["Design", "Multimedia", "Tech", "General"],
    })
    console.log("Successful")
    window.location.href = "index.html"
  }
  else {
    // User is signed out
    // ...
  }
});
