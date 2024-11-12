import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Popover, OverlayTrigger } from 'react-bootstrap';
import Modal from './Modal';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement // Register LineElement
);

const getRandomColor = () => {
    const darkGreenShades = [
        '#006400', '#005a00', '#005000', '#004600', 
        '#003c00', '#003200', '#002800', '#001e00', 
        '#001400', '#000a00'
    ];
    
    return darkGreenShades[Math.floor(Math.random() * darkGreenShades.length)];
};



const Sections = ({ sectionsData = [] }) => {
    const [sectionsState, setSectionsState] = useState(
        sectionsData.map(section => ({
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

    const handleTimeChange = (index, value) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            newSections[index].inputTime = value;
            newSections[index].isOnDisabled = value === '';
            return newSections;
        });
    };

    const handleManual = (index) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            newSections[index].isManualMode = true;
            newSections[index].inputTime = '';
            newSections[index].isOnDisabled = true;
            return newSections;
        });
    };

    const handleSaveChanges = (e, index) => {
        e.preventDefault();
        setSectionsState(prevState => {
            const newSections = [...prevState];
            const duration = inputDuration;

            if (duration) {
                const countdown = parseInt(duration, 10);
                newSections[index].timer = countdown;
                newSections[index].isCounting = true;
                newSections[index].isOnDisabled = true;

                const interval = setInterval(() => {
                    setSectionsState(prevState => {
                        const updatedSections = [...prevState];
                        if (updatedSections[index].timer <= 1) {
                            clearInterval(interval);
                            updatedSections[index].isCounting = false;
                            updatedSections[index].isOnDisabled = false;
                            updatedSections[index].timer = 0;
                        } else {
                            updatedSections[index].timer -= 1;
                        }
                        return updatedSections;
                    });
                }, 1000);
            }

            return newSections;
        });
    };

    const handleOff = (index) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            newSections[index].isCounting = false;
            newSections[index].isOnDisabled = false;
            newSections[index].inputTime = '';
            newSections[index].timer = 0;
            return newSections;
        });
    };

    const handleInputChange = (e) => {
        setInputDuration(e.target.value);
    };

    const handleStartClick = () => {
        if (inputDuration) {
            setIsStarted(true);
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    const columnChartData = {
        labels: sectionsState.map(section => section.section_name),
        datasets: [
            {
                label: 'Moisture Value',
                data: sectionsState.map(section => Math.floor(section.avg_section_moisture)),
                backgroundColor: getRandomColor,
                borderColor: 'transparent',
                borderWidth: 1,
                type: 'bar', // Bar chart
                barThickness: 30, // Adjust this value to change the width of the bars
            },
            {
                label: 'Moisture Value Line',
                data: sectionsState.map(section => Math.floor(section.avg_section_moisture)),
                borderColor: 'black',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false,
                type: 'line', // Line chart
                tension: 0.4, // For curved lines
            },
        ],
    };

    const manualPopover = (
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
    );

    return (
        <div>
            <div className="container p-0">
                <div className="row">
                    <div className="col-12 col-sm-6 d-flex align-items-stretch">
                        <div className="borderring w-100">
                            <h6 className="text-secondary p-1">Sections</h6>
                            <div className="sectionlogs overflow-auto" style={{ maxHeight: '220px' }}>
                                <table className="table table-striped table-hover table-responsive" style={{ fontSize: '0.875rem', padding: '0.5rem' }}>
                                    <thead>
                                        <tr>
                                            <th scope="col" style={{ width: '20%' }}>Section</th>
                                            <th scope="col" style={{ width: '20%' }}>Moisture</th>
                                            <th scope="col" style={{ width: '30%' }}>Status</th>
                                            <th scope="col" style={{ width: '30%' }}>Controls</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectionsState.map((section, index) => (
                                            <tr key={section.section_device_id}>
                                                <td scope="row">{section.section_name}</td>
                                                <td>{Math.floor(section.avg_section_moisture)}</td>
                                                <td>{capitalizeFirstLetter(section.valve_mode)} {capitalizeFirstLetter(section.valve_status)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <button type="button" className="btn btn-outline-secondary btn-sm me-2">Auto</button>
                                                        <OverlayTrigger
                                                            trigger="click"
                                                            placement="top"  
                                                            overlay={manualPopover}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary me-2 btn-sm"
                                                                onClick={() => handleManual(index)}
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
                    <div className="col-12 col-sm-6 d-flex align-items-stretch">
                        <div className="borderring w-100">
                            <div className='d-flex align-items-center justify-content-between mb-1'>

                                <span>Section Moisture Chart</span>
                            </div>
                            <div className="chart-container d-flex justify-content-between" style={{ height: '100%' }}>
                                <div className="bar-chart" style={{ width: '100%', height: '100%' }}>
                                    <Bar data={columnChartData} options={{ responsive: true }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sections;
