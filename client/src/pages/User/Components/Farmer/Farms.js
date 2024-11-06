import React, { useRef, useEffect, useState } from 'react';
import './Farms.css';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";

const Farms = ({ farmDetails, farmerid }) => {
    const scrollerRef = useRef();
    const [weatherData, setWeatherData] = useState([]);
    const [selectedFarm, setSelectedFarm] = useState(null);

    useEffect(() => {
        const handleScroll = (event) => {
            event.preventDefault();
            if (scrollerRef.current) {
                scrollerRef.current.scrollLeft += event.deltaY;
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
                    return { ...farm, weather };
                }
                return { ...farm, weather: null };
            });
            const results = await Promise.all(weatherPromises);
            setWeatherData(results);

            if (farmDetails.length > 0) {
                const firstFarm = farmDetails[0];
                requestFarmDetails(farmerid, firstFarm.id);
            }
        };
    
        if (farmDetails.length > 0) {
            fetchWeatherData();
        }
    }, [farmDetails, farmerid]);

    const requestFarmDetails = async (farmerid, farmid) => {
        try {
            const response = await fetch(`http://localhost:5500/farmer/${farmerid}/${farmid}`);
            if (!response.ok) throw new Error('Failed to fetch farm details');
            const farmData = await response.json();
            setSelectedFarm(farmData);
            console.log("First farm details:", farmData);
        } catch (error) {
            console.error("Error fetching first farm details:", error);
        }
    };

    function upperCase(name) {
        return name.toUpperCase().slice(0, 1) + name.slice(1).toLowerCase();
    }

    return (
        <div id="fields">
            <div className="fieldnumbers bordering p-3">
                <h6 className="text-secondary">Farms</h6>
                <div
                    className="field-scroller"
                    ref={scrollerRef}
                    style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
                >
                    {weatherData && weatherData.length > 0 ? (
                        weatherData.map((farm, index) => (
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
                                <div className=''>
                                    <h5 className="fw-bold">{upperCase(farm.farm_name)}</h5>
                                    <span className="text-dark fs-6">Active</span>
                                    <br />
                                    <small className='text-center'>{farm.weather ? upperCase(farm.weather.name) : "Loading..."}</small>
                                    <br />
                                    <small className="text-secondary">{farm.farm_size} ha</small>
                                </div>

                                <div className='ps-4'>
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
                                            />
                                            <br />
                                            <h6 className='text-center text-secondary'>{farm.weather.weather[0].main} Sky</h6>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Loading farms...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Farms;
