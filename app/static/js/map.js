// map.js

let map;
let mapData = {};
let segmentLayer;

// Function to update the URL without adding a new history entry
function updateURLWithoutPush(lat, lon, zoom) {
    const url = new URL(window.location);
    url.searchParams.set('lat', lat.toFixed(5));
    url.searchParams.set('lon', lon.toFixed(5));
    url.searchParams.set('zoom', zoom);
    history.replaceState({ lat, lon, zoom }, '', url);
}

// Function to add a new history entry
function pushNewState(lat, lon, zoom) {
    const url = new URL(window.location);
    url.searchParams.set('lat', lat.toFixed(5));
    url.searchParams.set('lon', lon.toFixed(5));
    url.searchParams.set('zoom', zoom);
    history.pushState({ lat, lon, zoom }, '', url);
}

// Function to get map state from the URL parameters
function getMapStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = parseFloat(urlParams.get('lat'));
    const lon = parseFloat(urlParams.get('lon'));
    const zoom = parseInt(urlParams.get('zoom'), 10);
    if (!isNaN(lat) && !isNaN(lon) && !isNaN(zoom)) {
        return { lat, lon, zoom };
    } else {
        return null; // Return null if any parameter is invalid
    }
}

// Initialize the map
function initMap(center, zoom) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([center.lat, center.lon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Add markers to the map
function addMarkers() {
    if (mapData.markers) {
        mapData.markers.forEach(function (marker) {
            L.marker([marker.lat, marker.lon]).addTo(map)
                .bindPopup(marker.popup);
        });
    }
}

// Center the map on the user's location and add a new history entry
function centerMapOnUser() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let userLat = position.coords.latitude;
            let userLon = position.coords.longitude;
            map.setView([userLat, userLon], 13);
            L.marker([userLat, userLon]).addTo(map)
            pushNewState(userLat, userLon, 13);
        }, function (error) {
            console.error("Error: " + error.message);
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

// Search for a location, center the map there, and add a new history entry
function searchLocation(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const zoom = 13; // Adjust zoom level as needed
                map.setView([lat, lon], zoom);
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`<div class="location-popup"><h3>${result.display_name}</h3></div>`)
                    .openPopup();
                pushNewState(lat, lon, zoom);
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while searching');
        });
}

// Use the user's current location (wrapper function)
function useMyLocation() {
    centerMapOnUser();
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}

// Find nearby trails based on the current map bounds
function findNearbyTrails() {
    const bounds = map.getBounds();
    fetch(`/api/trails?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`)
        .then(response => response.json())
        .then(segments => {
            if (segmentLayer) {
                map.removeLayer(segmentLayer);
            }
            segmentLayer = L.featureGroup().addTo(map);

            segments.forEach(segment => {
                const decodedPolyline = L.Polyline.fromEncoded(segment.points);
                const polyline = L.polyline(decodedPolyline.getLatLngs(), {
                    color: 'red',
                    weight: 3,
                    opacity: 0.7
                }).addTo(segmentLayer);

                polyline.bindPopup(`
                    <div class="trail-popup">
                        <h3>${segment.name}</h3>
                        <p>Distance: ${(segment.distance / 1000).toFixed(2)} km<br>
                           Avg Grade: ${segment.avg_grade.toFixed(1)}%<br>
                           Elev Difference: ${segment.elev_difference.toFixed(1)}m
                        </p>
                    </div>
                `);
            });

            map.fitBounds(segmentLayer.getBounds());
        })
        .catch(error => console.error('Error:', error));
}

// Get the icon URL for observations
function getIconUrl(iconicTaxonName) {
    const iconMapping = {
        'Actinopterygii': 'actinopterygii-32px.png',
        'Amphibia': 'amphibia-32px.png',
        'Animalia': 'animalia-32px.png',
        'Arachnida': 'arachnida-32px.png',
        'Aves': 'aves-32px.png',
        'Chromista': 'chromista-32px.png',
        'Fungi': 'fungi-32px.png',
        'Insecta': 'insecta-32px.png',
        'Mammalia': 'mammalia-32px.png',
        'Mollusca': 'mollusca-32px.png',
        'Plantae': 'plantae-32px.png',
        'Protozoa': 'protozoa-32px.png',
        'Reptilia': 'reptilia-32px.png'
    };
    const folderPath = '/static/assets/iconic_taxa/';
    return folderPath + (iconMapping[iconicTaxonName] || 'unknown-32px.png');
}

