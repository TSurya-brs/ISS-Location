let marker;
let zoom_level = 5;
let center_iss = true;
const speed = document.getElementById('speed');
const utcTime = document.getElementById('utcTime');
const iss_location = document.getElementById('iss_location');
const altitude = document.getElementById('altitude');
const latitude = document.getElementById('latitude');
const localTime = document.getElementById('localTime');
const longitude = document.getElementById('longitude');
const iss_center = document.getElementById('iss_center');
const visibility = document.getElementById('visibility');
const iss_location_api_endpoint = 'https://api.wheretheiss.at/v1/satellites/25544';
const mapbox_accesstoken = 'pk.eyJ1IjoicGFyaXNyaSIsImEiOiJja2ppNXpmaHUxNmIwMnpsbzd5YzczM2Q1In0.8VJaqwqZ_zh8qyeAuqWQgw'; 

mapboxgl.accessToken = mapbox_accesstoken;

iss_center.addEventListener('change', function(e) { center_iss = e.target.checked; });

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [0, 0], 
    zoom: zoom_level
});


const el = document.createElement('div');
el.className = 'marker';
el.style.backgroundImage = 'url("assets/img/img1.png")'; 
el.style.backgroundSize = 'contain'; 
el.style.backgroundRepeat = 'no-repeat'; 
el.style.width = '40px'; 
el.style.height = '40px'; 
el.style.borderRadius='50px';
marker = new mapboxgl.Marker(el).setLngLat([0, 0]).addTo(map);


async function getISSLocation() {
    const response = await fetch(iss_location_api_endpoint);
    const iss_data = await response.json();
    const lngLat = [iss_data.longitude, iss_data.latitude];

    const visibilityText = iss_data.visibility;
    const speedText = iss_data.velocity.toFixed(2);
    const altitudeText = iss_data.altitude.toFixed(2);
    const timestamp = new Date(iss_data.timestamp * 1000);
    const localTimeFormat = timestamp.toLocaleTimeString();
    const utcTimeFormat = timestamp.toUTCString().split(" ")[4];

    updateISS(lngLat, utcTimeFormat, localTimeFormat, speedText, altitudeText, visibilityText);
}

async function updateISS(lngLat, utcTimeFormat, localTimeFormat, sp, al, vi) {
    if (center_iss) { map.flyTo({center: lngLat, zoom: zoom_level}); }
    visibility.innerText = vi;
    speed.innerText = `${sp} km/hr`;
    altitude.innerText = `${al} km`;
    marker.setLngLat(lngLat);
    utcTime.innerHTML = [utcTimeFormat, 'UTC'].join(' ');
    localTime.innerHTML = [localTimeFormat, 'Local Time'].join(' ');
    latitude.innerHTML = Math.abs(lngLat[1]) + `&#176; ${getDirection(lngLat[1], 'lat')}`;
    longitude.innerHTML = Math.abs(lngLat[0]) + `&#176; ${getDirection(lngLat[0], 'lng')}`;

    const locDetails = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json?access_token=${mapbox_accesstoken}`);
    const locData = await locDetails.json();
    iss_location.innerHTML = locData.features[0]?.place_name || 'Not Available';
}

function getDirection(coordinate, lngLat) {
    return (lngLat === 'lat') ? (parseFloat(coordinate) < 0 ? 'South' : 'North') : (parseFloat(coordinate) < 0 ? 'West' : 'East');
}

setInterval(() => {
    getISSLocation();
}, 1000);
