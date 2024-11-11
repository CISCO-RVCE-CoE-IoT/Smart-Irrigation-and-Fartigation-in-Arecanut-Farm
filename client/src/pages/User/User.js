import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import "./CSS/User.css";
import servererror from './Images/server.jpg'
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Components/NavBar";
import Farmer from "./Components/Farmer/Farmer";
import FarmSensorsControl from "./Components/Farmer/FarmSensorsControl";
import Farms from "./Components/Farmer/Farms";
import MapContainer from "./Components/Farmer/Map";
import Sections from "./Components/Farmer/Sections";
import Logs from "./Components/Farmer/Logs";
import Modal from "./Components/Farmer/Modal";

const User = () => {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [chartType, setChartType] = useState('timeline');

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/farmer/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRec(data);
        setLoading(false);
        // console.log(data);

      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner
          animation="border"
          variant="secondary"
          role="status"
          style={{ width: "5rem", height: "5rem" }} 
        >
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }
  

  if (error) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 vw-100 text-center">
        <img src={servererror} width={250} alt="Server Error" /> <br></br>
        <p>{error}</p>
      </div>
    );
  }
  


  function countRecentMoistureValues(moistureDeviceValues) {
    const currentTimestamp = new Date();
    const oneHourInMillis = 60 * 60 * 1000; // 1 hour in milliseconds

    const recentValues = moistureDeviceValues.filter(item => {
      const itemTimestamp = new Date(item.timestamp);
      const timeDifference = currentTimestamp - itemTimestamp;

      return timeDifference <= oneHourInMillis;
    });

    return recentValues.length;
  }


  const famer_details = rec?.farmer_details;
  const farm_details = rec?.farmer_farms;

  const locationCoordinates = rec?.location_coordinates;
  const device_values = rec?.device_values


  
  const prediction_location = rec?.location_coordinates.farm_device[0].device_location;

  const farm_devices_data = rec?.device_values.farm_device_data;

  const section_data = rec?.device_values.valve_devices_data;

  const total_devices = rec?.location_coordinates.section_device.length + 1;
  const active_counting = rec?.device_values.moisture_device_value;


  const total_active_count = countRecentMoistureValues(active_counting);
  const auto_threshold_value = rec?.farm_details;

  const farm_name = rec?.farm_details.farm_name;  

  

  const total_and_active_farm_devices = {
    total_device: total_devices,
    total_active_devices: total_active_count,
    auto_threshold_value: auto_threshold_value,
    prediction_location: prediction_location
  }

  const notifications = [
    { message: "New crop update available", time: "10:30 AM" },
    { message: "Water levels low in field", time: "09:15 AM" },
    { message: "Fertilizer reminder", time: "Yesterday" },
    { message: "Weather alert: Rain tomorrow", time: "2 days ago" },
    { message: "Soil pH adjustment needed", time: "3 days ago" },
  ];


  const timelineChartData = {
    labels: ['2024-11-01', '2024-11-02', '2024-11-03'],
    values: [10, 20, 30],
  };

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    values: [12, 19, 3, 5, 2],
  };

  const handleOpenModal = (type) => {
    setChartType(type);
    setShowModal(true);
  };




  const handleCloseModal = () => setShowModal(false);

  return (
    <main>
      <header className="fixed-top">
        <NavBar notifications={notifications} />
      </header>
      {/* <div>
        <div className="mt-5 ">
          <button onClick={() => handleOpenModal('timeline')}>Open Timeline Chart Modal</button>
          <button onClick={() => handleOpenModal('line')}>Open Line Chart Modal</button>

          <Modal
            show={showModal}
            handleClose={handleCloseModal}
            chartData={chartType === 'timeline' ? timelineChartData : lineChartData}
            chartType={chartType}
          />
        </div>
      </div> */}
      <div className="container mt-5 pt-4 pb-4">
        <div className="row">
          <aside className="col-12 col-md-3 mb-4">
            <div style={{ position: "sticky", top: "72px", zIndex: 1000 }}>
              <div className="borderring" >
                <div className="farmerDetails">
                  <Farmer farmer_Details={famer_details} />
                </div>
              </div>
              <div className="p-3 borderring mt-3">
                <div className="FarmSensorsControl">
                  <Farms farmDetails={farm_details} />
                </div>
              </div>
            </div>

          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              <div className="col-12 mb-3">
                <FarmSensorsControl gauges={farm_devices_data} farmname={farm_name}  activeDevices={total_and_active_farm_devices} />
              </div>
              <div className="col-12">
                <MapContainer locationCoordinates={locationCoordinates} device_values={device_values} />


              </div>
              <div className="col-12 my-3">
                <Sections sectionsData={section_data} />
              </div>
              <div className="col-12 ">
                {/* <Logs logs={logs} /> */}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default User;