// Format date strings for display
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
};

// Search for observations and display them on the map
async function searchObservations() {
    const species = document.getElementById('speciesSearch').value;
    const bounds = map.getBounds();
    try {
        const response = await fetch(`/api/observations?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}&taxon_name=${encodeURIComponent(species)}`);
        const observations = await response.json();

        for (const obs of observations) {
            const [latitude, longitude] = obs.location.split(',').map(parseFloat);

            const iconicTaxonName = obs.taxon?.iconic_taxon_name || 'unknown';
            const iconURL = getIconUrl(iconicTaxonName);

            const customIcon = L.icon({
                iconUrl: iconURL,
                iconSize: [32, 32],
                shadowSize: [32, 32],
                iconAnchor: [16, 32],
                shadowAnchor: [16, 32],
                popupAnchor: [0, -16]
            });

            const getImageUrl = (photo) => {
                if (!photo) return null;
                const url = photo.url;
                return url;
            };

            const getSpeciesName = (obs) => {
                if (obs.taxon?.preferred_common_name) {
                    return obs.taxon.preferred_common_name.charAt(0).toUpperCase() + obs.taxon.preferred_common_name.slice(1);
                } else if (obs.species_guess) {
                    return `${obs.species_guess}? <i class="fas fa-question-circle" title="Species guess"></i>`;
                } else if (obs.taxon?.name) {
                    return obs.taxon.name.charAt(0).toUpperCase() + obs.taxon.name.slice(1);
                } else {
                    return 'Unknown Species';
                }
            };

            const imageUrl = obs.photos && obs.photos.length > 0 ? getImageUrl(obs.photos[0]) : null;

            L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
                .bindPopup(`
                <div class="observation-popup">
                  <h3>${getSpeciesName(obs)}</h3>
                  <div class="observation-content">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${getSpeciesName(obs)}" class="observation-image">` : ''}
                    <div class="observation-details">
                      ${obs.taxon?.name ? `<p class="scientific-name">${obs.taxon.name}</p>` : ''}
                      <div class="observation-date">
                        <img src="/static/assets/icons/calendar_2_line.svg" alt="Calendar Icon"/>
                        <span>${formatDate(obs.observed_on)}</span>
                      </div>
                    </div>
                  </div>
                  <a href="${obs.uri}" target="_blank">View on iNaturalist</a>
                </div>
                `);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Update the URL when the map is moved or zoomed, without adding new history entries
const debouncedUpdateURL = debounce(function () {
    const center = map.getCenter();
    const zoom = map.getZoom();
    updateURLWithoutPush(center.lat, center.lng, zoom);
}, 500); // Adjust the debounce time as needed

// Initialize the map when the document is loaded
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/map-data')
        .then(response => response.json())
        .then(data => {
            mapData = data;

            // Get the map state from the URL or use the default
            const mapState = getMapStateFromURL() || {
                lat: mapData.center.lat,
                lon: mapData.center.lon,
                zoom: mapData.center.zoom
            };

            // Initialize the map with the obtained state
            initMap({ lat: mapState.lat, lon: mapState.lon }, mapState.zoom);
            addMarkers();

            // Push the initial state to the history
            pushNewState(mapState.lat, mapState.lon, mapState.zoom);

            // Update the URL when the map is moved or zoomed, without adding new history entries
            map.on('moveend', debouncedUpdateURL);
        })
        .catch(error => {
            console.error('Error fetching map data:', error);
        });
});

// Handle the browser's back and forward buttons
window.addEventListener('popstate', function (event) {
    if (event.state) {
        map.setView([event.state.lat, event.state.lon], event.state.zoom);
    } else {
        // If no state is available, reset to default center
        const defaultCenter = mapData.center;
        map.setView([defaultCenter.lat, defaultCenter.lon], defaultCenter.zoom);
    }
});
