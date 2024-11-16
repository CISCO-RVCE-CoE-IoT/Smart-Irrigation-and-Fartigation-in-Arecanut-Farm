import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Radar, PolarArea, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Popover, OverlayTrigger, Modal, Button } from 'react-bootstrap';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement
);

const getUniqueColor = (index) => {
    const hue = (index * 137.5) % 360;  // 137.5 is a number that ensures the colors are evenly spaced
    return `hsl(${hue}, 70%, 50%)`;  // Generate a darker HSL color with lower lightness
};

const Sections = ({ collected_data = {} }) => {
    const { farm_details, location_coordinates, device_values } = collected_data;
    const sectionsData = device_values?.valve_devices_data || [];
    const moistureData = device_values?.moisture_device_value || [];

    // Merge moisture values into sectionsData based on section_device_id
    const sectionsWithMoisture = sectionsData.map(section => {
        const moistureValues = moistureData.filter(moisture => moisture.section_id === section.section_id);
        const avgMoisture = moistureValues.reduce((acc, curr) => acc + curr.moisture_value, 0) / (moistureValues.length || 1);
        return {
            ...section,
            avg_section_moisture: avgMoisture
        };
    });

    const [sectionsState, setSectionsState] = useState(
        sectionsWithMoisture.map(section => ({
            ...section,
            inputTime: '',
            timer: 0,
            isCounting: false,
            isOnDisabled: true,
            isManualMode: false,
        }))
    );
    const [inputDuration, setInputDuration] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Update the sectionsState whenever collected_data changes
    useEffect(() => {
        if (collected_data.device_values) {
            const updatedSections = sectionsWithMoisture.map(section => ({
                ...section,
                inputTime: '',
                timer: 0,
                isCounting: false,
                isOnDisabled: true,
                isManualMode: false,
            }));
            setSectionsState(updatedSections);
        }
    }, [collected_data]);

    // If no data is available, show a message
    if (!sectionsState.length) {
        return <div className='borderring'>
            <span className='fs-6 text-secondary'>No data available for sections</span>
        </div>;
    }

    const handleShow = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    const columnChartData = {
        labels: sectionsState.map(section => section.section_name),
        datasets: [
            {
                label: 'Moisture Value',
                data: sectionsState.map((section, index) => Math.floor(section.avg_section_moisture)),
                backgroundColor: sectionsState.map((_, index) => getUniqueColor(index)),
                borderColor: 'transparent',
                borderWidth: 1,
                type: 'bar',
                barThickness: 30,
            },
            {
                label: 'Moisture Value Line',
                data: sectionsState.map((section, index) => Math.floor(section.avg_section_moisture)),
                borderColor: 'black',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false,
                type: 'line',
                tension: 0.4,
            },
        ],
    };


    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    // Modal content for 6 types of charts
    const chartData = {
        labels: sectionsState.map(section => section.section_name),
        datasets: [{
            label: 'Moisture Value',
            data: sectionsState.map((section, index) => Math.floor(section.avg_section_moisture)),
            backgroundColor: sectionsState.map((_, index) => getUniqueColor(index)),
            borderColor: 'transparent',
            borderWidth: 1,
        }]
    };


    // Handle manual mode input change
    const handleInputChange = (e) => {
        setInputDuration(e.target.value);
    };

    // Handle Start button click for manual mode
    const handleStartClick = () => {
        setIsStarted(true);
    };

    // Handle saving changes to manual mode settings
    const handleSaveChanges = (e) => {
        e.preventDefault();
        // Implement your save logic here (e.g., update the sectionsState or trigger any other action)
        console.log('Saving changes', inputDuration);
        setIsStarted(false);
    };

    return (
        <div>
            <div className="container p-0">
                <div className="row d-flex align-items-stretch">
                    <div className="col-12 col-sm-6 d-flex align-items-stretch" style={{ height: '100%' }}>
                        <div className="borderring w-100" style={{ height: '100%' }}>
                            <h6 className="text-secondary p-1" style={{ fontSize: '14px' }}>Sections</h6>
                            <div className="sectionlogs overflow-auto" style={{ maxHeight: '215px', height: '100%' }}>
                                <table className="table table-striped table-hover table-responsive" style={{ fontSize: '0.875rem', padding: '0.5rem' }}>
                                    <thead>
                                        <tr>
                                            <th scope="col">Section</th>
                                            <th scope="col">Moisture</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectionsState.map((section, index) => (
                                            <tr key={section.section_device_id}>
                                                <td>{section.section_name}</td>
                                                <td>{Math.floor(section.avg_section_moisture)}</td>
                                                <td>{capitalizeFirstLetter(section.valve_mode)} {capitalizeFirstLetter(section.valve_status)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary btn-sm me-2"
                                                        >
                                                            Auto
                                                        </button>
                                                        <OverlayTrigger
                                                            trigger="click"
                                                            placement="top"
                                                            overlay={
                                                                <Popover id="popover-manual">
                                                                    <Popover.Body className="popover-body">
                                                                        <form onSubmit={(e) => handleSaveChanges(e)}>
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
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary me-2 btn-sm"
                                                            >
                                                                Manual
                                                            </button>
                                                        </OverlayTrigger>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 mt-3 mt-sm-0">
                        <div className="w-100 borderring ">
                            <div className='d-flex align-items-center justify-content-between'>
                                <h6 className='text-secondary' style={{ fontSize: '0.875rem' }}>Section Chart</h6>
                                <h6
                                    className='text-secondary'
                                    style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                                    onClick={handleShow}
                                >
                                    More Charts
                                </h6>
                            </div>
                            <div className="chart-container">
                                <Bar data={columnChartData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Moisture Charts</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row p-2">
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Bar Chart</h6>
                            <Bar data={chartData} />
                        </div>
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Line Chart</h6>
                            <Line data={chartData} />
                        </div>
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Radar Chart</h6>
                            <Radar data={chartData} />
                        </div>
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Doughnut Chart</h6>
                            <Doughnut data={chartData} />
                        </div>
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Pie Chart</h6>
                            <Pie data={chartData} />
                        </div>
                        <div className="col-lg-4 col-sm-6 chart-container">
                            <h6 className="text-center">Polar Area Chart</h6>
                            <PolarArea data={chartData} />
                        </div>
                    </div>
                </Modal.Body>
            </Modal>


        </div>
    );
};

export default Sections;
