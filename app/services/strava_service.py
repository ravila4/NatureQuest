import requests
from flask import current_app


def get_access_token():
    # We may want to implement a more secure way to store these
    client_id = current_app.config["STRAVA_CLIENT_ID"]
    client_secret = current_app.config["STRAVA_CLIENT_SECRET"]
    refresh_token = current_app.config["STRAVA_REFRESH_TOKEN"]
    if not client_id or not client_secret or not refresh_token:
        raise ValueError("Strava credentials not set")

    response = requests.post(
        url="https://www.strava.com/oauth/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
    )
    response.raise_for_status()
    return response.json()["access_token"]


def get_segments(bounds, activity_type="running"):
    access_token = get_access_token()
    url = "https://www.strava.com/api/v3/segments/explore"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "bounds": f"{bounds['south']},{bounds['west']},{bounds['north']},{bounds['east']}",
        "activity_type": activity_type,
    }
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()["segments"]
