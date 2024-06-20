// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {            //database
  getFirestore,
  doc,
  setDoc,
  Timestamp,
  collection,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import {             //file storage
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





const newsfolder = ref(storage, "news")
let categoryButton
let q
let preferences = ["Design", "Multimedia", "Tech", "General"]        //for "for you" page
const news = collection(db, 'news');
let CurrentUser




onAuthStateChanged(auth, async (user) => {
  if (user) {
    CurrentUser = user.uid;

    const docSnap = await getDoc(doc(db, "users", user.uid))
    if (docSnap.exists()) {
      preferences = docSnap.data().preferences                  //for for you page
      Notification.requestPermission(function(status){              //will request permission for notifications
        console.log("Notification permission status:", status);
       });
      categoryButton = "forYouButton"
      q = query(news, where('area', 'in', preferences), orderBy("startDate"))

      if (docSnap.data().adminToken == true) {
        // for admin functionality
        $('.admin').removeClass('d-none');
      }

      await loadNews(q)


    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  } else {
    // User is signed out will disable logged user functions
    document.getElementById("forYouButton").disabled = true
    document.getElementById("newsFav").disabled = true
    categoryButton = "allButton"
    buttonChange(categoryButton, "allButton")
    q = query(news, orderBy("startDate"))
    await loadNews(q)

  }
});


//button functions, will change category and database query for content related to clicked button
document.getElementById("forYouButton").addEventListener("click", () => {
  buttonChange(categoryButton, "forYouButton")
  categoryButton = "forYouButton"
  unloadNews()
  q = query(news, where('area', 'in', preferences), orderBy("startDate"))
  loadNews(q)

})
document.getElementById("allButton").addEventListener("click", () => {
  buttonChange(categoryButton, "allButton")
  categoryButton = "allButton"
  unloadNews()
  q = query(news, orderBy("startDate"))
  loadNews(q)
})
document.getElementById("designButton").addEventListener("click", () => {
  buttonChange(categoryButton, "designButton")
  categoryButton = "designButton"
  unloadNews()
  q = query(news, where('area', '==', 'Design'), orderBy("startDate"))
  loadNews(q)
})
document.getElementById("multimediaButton").addEventListener("click", () => {
  buttonChange(categoryButton, "multimediaButton")
  categoryButton = "multimediaButton"
  unloadNews()
  q = query(news, where('area', '==', 'Multimedia'), orderBy("startDate"))
  loadNews(q)
})
document.getElementById("techButton").addEventListener("click", () => {
  buttonChange(categoryButton, "techButton")
  categoryButton = "techButton"
  unloadNews()
  q = query(news, where('area', '==', 'Tech'), orderBy("startDate"))
  loadNews(q)
})
document.getElementById("generalButton").addEventListener("click", () => {
  buttonChange(categoryButton, "generalButton")
  categoryButton = "generalButton"
  unloadNews()
  q = query(news, where('area', '==', 'General'), orderBy("startDate"))
  loadNews(q)
})

function buttonChange(oldButton, newButton) {
  document.getElementById(oldButton).classList.add('btn-outline-dark')
  document.getElementById(oldButton).classList.remove('btn-dark')
  document.getElementById(newButton).classList.remove('btn-outline-dark')
  document.getElementById(newButton).classList.add('btn-dark')
}


//load news
async function loadNews(q) {
  const node = document.getElementById("news")

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const refimage = ref(newsfolder, doc.id)                //getting image
    const imgUrl = await getDownloadURL(refimage)
    const elipse = document.createElement("div")                                 //add elipse
    elipse.className = "col-1  d-md-none d-flex align-items-center";
    const currentDate = new Date()
    if (doc.data().startDate.toDate() <= currentDate && doc.data().endDate.toDate() >= currentDate) {
      elipse.innerHTML = '<img src="src/circle.svg" alt="circle" height="28px">'
    } else if (doc.data().endDate.toDate() < currentDate) {
      await deleteNews(doc)
    } else {
      elipse.innerHTML = '<img src="src/circlefuture.svg" alt="circle" height="28px">'
    }

    const card = document.createElement("div")                                 //adding cards to news tab 
    card.className = "col-11 col-md-4"
    card.setAttribute("data-bs-toggle", "modal")
    card.setAttribute("data-bs-target", "#newsModal")
    card.innerHTML = `<div class="card" style="max-width: 540px;">
              <div class="row g-0">
                <div class="col-5 ${doc.data().area}">
                  <img src="${imgUrl}"
                    class="img-fluid rounded-start gradient NO-CACHE" loading="lazy">
                </div>
                <div class="col-7">
                  <div class="card-body">
                    <h6 class="card-title">${doc.data().title}</h6>
                    <span class="card-text">${doc.data().startDate.toDate().toDateString()} at ${doc.data().startDate.toDate().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>`
    node.appendChild(elipse)
    node.appendChild(card)
    card.addEventListener("click", () => loadNewsModal(doc, imgUrl))

    //making sure images  get updated
    $('.NO-CACHE').attr('src', function () { return $(this).attr('src') + "?a=" + Math.random() })
  }


  document.getElementsByClassName("skeleton")[0].classList.add("d-none"); //removing skeleton screen element
  document.getElementsByClassName("skeleton")[1].classList.add("d-none");
}

//unload news
function unloadNews() {
  const node = document.getElementById("news")
  node.innerHTML = `<div class="col-1  d-md-none d-flex align-items-center skeleton">
        <img src="src/circle.svg" alt="user" height="28px">
      </div>
      <div class="col-11 col-md-4 skeleton">
        <div class="card" style="max-width: 540px;">
          <div class="row g-0">
            <div class="col-5 General">
              <img src="https://firebasestorage.googleapis.com/v0/b/projtest-2178c.appspot.com/o/news%20images%2Fgrey.jpg?alt=media&token=23cea584-44b6-4cf8-b2ab-8359e00aa5e6"class="img-fluid rounded-start gradient">
            </div>
            <div class="col-7">
              <div class="card-body">
                <h6 class="card-title">■■■■■■■■■■■■■■■■■■■■■■</h6>
                <span class="card-text">■■■■■■■■■■■■</span>
                <p class="card-text">■■■■■■■■■■■■■■■</p>
              </div>
            </div>
          </div>
        </div>
      </div>`
}

//load modal
function loadNewsModal(doc, image) {                           //will load content to modal of card clicked
  //load image
  document.getElementById("newsImage").src = image


  //making sure images  get updated
  $('.NO-CACHE').attr('src', function () { return $(this).attr('src') + "?a=" + Math.random() })

  //skeleton
  document.getElementById("newsTitle").innerHTML = "■■■■■■■■■■■■"                  //while its replacing content, modal will show skeleton
  document.getElementById("newsDescription").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsArea").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsRoom").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsStart").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsEnd").innerHTML = "■■■■■■■■■■■■"

  //remove previous event listeners
  $('#newsBlock').replaceWith($('#newsBlock').clone());
  $('#newsEdit').replaceWith($('#newsEdit').clone());
  $('#newsFav').replaceWith($('#newsFav').clone());

  //description and title
  document.getElementById("newsTitle").innerHTML = doc.data().title
  document.getElementById("newsDescription").innerHTML = doc.data().description
  document.getElementById("newsRoom").innerHTML = doc.data().room
  document.getElementById("newsArea").innerHTML = doc.data().area
  document.getElementById("newsStart").innerHTML = `${doc.data().startDate.toDate().toDateString()} at ${doc.data().startDate.toDate().toLocaleTimeString()}`
  document.getElementById("newsEnd").innerHTML = `${doc.data().endDate.toDate().toDateString()} at ${doc.data().endDate.toDate().toLocaleTimeString()}`
  document.getElementById("newsBlock").addEventListener("click", () => showBlock(doc.data().block))
  document.getElementById("newsEdit").addEventListener("click", () => editNews(doc))
  document.getElementById("newsFav").addEventListener("click", () => { favorites(doc) }
  )


  const shareData = {                      //for sharing news through web share API
    title: doc.data().title,
    text: `Check out this ${doc.data().area} event on ${doc.data().startDate.toDate().toDateString()}!`,
    url: "news.html",
  };

  document.getElementById("newsShare").addEventListener("click", async () => {
    try {
      if (navigator.canShare) {
        navigator.share(shareData);
        console.log("Share successful")
      } else {
        alert("This navigator cant share content!")
      }
    } catch (err) {
      console.log("Share unsuccessful:", err)
    }
  });
}


