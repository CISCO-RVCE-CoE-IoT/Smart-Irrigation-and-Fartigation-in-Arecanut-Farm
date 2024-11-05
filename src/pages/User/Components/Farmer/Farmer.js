import React from 'react';
import farmer from "../Images/farmer.jpg";

const Farmer = ({ username, userID,fields }) => {
    const imageStyle = {
        width: "5rem",
        height: "5rem",
        overflow: "hidden",
        borderRadius: "12%",
    };

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
                <h4 className="fw-bold" aria-label="Farmer Name">
                    {username}
                </h4>
                <small className="text-secondary" aria-label="Farmer ID">
                    Id : {userID}
                </small>
                <small>
                    Total Fields : <strong className='fs-5 px-1'>{fields}</strong>
                </small>
                
            </div>
        </div>
    );
}

export default Farmer;
