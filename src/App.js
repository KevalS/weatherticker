import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [zipInput, setZipInput] = useState('');
  const [weatherData, setWeatherData] = useState([]);
  const [forecastData, setForecastData] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (weatherData.length > 0) {
        refreshAllWeather();
      }
    }, 900000); // 15 minutes in milliseconds
    setAutoRefresh(interval);

    return () => clearInterval(interval);
  }, [weatherData]);

  const addZipCode = async () => {
    if (zipInput && !weatherData.some((entry) => entry.zip === zipInput)) {
      const newWeatherData = await fetchWeatherDataForZip(zipInput);
      if (newWeatherData) {
        setWeatherData([...weatherData, newWeatherData]);
      }
      setZipInput('');
    }
  };
  
  const fetchWeatherDataForZip = async (zip) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/location?zip=${zip}`);
      const weather = await axios.get(`http://127.0.0.1:5000/weather?coords=${response.data.lat},${response.data.lon}`);
      return { zip, data: weather.data };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  };

  const fetchForecastData = async (lat, lon) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/forecast?lat=${lat}&lon=${lon}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      return null;
    }
  };

  const refreshWeatherCard = async (zip) => {
    const newWeatherData = await fetchWeatherDataForZip(zip);
    if (newWeatherData) {
      setWeatherData(weatherData.map(data => data.zip === zip ? newWeatherData : data));
    }
  };

  const refreshAllWeather = async () => {
    const refreshedDataPromises = weatherData.map((loc) => fetchWeatherDataForZip(loc.zip));
    const refreshedData = await Promise.all(refreshedDataPromises);
    setWeatherData(refreshedData.filter((data) => data !== null));
  };

  const handleZipChange = (event) => {
    setZipInput(event.target.value);
  };

  const handleCardClick = async (lat, lon) => {
    const forecast = await fetchForecastData(lat, lon);
    setForecastData(forecast);
  };

  const removeWeatherCard = (zipToRemove) => {
    setWeatherData(weatherData.filter((data) => data.zip !== zipToRemove));
  };
  return (
    <div className="App">
      <input
        value={zipInput}
        onChange={handleZipChange}
        placeholder="Enter ZIP Code"
        type="text"
      />
      <button onClick={addZipCode}>Add ZIP Code</button>
      <button onClick={refreshAllWeather}>Refresh All</button>
      <div className="weather-info">
        {weatherData.map((location, index) => (
          <div key={index} className="weather-card">
            {location.data.map((data, dataIndex) => (
              <div key={dataIndex} onClick={() => handleCardClick(data.coord.lat, data.coord.lon)}>
                <div>Location: {data.name}</div>
                <div>Temperature: {data.main.temp}°C</div>
                <div>Temperature Min: {data.main.temp_min}</div>
                <div>Temperature Max: {data.main.temp_max}</div>
                <div>Humidity: {data.main.humidity}</div>
                <div>Weather: {data.weather[0].main}</div>
                <button onClick={() => refreshWeatherCard(location.zip)}>Refresh</button>
                <button onClick={() => removeWeatherCard(location.zip)}>Remove</button>
              </div>
            ))}
          </div>
        ))} 
      </div>
      {forecastData?.list?.length > 0 && (
        <div className="forecast">
          <h2>Forecast</h2>
          {forecastData.list?.map((item, index) => (
            <div key={index}>
              <div>{new Date(item.dt * 1000).toLocaleDateString('en-GB')} {new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour12: false })} - Temp: {item.main.temp}°C</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;

