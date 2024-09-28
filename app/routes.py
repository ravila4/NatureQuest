from flask import current_app as app
from flask import jsonify, render_template, request, send_from_directory

from app.services import inaturalist_service, strava_service

# Zion National Park
DEFAULT_CENTER = {"lat": 36.4175, "lon": -112.0079, "zoom": 11}

DEFAULT_MARKERS = []


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/map-data")
def map_data():
    return jsonify({"center": DEFAULT_CENTER, "markers": DEFAULT_MARKERS})


@app.route("/static/<path:path>")
def send_static(path):
    return send_from_directory("static", path)


@app.route("/api/trails")
def get_trails():
    bounds = {
        "north": request.args.get("north"),
        "south": request.args.get("south"),
        "east": request.args.get("east"),
        "west": request.args.get("west"),
    }
    activity_type = request.args.get("activity_type", "running")
    segments = strava_service.get_segments(bounds, activity_type)
    return jsonify(segments)


@app.route("/api/observations")
def get_observations():
    bounds = {
        "north": request.args.get("north"),
        "south": request.args.get("south"),
        "east": request.args.get("east"),
        "west": request.args.get("west"),
    }
    taxon_name = request.args.get("taxon_name")
    observations = inaturalist_service.get_observations(bounds, taxon_name)
    return jsonify(observations)
