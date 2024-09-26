import os

class Config:
    DEBUG = bool(os.getenv('DEBUG', False))
    # Strava API credentials
    STRAVA_CLIENT_ID = os.getenv('STRAVA_CLIENT_ID')
    STRAVA_CLIENT_SECRET = os.getenv('STRAVA_CLIENT_SECRET')
    STRAVA_REFRESH_TOKEN = os.getenv('STRAVA_REFRESH_TOKEN')
