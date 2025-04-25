import React from "react";
import { Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import logo from "../Images/logo.png";
import user from "../Images/farmer.jpg";

const NavBar = () => {
  return (
    <div className="shadow" style={{
      borderBottom: '1px solid grey',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    }}>

      <div className="container-lg d-flex justify-content-between align-items-center px-3 py-1 ">
        {/* Logo and title */}
        <a href="/" className="d-flex align-items-center text-decoration-none">
          <img
            src={logo}
            alt="logo"
            className="me-2"
            style={{ width: "22px" }}
          />
          <span className="fs-5 fw-semibold d-none d-sm-block" style={{ color: '#323232' }}>
            Smart Irrigation & Fartigation
          </span>
        </a>

        {/* Navigation links and user icon with dropdown */}
        <div className="d-flex align-items-center">
          {/* For larger screens */}
          <ul className="list-unstyled d-flex mb-0 me-1 d-none d-sm-flex">
            <li className=" d-flex align-items-center">
              {/* Tooltip for Call Us */}
              <OverlayTrigger
                placement="bottom"
                overlay={<Tooltip id="call-tooltip">Call: 9876543210</Tooltip>}
              >
                <a href="#" className="text-decoration-none text-dark">
                  Call Us <i className="fa-solid fa-phone me-2"></i>
                </a>
              </OverlayTrigger>
            </li>
          </ul>

          {/* User dropdown visible on larger screens */}
          <Dropdown style={{ borderLeft: "1px solid grey" }} className="d-none d-sm-block">
            <Dropdown.Toggle variant="link" className="px-3 border-1">
              <img
                src={user}
                alt="user profile"
                className="rounded-circle border"
                style={{ width: "30px", height: "30px" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item href="#edit-profile">Edit Profile</Dropdown.Item>
              <Dropdown.Item href="#signout">Sign Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Mobile View - show Call and User icon */}
        <ul className="list-unstyled d-flex mb-0 ms-3 d-block d-sm-none w-100 justify-content-end">
          <li className="me-1 d-flex align-items-center">
            {/* Tooltip for Call Us */}
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="call-tooltip">Call: 9876543210</Tooltip>}
            >
              <a href="#" className="text-decoration-none text-dark">
                <i className="fa-solid fa-phone me-2"></i>
              </a>
            </OverlayTrigger>
          </li>

          {/* User dropdown */}
          <Dropdown style={{ borderLeft: "1px solid grey" }}>
            <Dropdown.Toggle variant="link" className="px-2 border-1">
              <img
                src={user}
                alt="user profile"
                className="rounded-circle border"
                style={{ width: "30px", height: "30px" }}
              />
            </Dropdown.Toggle>

            <Dropdown.Menu align="end">
              <Dropdown.Item href="#edit-profile">Edit Profile</Dropdown.Item>
              <Dropdown.Item href="#signout">Sign Out</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
