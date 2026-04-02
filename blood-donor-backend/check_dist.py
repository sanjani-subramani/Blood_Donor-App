import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float):
    R = 6371.0  # Earth radius in km

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )

    c = 2 * math.asin(math.sqrt(a))
    return R * c

print("Distance to Far Donor:", calculate_distance(12.9716, 77.5946, 13.1016, 77.7246))

