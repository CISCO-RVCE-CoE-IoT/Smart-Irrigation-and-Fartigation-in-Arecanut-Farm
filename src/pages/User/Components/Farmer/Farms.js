import React, { useRef, useEffect, useState } from 'react';
import './Farms.css';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";

const Farms = ({ fields }) => {
    const scrollerRef = useRef();
    const [weatherData, setWeatherData] = useState([]);

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
            return data; // Return the fetched data
        }
    };

    useEffect(() => {
        const fetchWeatherData = async () => {
            const weatherPromises = fields.map(async (field) => {
                const { coordinates } = field;
                const weather = await checkWeather(coordinates[0], coordinates[1]);
                return { ...field, weather }; // Combine field data with weather data
            });
            const results = await Promise.all(weatherPromises);
            setWeatherData(results); // Set the combined data in state
        };

        if (fields.length > 0) {
            fetchWeatherData();
        }
    }, [fields]);

    return (
        <div id="fields">
            <div className="fieldnumbers bordering p-3">
                <h6 className="text-secondary">Farms</h6>
                <div
                    className="field-scroller"
                    ref={scrollerRef}
                    style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
                >
                    {weatherData.map((field, index) => (
                       <div
                       className="farms farm-bordering d-flex align-items-center justify-content-between bg-dark"
                       key={index}
                       style={{
                           display: 'inline-block',
                           marginRight: '10px',
                           color: 'black',
                           padding: '6px 14px',
                           borderRadius: '5px',
                           background: "linear-gradient(to right, #f1f1f1 5%, #9bddf7)" // Gradient background
                       }}
                   >
                   
                            <div className=''>
                                <h5 className="fw-bold">{field.name}</h5>
                                <span className="fw-bold text-dark">
                                    {field.status}
                                    {field.status === "Active" && (
                                        <div
                                            className="spinner-grow text-success ms-2"
                                            role="status"
                                            style={{ width: "0.75rem", height: "0.75rem" }}
                                        >
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    )}
                                    
                                </span>
                                <br />
                                <small className='text-center'>{field.weather.name}</small>
                                <br />
                                <small className="text-secondary">{field.dimensions}</small>
                            </div>

                            <div className='ps-4'>
                                {field.weather && (
                                    <>
                                        <img
                                            src={
                                                field.weather.weather[0].main === "Clouds" ? clouds :
                                                    field.weather.weather[0].main === "Clear" ? clear :
                                                        field.weather.weather[0].main === "Rain" ? rain :
                                                            field.weather.weather[0].main === "Drizzle" ? drizzle :
                                                                field.weather.weather[0].main === "Mist" || "Haze" ? mist :
                                                                    ''
                                            }
                                            width={80}
                                            alt="Weather Icon"
                                        />
                                        <br />
                                        <h6 className='text-center text-secondary'>{field.weather.weather[0].main} Sky</h6>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Farms;
