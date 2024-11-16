import React, { useState, useEffect } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import clouds from './WeatherImages/clouds.png';
import clear from './WeatherImages/clear.png';
import drizzle from './WeatherImages/drizzle.png';
import rain from './WeatherImages/rain.png';
import mist from './WeatherImages/mist.png';

const apikey = "8925502a781648f4443f9e01d96c7ff5";
const apiURL = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=";

const FieldControl = ({collected_data}) => {

  function recomendation(collected_data) {
    const totalmoisture = collected_data.device_values.valve_devices_data.reduce((sum, device) => sum + device.avg_section_moisture, 0);
    const avgMoisture = totalmoisture / collected_data.device_values.valve_devices_data.length;
  
    const isAnyMoistureLow = collected_data.device_values.valve_devices_data.some(device => device.avg_section_moisture < avgMoisture);
  
    setRecomendation(isAnyMoistureLow);
  }

  function countRecentMoistureValues(moistureDeviceValues) {
    const currentTimestamp = new Date();
    const oneHourInMillis = 60 * 60 * 1000; 

    const recentValues = moistureDeviceValues.filter(item => {
      const itemTimestamp = new Date(item.timestamp);
      const timeDifference = currentTimestamp - itemTimestamp;

      return timeDifference <= oneHourInMillis;
    });

    return recentValues.length;
  }

  const active_counting = collected_data?.device_values.moisture_device_value;
  const total_active_count = countRecentMoistureValues(active_counting);

  const total_devices = collected_data?.location_coordinates.section_device.length ;
  const prediction_location = collected_data?.location_coordinates?.farm_device?.[0]?.device_location;
  const auto_threshold_value = collected_data?.farm_details;

  const activeDevices = {
    total_device: total_devices,
    total_active_devices: total_active_count,
    auto_threshold_value: auto_threshold_value,
    prediction_location: prediction_location
  }

  const [inputDuration, setInputDuration] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [threshold1, setThreshold1] = useState(30);
  const [threshold2, setThreshold2] = useState(30);
  const [forecastData, setForecastData] = useState(null);
  const [isEditingThreshold1, setIsEditingThreshold1] = useState(false);
  const [isEditingThreshold2, setIsEditingThreshold2] = useState(false);
  const [recomended, setRecomendation] = useState(false);


  const [latitude, longitude] = activeDevices.prediction_location 
  ? activeDevices.prediction_location.split(", ").map(Number)
  : [null, null];


  useEffect(() => {
    if (activeDevices.auto_threshold_value) {
      const { auto_on_threshold, auto_off_threshold } = activeDevices.auto_threshold_value;
      setThreshold1(auto_on_threshold || 30);
      setThreshold2(auto_off_threshold || 30);
    }
  }, [activeDevices]);

  useEffect(() => {
    if (latitude && longitude) {
      fetch(`${apiURL}${latitude}&lon=${longitude}&appid=${apikey}`)
        .then(response => response.json())
        .then(data => {
          const forecast = data.list[2];
          setForecastData(forecast);
        })
        .catch(error => console.error("Error fetching weather forecast data:", error));
    }
  }, [latitude, longitude]);

  const handleThresholdChange1 = (e) => setThreshold1(e.target.value);
  const handleThresholdChange2 = (e) => setThreshold2(e.target.value);
  const toggleEditThreshold1 = () => setIsEditingThreshold1(!isEditingThreshold1);
  const toggleEditThreshold2 = () => setIsEditingThreshold2(!isEditingThreshold2);
  const handleManualClick = () => {
    setIsManualMode(true);
    setIsStarted(false);
    setInputDuration('');
  };
  const handleStartClick = () => {
    if (inputDuration) setIsStarted(true);
  };
  const handleInputChange = (e) => setInputDuration(e.target.value);
  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert(`Duration saved: ${inputDuration}`);
  };

  const weatherIcons = {
    Clouds: clouds,
    Clear: clear,
    Drizzle: drizzle,
    Rain: rain,
    Mist: mist,
  };

  const upperCase = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  useEffect(() => {
    recomendation(collected_data);
  }, [collected_data]);
  
  const manualPopover = (
    <Popover id="popover-manual">
      <Popover.Body>
        <form onSubmit={handleSaveChanges}>
          <input
            className="form-control form-control-sm mt-1 mb-2"
            type="number"
            placeholder="Enter duration"
            value={inputDuration}
            onChange={handleInputChange}
          />
          <div className="d-flex justify-content-evenly align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100 me-3"
              onClick={handleStartClick}
              disabled={!inputDuration}
            >
              Start
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm w-100"
            >
              Stop
            </button>
          </div>
          <div className="text-center my-2">
            <button
              type="submit"
              className="text-center btn btn-outline-secondary btn-sm"
              disabled={!isStarted}
            >
              Save Changes
            </button>
          </div>
        </form>
      </Popover.Body>
    </Popover>
  );



  return (
    <div>
      <hr className='my-1'></hr>
      <div className="controller">
        <div className="container">
          <div className="row pt-2 pb-1">
            <div className="col-12 col-sm-3 field-control-mobile">
              <h6 className='text-secondary'>Farm devices</h6>
              <small>Total Devices : <span className='fw-bold fs-6'>{activeDevices.total_device>0 ?(activeDevices.total_device +1) : 0}</span></small><br />
              <small>Active Devices : <span className='fw-bold fs-6'>{activeDevices.total_active_devices}</span></small>
            </div>
            <div className="col-12 col-sm-3 field-control-mobile">
              <h6 className="text-secondary m-0">Threshold</h6>
              <div className="d-flex align-items-center">
                <small>Auto on threshold : </small>
                {isEditingThreshold1 ? (
                  <>
                    <input
                      type="number"
                      value={threshold1}
                      onChange={handleThresholdChange1}
                      className="form-control form-control-sm ms-2"
                      style={{ width: '60px' }}
                      min={10}
                      max={30}
                    />
                    <button
                      onClick={toggleEditThreshold1}
                      className="btn btn-sm btn-outline-secondary ms-2"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <small>{threshold1}</small>
                    <button
                      onClick={toggleEditThreshold1}
                      className="btn btn-sm ms-1 text-secondary "
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </>
                )}
              </div>
              <div className="d-flex align-items-center">
                <small>Auto off threshold : </small>
                {isEditingThreshold2 ? (
                  <>
                    <input
                      type="number"
                      value={threshold2}
                      onChange={handleThresholdChange2}
                      className="form-control form-control-sm ms-2"
                      style={{ width: '60px' }}
                    />
                    <button
                      onClick={toggleEditThreshold2}
                      className="btn btn-sm btn-outline-secondary ms-1"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <small>{threshold2}</small>
                    <button
                      onClick={toggleEditThreshold2}
                      className="btn btn-sm ms-2 text-secondary"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className='col-12 col-sm-3 field-control-mobile'>
              <h6 className='text-secondary m-0'>Weather in 6 hrs</h6>
              {forecastData ? (
                <div className='d-flex align-items-center justify-content-between'>
                  <div>
                  <small>{upperCase(forecastData.weather[0].description)}</small><br></br>
                  <small>{forecastData.main.temp}°C</small>
                  </div>
                  <img
                    src={weatherIcons[forecastData.weather[0].main]}
                    alt={forecastData.weather[0].description}
                    width={65}
                    style={{ filter: 'drop-shadow(0px 0px 9px #0080ff)' }}
                  />
                </div>
              ) : (
                <span>Loading...</span>
              )}
            </div>
            <div className="col-12 col-sm-3 toppadding">
              <h6 className='text-secondary'>Pump controls</h6>
              <div className="d-flex justify-content-evenly text-center flex-column">
                <div className='d-flex'>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100 mb-1"
                  >
                    Auto
                  </button>
                  {
                    recomended && (<span className='text-secondary ms-2'>Recommended</span>)
                  }
                </div>
                <OverlayTrigger
                  trigger="click"
                  placement="bottom"
                  overlay={manualPopover}
                >
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm w-100"
                    onClick={handleManualClick}
                  >
                    Manual
                  </button>
                </OverlayTrigger>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldControl;
