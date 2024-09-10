# 👣🌿️ Nature Quest: Trail Explorer 🌿️👣

Nature Quest: Trail Explorer is a Flask-based web application designed to bridge the gap between outdoor fitness activities and nature education by integrating trail information with local biodiversity data. The project aims to create an interactive platform where users of all ages can explore hiking trails, discover local flora and fauna, and plan nature-focused outings.

## Project Goals

- Develop a user-friendly web interface for exploring trails and natural observations.
Integrate data from Strava (for trails) and iNaturalist (for biodiversity observations).
- Provide an interactive map-based experience for users to visualize trails and species sightings.
- Create a responsive design that works well on both desktop and mobile devices.

## User Stories

- As a mushroom forager, I want to search for morel mushroom observations in my area of interest and find nearby hiking trails to plan my foraging trip.
- As a bird watcher, I want to select a specific hiking route and see what bird species I might encounter along the way.
- As a novice nature enthusiast, I want to find hiking trails near my current location and learn about the various species I might see in the area.

## Project Structure

```
NatureQuest/
├── app/
│   ├── __init__.py
│   ├── routes.py
│   ├── services/
│   │   ├── strava_service.py
│   │   └── inaturalist_service.py
│   ├── static/
│   │   ├── assets/
│   │   │   └── iconic_taxa/
│   │   ├── css/
│   │   │   └── main.css
│   │   └── js/
│   │       ├── dock.js
│   │       └── map.js
│   └── templates/
│       ├── dock.html
│       └── index.html
├── config.py
├── requirements.txt
├── README.md
└── run.py
```

## Key Features Implemented

- Interactive map using Leaflet.js, centered on the user's location or a searched area.
- Integration with Strava API to fetch and display nearby trails.
- Integration with iNaturalist API to search and display species observations.
- Responsive design for both desktop and mobile use.

## Next Steps

- Refine API integrations and error handling.
- Implement caching for API responses to improve performance and handle rate limits.
- Enhance the user interface with more detailed trail and species information.
- Add filtering options for observations (e.g., by date, species type).
- Implement user authentication for saving preferences and favorite trails.
