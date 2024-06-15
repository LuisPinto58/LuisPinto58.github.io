// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



import {           //authentication
    getAuth,
    signOut,
    onAuthStateChanged,
    updatePassword,
  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';


  import {      //database
    getFirestore,
    doc,
    collection,
    getDoc,
    updateDoc,
    query,
    orderBy,
    where,
    getDocs,
  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  
  import {  //storage
    getStorage,
    ref,
    getDownloadURL,
    uploadBytes,
  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';



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

let myFavorites
const userFolder = ref(storage, "users")
let userId

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("notLogged").classList.add("d-none")
        document.getElementById("Logged").classList.remove("d-none")
        userId= user.uid
        const refimage = ref(userFolder, userId)
        document.getElementById("pfp").src = await getDownloadURL(refimage)
        
        //for getting Favorites
        const docSnap = await getDoc(doc(db, "users", user.uid))
        if (docSnap.exists()) {
            myFavorites = docSnap.data().favorites
            await getFavorites()
        } else {
        // docSnap.data() will be undefined in this case
        console.log("No such document!");
        }
        
    } else {
      // User is signed out
      document.getElementById("notLogged").classList.remove("d-none")
      document.getElementById("Logged").classList.add("d-none")
    }
  });

  //logOut

  document.getElementById("logOut").addEventListener("click", ()=> logOut())

  function logOut(){
    signOut(auth).then(()=>{
        console.log("logout")
    }) 
    location.reload()
  }


  //changePassword
  document.getElementById("PasswordForm").addEventListener("submit", (event)=> changePassword(event))

  function changePassword(event){
    event.preventDefault()

    const user = auth.currentUser;
    const newPassword = document.getElementById("InputPasswordNew").value

    updatePassword(user, newPassword).then(() => {
     alert("Password updated")
    }).catch((error) => {
        alert(error.message)
    });
  }

  //change to personal information

  document.getElementById("PItab").addEventListener("click", ()=>{
    document.getElementById("main").classList.add("d-none")
    document.getElementById("personalInfo").classList.remove("d-none")
  })

  //change pfp

  document.getElementById("file-input").addEventListener("change", async ()=>{
    document.getElementById('pfpChange').src = window.URL.createObjectURL(document.getElementById("file-input").files[0])
    const refimage = ref(userFolder, userId)
    await uploadBytes(refimage, document.getElementById("file-input").files[0])
    location.reload()

  })



   //change to favorites information

   document.getElementById("Favtab").addEventListener("click", ()=>{
    document.getElementById("main").classList.add("d-none")
    document.getElementById("favorites").classList.remove("d-none")
  })


  //change to main user
  document.getElementById("PIReturn").addEventListener("click", ()=> toMain())
  document.getElementById("FavoritesReturn").addEventListener("click", ()=> toMain())

  function toMain(){
    document.getElementById("main").classList.remove("d-none")
    document.getElementById("favorites").classList.add("d-none")
    document.getElementById("personalInfo").classList.add("d-none")
  }

//changePreferences

document.getElementById("preferencesForm").addEventListener("submit", async (event)=>  await changePreferences(event))

  async function changePreferences(event){
    event.preventDefault()

    const user = auth.currentUser;
    const Array = []

    $("input:checkbox[name=type]:checked").each(function(){
      Array.push($(this).val());
    });
      await updateDoc(doc(db, "users", user.uid),{
        preferences: Array,
      })
        
  }




//getting favorites

async function getFavorites() {
    
    if (myFavorites[0] != "") {
    const news = collection(db, 'news');
    const newsfolder = ref(storage, "news")
    let q = query(news, where("__name__", 'in', myFavorites), orderBy("startDate"))
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
  
      const card = document.createElement("div")                                 //add card  not ordering
      card.className = "col-11 col-md-4"
      card.setAttribute("data-bs-toggle", "modal")
      card.setAttribute("data-bs-target", "#newsModal")
      card.innerHTML = `<div class="card" style="max-width: 540px;">
                <div class="row g-0">
                  <div class="col-5 ${doc.data().area}">
                    <img src="${imgUrl}"
                      class="img-fluid rounded-start gradient" loading="lazy">
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
    }
  
    document.getElementsByClassName("skeleton")[0].classList.add("d-none");
    document.getElementsByClassName("skeleton")[1].classList.add("d-none"); 
    } else {
      document.getElementsByClassName("skeleton")[0].classList.add("d-none");
      document.getElementsByClassName("skeleton")[1].classList.add("d-none"); 
      document.getElementById("news").innerHTML = "<h1>Nothing here yet!</h1>"

    }
  }


//load favorite modal

function loadNewsModal(doc, image) {
  //load image
  document.getElementById("newsImage").src = image
  //skeleton
  document.getElementById("newsTitle").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsDescription").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsArea").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsRoom").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsStart").innerHTML = "■■■■■■■■■■■■"
  document.getElementById("newsEnd").innerHTML = "■■■■■■■■■■■■"

   //remove previous event listeners
   $('#newsBlock').replaceWith($('#newsBlock').clone());

  //description and title

  document.getElementById("newsTitle").innerHTML = doc.data().title
  document.getElementById("newsDescription").innerHTML = doc.data().description
  document.getElementById("newsRoom").innerHTML = doc.data().room
  document.getElementById("newsArea").innerHTML = doc.data().area
  document.getElementById("newsStart").innerHTML = `${doc.data().startDate.toDate().toDateString()} at ${doc.data().startDate.toDate().toLocaleTimeString()}`
  document.getElementById("newsEnd").innerHTML = `${doc.data().endDate.toDate().toDateString()} at ${doc.data().endDate.toDate().toLocaleTimeString()}`
  document.getElementById("newsBlock").addEventListener("click", () => showBlock(doc.data().block))


  const shareData = {                      //for sharing news through web share API
    title: doc.data().title,
    text: `Check out this ${doc.data().area} event on ${doc.data().startDate.toDate().toDateString()}!`,
    url: "news.html",
  };

  document.getElementById("newsShare").addEventListener("click", async () => {
    try {
      if (navigator.canShare){
         navigator.share(shareData);
        console.log("Share successful")
      }else{
        alert("This navigator cant share content!")
      }
    } catch (err) {
      console.log("Share unsuccessful:", err)
    }
  });
}



//to blink block on index.html
function showBlock(block) {
  if (block == "Online") {
    alert("This event is Online")
  } else if (block == "None") {
    alert("This event doesn't have a location")
  } else {
    localStorage.setItem("blinkingblock", block);
    localStorage.setItem("blinkingpermit", true);
    location.href = "index.html"
  }
}

