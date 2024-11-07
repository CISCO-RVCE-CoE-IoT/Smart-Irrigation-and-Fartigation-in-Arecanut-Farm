import React, { useRef, useEffect, useState } from 'react';
import './Farms.css';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";

const Farms = ({ farmDetails }) => {
    const scrollerRef = useRef();
    const [weatherData, setWeatherData] = useState([]);

    useEffect(() => {
        const handleScroll = (event) => {
            event.preventDefault();
            if (scrollerRef.current) {
                scrollerRef.current.scrollBy({
                    left: event.deltaY * 1.5,
                    behavior: 'smooth'
                });
            }
        };

        const scroller = scrollerRef.current;
        if (scroller) {
            scroller.addEventListener('wheel', handleScroll);
        }

        return () => {
            if (scroller) {
                scroller.removeEventListener('wheel', handleScroll);
            }
        };
    }, []);

    const checkWeather = async (latitude, longitude) => {
        const response = await fetch(`${apiURL}${latitude}&lon=${longitude}&appid=${apikey}`);
        if (response.status === 404) {
            window.alert("Enter Valid Coordinates");
        } else {
            const data = await response.json();
            return data;
        }
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            const weatherPromises = farmDetails.map(async (farm) => {
                const firstCoordinate = farm.farm_location_cordinates[0];
                if (firstCoordinate) {
                    const [latitude, longitude] = firstCoordinate.split(',').map(coord => parseFloat(coord.trim()));
                    const weather = await checkWeather(latitude, longitude);
                    return { ...farm, weather, updatedAt: new Date().toLocaleTimeString() };
                }
                return { ...farm, weather: null, updatedAt: null };
            });
            const results = await Promise.all(weatherPromises);
            setWeatherData(results);
        };

        if (farmDetails.length > 0) {
            fetchWeatherData();
        }
    }, [farmDetails]);

    function upperCase(name) {
        return name.toUpperCase().slice(0, 1) + name.slice(1).toLowerCase();
    }

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
                                                src={
                                                    farm.weather.weather[0].main === "Clouds" ? clouds :
                                                        farm.weather.weather[0].main === "Clear" ? clear :
                                                            farm.weather.weather[0].main === "Rain" ? rain :
                                                                farm.weather.weather[0].main === "Drizzle" ? drizzle :
                                                                    (farm.weather.weather[0].main === "Mist" || farm.weather.weather[0].main === "Haze") ? mist :
                                                                        ''
                                                }
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
                    <div className=''>
                        <div>
                            <h5 className="fw-bold">{upperCase(weatherData[0].farm_name)}</h5>
                            <strong className="text-dark fs-6 me-2">{weatherData[0].active ? "Active" : "Inactive"}</strong><br></br>
                            <small className="text-secondary me-2">{weatherData[0].farm_size} ha</small>
                            <small className='text-center text-secondary'>{weatherData[0].weather ? upperCase(weatherData[0].weather.name) : "Loading..."}</small>
                        </div>

                    </div>
                    <div className='ps-5 py-1 d-flex align-items-center '>
                        {weatherData[0].weather && (
                            <>
                                <img
                                    src={
                                        weatherData[0].weather.weather[0].main === "Clouds" ? clouds :
                                            weatherData[0].weather.weather[0].main === "Clear" ? clear :
                                                weatherData[0].weather.weather[0].main === "Rain" ? rain :
                                                    weatherData[0].weather.weather[0].main === "Drizzle" ? drizzle :
                                                        (weatherData[0].weather.weather[0].main === "Mist" || weatherData[0].weather.weather[0].main === "Haze") ? mist :
                                                            ''
                                    }
                                    width={80}
                                    alt="Weather Icon"
                                />
                                <br />
                                <h6 className='text-center text-light me-2'>{weatherData[0].weather.weather[0].main} Sky</h6>
                                <h6 className="text-center text-light me-2">{weatherData[0].weather.main.temp} °C</h6>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Farms;
