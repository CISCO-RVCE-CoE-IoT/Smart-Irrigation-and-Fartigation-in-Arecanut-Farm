import React from 'react';
import ProgressChart from './ProgressChart';

const FarmSensorsControl = ({ gauges }) => {
    const units = {
        nitrogen: 'kg/ha',
        phosphorus: 'kg/ha',
        potassium: 'kg/ha',
        temperature: '°C',
        humidity: '%',
    };

    return (
        <div>
            <hr className="my-2" />

            <h6 className='fs-5'> {gauges[0].toUpperCase().slice(0, 1) + gauges[0].slice(1).toLowerCase()} </h6>
            <div className='text-secondary d-flex justify-content-between align-items-center'>
                <small className='text-dark'>Sensor Values</small>
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
            <small className='text-secondary'>Last updated: {new Date(gauges[1].timestamp).toLocaleString()}</small>

            <div className="ProgressCharts" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="Sensors" style={{ width: "100%" }}>
                    <div className="row" style={{ display: "flex", flexWrap: "wrap" }}>
                        {Object.entries(gauges[1]).map(([name, value], index) => (
                            name !== "timestamp" && name !== "farm_device_id" && (
                                <div
                                    className="col-6"
                                    key={index}
                                    style={{
                                        flex: "1 1 50%",
                                        textAlign: "center",
                                        padding: "10px",
                                        boxSizing: "border-box"
                                    }}
                                >
                                    <ProgressChart
                                        value={value}
                                        name={name.charAt(0).toUpperCase() + name.slice(1)}
                                        unit={units[name] || 'mg/kg'}
                                    />
                                </div>
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FarmSensorsControl;
