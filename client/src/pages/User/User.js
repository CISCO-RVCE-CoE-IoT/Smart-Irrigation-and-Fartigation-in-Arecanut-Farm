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

const User = () => {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const farmerDetails = rec?.farmer_details;
  const farmerDetail = farmerDetails?.[0];
  const total_count = rec?.total_farm_count;

  const farmer_Details = [farmerDetail, total_count];
  const farms = rec?.farm_details;

  const gauges = [
    { value: 97, name: "Nitrogen" },
    { value: 57, name: "Phosphorus" },
    { value: 37, name: "Potassium" },
    { value: 75, name: "Temperature" },
    { value: 45, name: "Humidity" },
    { value: 60, name: "A.Moisture" },
  ];

  const notifications = [
    { message: "New crop update available", time: "10:30 AM" },
    { message: "Water levels low in field", time: "09:15 AM" },
    { message: "Fertilizer reminder", time: "Yesterday" },
    { message: "Weather alert: Rain tomorrow", time: "2 days ago" },
    { message: "Soil pH adjustment needed", time: "3 days ago" },
  ];

  const jsonData = {
    mapData: [
      {
        type: "farmland",
        coordinates: [
          [16.2246, 74.8412],
          [16.2246, 74.8428],
          [16.2252, 74.8428],
          [16.2252, 74.8412],
        ],
      },
      { type: "valve", lat: 16.2249, lon: 74.8423, label: "Valve 1" },
      { type: "valve", lat: 16.225, lon: 74.8423, label: "Valve 2" },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8414,
        label: "Sensor 1",
        moistureValue: 30,
      },
      // (Additional map data truncated for brevity)
    ],
  };

  const sectionsData = [
    {
      section_device_id: 1,
      valve_mode: "auto",
      valve_status: "on",
      moisture_level: 30,
    },
    {
      section_device_id: 2,
      valve_mode: "manual",
      valve_status: "off",
      moisture_level: 45,
    },
    {
      section_device_id: 3,
      valve_mode: "auto",
      valve_status: "on",
      moisture_level: 25,
    },
  ];

  const logs = [
    { title: "New crop update available", time: "00:00:00" },
    { title: "New crop update available", time: "00:00:00" },
    { title: "New crop update available", time: "00:00:00" },
  ];

  const farmdata = [{ farmname: "Arecanut 1" }];

  return (
    <main>
      <header className="fixed-top">
        <NavBar notifications={notifications} />
      </header>
      <div className="container mt-5 pt-4 pb-4">
        <div className="row">
          <aside className="col-12 col-md-3 mb-4">
            <div className="borderring" style={{ position: "sticky", top: "72px", zIndex: 1000 }}>
              <div className="farmerDetails">
                <Farmer farmer_Details={farmer_Details} />
              </div>
              <div className="FarmSensorsControl">
                <FarmSensorsControl gauges={gauges} />
              </div>
              <div>
                <FieldControl data={farmdata} />
              </div>
            </div>
          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              <div className="col-12">
                <Farms farmDetails={farms} />
              </div>
              <div className="col-12 my-3">
                <Map jsonData={jsonData} />
              </div>
              <div className="col-12">
                <Sections sectionsData={sectionsData} />
              </div>
              <div className="col-12 mt-3">
                <Logs logs={logs} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default User;
