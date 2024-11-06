import React from "react";
// css--------------
import "./CSS/User.css";
import "bootstrap/dist/css/bootstrap.min.css";
// Components------------
import NavBar from "./Components/NavBar";
import Farmer from "./Components/Farmer/Farmer";
import FarmSensorsControl from "./Components/Farmer/FarmSensorsControl";
import FieldControl from "./Components/Farmer/FieldControl";
import Farms from "./Components/Farmer/Farms";
import Map from "./Components/Farmer/Map";
import Sections from "./Components/Farmer/Sections";
import Logs from "./Components/Farmer/Logs";

const User = () => {
  const fields = [
    {
      name: "Arecanut 1",
      id: "1232164",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [12.992688, 77.4982241], // [latitude, longitude]
    },
    {
      name: "Arecanut 2",
      id: "1232165",
      dimensions: "120 X 120",
      status: "Inactive",
      coordinates: [14.215888, 76.398907], // Example coordinates
    },
    {
      name: "Arecanut 3",
      id: "1232166",
      dimensions: "120 X 120",
      status: "Inactive",
      coordinates: [16.22545, 74.8419], // Example coordinates
    },
    {
      name: "Arecanut 4",
      id: "1232167",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [16.2255, 74.842], // Example coordinates
    },
    {
      name: "Arecanut 5",
      id: "1232168",
      dimensions: "120 X 120",
      status: "Active",
      coordinates: [16.22555, 74.8421], // Example coordinates
    },
  ];

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
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8416,
        label: "Sensor 2",
        moistureValue: 40,
      },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.8418,
        label: "Sensor 3",
        moistureValue: 50,
      },
      {
        type: "moisture",
        lat: 16.2247,
        lon: 74.842,
        label: "Sensor 4",
        moistureValue: 60,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8414,
        label: "Sensor 5",
        moistureValue: 70,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8416,
        label: "Sensor 6",
        moistureValue: 80,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.8418,
        label: "Sensor 7",
        moistureValue: 90,
      },
      {
        type: "moisture",
        lat: 16.2251,
        lon: 74.842,
        label: "Sensor 8",
        moistureValue: 80,
      },
      {
        type: "moisture",
        lat: 16.2249,
        lon: 74.8416,
        label: "Sensor 9",
        moistureValue: 70,
      },
      {
        type: "moisture",
        lat: 16.2249,
        lon: 74.8418,
        label: "Sensor 10",
        moistureValue: 100,
      },
      {
        type: "npk",
        lat: 16.225,
        lon: 74.8425,
        label: "NPK Sensor",
        npkValue: 20,
      },
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

  const username = "Somanna";
  const userId = "U5435324";
  const field = 5;

  const logs = [
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    },
    {
      title: "New crop update available",
      time: "00:00:00"
    }
    , {
      title: "New crop update available",
      time: "00:00:00"
    }
  ]

  const farmdata=[
    {
      farmname:'Arecanut 1'
    }
  ]

  return (
    <main>
      <header className="fixed-top">
        <NavBar notifications={notifications} />
      </header>
      <div className="container mt-5 pt-4 pb-4">
        <div className="row">
          
          {/* Left Sidebar */}
          <aside className="col-12 col-md-3 mb-4">
            <div className="borderring" style={{ position: "sticky", top: "72px", zIndex: 1000 }}>
              
              {/* Farmer Details */}
              <div className="farmerDetails">
                <Farmer username={username} userID={userId} fields={field} />
              </div>
              
              {/* Farm Sensors Control */}
              <div className="FarmSensorsControl">
                {/* <FarmSensorsControl gauges={gauges} /> */}
              </div>
              
              {/* Field Control */}
              <div>
                {/* <FieldControl data={farmdata} /> */}
              </div>
            </div>
          </aside>
          
          {/* Main Content Area */}
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              
              {/* Farms Component */}
              <div className="col-12">
                <Farms fields={fields} />
              </div>
              
              {/* Map Component */}
              <div className="col-12 my-3">
                {/* <Map jsonData={jsonData} /> */}
              </div>
              
              {/* Sections Component */}
              <div className="col-12">
                {/* <Sections sectionsData={sectionsData} /> */}
              </div>
              
              {/* Logs Component */}
              <div className="col-12 mt-3">
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
