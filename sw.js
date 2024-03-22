self.addEventListener("install", function(e){
    console.log("Service Worker- Installing",e);
});

self.addEventListener("activate", function(e){
    console.log("Service Worker- Activating",e);
    return self.clients.claim();
});

self.addEventListener("fetch", function(e){
    console.log("Service Worker- Fetching something",e);
});