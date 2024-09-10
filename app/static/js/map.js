let map;
let mapData = {};
let segmentLayer;


function initMap(center, zoom) {
    if (map) {
        map.remove();
    }
    map = L.map('map').setView([center.lat, center.lon], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addMarkers() {
    mapData.markers.forEach(function (marker) {
        L.marker([marker.lat, marker.lon]).addTo(map)
            .bindPopup(marker.popup);
    });
}

function centerMapOnUser() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let userLat = position.coords.latitude;
            let userLon = position.coords.longitude;
            initMap({ lat: userLat, lon: userLon }, 13);
            L.marker([userLat, userLon]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();
        }, function (error) {
            console.error("Error: " + error.message);
            initMap(mapData.center, mapData.center.zoom);
            addMarkers();
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
        initMap(mapData.center, mapData.center.zoom);
        addMarkers();
    }
}

function searchLocation(query) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let result = data[0];
                initMap({ lat: result.lat, lon: result.lon }, 13);
                L.marker([result.lat, result.lon]).addTo(map)
                    .bindPopup(result.display_name)
                    .openPopup();
            } else {
                alert('Location not found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while searching');
        });
}

function useMyLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            map.setView([lat, lon], 13);
            L.marker([lat, lon]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();
        }, function (error) {
            console.error("Error: " + error.message);
            alert("Unable to retrieve your location");
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}


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
                    <strong>${segment.name}</strong><br>
                    Distance: ${(segment.distance / 1000).toFixed(2)} km<br>
                    Avg Grade: ${segment.avg_grade.toFixed(1)}%<br>
                    Elev Difference: ${segment.elev_difference.toFixed(1)}m
                `);
            });

            map.fitBounds(segmentLayer.getBounds());
        })
        .catch(error => console.error('Error:', error));
}

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
                return url.replace('/square.', '/thumb.');
            };

            const getSpeciesName = (obs) => {
                if (obs.taxon?.preferred_common_name) {
                    return obs.taxon.preferred_common_name;
                } else if (obs.species_guess) {
                    return `${obs.species_guess}? <i class="fas fa-question-circle" title="Species guess"></i>`;
                } else {
                    return 'Unknown Species';
                }
            };

            const imageUrl = obs.photos && obs.photos.length > 0 ? getImageUrl(obs.photos[0]) : null;
            const speciesName = getSpeciesName(obs);

            L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
                .bindPopup(`
                    <div class="observation-popup">
                        <h3>${speciesName}</h3>
                        ${obs.taxon?.taxon.name ? `<p><em>${obs.taxon.name}</em></p>` : ''}
                        <p style="color: #888;">Observed on: ${obs.observed_on}</p>
                        ${imageUrl ? `<img src="${imageUrl}" alt="${speciesName}">` : ''}
                        <a href="${obs.uri}" target="_blank">View on iNaturalist</a>
                    </div>
                `);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initialize map when the script loads
document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/map-data')
        .then(response => response.json())
        .then(data => {
            mapData = data;
            map = L.map('map').setView([mapData.center.lat, mapData.center.lon], mapData.center.zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            addMarkers();
        })
        .catch(error => {
            console.error('Error fetching map data:', error);
        });
});