import React from 'react';
import ProgressChart from './ProgressChart';

const FarmSensorsControl = ({ collected_data = [] }) => {
  const farm_devices_data = collected_data?.device_values?.farm_device_data || [];
  const farmname = collected_data?.farm_details?.farm_name || "Farm Name Not Available";

  const units = {
    nitrogen: 'kg/ha',
    phosphorus: 'kg/ha',
    potassium: 'kg/ha',
    temperature: '°C',
    humidity: '%',
    avg_moisture: '%',
  };

  const upperCase = (name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Handle the case when farm_devices_data is empty or timestamp is missing
  const lastUpdated = farm_devices_data.length > 0 ? new Date(farm_devices_data[0]?.timestamp).toLocaleString() : 'N/A';

  return (
    <div>
      <div className='text-secondary d-flex justify-content-between align-items-center'>
        <span className='text-dark fs-5 fw-bold'>{upperCase(farmname)}</span>
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
      </div>
      <small className='text-secondary'>
        Last updated: {lastUpdated}
      </small>

      <div className="ProgressCharts" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div className="Sensors" style={{ width: "100%", display: "grid", gap: "10px", padding: "10px" }}>
          <style>
            {`
              .Sensors {
                grid-template-columns: repeat(1, 1fr); /* Default to one column */
              }
              /* Tablet view: 3 charts in a row */
              @media (min-width: 768px) {
                .Sensors {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
              /* Laptop/Desktop view: all charts in a row */
              @media (min-width: 1024px) {
                .Sensors {
                  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                }
              }
              /* Mobile view: 2 charts in a row */
              @media (max-width: 767px) {
                .Sensors {
                  grid-template-columns: repeat(2, 1fr);
                }
              }
            `}
          </style>
          {farm_devices_data[0] && Object.entries(farm_devices_data[0]).map(([name, value], index) =>
            name !== "timestamp" && name !== "farm_device_id" && (
              <div
                className="col"
                key={index}
                style={{
                  textAlign: "center",
                  boxSizing: "border-box"
                }}
              >
                <ProgressChart
                  value={Math.round(value)}
                  name={name.charAt(0).toUpperCase() + name.slice(1)}
                  unit={units[name] || 'mg/kg'}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmSensorsControl;
