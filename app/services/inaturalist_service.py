import requests


def get_observations(bounds, taxon_name=None):
    url = "https://api.inaturalist.org/v1/observations"
    params = {
        "nelat": bounds["north"],
        "nelng": bounds["east"],
        "swlat": bounds["south"],
        "swlng": bounds["west"],
        "per_page": 200,
        "order": "desc",
        "order_by": "created_at",
    }
    if taxon_name:
        params["taxon_name"] = taxon_name

    response = requests.get(url, params=params)
    # Log response json
    response.raise_for_status()
    return response.json()["results"]
