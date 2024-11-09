import React, { useState } from 'react';

const FieldControl = () => {
   

    // State variables
    const [inputDuration, setInputDuration] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    // Handlers
    const handleManualClick = () => {
        setIsManualMode(true);
        setIsStarted(false); // Reset the started state
        setInputDuration(''); // Clear input duration
    };

    const handleStartClick = () => {
        if (inputDuration) {
            setIsStarted(true);
        }
    };

    const handleInputChange = (e) => {
        setInputDuration(e.target.value);
        if (!isStarted) {
            setIsStarted(false); // Reset the start state if the input changes
        }
    };

    const handleSaveChanges = (e) => {
        e.preventDefault(); // Prevent form submission
        alert(`Duration saved: ${inputDuration}`);
        // Here you can also handle saving the duration, e.g., make an API call
    };

    return (
        <div>
            <hr className="my-2"></hr>
            <div>
                <h6>Farm controls</h6>
                <div className='controller px-3 py-2'>
                    <div className="d-flex justify-content-evenly text-center">
                        <button
                            type="button"
                            className="btn btn-secondary w-100 btn-sm"
                        >
                            Auto
                        </button>
                        <span className="text-secondary fs-6 d-flex justify-content-center align-items-center px-3">
                            Recommended
                        </span>
                    </div>
                    <button 
                        type="button" 
                        className="btn btn-secondary btn-sm mt-2 w-100"
                        onClick={handleManualClick}
                    >
                        Manual
                    </button>

                    {isManualMode && (
                        <form className='mt-2 border p-2' onSubmit={handleSaveChanges}>
                            <input
                                className="form-control form-control-sm mt-1 mb-2"
                                type="number"
                                placeholder="Enter duration"
                                aria-label=".form-control-sm example"
                                value={inputDuration}
                                onChange={handleInputChange}
                            />
                            <div className='d-flex justify-content-evenly align-items-center'>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-secondary btn-sm w-100 me-3"
                                    onClick={handleStartClick}
                                    disabled={!inputDuration} // Disable if no input duration
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
                            <div className='text-center my-2'>
                                <button 
                                    type="submit" 
                                    className='text-center btn btn-outline-secondary btn-sm' 
                                    disabled={!isStarted} // Disable if not started
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FieldControl;
