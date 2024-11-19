import React, { useState, useEffect } from 'react';
import ProgressChart from './ProgressChart';

const FarmSensorsControl = ({ collected_data = {}, farmer_details = {} }) => {
  const [farmDevicesData, setFarmDevicesData] = useState([]);
  const [farmName, setFarmName] = useState("Farm Name Not Available");
  const [lastUpdated, setLastUpdated] = useState("N/A");
  const [isEditing, setIsEditing] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [activeDevicesSetup, setActiveDevicesSetup] = useState([]);

  const farmId = collected_data?.farm_details?.farm_id;
  const farmerId = farmer_details?.farmer_details?.farmer_id;

  const units = {
    nitrogen: 'kg/ha',
    phosphorus: 'kg/ha',
    potassium: 'kg/ha',
    temperature: '°C',
    humidity: '%',
    avg_moisture: '%',
  };

  const capitalize = (name) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  useEffect(() => {
    const devices = collected_data?.device_values?.farm_device_data || [];
    const name =
      collected_data?.farm_details?.farm_name || "Farm Name Not Available";
    const lastUpdate =
      devices.length > 0
        ? new Date(devices[0]?.timestamp).toLocaleString()
        : "N/A";

    setFarmDevicesData(devices);
    setFarmName(name);
    setNewFarmName(name); // Sync the editing input with the initial name
    setLastUpdated(lastUpdate);
  }, [collected_data]);

  useEffect(() => {
    const activeDevices = getActiveDevices([
      ...(collected_data.device_values?.farm_device_data || []),
      ...(collected_data.device_values?.moisture_device_value || []),
    ]);
    // console.log("Active Devices:", activeDevices);
    setActiveDevicesSetup(activeDevices);
  }, [collected_data]);


  const getActiveDevices = (devices) => {
    return devices.filter((device) => {
      if (!device.timestamp) {
        console.log("Inactive: Missing timestamp", device);
        return false;
      }
  
      const deviceTime = new Date(device.timestamp).getTime();
      const now = new Date().getTime();
      const diffInMinutes = (now - deviceTime) / (1000 * 60);
  
      if (diffInMinutes >= 10) {
        console.log("Inactive: Timestamp older than 10 minutes", device);
        return false;
      }
  
      if (device.moisture_value === 0) {
        console.log("Inactive: Moisture value is zero", device);
        return false;
      }
  
      return true; // All conditions passed
    });
  };
  

  const handleFarmNameChange = (event) => {
    setNewFarmName(event.target.value);
  };

  const saveFarmName = async () => {
    if (!farmId || !farmerId) {
      console.error("Invalid farm or farmer details.");
      return;
    }

    try {
      const response = await fetch(`/farmer/farm/farm_name/${farmId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ farm_name: newFarmName, farmer_id: farmerId }),
      });

      if (response.ok) {
        console.log('Farm name updated successfully');
        setFarmName(newFarmName);
        setIsEditing(false);
      } else {
        const errorText = await response.text();
        console.error('Failed to update farm name:', errorText);
      }
    } catch (error) {
      console.error('Error updating farm name:', error);
    }
  };

  return (
    <div>
      {/* Farm Header */}
      <div className='text-secondary d-flex justify-content-between align-items-center'>
        <div>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={newFarmName}
                onChange={handleFarmNameChange}
                className="form-control"
                style={{ width: '200px', display: 'inline', height: '35px' }}
              />
              <button
                onClick={saveFarmName}
                className="btn btn-outline-secondary btn-sm ms-2"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <span className='text-dark fs-5 fw-bold'>
                {capitalize(farmName)}
              </span>
              <i
                className="fa-solid fa-pencil ms-2"
                style={{ cursor: 'pointer' }}
                onClick={() => setIsEditing(true)}
              />
            </div>
          )}
        </div>

        {/* Active Device Spinner */}
        {activeDevicesSetup.length > 0 ? (
          <div className="d-flex align-items-center" aria-live="polite">
            <span className="fw-bold text-dark">Active</span>
            <div
              className="spinner-grow text-success ms-2"
              role="status"
              style={{ width: "0.75rem", height: "0.75rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <span className='text-secondary me-1'>Inactive</span>
        )}
      </div>

      {/* Last Updated */}
      <small className='text-secondary'>Last updated: {lastUpdated}</small>

      {/* Progress Charts */}
      <div
        className="ProgressCharts"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="Sensors"
          style={{
            width: "100%",
            display: "grid",
            gap: "10px",
            padding: "10px",
          }}
        >
          <style>
            {`
              .Sensors {
                grid-template-columns: repeat(1, 1fr);
              }
              @media (min-width: 768px) {
                .Sensors {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
              @media (min-width: 1024px) {
                .Sensors {
                  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                }
              }
              @media (max-width: 767px) {
                .Sensors {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
            `}
          </style>
          {farmDevicesData.length > 0 &&
            Object.entries(farmDevicesData[0]).map(([name, value], index) =>
              name !== "timestamp" && name !== "farm_device_id" ? (
                <div
                  className="col"
                  key={index}
                  style={{
                    textAlign: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <ProgressChart
                    value={Math.round(value)}
                    name={capitalize(name)}
                    unit={units[name] || 'mg/kg'}
                  />
                </div>
              ) : null
            )}
        </div>
      </div>
    </div>
  );
};

export default FarmSensorsControl;
