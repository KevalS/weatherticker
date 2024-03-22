from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests

app = Flask(__name__)
cors = CORS(app)

API_KEY = 'ca3bf5ab9bd4ba9194db9d7f54de7cef'
GEO_BASE_URL = "http://api.openweathermap.org/geo/1.0"
BASE_URL = "https://api.openweathermap.org/data/2.5"

@cross_origin()
@app.route('/location', methods=['GET'])
def get_location():
    zip_code = request.args.get('zip')
    country_code = "IN"

    geo_url = f"{GEO_BASE_URL}/zip?zip={zip_code},{country_code}&appid={API_KEY}"
    response = requests.get(geo_url)
    if response.ok:
        return response.json()
    else:
        return jsonify({'error': 'Please enter a valid zip'}), 400

@app.route('/weather', methods=['GET'])
def get_weather():
    coords = request.args.get('coords')
    if not coords:
        return jsonify({'error': 'Missing coordinates'}), 400
    
    coords_list = coords.split(';')
    weather_data_list = []

    for coord_pair in coords_list:
        lat, lon = coord_pair.split(',')
        weather_api_url = f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        
        response = requests.get(weather_api_url)
        if response.status_code == 200:
            weather_data_list.append(response.json())
        else:
            continue
            # weather_data_list.append({'error': f'Failed to fetch data for coordinates {lat},{lon}'})

    return jsonify(weather_data_list)

@app.route('/forecast', methods=['GET'])
def forecast():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    forecast_api_url = f"{BASE_URL}/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(forecast_api_url)
    if response.status_code == 200:
        return response.json()
    else:
        return jsonify({'error': 'Failed to fetch weather forecast'})


if __name__ == '__main__':
    app.run(debug=True)
