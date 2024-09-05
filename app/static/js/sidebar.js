// sidebar.js

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');

    if (sidebar.classList.contains('collapsed')) {
        closeAllSections();
        sidebar.style.width = '50px';
    } else {
        sidebar.style.width = '300px';
    }

    // Update ARIA attributes
    const expanded = !sidebar.classList.contains('collapsed');
    document.getElementById('toggle-sidebar').setAttribute('aria-expanded', expanded.toString());

    // Trigger a resize event to refresh the map
    window.dispatchEvent(new Event('resize'));
}

function toggleSection(element) {
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        if (section !== element.nextElementSibling) {
            section.classList.add('hidden');
            section.previousElementSibling.setAttribute('aria-expanded', 'false');
        }
    });

    const sectionContent = element.nextElementSibling;
    const isExpanded = sectionContent.classList.toggle('hidden');

    // Update ARIA attributes
    element.setAttribute('aria-expanded', (!isExpanded).toString());
}

function closeAllSections() {
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        section.classList.add('hidden');
    });

    const allHeaders = document.querySelectorAll('.sidebar-section > h3');
    allHeaders.forEach(header => {
        header.setAttribute('aria-expanded', 'false');
    });
}

function openLocationSearchSection() {
    const locationSearchHeader = document.querySelector('.sidebar-section > h3:first-child');
    const locationSearchContent = locationSearchHeader.nextElementSibling;
    locationSearchContent.classList.remove('hidden');
    locationSearchHeader.setAttribute('aria-expanded', 'true');
}

// Optional: Close sidebar on mobile when clicking outside
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    if (window.innerWidth <= 768 && !sidebar.contains(event.target) && event.target !== toggleBtn) {
        sidebar.classList.add('collapsed');
        closeAllSections();
        sidebar.style.width = '50px';
        toggleBtn.setAttribute('aria-expanded', 'false');
    }
});

// Initialize ARIA attributes, sidebar position, and open Location Search section
document.addEventListener('DOMContentLoaded', function () {
    closeAllSections();
    openLocationSearchSection();

    document.getElementById('toggle-sidebar').setAttribute('aria-expanded', 'true');

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.style.width = '300px';
    } else {
        sidebar.style.width = '100%';
    }
});

// Handle window resize
window.addEventListener('resize', function () {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.style.width = sidebar.classList.contains('collapsed') ? '50px' : '300px';
    } else {
        sidebar.style.width = '100%';
    }
});