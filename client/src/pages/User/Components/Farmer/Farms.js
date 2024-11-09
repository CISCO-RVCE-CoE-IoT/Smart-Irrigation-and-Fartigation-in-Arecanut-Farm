import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Farms.css';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";

const weatherImages = {
  Clouds: clouds,
  Clear: clear,
  Rain: rain,
  Drizzle: drizzle,
  Mist: mist,
  Haze: mist, // Mapping Mist/Haze to same image as both weather types have similar icons
};

const Farms = React.memo(({ farmDetails = [] }) => {
  const scrollerRef = useRef();
  const [weatherData, setWeatherData] = useState([]);
  
  // Throttling scroll event
  const handleScroll = useCallback((event) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({
        left: event.deltaY * 1.5,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener('wheel', handleScroll, { passive: true });
    }

    return () => {
      if (scroller) {
        scroller.removeEventListener('wheel', handleScroll);
      }
    };
  }, [handleScroll]);

  const checkWeather = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(`${apiURL}${latitude}&lon=${longitude}&appid=${apikey}`);
      if (response.status === 404) {
        window.alert("Enter Valid Coordinates");
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchWeatherData = async () => {
      const weatherPromises = farmDetails.map(async (farm) => {
        const [latitude, longitude] = farm.farm_location.split(',').map(coord => parseFloat(coord.trim()));
        const weather = await checkWeather(latitude, longitude);
        return { ...farm, weather, updatedAt: new Date().toLocaleTimeString() };
      });
      
      const results = await Promise.allSettled(weatherPromises);
      const successfulResults = results.filter(result => result.status === 'fulfilled').map(result => result.value);
      setWeatherData(successfulResults);
    };

    if (farmDetails.length > 0) {
      fetchWeatherData();
    }
  }, [farmDetails, checkWeather]);

  const upperCase = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  return (
    <div id="fields">
      {weatherData.length > 1 && (
        <div className="fieldnumbers bordering p-3">
          <h6 className="text-secondary">Farms</h6>
          <div
            className="field-scroller"
            ref={scrollerRef}
            style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollBehavior: 'smooth' }}
          >
            {weatherData.map((farm, index) => (
              <div
                className="farms farm-bordering d-flex align-items-center justify-content-between bg-dark"
                key={index}
                style={{
                  display: 'inline-block',
                  marginRight: '10px',
                  color: 'black',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  background: "linear-gradient(to right, #f1f1f1 5%, #9bddf7)"
                }}
              >
                <div className='me-5'>
                  <h5 className="fw-bold">{upperCase(farm.farm_name)}</h5>
                  <span className="text-dark fs-6">{farm.active ? "Active" : "Inactive"}</span>
                  <br />
                  <small className='text-center'>{farm.weather ? upperCase(farm.weather.name) : "Loading..."}</small>
                  <br />
                  <small className="text-dark">{farm.farm_size} ha</small>
                </div>
                <div className='ps-4 d-flex flex-column'>
                  {farm.weather && (
                    <>
                      <img
                        src={weatherImages[farm.weather.weather[0].main] || ''}
                        width={80}
                        alt="Weather Icon"
                        className='m-0'
                      />
                      <strong className='text-center text-secondary m-0'>{farm.weather.weather[0].main} Sky</strong>
                      <small className="text-center text-secondary m-0">{farm.weather.main.temp} °C</small>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {weatherData.length === 1 && (
        <div
          className="farms borderring farm-bordering d-flex align-items-center justify-content-between bg-dark px-3 p-1"
          style={{
            margin: '0 auto',
            color: 'black',
            borderRadius: '8px',
            background: "linear-gradient(to right, #f1f1f1 5%, #9bddf7)"
          }}
        >
          <div>
            <h5 className="fw-bold">{upperCase(weatherData[0].farm_name)}</h5>
            <strong className="text-dark fs-6 me-2">{weatherData[0].active ? "Active" : "Inactive"}</strong><br />
            <small className="text-secondary me-2">{weatherData[0].farm_size} ha</small>
            <small className='text-center text-secondary'>{weatherData[0].weather ? upperCase(weatherData[0].weather.name) : "Loading..."}</small>
          </div>
          <div className='ps-5 py-2 d-flex align-items-center'>
            {weatherData[0].weather && (
              <>
                <div className='d-flex align-items-center flex-column'>
                <h6 className='text-center text-secondary me-2'>{weatherData[0].weather.weather[0].main} Sky</h6>
                <h6 className="text-center text-secondary me-2">{weatherData[0].weather.main.temp} °C</h6>
                </div>
                <img
                  src={weatherImages[weatherData[0].weather.weather[0].main] || ''}
                  width={80}
                  alt="Weather Icon"
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default Farms;
