document.addEventListener('DOMContentLoaded', function () {
    const dockItems = document.querySelectorAll('.dock-item');
    const panels = document.querySelectorAll('.panel');

    dockItems.forEach(item => {
        item.addEventListener('click', function () {
            const panelId = this.getAttribute('data-panel');
            togglePanel(panelId);
        });
    });

    function togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        const dockItem = document.querySelector(`[data-panel="${panelId}"]`);
        const isActive = panel.classList.contains('active');

        // Close all panels
        panels.forEach(p => p.classList.remove('active'));
        dockItems.forEach(item => item.classList.remove('active'));

        // If the clicked panel wasn't active, open it
        if (!isActive) {
            panel.classList.add('active');
            dockItem.classList.add('active');
        }

        // Trigger map resize to handle any layout changes
        if (typeof map !== 'undefined' && map !== null) {
            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        }
    }

    // Attach event listeners to elements
    document.getElementById('locationSearch').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const locationInput = document.getElementById('locationSearch').value;
            if (locationInput) {
                searchLocation(locationInput);
            } else {
                alert('Please enter a location to search.');
            }
        }
    });

    document.getElementById('useMyLocationBtn').addEventListener('click', useMyLocation);

    document.getElementById('findNearbyTrailsBtn').addEventListener('click', findNearbyTrails);

    document.getElementById('speciesSearch').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const speciesInput = document.getElementById('speciesSearch').value;
            if (speciesInput) {
                searchObservations(speciesInput);
            } else {
                alert('Please enter a species to search.');
            }
        }
    });

    // Close panels when clicking outside
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.dock') && !event.target.closest('.panels')) {
            panels.forEach(p => p.classList.remove('active'));
            dockItems.forEach(item => item.classList.remove('active'));
        }
    });
});