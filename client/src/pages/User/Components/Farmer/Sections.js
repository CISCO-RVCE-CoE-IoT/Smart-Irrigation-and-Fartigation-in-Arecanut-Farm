import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut, Radar, PolarArea, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

const getUniqueColor = (index) => {
    const darkGreenShades = [
        '#013220', '#004225', '#0B3D2E', '#2E8B57', '#05402D',
        '#064635', '#0A4D3C', '#11574A', '#1B7D5F', '#145C51',
        '#006400', '#004E2C', '#00564D', '#007860', '#006B54'
    ];

    return darkGreenShades[Math.floor(Math.random() * darkGreenShades.length)];
};

const Sections = ({ collected_data = {}, farmer_details }) => {
    const { device_values } = collected_data;
    const sectionsData = device_values?.valve_devices_data || [];
    const moistureData = device_values?.moisture_device_value || [];
    const farmer_id = farmer_details?.farmer_details?.farmer_id;

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
            remainingTime: 0,
            isCounting: false,
            isOnDisabled: true,
            isManualMode: false,
        }))
    );
    const [inputDuration, setInputDuration] = useState('');
    const [isStarted, setIsStarted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [sectionDeviceId, setSectionDeviceId] = useState(null);
    const [valveStatus, setValveStatus] = useState('off');
    const [showStopModal, setShowStopModal] = useState(false);
    const [sectionToStop, setSectionToStop] = useState(null);
    const [showAutoModal, setShowAutoModal] = useState(false);
    const [mode, setMode] = useState('manual');

    useEffect(() => {
        if (collected_data.device_values) {
            const updatedSections = sectionsWithMoisture.map(section => ({
                ...section,
                inputTime: '',
                timer: 0,
                remainingTime: 0,
                isCounting: false,
                isOnDisabled: true,
                isManualMode: false,
            }));
            setSectionsState(updatedSections);
        }
    }, [collected_data]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSectionsState(prevState => prevState.map(section => {
                if (section.isCounting && section.remainingTime > 0) {
                    return { ...section, remainingTime: section.remainingTime - 1 };
                }
                return section;
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleShow = (sectionId) => {
        setSectionDeviceId(sectionId);
        setShowModal(true);
    };
    const handleClose = () => setShowModal(false);
    const handleStopShow = (sectionId) => {
        setSectionToStop(sectionId);
        setShowStopModal(true);
    };
    const handleStopClose = () => setShowStopModal(false);
    const handleAutoShow = (sectionId) => {
        setMode('auto');
        setSectionDeviceId(sectionId);
        setShowAutoModal(true);
    };
    const handleAutoClose = () => setShowAutoModal(false);

    const columnChartData = {
        labels: sectionsState.map(section => section.section_name),
        datasets: [
            {
                label: 'Moisture Value',
                data: sectionsState.map(section => Math.floor(section.avg_section_moisture)),
                backgroundColor: sectionsState.map((_, index) => getUniqueColor(index)),
                borderColor: 'transparent',
                borderWidth: 1,
                type: 'bar',
                barThickness: 30,
            },
            {
                label: 'Moisture Value Line',
                data: sectionsState.map(section => Math.floor(section.avg_section_moisture)),
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

    const handleInputChange = (e) => {
        setInputDuration(e.target.value);
    };

    const handleStartClick = () => {
        setIsStarted(true);
        setValveStatus('on');
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!sectionDeviceId) {
            console.error("Section Device ID is null");
            return;
        }

        const payload = {
            mode: mode,
            status: valveStatus,
            timer: inputDuration || 0,
            farmer_id: farmer_id,
        };

        try {
            const response = await fetch(`/farmer/farm/valve/${sectionDeviceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to insert valve data", errorText);
                return;
            }

            const result = await response.json();

            setSectionsState(prevState => prevState.map(section =>
                section.section_device_id === sectionDeviceId
                    ? { ...section, timer: inputDuration * 60, remainingTime: inputDuration * 60, isCounting: true, valve_mode: mode, valve_status: valveStatus }
                    : section
            ));
        } catch (error) {
            console.error("Error while inserting valve data", error);
        }

        setIsStarted(false);
        setValveStatus('off');
        setShowModal(false);
    };

    const handleStopClick = async () => {
        const sectionId = sectionToStop;
        const section = sectionsState.find(section => section.section_device_id === sectionId);
        const remainingTime = section.remainingTime;

        try {
            const response = await fetch(`/farmer/farm/valve/${sectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: mode,
                    status: "off",
                    timer: remainingTime,
                    farmer_id: farmer_id,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Failed to update valve data", errorText);
                return;
            }

            const result = await response.json();

            setSectionsState(prevState => prevState.map(section =>
                section.section_device_id === sectionId
                    ? { ...section, timer: 0, remainingTime: 0, isCounting: false, valve_status: 'off' }
                    : section
            ));
        } catch (error) {
            console.error("Error while updating valve data", error);
        }

        setShowStopModal(false);
    };

    const handleAutoConfirm = () => {
        if (sectionsState.find(section => section.section_device_id === sectionDeviceId).avg_section_moisture <= 50) {
            setValveStatus('on');
        } else {
            setValveStatus('off');
        }
        setMode('auto');
        handleSaveChanges({ preventDefault: () => {} });
        setShowAutoModal(false);
    };

    return (
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
                                    {sectionsState
                                        .sort((a, b) => {
                                            if (a.valve_status === 'on' && b.valve_status !== 'on') return -1;
                                            if (a.valve_status !== 'on' && b.valve_status === 'on') return 1;
                                            return 0;
                                        })
                                        .map((section) => (
                                            <tr key={section.section_device_id}>
                                                <td>{section.section_name}</td>
                                                <td>{Math.floor(section.avg_section_moisture)}</td>
                                                <td>{capitalizeFirstLetter(section.valve_mode)} {capitalizeFirstLetter(section.valve_status)}</td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Button
                                                            type="button"
                                                            className="btn btn-outline-secondary btn-sm me-2"
                                                            onClick={() => handleAutoShow(section.section_device_id)}
                                                            disabled={section.isCounting}
                                                        >
                                                            Auto
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            className="btn btn-outline-secondary me-2 btn-sm"
                                                            onClick={() => handleShow(section.section_device_id)}
                                                            disabled={section.isCounting}
                                                        >
                                                            Manual
                                                        </Button>
                                                        {(section.isCounting || (section.valve_mode === 'manual' && section.valve_status === 'on') || (section.valve_mode === 'auto' && section.valve_status === 'on')) && (
                                                            <Button
                                                                type="button"
                                                                className="btn btn-outline-secondary btn-sm"
                                                                onClick={() => handleStopShow(section.section_device_id)}
                                                            >
                                                                Stop
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-sm-6 ">
                    <div className="w-100 borderring">
                    <h6 className="text-secondary p-1" style={{ fontSize: '14px' }}>Sections chart</h6>
                        <div className="chart-container">
                            <Bar 
                                data={columnChartData}
                                options={{
                                    scales: {
                                        x: {
                                            beginAtZero: true
                                        },
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
    
            <Modal show={showModal} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Manual Mode</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveChanges}>
                        <Form.Group className="mb-3">
                            <Form.Label>Enter duration (minutes)</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter duration"
                                value={inputDuration}
                                onChange={handleInputChange}
                            />
                        </Form.Group>
                        <Button
                            variant="outline-secondary"
                            type="button"
                            onClick={handleStartClick}
                            disabled={!inputDuration}
                        >
                            Start
                        </Button>
                        <Button
                            variant="outline-secondary"
                            type="submit"
                            disabled={!isStarted}
                        >
                            Save Changes
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
    
            <Modal show={showStopModal} onHide={handleStopClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Stop</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to stop this section?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleStopClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleStopClick}>
                        Confirm
                    </Button>
                </Modal.Footer>
            </Modal>
    
            <Modal show={showAutoModal} onHide={handleAutoClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Auto Mode</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Do you want to enable auto mode for this section?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleAutoClose}>No</Button>
                    <Button variant="primary" onClick={handleAutoConfirm}>Yes</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
    
};

export default Sections;