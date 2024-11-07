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

    fetch(`/f/${id}`)
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

  const farmerDetails = rec?.farmer_details;
  const total_count = rec?.total_farm_count;

  const user_details = [farmerDetails, total_count];

  const farm_device_data = rec?.all_sensor_values.farm_device_data[0];
  const farms = rec?.All_farms;
  const valveDevicesData = rec?.all_sensor_values?.valve_devices_data;
  
  let avgMoisture = 0;  // Default value
  
  if (valveDevicesData && valveDevicesData.length > 0) {
    const totalMoisture = valveDevicesData.reduce((acc, device) => acc + device.moisture, 0);
    avgMoisture = Math.floor(totalMoisture / valveDevicesData.length);  // Rounding down to integer
  } else {
    console.log('No valve device data available');
  }
  
  const farmname = farms[0]?.farm_name;
  
  const updatedFarmDeviceData = { ...farm_device_data, avg_moisture: avgMoisture };
  
  const fieldsensorvalve = [farmname, updatedFarmDeviceData];

  const farmloc = rec?.farm_cordinates[0];

  const sensorloc = rec?.all_devices.section_devices;

  const farmdeviceloc = rec?.all_devices.farm_devices;

  const moisturedata = rec?.all_sensor_values.moisture_devices;

  const mapppingdevices = {farmlocation : farmloc, sensorlocation : sensorloc, farmdevicelocation : farmdeviceloc, moisturedata : moisturedata}

  console.log(mapppingdevices);
  
  

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
                <Farmer farmer_Details={user_details} />
              </div>
              <div className="FarmSensorsControl">
                <FarmSensorsControl gauges={fieldsensorvalve} />
              </div>
              <div>
                {/* <FieldControl data={farmdata} /> */}
              </div>
            </div>
          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              <div className="col-12 mb-3">
                <Farms farmDetails={farms} />

              </div>
              <div className="col-12">
                <Map data={mapppingdevices} />
              </div>
              <div className="col-12 my-3">
                <Sections sectionsData={sectionsData} />
              </div>
              <div className="col-12 ">
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
