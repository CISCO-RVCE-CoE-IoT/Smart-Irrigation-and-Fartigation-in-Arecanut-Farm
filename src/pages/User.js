import "./User.css";
import logo from "../images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faBell } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import farmer from "../images/farmer.jpg";
import GaugeChart from "./GaugeChart";
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AutoConfirmationModal, ManualInputModal } from "./Modal";
import L from "leaflet";

const User = () => {
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTime, setManualTime] = useState("10");

  const handleAuto = () => setShowAutoModal(true);
  const handleConfirmAuto = () => {
    console.log("Auto mode activated");
    setShowAutoModal(false);
  };

  const gauges = [
    { value: 97, name: "Nitrogen" },
    { value: 57, name: "Phosphorus" },
    { value: 37, name: "Potassium" },
    { value: 75, name: "Temperature" },
    { value: 45, name: "Humidity" },
    { value: 60, name: "Moisture" },
  ];

  const fields = [
    {
      name: "Arecanut 1",
      id: "1232164",
      dimensions: "120 X 120",
      status: "Active",
    },
    {
      name: "Arecanut 2",
      id: "1232165",
      dimensions: "120 X 120",
      status: "Active",
    },
    {
      name: "Arecanut 3",
      id: "1232166",
      dimensions: "120 X 120",
      status: "Active",
    },
    {
      name: "Arecanut 4",
      id: "1232167",
      dimensions: "120 X 120",
      status: "Active",
    },
    {
      name: "Arecanut 5",
      id: "1232168",
      dimensions: "120 X 120",
      status: "Active",
    },
  ];

  const scrollerRef = useRef(null);
  const mapRef = useRef(null); // Create a reference for the map

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault(); // Prevent default scroll behavior
      if (scrollerRef.current) {
        // Scroll horizontally based on the wheel delta
        scrollerRef.current.scrollLeft += event.deltaY;
      }
    };

    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener("wheel", handleWheel, { passive: false });
    }

    // Clean up the event listener on unmount
    return () => {
      if (scroller) {
        scroller.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      const jsonData = {
        gauges: [
          { value: 97, name: "Nitrogen" },
          { value: 57, name: "Phosphorus" },
          { value: 37, name: "Potassium" },
          { value: 75, name: "Temperature" },
          { value: 45, name: "Humidity" },
          { value: 60, name: "Moisture" },
        ],
        fields: [
          {
            name: "Arecanut 1",
            id: "1232164",
            dimensions: "10 acres",
            status: "Active",
          },
          {
            name: "Arecanut 2",
            id: "1232165",
            dimensions: "120 X 120",
            status: "Active",
          },
          {
            name: "Arecanut 3",
            id: "1232166",
            dimensions: "120 X 120",
            status: "Active",
          },
          {
            name: "Arecanut 4",
            id: "1232167",
            dimensions: "120 X 120",
            status: "Active",
          },
          {
            name: "Arecanut 5",
            id: "1232168",
            dimensions: "120 X 120",
            status: "Active",
          },
        ],
        mapData: [
          {
            type: "farmland",
            coordinates: [
              [16.225329, 74.841749],
              [16.225228, 74.841714],
              [16.225156, 74.842699],
              [16.225268, 74.842715],
            ],
          },
          { type: "valve", lat: 16.225284, lon: 74.842259, label: "Valve 1" },
          { type: "valve", lat: 16.225217, lon: 74.842574, label: "Valve 2" },
          {
            type: "moisture",
            lat: 16.225241,
            lon: 74.842332,
            label: "Sensor 1",
            moistureValue: 30,
          },
          {
            type: "moisture",
            lat: 16.225264,
            lon: 74.842378,
            label: "Sensor 2",
            moistureValue: 60,
          },
          {
            type: "moisture",
            lat: 16.22526,
            lon: 74.842476,
            label: "Sensor 3",
            moistureValue: 90,
          },
        ],
      };

      const map = L.map(mapRef.current).setView([16.22525, 74.8424], 17);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 25,
        minZoom: 2,
      }).addTo(map);

      jsonData.mapData.forEach((data) => {
        if (data.type === "farmland") {
          L.polygon(data.coordinates, { color: "green" }).addTo(map);
        } else if (data.type === "valve") {
          L.circleMarker([data.lat, data.lon], {
            radius: 8,
            fillColor: "orange",
            color: "orange",
            fillOpacity: 0.6,
            stroke: true,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(data.label);
        } else if (data.type === "moisture") {
          const moistureRadius = data.moistureValue * 0.2;
          const tipRadius = 5;

          const moistureCircle = L.circleMarker([data.lat, data.lon], {
            radius: moistureRadius,
            fillColor: `rgba(173, 216, 230, 0.6)`,
            color: "blue",
            fillOpacity: 0.6,
            stroke: true,
            weight: 2,
          })
            .addTo(map)
            .bindPopup(`${data.label}: ${data.moistureValue}% Moisture`);

          L.circleMarker([data.lat, data.lon], {
            radius: tipRadius,
            fillColor: "blue",
            color: "black",
            fillOpacity: 1,
            stroke: false,
          }).addTo(map);
        }
      });

      const allLocations = jsonData.mapData
        .filter((location) => location.type !== "farmland")
        .map((location) => ({ lat: location.lat, lon: location.lon }));
      const bounds = L.latLngBounds(
        allLocations.map((location) => [location.lat, location.lon])
      );
      map.fitBounds(bounds);

      // Cleanup on unmount
      return () => {
        map.remove();
      };
    }
  }, []);

  const [showManualControls, setShowManualControls] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [isOnDisabled, setIsOnDisabled] = useState(false);

  const handleManual = () => {
    setShowManualControls(!showManualControls);
  };

  const handleTimeChange = (e) => {
    setTimer(parseInt(e.target.value) || 0);
  };

  const handleOn = () => {
    if (timer > 0) {
      setIsCounting(true);
      setIsOnDisabled(true); // Disable "On" button when clicked
    }
  };

  const handleOff = () => {
    setIsCounting(false);
    setIsOnDisabled(false); // Re-enable "On" button when "Off" is clicked
  };

  useEffect(() => {
    let countdown;
    if (isCounting && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    } else if (timer === 0) {
      setIsCounting(false);
      setIsOnDisabled(false); // Re-enable "On" button when timer reaches zero
    }

    return () => clearInterval(countdown);
  }, [isCounting, timer]);

  return (
    <>
      <main>
        <header>
          <div className="fixed-top bg-white d-flex justify-content-center align-items-center bg-light shadow-sm py-1 border-bottom">
            <div className="container d-flex justify-content-between align-items-center">
              <div className="logo-name d-flex align-items-center text-center">
                <Link to="/user" className="d-flex align-items-center">
                  <img
                    src={logo}
                    style={{ width: "1.8rem", margin: "4px" }}
                    alt="Logo"
                  />
                  <p className="px-1 mb-0 fs-4">
                    Smart Irrigation and Fertigation
                  </p>
                </Link>
              </div>

              <div className="icons d-flex justify-content-center align-items-center">
                <div className="text-center mx-2 d-flex flex-column justify-content-center align-items-center">
                  <a
                    href="tel:1234567890"
                    aria-label="Contact"
                    className="d-flex flex-column justify-content-center align-items-center"
                  >
                    <FontAwesomeIcon icon={faPhone} className="fs-4" />
                    <span style={{ fontSize: "0.8rem" }}>Contact</span>
                  </a>
                </div>
                <div
                  className="text-center px-2 d-flex flex-column justify-content-center align-items-center"
                  style={{ borderRight: "1px solid black" }}
                >
                  <a
                    href="#"
                    aria-label="Notifications"
                    className="d-flex flex-column justify-content-center align-items-center"
                  >
                    <FontAwesomeIcon icon={faBell} className="fs-4" />
                    <span style={{ fontSize: "0.8rem" }}>Notifications</span>
                  </a>
                </div>
                <div className="user-details d-flex justify-content-center">
                  <div
                    className="img"
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      overflow: "hidden",
                      borderRadius: "50%",
                      marginLeft: "10px",
                    }}
                  >
                    <img
                      src={farmer}
                      alt="Farmer"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        margin: "0",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main body */}
        <div className="container mt-5">
          <div className="container pt-4">
            <div className="row">
              <div className="col-3">
                <div className="user bordering p-3">
                  <div className="user-name-pic">
                    <div className="user-details d-flex">
                      <div
                        className="img border"
                        style={{
                          width: "5rem",
                          height: "5rem",
                          overflow: "hidden",
                          borderRadius: "15%",
                        }}
                      >
                        <img
                          src={farmer}
                          alt="Farmer"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            margin: "0",
                          }}
                        />
                      </div>
                      <div className="mx-3">
                        <h4 id="username" className="fw-bold">
                          Somanna
                        </h4>
                        <span className="text-secondary">Id : U125633254</span>
                        <p className="text-secondary">Joined : 26-10-2024</p>
                      </div>
                    </div>

                    <hr className="m-0"></hr>
                    <h5 className="text-dark my-2 fw-bold">Arecanut 1</h5>

                    <span>Sensor Values</span>

                    <div className="Sensors">
                      <div className="row">
                        {gauges.map((gauge, index) => (
                          <div
                            className="col-md-6 col-sm-12"
                            key={index}
                            style={{ margin: "0", textAlign: "center" }}
                          >
                            <GaugeChart value={gauge.value} name={gauge.name} />
                          </div>
                        ))}
                      </div>

                      <div>
                        <div>
                          <hr></hr>
                          <h6 className="mt-3">Farm Pump Controls</h6>
                          <div className="pumpcontrols text-center d-flex justify-content-evenly mt-3 flex-column">
                            <div className="d-flex justify-content-evenly text-center">
                              <button
                                type="button"
                                className="btn btn-success w-100"
                                onClick={handleAuto}
                              >
                                Auto
                              </button>
                              <h5 className="text-center px-3 text-secondary">
                                Recommended
                              </h5>
                            </div>

                            <div className="d-flex justify-content-evenly text-center mt-3 flex-column">
                              <button
                                type="button"
                                className="btn btn-warning w-100"
                                onClick={handleManual}
                              >
                                Manual
                              </button>
                              {showManualControls && (
                                <div className="manualcontrols mt-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={timer}
                                    onChange={handleTimeChange}
                                    placeholder="Enter time (s)"
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={handleOn}
                                    disabled={isOnDisabled} // Disable "On" button when appropriate
                                  >
                                    On
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={handleOff}
                                  >
                                    Off
                                  </button>
                                  {isCounting && (
                                    <p>Timer: {timer} seconds left</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Modals */}
                          <AutoConfirmationModal
                            show={showAutoModal}
                            onClose={() => setShowAutoModal(false)}
                            onConfirm={handleConfirmAuto}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-9">
                <div className="col-12" id="fields">
                  <div className="fieldnumbers bordering p-3">
                    <h6 className="text-secondary">Farms</h6>
                    <div
                      className="field-scroller d-flex overflow-auto"
                      ref={scrollerRef}
                    >
                      {fields.map((field, index) => (
                        <div
                          className="farms d-flex flex-column farm-bordering col-3 mx-1"
                          key={index}
                        >
                          <h5 className="fw-bold">{field.name}</h5>
                          <span className="text-secondary">{field.id}</span>
                          <small className="text-secondary d-flex justify-content-between align-items-center">
                            {field.dimensions}
                            <span className="fw-bold text-dark">
                              {field.status}
                              <div
                                className="spinner-grow text-success ms-2"
                                role="status"
                                style={{ width: "0.75rem", height: "0.75rem" }}
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </span>
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="fieldoverview bordering p-3 mt-3">
                    <h6 className="text-secondary">Field Overview</h6>
                    <div
                      ref={mapRef}
                      style={{ width: "100%", height: "100%", scale: "1.25" }}
                    ></div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="sectionlogs bordering p-3 mt-3">
                    <h6 className="text-secondary p-1">Sections</h6>

                    <table class="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th scope="col"></th>
                          <th scope="col">Sections</th>
                          <th scope="col">Moisture</th>
                          <th scope="col">Controls</th>
                          <th scope="col">Pump status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">1</th>
                          <td>Section 1</td>
                          <td>12</td>
                          <td>
                            <div className="d-flex justify-content-left align-items-center">
                              <button type="button" className="btn btn-outline-success me-2">Auto</button>
                              <button type="button" className="btn btn-outline-warning me-2" onClick={handleManual}>Manual</button>

                              {showManualControls && (
                                <div className="manualcontrols d-flex align-items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={timer}
                                    onChange={handleTimeChange}
                                    placeholder="Enter time (s)"
                                    className="form-control me-2"
                                    style={{ width: '100px' }} // Set a fixed width for better alignment
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={handleOn}
                                    disabled={isOnDisabled} // Disable "On" button when appropriate
                                  >
                                    On
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary m-1"
                                    onClick={handleOff}
                                  >
                                    Off
                                  </button>
                                  {isCounting && (
                                    <p className="mb-0 ms-2">Timer: {timer} seconds left</p> // Adjusted for horizontal alignment
                                  )}
                                </div>
                              )}
                            </div>

                          </td>
                          <td> <span className="fw-bold">Auto</span> OFF</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default User;
