import React, { useState } from 'react';

// Sample data for sections
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
        moisture_level: 40,
    },
    // Add more sections as needed
];

const Sections = () => {
    // Initialize state for all sections based on the sample data
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

    const handleTimeChange = (index, value) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            newSections[index].inputTime = value;
            newSections[index].isOnDisabled = value === ''; // Enable "On" button if input is provided
            return newSections;
        });
    };

    const handleManual = (index) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            newSections[index].isManualMode = true;
            newSections[index].inputTime = ''; // Clear input duration when manual control is activated
            newSections[index].isOnDisabled = true; // Disable "On" button initially
            return newSections;
        });
    };

    const handleSaveChanges = (index) => {
        setSectionsState(prevState => {
            const newSections = [...prevState];
            const duration = newSections[index].inputTime;

            alert(`Duration saved for section ${newSections[index].section_device_id}: ${duration} seconds`);

            if (duration) {
                const countdown = parseInt(duration, 10);
                newSections[index].timer = countdown;
                newSections[index].isCounting = true;
                newSections[index].isOnDisabled = true; // Disable "On" button until timer is reset

                const interval = setInterval(() => {
                    setSectionsState(prevState => {
                        const updatedSections = [...prevState];
                        if (updatedSections[index].timer <= 1) {
                            clearInterval(interval); // Stop the countdown when it reaches 0
                            updatedSections[index].isCounting = false;
                            updatedSections[index].isOnDisabled = false; // Enable the "On" button again
                            updatedSections[index].timer = 0; // Reset timer
                        } else {
                            updatedSections[index].timer -= 1; // Decrease timer
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

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    };

    return (
        <div>
            <div className='borderring'>
                <div className="sectionlogs overflow-auto">  
                    <h6 className="text-secondary p-1">Sections</h6>
                    <table className="table table-striped table-hover table-responsive">
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
                                    <td scope="row">Section {section.section_device_id}</td>
                                    <td>{section.moisture_level}</td>
                                    <td>{capitalizeFirstLetter(section.valve_mode)} {capitalizeFirstLetter(section.valve_status)}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <button type="button" className="btn btn-outline-secondary btn-sm me-2">Auto</button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary me-2 btn-sm"
                                                onClick={() => handleManual(index)}
                                            >
                                                Manual
                                            </button>
                                            {section.isManualMode && (
                                                <div className="manualcontrols d-flex align-items-center">
                                                    <input
                                                        type="number"
                                                        value={section.inputTime}
                                                        onChange={(e) => handleTimeChange(index, e.target.value)}
                                                        placeholder="Enter time (s)"
                                                        className="form-control me-2"
                                                        style={{ width: '100px' }} // Set a fixed width for better alignment
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary mx-1 btn-sm"
                                                        onClick={() => { /* Handle On logic */ }}
                                                        disabled={section.isOnDisabled} // Disable "On" button when appropriate
                                                    >
                                                        On
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary mx-1 btn-sm"
                                                        onClick={() => handleOff(index)}
                                                    >
                                                        Off
                                                    </button>
                                                    <div className='text-center'>
                                                        <button 
                                                            type="button" 
                                                            className='text-center btn btn-outline-secondary btn-sm' 
                                                            onClick={() => handleSaveChanges(index)}
                                                            disabled={!section.inputTime} // Disable if no input
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                    {section.isCounting && (
                                                        <p className="mb-0 mx-2">{section.timer} seconds left</p> // Show remaining time separately
                                                    )}
                                                </div>
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
    );
};

export default Sections;
