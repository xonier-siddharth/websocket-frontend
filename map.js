// Initialize the map and set its view to a chosen geographical coordinates and a zoom level
var map = L.map('map').setView([28.65553, 77.23165], 10);

// Add a tile layer to add to our map, in this case, it's a map from OpenStreetMap.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 17
}).addTo(map);

var routeLine;
var stepCount = 1;

// Function to get the route from Google Directions API
function getRoute(start, end) {
    console.log('start', start);
    const apiKey = 'AIzaSyCAdzVvYFPUpI3mfGWUTVXLDTerw1UWbdg';
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&key=${apiKey}`;
    
    // Add markers for the start and end points
    L.marker(start).addTo(map).bindPopup("Start Point").openPopup();

    axios.get(url)
        .then(response => {
            if (response.data.status === 'OK') {
                const route = response.data.routes[0].overview_polyline.points;
                const decodedRoute = decodePolyline(route);

                // Draw the route on the map
                var routeLine = L.polyline(decodedRoute, { color: 'blue' }).addTo(map);
                map.fitBounds(routeLine.getBounds());

                // Add a marker for the new endpoint with the step count title and open its popup
                var stepMarker = L.marker(end).addTo(map).bindPopup(`Step ${stepCount}`).openPopup();
                stepCount++;

                // Add the new endpoint to the waypoints list
                // waypoints.push(end);
            } else {
                console.error('Error fetching route data:', response.data.status);
            }
        })
        .catch(error => {
            console.error('Error fetching route data:', error);
        });
}

// Function to decode polyline
function decodePolyline(polyline) {
    let current = 0;
    const len = polyline.length;
    const path = [];
    let lat = 0, lng = 0;

    while (current < len) {
        let shift = 0, result = 0;
        let byte;
        do {
            byte = polyline.charCodeAt(current++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += deltaLat;

        shift = 0;
        result = 0;
        do {
            byte = polyline.charCodeAt(current++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);
        const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += deltaLng;

        path.push([lat * 1e-5, lng * 1e-5]);
    }

    return path;
}

// Function to generate a random endpoint based on the starting point
function generateRandomEndpoint(baseLat, baseLng, offset = 0.01) {
    const randomLat = baseLat + (Math.random() - 0.5) * offset;
    const randomLng = baseLng + (Math.random() - 0.5) * offset;
    return [randomLat, randomLng];
}

// Periodically update the endpoint and route
// setInterval(() => {
    // const newEndPoint = generateRandomEndpoint(startPoint[0], startPoint[1]);
    // const lastEndPoint = waypoints[waypoints.length - 1];
    // console.log('lastEndPoint', lastEndPoint);
    // getRoute(lastEndPoint, newEndPoint);
// }, 5000);