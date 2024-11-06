import React from 'react';
import ProgressChart from './ProgressChart';

const FarmSensorsControl = ({ gauges }) => {
    return (
        <div>
            <hr className="my-2"></hr>

            <h6 className='fs-5'>Arecanut 1</h6>
            <div className='text-secondary d-flex justify-content-between align-items-center'>
                <small className=' text-secondary'>Sensor Values</small>
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

            <div className="ProgressCharts" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div className="Sensors" style={{ width: "100%" }}>
                    <div className="row" style={{ display: "flex", flexWrap: "wrap" }}>
                        {gauges.map((gauge, index) => (
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
                                    value={gauge.value}
                                    name={gauge.name}
                                    unit={
                                        gauge.name === 'Nitrogen' ? 'kg/ha' :
                                        gauge.name === 'Temperature' ? '°C' :
                                        gauge.name === 'Humidity' ? '%' :
                                        gauge.name === 'Moisture' ? 'm³/m³' :
                                        'mg/kg'
                                      }                                      
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}

export default FarmSensorsControl;
