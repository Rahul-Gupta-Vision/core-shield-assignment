const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(setMapView);
}
var destinationIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});
var destinationGroup = L.layerGroup().addTo(map);
var srcGroup = L.layerGroup().addTo(map);
var routeLayer = L.layerGroup().addTo(map);
var srcCircleLayer = L.layerGroup().addTo(map);
var destCircleLayer = L.layerGroup().addTo(map);
var destCircle = null;
var srcCircle = null;
var routeLine = null;
var watchRoute = null;
const srcSlider = document.getElementById("src-slider");
const srcSliderVal = document.getElementById("src-sliderValue");

const destSlider = document.getElementById("dest-slider");
const destSliderVal = document.getElementById("dest-sliderValue");

document.getElementById('set-location').addEventListener('click', () => {
    if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(setMapView);
      }
});
function setMapView(position){
    srcGroup.clearLayers();
    map.setView([position.coords.latitude, position.coords.longitude], 13);
    L.marker([position.coords.latitude, position.coords.longitude]).addTo(srcGroup).bindPopup('User Location');
    addSrcCircle(position.coords.latitude, position.coords.longitude, srcSlider.value);
}

map.on('click', (e) => {
    var check = document.getElementById("track-checkbox").checked;
    if(check){
        alert("First Disable Real time routing");
    }else{
        destinationGroup.clearLayers();
        L.marker(e.latlng,{ icon: destinationIcon }).addTo(destinationGroup).bindPopup("Selected Destination");
        getRoute(e.latlng.lat, e.latlng.lng);
        addDestinationCircle(e.latlng.lat, e.latlng.lng, destSlider.value);
    }
});

srcSlider.addEventListener('input', function(){
    srcSliderVal.textContent = srcSlider.value;
    var circleLayer = srcCircleLayer.getLayers()[0];
    if(circleLayer){
        circleLayer.setRadius(srcSlider.value*10);
    }else{
        srcSlider.value = 0;
        srcSliderVal.textContent = srcSlider.value;
        alert("Set the user location first");
    }
})

destSlider.addEventListener('input', function(){
    destSliderVal.textContent = destSlider.value;
    var circleLayer = destCircleLayer.getLayers()[0];
    if(circleLayer){
        circleLayer.setRadius(destSlider.value*10);
    }else{
        destSlider.value = 0;
        destSliderVal.textContent = destSlider.value;
        alert("Set the Destination location first");
    }
})


document.getElementById("track-checkbox").addEventListener('change', (e)=>{
    if(e.target.checked){
        const destLayer = destinationGroup.getLayers()[0];
        if(destLayer){
            const dest = destLayer.getLatLng();
            startRealTimeTracking(dest.lat, dest.lng);
        }else{
            alert("No destination selection found on map!");
            e.target.checked = false;
        }
    }else{
        stopTracking();
    }
})

function getRoute(destLatitude, destLongitude){
    var userLatitude = 0;
    var userLongitude = 0;
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition((position)=>{
            userLatitude = position.coords.latitude;
            userLongitude = position.coords.longitude;
            mapRoutes(userLatitude, userLongitude, destLatitude, destLongitude);
        })
    }
}

function mapRoutes(userLatitude, userLongitude, destLatitude, destLongitude){
    fetch("http://localhost:8080/api/route", {
        method: "POST",
        body: JSON.stringify({
          "startLatitude": userLatitude,
          "startLongitude": userLongitude,
          "destLatitude": destLatitude,
          "destLongitude": destLongitude
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      })
      .then(response => response.text())
      .then(data => {
        console.log("API Response:", data);
        var res = JSON.parse(data)
        if (res.paths && res.paths.length > 0) {
          const encodedPoints = res.paths[0].points;
          const distance = res.paths[0].distance;
          const time = res.paths[0].time;
          console.log("Encoded Points:", encodedPoints);
          const decodedPoints = polyline.decode(encodedPoints);
          const latLngPoints = decodedPoints.map(point => L.latLng(point[0], point[1]));
          routeLayer.clearLayers();
          routeLine = L.polyline(latLngPoints, {
            color: 'blue'
          }).addTo(routeLayer);
          map.fitBounds(routeLine.getBounds());
          displayRouteInfo(distance, time);
        } else {
          console.error("No paths found in the response.");
        }
      }).catch(error => {
        console.error("There was a problem with the fetch operation:", error);
    });
}

function displayRouteInfo(distance, time){
    const distanceInKm = (distance/1000).toFixed(2);
    const totalMinutes = Math.floor(time / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let timeString = `${minutes} minutes`;
    if (hours > 0) {
        timeString = `${hours} hour(s) and ${minutes} minutes`;
    }
    document.getElementById("travel-time").innerHTML = `${timeString}`;
    document.getElementById("distance").innerHTML = `${distanceInKm} KM`;
}

function startRealTimeTracking(destLatitude, destLongitude){
    if(navigator.geolocation){
        watchRoute = navigator.geolocation.watchPosition((position)=>{
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;
            setMapView(position);
            mapRoutes(userLatitude, userLongitude, destLatitude, destLongitude);
        },(error)=>{
            console.error("Error watching position: ", error);
        },{
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 30000
        });
    }else{
        alert("Geolocation is not supported by this browser.");
    }
}

function stopTracking(){
    if(watchRoute){
        navigator.geolocation.clearWatch(watchRoute);
        watchRoute = null;
        routeLayer.clearLayers();
        destinationGroup.clearLayers();
        destCircleLayer.clearLayers();
        destCircle = null;
    }
}


function addDestinationCircle(latitude, longitude, radius){
    if(destCircle){
        destCircle.setLatLng([latitude, longitude]);
        destCircle.setRadius(radius);
    }else{
        destCircleLayer.clearLayers();
        destCircle = L.circle([latitude, longitude], {
                   color: 'red',
                   fillColor: '#30f',
                   fillOpacity: 0.2,
                   radius: radius
        }).addTo(destCircleLayer);
    }
}

function addSrcCircle(latitude, longitude, radius){
    if(srcCircle){
        srcCircle.setLatLng([latitude, longitude]);
        srcCircle.setRadius(radius);
    }else{
        srcCircleLayer.clearLayers();
        srcCircle = L.circle([latitude, longitude], {
                       color: 'blue',
                       fillColor: '#30f',
                       fillOpacity: 0.2,
                       radius: radius
        }).addTo(srcCircleLayer);
    }
}