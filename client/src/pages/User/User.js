import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import "./CSS/User.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Components/NavBar";
import Farmer from "./Components/Farmer/Farmer";
import FarmSensorsControl from "./Components/Farmer/FarmSensorsControl";
import FieldControl from "./Components/Farmer/FieldControl";
import Farms from "./Components/Farmer/Farms";
import Map from "./Components/Farmer/Map";
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
        console.log(data);

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
        <Spinner animation="border" variant="secondary" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const famer_details = rec?.farmer_details;
  const farm_details = rec?.farmer_farms;
  const locationCoordinates = rec?.location_coordinates;
  const farm_device_data = rec?.device_values.farm_device_data;
  const section_data = rec?.device_values.valve_devices_data;

  console.log(section_data);
  




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
                  <FarmSensorsControl gauges={farm_device_data} />
                </div>
                <div>
                  <FieldControl />
                </div>
              </div>
            </div>

          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              <div className="col-12 mb-3">
                <Farms farmDetails={farm_details} />

              </div>
              <div className="col-12">
                <Map locationCoordinates={locationCoordinates} />

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
