import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Farms.css';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";
const farmDetailAPI = "/farmer/farm";  // Modify this URL according to your API

const weatherImages = {
  Clouds: clouds,
  Clear: clear,
  Rain: rain,
  Drizzle: drizzle,
  Mist: mist,
  Haze: mist, 
};

const Farms = React.memo(({ farmDetails = [], onFarmDetailsSelected }) => {
  const farm_details = farmDetails?.farmer_farms || [];
  const [weatherData, setWeatherData] = useState([]);
  const [selectedFarmDetails, setSelectedFarmDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkWeather = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(`${apiURL}${latitude}&lon=${longitude}&appid=${apikey}`);
      if (response.status === 404) {
        setError("Invalid coordinates, please try again.");
        return null;
      } else if (!response.ok) {
        setError("Failed to fetch weather data.");
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error fetching weather data.");
    }
    return null;
  }, []);

  const fetchFarmDetails = async (farmId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${farmDetailAPI}/${farmId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedFarmDetails(data);
        // Pass the farm details back to the parent component
        if (onFarmDetailsSelected) onFarmDetailsSelected(data);
      } else {
        setError("Failed to fetch farm details.");
      }
    } catch (error) {
      console.error("Error fetching farm details:", error);
      setError("Error fetching farm details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (farm_details.length === 0) return;

      const weatherPromises = farm_details.map(async (farm) => {
        const [latitude, longitude] = farm.farm_location.split(',').map(coord => parseFloat(coord.trim()));
        const weather = await checkWeather(latitude, longitude);
        if (weather) {
          return { ...farm, weather, updatedAt: new Date().toLocaleTimeString() };
        }
        return null;
      });

      const results = await Promise.all(weatherPromises);
      const successfulResults = results.filter(result => result !== null);
      setWeatherData(successfulResults);
    };

    fetchWeatherData();
  }, [farm_details, checkWeather]);

  useEffect(() => {
    if (farm_details.length > 0 && !selectedFarmDetails) {
      fetchFarmDetails(farm_details[0].farm_id); // Fetch details for the first farm if none are selected
    }
  }, [farm_details, selectedFarmDetails]);

  const handleFarmClick = (farmId) => {
    fetchFarmDetails(farmId);
  };

  const upperCase = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Function to initialize map with valid data
  const initializeMapWithCoordinates = () => {
    if (
      farm_details.length > 0 &&
      weatherData.length > 0 &&
      weatherData.every(farm => farm.weather !== null) // Ensure all farms have weather data
    ) {
      const mapData = weatherData.map(farm => ({
        coordinates: farm.farm_location,
        weather: farm.weather
      }));

      setTimeout(() => {
        // Initialize map logic here
        // Call the map initialization function with mapData
        // mapInstance.initialize(mapData);
      }, 50); // Small delay before initialization
    }
  };

  useEffect(() => {
    initializeMapWithCoordinates();
  }, [weatherData, farm_details]);

  return (
    <div id="fields">
      <h6 className="text-secondary">Farms</h6>
      {error && <div className="alert alert-danger">{error}</div>}
      {weatherData.length > 0 && (
        <div
          className="fieldnumbers"
          style={{
            minHeight: 'auto',
            maxHeight: weatherData.length > 3 ? '400px' : 'none', 
            overflowY: weatherData.length > 3 ? 'auto' : 'visible',
            transition: 'max-height 0.3s ease-in-out',
          }}
        >
          <div
            className="field-scroller"
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            {weatherData.map((farm, index) => (
              <div
                className="farms farm-bordering d-flex align-items-center justify-content-between bg-dark hover-effect"
                key={index}
                style={{
                  color: 'black',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  background: "linear-gradient(to right, #f1f1f1 5%, #9bddf7)"
                }}
                onClick={() => handleFarmClick(farm.farm_id)} // Trigger farm detail fetch
              >
                <div>
                  <h5 className="fw-bold">{upperCase(farm.farm_name)}</h5>
                  <span className="text-dark fs-6">{farm.active ? "Active" : "Inactive"}</span>
                  <br />
                  <small className='text-center'>{farm.weather ? upperCase(farm.weather.name) : "Loading..."}</small>
                  <br />
                  <small className="text-dark">{farm.farm_size} ha</small>
                </div>
                <div className='d-flex flex-column'>
                  {farm.weather ? (
                    <>
                      <img
                        src={weatherImages[farm.weather.weather[0].main] || mist} // Fallback to mist if no image found
                        width={80}
                        alt="Weather Icon"
                        className='m-0'
                      />
                      <strong className='text-center text-secondary m-0'>{farm.weather.weather[0].main} Sky</strong>
                      <small className="text-center text-secondary m-0">{farm.weather.main.temp} °C</small>
                    </>
                  ) : (
                    <div>Loading weather...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default Farms;
