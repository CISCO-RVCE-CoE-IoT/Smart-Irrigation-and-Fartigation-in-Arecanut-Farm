import React from 'react';
import farmer from "../Images/farmer.jpg";

const Farmer = ({farmer_Details}) => {
    const imageStyle = {
        width: "5rem",
        height: "5rem",
        overflow: "hidden",
        borderRadius: "12%",
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
        <div className="user-details d-flex">
            <div className="img border" style={imageStyle}>
                <img
                    src={farmer}
                    alt="Farmer"
                    style={imgInnerStyle}
                    aria-label="Farmer Profile Image"
                />
            </div>
            <div className="mx-3 d-flex flex-column">
                <h4 className="fw-bold" >
                {upperCase(farmer_Details[0].farmer_fname)}
                        
                </h4>
                <small className="text-secondary" >
                    Id : U2024{farmer_Details[0].farmer_id}
                </small>
                <small>
                    Total Fields : <strong className='fs-5 px-1'>{farmer_Details[1]}</strong>
                </small>
                
            </div>
        </div>
    );
}

export default Farmer;
