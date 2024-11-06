import React from "react";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import logo from "../Images/logo.png";
import user from "../Images/farmer.jpg";

const NavBar = ({ notifications }) => {
  return (
    <div className="shadow" style={{
      borderBottom: '1px solid grey',
      backgroundColor: 'rgba(255, 255, 255, 0.09)',
      backdropFilter: 'blur(4px)'
    }}>

      <div className="container-lg d-flex justify-content-between align-items-center py-1">
        {/* Logo and title */}
        <a href="/" className="d-flex align-items-center text-decoration-none">
          <img
            src={logo}
            alt="logo"
            className="me-2"
            style={{ width: "25px" }}
          />
          <span className="fs-5 fw-semibold text-dark d-none d-sm-block">
            Smart Irrigation & Fartigation
          </span>
        </a>

        {/* Navigation links and user icon with dropdown */}
        <div className="d-flex align-items-center">
          <ul className="list-unstyled d-flex mb-0 me-1">
            <li className="me-2 d-flex align-items-center">
              {/* Tooltip for Call Us */}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="call-tooltip">Call: 9876543210</Tooltip>}
              >
                <a href="#" className="text-decoration-none text-dark">
                  Call Us
                </a>
              </OverlayTrigger>
            </li>

            {/* Notifications dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="link"
                className="text-dark text-decoration-none"
                style={{ cursor: "pointer" }}
              >
                Notifications
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {notifications.slice(0, 10).map((notification, index) => (
                  <Dropdown.Item
                    key={index}
                    className={`d-flex justify-content-between ${index % 2 === 0 ? "bg-light" : "bg-white"
                      }`}
                  >
                    <span className="fw-semibold">{notification.message}</span>
                    <span
                      className="text-muted small"
                      style={{ marginLeft: "20px" }}
                    >
                      {notification.time}
                    </span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </ul>

          {/* User dropdown */}
          <Dropdown style={{ borderLeft: "1px solid grey" }}>
            <Dropdown.Toggle variant="link" className="px-3 border-1">
              <img
                src={user}
                alt="user profile"
                className="rounded-circle border border-secondary"
                style={{ width: "30px", height: "30px" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item href="#edit-profile">Edit Profile</Dropdown.Item>
              <Dropdown.Item href="#signout">Sign Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
