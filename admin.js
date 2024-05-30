
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    console.log('queryParam', userId);

    const socket = io('http://app.hrjee.com:6370');
    
    const closeConnection = (userId) => {
        socket.emit('closeConnection', userId);
        console.log(`Close connection for: ${userId}`);
    };

    const locationDataDiv = document.getElementById('locationData');
    const closeConnectionBtn = document.getElementById('closeConnection');

    closeConnectionBtn.addEventListener('click', () => {
        closeConnection(userId)
    })

    // Function to handle subscription to a user's location updates
    const subscribeToUser = (userId) => {
        socket.emit('subscribeToUser', userId);
        socket.emit('requestLocationData', userId);
        console.log(`Subscribed to updates for user: ${userId}`);
    };

    // Function to update the location data on the page
    const updateLocationData = (data) => {
        console.log(data);
        const { userId, firstLocation, currentLocation } = data;
        locationDataDiv.innerHTML = `
            <h2>Location for User ID: ${userId}</h2>
            ${firstLocation && currentLocation ? `
                <p><b>Started:</b> Latitude: ${firstLocation?.latitude}, Longitude: ${firstLocation?.longitude}</p>
                <p><b>Current:</b> Latitude: ${currentLocation?.latitude}, Longitude: ${currentLocation?.longitude}</p>
            ` : `
                <p>No location data available.</p>
            `}
        `;


        var startPoint = [firstLocation?.latitude, firstLocation?.longitude];
        var waypoints = [startPoint];
        const newEndPoint = [currentLocation?.latitude, currentLocation?.longitude];
        const lastEndPoint = waypoints[waypoints.length - 1];
        console.log('lastEndPoint', lastEndPoint);
        getRoute(lastEndPoint, newEndPoint);
    };

    // Listen for location updates from the server
    socket.on('locationData', (data) => {
        updateLocationData(data);
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
        console.error(`Connection error: ${err.message}`);
    });

    subscribeToUser(userId)
});
