import React, { useEffect, useState } from 'react';

const ProgressChart = ({ value, name, unit }) => {
    const defaultSize = 160; // Default size for the chart
    const radius = defaultSize / 2;
    const circumference = Math.PI * (radius - 8); // Half-circle circumference
    const [progress, setProgress] = useState(0);

    // Ensure the value is not null, default to 0 if null
    const validValue = value ?? 0; 

    useEffect(() => {
        // Trigger animation to target valid value
        setProgress((circumference * validValue) / 100);
    }, [validValue, circumference]);

    return (
        <div
            style={{
                width: "100%",
                maxWidth: defaultSize,
                height: "auto",
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <svg
                width="90%"
                height="90%"
                viewBox={`0 0 ${defaultSize} ${defaultSize / 2}`}
                style={{ overflow: 'hidden' }}
            >
                {/* Background Arc */}
                <path
                    d={`M ${8} ${radius} A ${radius - 8} ${radius - 8} 0 0 1 ${defaultSize - 8} ${radius}`}
                    stroke="#e0e0e0"
                    strokeWidth="8"
                    fill="transparent"
                    strokeLinecap="round" // Rounded ends
                />
                {/* Progress Arc with animation */}
                <path
                    d={`M ${8} ${radius} A ${radius - 8} ${radius - 8} 0 0 1 ${defaultSize - 8} ${radius}`}
                    stroke="darkgreen"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round" // Rounded ends for progress
                    style={{
                        transition: 'stroke-dashoffset 1s ease-in-out', // Animation
                    }}
                />
            </svg>
            {/* Sensor Name and Value */}
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                }}
            >
                <div style={{ fontSize: '1.05em', fontWeight: 'bold', marginTop: '16px' }}>
                    {validValue} 
                    <span style={{ fontSize: '0.75rem' }} className='text-secondary'> {unit}</span>
                </div>
                <div style={{ fontSize: '0.8em', color: '#555' }} className='m-0'>{name}</div>
            </div>
        </div>
    );
};

export default ProgressChart;
