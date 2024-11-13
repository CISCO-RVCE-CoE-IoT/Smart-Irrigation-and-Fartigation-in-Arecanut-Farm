import React from 'react';
import farmer from "../Images/farmer.jpg";

const Farmer = ({ farmer_Details }) => {

  const famer_details = farmer_Details?.farmer_details;

    const imageStyle = {
        width: "5rem",
        height: "5rem",
        overflow: "hidden",
        borderRadius: "12%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    };

    function upperCase(name) {
        return name.toUpperCase().slice(0, 1) + name.slice(1).toLowerCase();
    }
    
    const imgInnerStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        margin: "0",
    };

    return (
        <div className="user-details d-flex align-items-center">
            <div className="img border" style={imageStyle}>
                <img
                    src={farmer}
                    alt="Farmer"
                    style={imgInnerStyle}
                    aria-label="Farmer Profile Image"
                />
            </div>
            <div className="mx-3 d-flex flex-column">
                <h4 className="fw-bold mb-1">
                    {upperCase(famer_details.farmer_fname)}
                </h4>
                <small className="text-secondary mb-1">
                    Id : U2024{famer_details.farmer_id}
                </small>
                <small>
                    Total fields : <strong className='fs-6 px-1'>{famer_details.farmer_total_farms}</strong>
                </small>
            </div>
        </div>
    );
}

export default Farmer;
