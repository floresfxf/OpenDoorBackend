# OpenDoorBackend
## Overview
## Purpose
The goal of this project was to complete the OpenDoor Software Engineer challenge given to each applicant. The given code was completed in 2 hours.  

## Solution
Ontop of solving the original problem, I was able to implement middleware to restrict api access to only users with valid api keys. The API keys used were pseudokeys generated using bcrypt. Users would have to register, then request thier key from the `retrieve_key` endpoint.  
  
Although these pseudokeys never actually expired, I've implemented a `refresh_token` route which will delete the old api key, making it no longer usable, and send the user a new api key. When making the request to any endpoint besides `/register` and `/retrieve_key`, the apikey **must** appear in the `api_key` header of the request, otherwise it will restrict access.  
### Original Problem  
The question below is meant to give candidates a sense of the problems we tackle at Opendoor. Please submit solutions in the form of a readme + working code. The problems should take under 2 hours to complete.  
  
Write an API endpoint that returns a filtered set of listings from the data provided:  

https://s3.amazonaws.com/opendoor-problems/listing-details.csv

API:  
**GET** */listings?min_price=100000&max_price=200000&min_bed=2&max_bed=2&min_bath=2&max_bath=2*  

min_price: The minimum listing price in dollars.  
max_price: The maximum listing price in dollars.  
min_bed: The minimum number of bedrooms.  
max_bed: The maximum number of bedrooms.  
min_bath: The minimum number of bathrooms.  
max_bath: The maximum number of bathrooms.  
  
The expected response is a GeoJSON FeatureCollection of listings:  
```
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [-112.1,33.4]},
      "properties": {
  "id": "123ABC", # CSV id
  "price": 200000, # Price in Dollars
  "street": "123 Walnut St",
        "bedrooms": 3, # Bedrooms
        "bathrooms": 2, # Bathrooms
        "sq_ft": 1500 # Square Footage
      }
    },
    ...
  ]
}
```
All query parameters are optional, all minimum and maximum fields should be inclusive (e.g. min_bed=2&max_bed=4 should return listings with 2, 3, or 4 bedrooms).  

At a minimum:
- Your API endpoint URL is /listings  
- Your API responds with valid GeoJSON (you can check the output using http://geojson.io)  
- Your API should correctly filter any combination of API parameters  
- Use a datastore  

