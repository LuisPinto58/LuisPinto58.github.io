let mins = 25
let count = 0
let rmins = 5
let r = 0
let s = 0

if ("serviceWorker" in navigator) {
    console.log("service worker supported")
    navigator.serviceWorker.register("./sw.js").then(function(){
        console.log("service worker is registered")
    });
}

let timer = document.getElementById("timer")
let time = document.getElementById("time")
let rest = document.getElementById("rest")
let start = document.getElementById("start")
let stop = document.getElementById("stop")
let reset = document.getElementById("reset")

start.addEventListener("click", () =>{
    if (s==0) {
        mins = time.value
        rmins = rest.value
    }
    else if (s==1 && r == 0) {
        mins = timer.innerHTML
    }else if(s==1 && r== 1){
        rmins = timer.innerHTML
    }
    myInterval = setInterval(countDown,500)

})

function countDown(){
    if(r==0){
        mins--
        timer.innerHTML = mins
        if(mins == 0){
            console.log("rest")
            r=1
        }
    }
    if(r==1){
        rmins--
        timer.innerHTML = rmins
        if(rmins == 0){
            console.log("rest ended")
            clearInterval(myInterval)
            r = 0
            s = 0
            let listItem = document.createElement("li")
            listItem.innerHTML = new Date()
            document.getElementById("list").appendChild(listItem)
        }
    }
}

stop.addEventListener("click", () =>{
    clearInterval(myInterval)
    s = 1
})


reset.addEventListener("click", () =>{
    clearInterval(myInterval)
    timer.innerHTML = 25
})
