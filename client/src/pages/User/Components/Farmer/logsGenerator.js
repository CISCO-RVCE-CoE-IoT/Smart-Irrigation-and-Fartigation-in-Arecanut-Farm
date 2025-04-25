import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const apiKey = '8925502a781648f4443f9e01d96c7ff5';
const apiURL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat=';

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

  useEffect(() => {
    if (!data) return;

    const uniqueLogs = new Set();
    const weatherDataCache = new Set();
    const npkCache = new Set();
    const valveCache = new Set();
    let generatedLogs = [];

    const fetchWeatherData = async (coordinates) => {
      const [lat, lon] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      const weatherData = await fetch(`${apiURL}${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .catch(err => console.error(err));
      
      if (weatherData && weatherData.weather) {
        const weatherLog = {
          title: `Weather Prediction: ${weatherData.weather[0].description}, Temp: ${weatherData.main.temp}°C`,
          timestamp: new Date().toISOString(),
        };
        const cacheKey = `${coordinates}_${weatherData.weather[0].description}_${weatherData.main.temp}`;
        if (!weatherDataCache.has(cacheKey)) {
          weatherDataCache.add(cacheKey);
          addUniqueLog(weatherLog);
          if (weatherData.main.temp > 35) {
            addUniqueLog({
              title: `Extreme Heat Alert: Temp ${weatherData.main.temp}°C`,
              timestamp: weatherLog.timestamp,
            });
          } else if (weatherData.main.temp < 5) {
            addUniqueLog({
              title: `Extreme Cold Alert: Temp ${weatherData.main.temp}°C`,
              timestamp: weatherLog.timestamp,
            });
          }
        }
      }
    };

    const addUniqueLog = (log) => {
      const logKey = `${log.title}_${log.timestamp}`;
      if (!uniqueLogs.has(logKey)) {
        uniqueLogs.add(logKey);
        generatedLogs.push(log);
      }
    };

    if (data.device_values?.farm_device_data) {
      data.device_values.farm_device_data.forEach((device) => {
        const npkLog = {
          title: `NPK Levels - N: ${device.nitrogen}, P: ${device.phosphorus}, K: ${device.potassium}`,
          timestamp: device.timestamp,
        };
        if (!npkCache.has(JSON.stringify(npkLog))) {
          addUniqueLog(npkLog);
          npkCache.add(JSON.stringify(npkLog));
        }
      });
    }

    if (data.device_values?.valve_devices_data) {
      data.device_values.valve_devices_data.forEach((valve) => {
        const valveLog = {
          title: `Valve Status for ${valve.section_name}: ${valve.valve_status} (Mode: ${valve.valve_mode})`,
          timestamp: valve.valve_timestamp,
        };
        if (!valveCache.has(JSON.stringify(valveLog))) {
          addUniqueLog(valveLog);
          valveCache.add(JSON.stringify(valveLog));
        }
      });
    }

    if (data.location_coordinates?.farm_coordinates) {
      Promise.all(
        data.location_coordinates.farm_coordinates.map(coord => fetchWeatherData(coord))
      ).then(() => setLogs(generatedLogs));
    } else {
      setLogs(generatedLogs);
    }
  }, [data]);

  const farm_name = data?.farm_details.farm_name;

  const upperCase = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();


  return (
    <div className='borderring p-3'>
      <h5 className='text-secondary' style={{ fontSize: '14px' }}>{upperCase(farm_name)} Logs</h5>
      <table className="table table-hover">
        <thead>
          <tr>
            <th style={{ fontSize: '0.875rem' }}>Title</th>
            <th style={{ fontSize: '0.875rem' }}>Time Ago</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td style={{ fontSize: '0.875rem' }}>{log.title}</td>
              <td style={{ fontSize: '0.875rem' }}>{timeAgo(log.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsGenerator;
