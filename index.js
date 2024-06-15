// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {         //database
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import {         //storage
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';

import {                //authentication
  getAuth,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


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

// Initialize Firestore
const db = getFirestore(app);
const storage = getStorage(app)
const auth = getAuth(app)


if ("serviceWorker" in navigator) {
  console.log("service worker supported")
  navigator.serviceWorker.register("./sw.js").then(function () {
    console.log("service worker is registered")
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docSnap = await getDoc(doc(db, "users", user.uid))
    if (docSnap.exists()) {
      if (docSnap.data().adminToken == true) {
        $('.admin').removeClass('d-none');
      }
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  } else {
    //user is signed out
  }
});

let blinkingpermit = localStorage.getItem('blinkingpermit')      //for executing the block location feature from the news tab

const placeFolder = ref(storage, "places")
const blockFolder = ref(storage, "block")
let currentBlock = ""

if (blinkingpermit) {
  let block = localStorage.getItem('blinkingblock')
  blinkBlock(block)
}

function blinkBlock(block) {
  let verify = true
  let counter = 0

  const t = setInterval(function () {
    if (verify) {
      document.getElementById(`block${block}`).style.stroke = "#d14124"
      document.getElementById(`block${block}web`).style.stroke = "#d14124"
      verify = false
    } else {
      document.getElementById(`block${block}`).style.stroke = "none"
      document.getElementById(`block${block}web`).style.stroke = "none"
      verify = true
    }
    counter++
    if (counter > 5) {
      localStorage.removeItem('blinkingblock')
      localStorage.removeItem('blinkingpermit')
      stopBlink(t)
      counter = 0
    }
  }, 500);
}

function stopBlink(t) {
  clearInterval(t)

}



let blocks = ["A", "B", "C", "D", "E", "F", "G"]
let counter = 0

for (let index = 0; index < blocks.length; index++) {
  document.getElementById(`block${blocks[index]}`).addEventListener("click", () => loadModal(blocks[index]))
  document.getElementById(`block${blocks[index]}web`).addEventListener("click", () => loadModal(blocks[index]))
  onSnapshot(collection(doc(db, "block", blocks[index]), "places"), () => {                  //places information onsnapshots
    if (counter < 5) {
      counter++
    } else {
      const popup = document.getElementById("myPopup");
      popup.classList.toggle("show")
      setTimeout(() => {
        popup.classList.toggle("show")
      }, "5000")
    }
  })
}

onSnapshot(collection(db, "block"), () => {                  //block information
  if (counter < 6) {
    counter++
  } else {
    const popup = document.getElementById("myPopup");
    popup.classList.toggle("show")
    setTimeout(() => {
      popup.classList.toggle("show")
    }, "5000");
  }
})




//block modal
async function loadModal(block) {
  //skeleton
  document.getElementById("blockImage").src = "src/ESMADgray.png"
  document.getElementById("blockPlaces").innerHTML = ""
  document.getElementById("blockLetter").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("blockDescription").innerHTML = "■■■■■■■■■■■■"
  const blockFolder = ref(storage, "block")
  const imageUrl = await getDownloadURL(ref(blockFolder, `${block}.jpg`))
  document.getElementById("blockImage").src = imageUrl

  //description and block
  const blockref = doc(db, "block", `${block}`)
  const docSnap = await getDoc(blockref);
  if (docSnap.exists()) {
    document.getElementById("blockLetter").innerHTML = "Block " + block
    document.getElementById("blockDescription").innerHTML = docSnap.data().description
    //for edit button
    //removes other event listeners for editing and creating place
    $('#blockEdit').replaceWith($('#blockEdit').clone());
    document.getElementById("blockEdit").addEventListener("click", () => editBlock(docSnap))
  } else {
    console.log('No such document!');
  }
  //places  
  const placecollection = collection(blockref, "places")
  const snapshot = await getDocs(placecollection);
  snapshot.forEach((doc) => {
    const newPlace = document.createElement("h5")
    newPlace.innerHTML = doc.data().name
    newPlace.setAttribute("data-bs-toggle", "modal")
    newPlace.setAttribute("data-bs-target", "#placeModal")
    newPlace.addEventListener("click", () => loadLocation(doc))
    document.getElementById("blockPlaces").appendChild(newPlace)
  });

}

//place modal
async function loadLocation(doc) {
  //skeleton
  document.getElementById("placeImage").src = "src/ESMADgray.png"
  document.getElementById("placeName").innerHTML = "■■■■■■"
  document.getElementById("placeDescription").innerHTML = "■■■■■■■■■■■■"
  //description and name

  document.getElementById("placeName").innerHTML = doc.data().name
  document.getElementById("placeDescription").innerHTML = doc.data().description
  const imageUrl = await getDownloadURL(ref(placeFolder, doc.id))
  document.getElementById("placeImage").src = imageUrl


  $('#placeEdit').replaceWith($('#placeEdit').clone());        //remove other event listeners
  document.getElementById("placeEdit").addEventListener("click", () => editPlace(doc))

}

//block edit modal

async function editBlock(docSnap) {
  document.getElementById("editfile-input").value = ""
  document.getElementById("editBlockImage").src = "src/imageInput.png"
  document.getElementById("editBlockPlaces").innerHTML = ""
  document.getElementById("blockName").innerHTML = "block " + docSnap.data().letter
  document.getElementById("editBlockdescriptionTextarea").value = docSnap.data().description

  currentBlock = docSnap.data().letter



  //places  
  let placecollection = collection(doc(db, "block", currentBlock), "places")
  const snapshot = await getDocs(placecollection);
  snapshot.forEach((doc) => {
    const newPlace = document.createElement("h5")
    newPlace.innerHTML = doc.data().name
    document.getElementById("editBlockPlaces").appendChild(newPlace)
  });

  document.getElementById("blockEditForm").addEventListener("submit", async (event) => {
    event.preventDefault()
    await updateDoc(docSnap.ref, {
      description: document.getElementById("editBlockdescriptionTextarea").value
    }).then(async function () {
      if (document.getElementById("editfile-input").files.length != 0) {
        const refimage = ref(blockFolder, docSnap.data().letter + ".jpg")
        const uploaded = document.getElementById("editfile-input").files[0]
        await uploadBytes(refimage, uploaded)
      }
    })
    $('#blockEditModal').modal('hide');
  })
}

//Place creation 
document.getElementById("floater").addEventListener("click", () => {
  document.getElementById("placefile-input").value = ""
  document.getElementById("addPlaceImage").src = "src/imageInput.png"
})



document.getElementById("placeCreationForm").addEventListener("submit", (event) => createPlace(event))

async function createPlace(event) {
  event.preventDefault()

  await addDoc(collection(doc(db, "block", currentBlock), "places"), {
    name: document.getElementById("titleTextarea").value,
    description: document.getElementById("placeCreatordescriptionTextarea").value,
  }).then(async function (docRef) {
    const refimage = ref(placeFolder, docRef.id)
    const uploaded = document.getElementById("placefile-input").files[0]
    await uploadBytes(refimage, uploaded)
  })
  document.getElementById("placeCreationForm").reset()
  $('#placeCreationModal').modal('hide');
}



//Place edit

async function editPlace(doc) {
  $('#deletePlace').replaceWith($('#deletePlace').clone());     //remove previous event listeners

  document.getElementById("deletePlace").addEventListener("click", () => deleteLocation(doc))

  const docSnap = await getDoc(doc.ref)
  if (docSnap.exists()) {
    document.getElementById("editPlaceTitleTextarea").value = docSnap.data().name
    document.getElementById("placeEditdescriptionTextarea").value = docSnap.data().description
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }

  document.getElementById("placeEditForm").addEventListener("submit", async (event) => {
    event.preventDefault()
    await setDoc(doc.ref, {
      name: document.getElementById("editPlaceTitleTextarea").value,
      description: document.getElementById("placeEditdescriptionTextarea").value,
    }).then(async function () {
      if (document.getElementById("placeEditfile-input").files.length != 0) {
        const refimage = ref(placeFolder, doc.id)
        const uploaded = document.getElementById("placeEditfile-input").files[0]
        await uploadBytes(refimage, uploaded)
      }
      $('#placeEditModal').modal('hide');
    })
  })
}


async function deleteLocation(doc) {
  await deleteDoc(doc.ref)
  await deleteObject(ref(placeFolder, doc.id)).then(() => {
    console.log("file deleted")
  }).catch((error) => {
    console.log("error: " + error)
  });
}