//favorites
async function favorites(documento) {
  const docSnap = await getDoc(doc(db, "users", CurrentUser))
  if (docSnap.exists()) {
    if (docSnap.data().favorites.includes(documento.id)) {                       //to remove favorites
      const Array = docSnap.data().favorites
      Array.splice(docSnap.data().favorites.indexOf(documento.id), 1)
      if (Array[0] == undefined) {                           //favorite query on user.js cant work with empty array
        Array.push("")
      }
      await updateDoc(docSnap.ref, {
        favorites: Array
      })
      const favpopup = document.getElementById("myFavPopup");   //triggering pop up
      favpopup.innerHTML = "Removed from favorites"
      favpopup.classList.toggle("show")
      setTimeout(() => {
        favpopup.classList.toggle("show")
      }, "5000");
    } else {                                                         //to add favorites
      const Array = docSnap.data().favorites
      Array.splice(0, 0, documento.id)
      if (Array.includes("")) {                            //favorite query on user.js also cant work if array has empty string
        Array.splice(Array.indexOf(""), 1)
      }
      await updateDoc(docSnap.ref, {
        favorites: Array
      })
      const favpopup = document.getElementById("myFavPopup");   //triggering pop up
      favpopup.innerHTML = "Added to favorites"
      favpopup.classList.toggle("show")
      setTimeout(() => {
        favpopup.classList.toggle("show")
      }, "5000");
    }
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
}

//to blink block on index.html
function showBlock(block) {
  if (block == "Online") {
    alert("This event is Online")
  } else if (block == "None") {
    alert("This event doesn't have a location")
  } else {
    localStorage.setItem("blinkingblock", block);     //local storage functions for locating block in index.html
    localStorage.setItem("blinkingpermit", true);
    location.href = "index.html"
  }
}


//add news
document.getElementById("floater").addEventListener("click", () => {            //removing image in case another had been left mid edit
  document.getElementById("file-input").value = ""
  document.getElementById("newsAddImage").src = "src/imageInput.png"
})

document.getElementById("creatorForm").addEventListener("submit", (event) => createNews(event))


async function createNews(event) {
  event.preventDefault()
  await addDoc(collection(db, 'news'), {            //adding to firebase
    title: document.getElementById("titleTextarea").value,
    description: document.getElementById("descriptionTextarea").value,
    startDate: Timestamp.fromDate(new Date(document.getElementById("newsStartDate").value)),
    endDate: Timestamp.fromDate(new Date(document.getElementById("newsEndDate").value)),
    block: document.getElementById("floatingBlockSelect").value,
    room: document.getElementById("roomTextarea").value,
    area: document.getElementById("floatingAreaSelect").value
  }).then(async function (docRef) {
    const refimage = ref(newsfolder, docRef.id)
    const uploaded = document.getElementById("file-input").files[0]
    await uploadBytes(refimage, uploaded)
  })
  document.getElementById("creatorForm").reset()
  $('#newsCreationModal').modal('hide');
}

//edit news
document.getElementById("newsEdit").addEventListener("click", () => {
  document.getElementById("editfile-input").value = ""
  document.getElementById("editnewsImage").src = "src/imageInput.png"
})


async function editNews(doc) {
  //remove previous delete event listener
  $('#deleteNews').replaceWith($('#deleteNews').clone());

  document.getElementById("deleteNews").addEventListener("click", () => deleteNews(doc))

  //will load document form fields with previously edited data
  document.getElementById("edittitleTextarea").innerHTML = doc.data().title
  document.getElementById("editdescriptionTextarea").innerHTML = doc.data().description
  document.getElementById("editroomTextarea").innerHTML = doc.data().room
  document.getElementById(`editselect${doc.data().block}`).setAttribute("selected", "")
  document.getElementById(`editselect${doc.data().area}`).setAttribute("selected", "")
  document.getElementById("editnewsStartDate").value = new Date(doc.data().startDate.toDate().getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19)
  document.getElementById("editnewsEndDate").value = new Date(doc.data().endDate.toDate().getTime() + new Date().getTimezoneOffset() * -60 * 1000).toISOString().slice(0, 19)


  document.getElementById("editForm").addEventListener("submit", async (event) => {
    event.preventDefault()
    await setDoc(doc.ref, {              //loaded information is important due to using setDoc function without merge
      title: document.getElementById("edittitleTextarea").value,
      description: document.getElementById("editdescriptionTextarea").value,
      startDate: Timestamp.fromDate(new Date(document.getElementById("editnewsStartDate").value)),
      endDate: Timestamp.fromDate(new Date(document.getElementById("editnewsEndDate").value)),
      block: document.getElementById("editfloatingBlockSelect").value,
      room: document.getElementById("editroomTextarea").value,
      area: document.getElementById("editfloatingAreaSelect").value
    }).then(async function () {
      if (document.getElementById("editfile-input").files.length != 0) {         //will check if file input is empty so storage isnt updated. This is the only field that isnt required
        const refimage = ref(newsfolder, doc.id)
        const uploaded = document.getElementById("editfile-input").files[0]
        await uploadBytes(refimage, uploaded)
      }
      $('#editModal').modal('hide');
    })
  })
}

//delete News
async function deleteNews(doc) {
  await deleteDoc(doc.ref)
  await deleteObject(ref(newsfolder, doc.id)).then(() => {         //to remove image from storage
    console.log("file deleted")
  }).catch((error) => {
    console.log("error: " + error)
  });
  const d = query(collection(db, "users"), where("favorites", "array-contains", doc.id)) //to remove from users favorites 
  const querySnap = await getDocs(d);
  querySnap.forEach(async (documento) => {
    const Array = documento.data().favorites
    Array.splice(documento.data().favorites.indexOf(doc.id), 1)
    if (Array[0] == undefined) {                           //favorite query on user.js cant work with empty array
      Array.push("")
    }
    await updateDoc(documento.ref, {
      favorites: Array
    })

  });
}


//alert that there have been alterations to database live

let count = 0

onSnapshot(collection(db, "news"), () => {
  if (count == 0) {
    count++        //to make sure "alterations" arent just the initial load
  } else {
    const popup = document.getElementById("myPopup");
    popup.classList.toggle("show")
    //will send a local notification to user
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations[0].showNotification("There have been content changes to this page! Refresh for new content!", { icon: "src/icon-512x512.png" });
    });
    setTimeout(() => {
      popup.classList.toggle("show")
    }, "5000");
  }
})