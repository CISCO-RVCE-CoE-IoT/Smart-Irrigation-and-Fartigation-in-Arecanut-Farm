import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is imported

// OpenWeather API
const apiKey = '8925502a781648f4443f9e01d96c7ff5';
const apiURL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat=';

// Helper function to format time ago
const timeAgo = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);

  if (days > 0) return `${days} d${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
};

const LogsGenerator = ({ data }) => {
  const [logs, setLogs] = useState([]);
  const [weatherLogs, setWeatherLogs] = useState(new Set()); // Use a Set to hold weather logs
  const [extremeMoistureLogs, setExtremeMoistureLogs] = useState(new Set()); // Use a Set to hold extreme moisture logs
  const [extremeWeatherLogs, setExtremeWeatherLogs] = useState(new Set()); // Use a Set to hold extreme weather logs

  useEffect(() => {
    const generatedLogs = [];

    // Add logs for NPK values
    data.device_values.farm_device_data.forEach((device) => {
      generatedLogs.push({
        title: `NPK Values: Nitrogen: ${device.nitrogen}, Phosphorus: ${device.phosphorus}, Potassium: ${device.potassium}`,
        timestamp: device.timestamp,
      });
    });

    // Add logs for valve status
    data.device_values.valve_devices_data.forEach((valve) => {
      generatedLogs.push({
        title: `Valve Status for Section ${valve.section_name}: ${valve.valve_status} (Mode: ${valve.valve_mode})`,
        timestamp: valve.valve_timestamp,
      });
    });

    setLogs(generatedLogs);

    // Check for extreme moisture values (low and high)
    const extremeMoisture = data.device_values.moisture_device_value.filter((moisture) => {
      return moisture.moisture_value <= 30 || moisture.moisture_value >= 80; // Extreme moisture values: Low (<30%) or High (>80%)
    });

    // Create logs for extreme moisture values and store them in a Set
    extremeMoisture.forEach((moisture) => {
      const moistureLog = {
        title: `Moisture Value for Section ${moisture.section_id}: ${moisture.moisture_value}%`,
        timestamp: moisture.timestamp,
      };
      setExtremeMoistureLogs((prevLogs) => new Set(prevLogs.add(JSON.stringify(moistureLog)))); // Convert object to string to ensure uniqueness
    });

    // Fetch weather prediction for each farm
    const weatherDataCache = {}; // Cache to avoid duplicate entries

    data.farmer_farms.forEach(async (farm) => {
      const [lat, lon] = farm.farm_location.split(',').map(coord => parseFloat(coord.trim()));
      const weatherData = await fetch(`${apiURL}${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .catch(err => console.error(err));

      if (weatherData) {
        const weatherLog = {
          title: `Weather Prediction for ${farm.farm_name}: ${weatherData.weather[0].description}, Temp: ${weatherData.main.temp}°C`,
          timestamp: new Date().toISOString(),
        };

        // Check if this weather data has already been added
        const cacheKey = `${farm.farm_name}_${weatherData.weather[0].description}_${weatherData.main.temp}`;
        if (!weatherDataCache[cacheKey]) {
          weatherDataCache[cacheKey] = true;
          setWeatherLogs((prevLogs) => new Set(prevLogs.add(JSON.stringify(weatherLog)))); // Ensure uniqueness by stringifying
          
          // Check for extreme weather conditions (hot and cold)
          if (weatherData.main.temp > 35) { // Hot weather (above 35°C)
            const extremeHeatLog = {
              title: `Extreme Heat for ${farm.farm_name}: Temp: ${weatherData.main.temp}°C`,
              timestamp: weatherLog.timestamp,
            };
            setExtremeWeatherLogs((prevLogs) => new Set(prevLogs.add(JSON.stringify(extremeHeatLog)))); // Add to Set
          } else if (weatherData.main.temp < 5) { // Cold weather (below 5°C)
            const extremeColdLog = {
              title: `Extreme Cold for ${farm.farm_name}: Temp: ${weatherData.main.temp}°C`,
              timestamp: weatherLog.timestamp,
            };
            setExtremeWeatherLogs((prevLogs) => new Set(prevLogs.add(JSON.stringify(extremeColdLog)))); // Add to Set
          }
        }
      }
    });
  }, [data]);

  return (
    <div className='borderring p-3'>
      <h5 className='text-secondary fs-5 fs-md-3 fs-lg-2'>Logs</h5>
      <table className="table table-hover">
        <thead>
          <tr>
            <th className="fs-6 fs-md-5 fs-lg-4">Title</th>
            <th className="fs-6 fs-md-5 fs-lg-4">Time Ago</th>
          </tr>
        </thead>
        <tbody>
          {/* Render Logs from NPK and Valve status */}
          {logs.map((log, index) => (
            <tr key={index}>
              <td className="fs-6 fs-md-5 fs-lg-4">{log.title}</td>
              <td className="fs-6 fs-md-5 fs-lg-4">{timeAgo(log.timestamp)}</td>
            </tr>
          ))}
          {/* Render Extreme Moisture Logs (Low or High Moisture) */}
          {[...extremeMoistureLogs].map((logStr, index) => {
            const log = JSON.parse(logStr); // Convert back to object
            return (
              <tr key={`extreme-moisture-${index}`}>
                <td className="fs-6 fs-md-5 fs-lg-4">{log.title}</td>
                <td className="fs-6 fs-md-5 fs-lg-4">{timeAgo(log.timestamp)}</td>
              </tr>
            );
          })}
          {/* Render Extreme Weather Logs (Hot or Cold Weather) */}
          {[...extremeWeatherLogs].map((logStr, index) => {
            const log = JSON.parse(logStr); // Convert back to object
            return (
              <tr key={`extreme-weather-${index}`}>
                <td className="fs-6 fs-md-5 fs-lg-4">{log.title}</td>
                <td className="fs-6 fs-md-5 fs-lg-4">{timeAgo(log.timestamp)}</td>
              </tr>
            );
          })}
          {/* Render Weather Logs */}
          {[...weatherLogs].map((logStr, index) => {
            const log = JSON.parse(logStr); // Convert back to object
            return (
              <tr key={`weather-${index}`}>
                <td className="fs-6 fs-md-5 fs-lg-4">{log.title}</td>
                <td className="fs-6 fs-md-5 fs-lg-4">{timeAgo(log.timestamp)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LogsGenerator;
