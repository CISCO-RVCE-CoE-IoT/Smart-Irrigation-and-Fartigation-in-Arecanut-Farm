import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./CSS/User.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Components/NavBar";
import Farmer from "./Components/Farmer/Farmer";
import FarmSensorsControl from "./Components/Farmer/FarmSensorsControl";
import Farms from "./Components/Farmer/Farms";
import MapContainer from "./Components/Farmer/Map";
import Sections from "./Components/Farmer/Sections";
import Modal from "./Components/Farmer/Modal";
import FieldControl from "./Components/Farmer/FieldControl";
import LogsGenerator from "./Components/Farmer/logsGenerator";
import ErrorComponent from "../ErrorComponent";

const User = () => {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [chartType, setChartType] = useState('timeline');
  const [selectedFarmDetails, setSelectedFarmDetails] = useState(null);
  const [farmDetailsLoading, setFarmDetailsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/farmer/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRec(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  const handleSelectedFarmDetails = (details) => {
    setFarmDetailsLoading(true); // Start loading for farm details
    setSelectedFarmDetails(details);
    setFarmDetailsLoading(false); // End loading when details are set
  };

  const farm_details = selectedFarmDetails;
  const farmer_detail = rec;
  

  if (loading) {
    return (
      <main>
        <header className="fixed-top">
          <NavBar />
        </header>
        <div className="container mt-5 pt-4 pb-4">
          <div className="row">
            <aside className="col-12 col-md-3 mb-4">
              <div className="shimmer shimmer-placeholder borderring" style={{ height: "150px" }}></div>
              <div className="shimmer shimmer-placeholder borderring mt-3" style={{ height: "200px" }}></div>
            </aside>
            <section className="col-12 col-md-9">
              <div className="d-flex flex-column align-items-center">
                <div className="shimmer shimmer-placeholder col-12 mb-3 borderring" style={{ height: "200px" }}></div>
                <div className="shimmer shimmer-placeholder col-12 borderring" style={{ height: "300px" }}></div>
                <div className="shimmer shimmer-placeholder col-12 my-3 borderring " style={{ height: "250px" }}></div>
                <div className="shimmer shimmer-placeholder col-12 borderring" style={{ height: "150px" }}></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
        }}
      >
        <ErrorComponent />
      </div>
    );
  }

  const handleOpenModal = (type) => {
    setChartType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <main >
      <header className="fixed-top">
        <NavBar />
      </header>
      <div className="container mt-4 pt-5 pb-4">
        <div className="row">
          <aside className="col-12 col-md-3 mb-4">
            <div style={{ position: "sticky",top:'72px' ,zIndex: 1000 }}>
              <div className="borderring">
                <div className="farmerDetails">
                  <Farmer farmer_Details={rec} />
                </div>
              </div>
              <div className="p-3 borderring mt-3">
                <div className="FarmSensorsControl">
                  <Farms 
                    farmDetails={rec} 
                    onFarmDetailsSelected={handleSelectedFarmDetails}
                  />
                </div>
              </div>
            </div>
          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              {farmDetailsLoading ? (
                <>
                  <div className="shimmer shimmer-placeholder col-12 mb-3 borderring" style={{ height: "200px" }}></div>
                  <div className="shimmer shimmer-placeholder col-12 borderring" style={{ height: "300px" }}></div>
                  <div className="shimmer shimmer-placeholder col-12 my-3 borderring " style={{ height: "250px" }}></div>
                  <div className="shimmer shimmer-placeholder col-12 borderring" style={{ height: "150px" }}></div>
                </>
              ) : (
                <>
                  <div className="col-12 mb-3 borderring">
                    <FarmSensorsControl collected_data={farm_details} farmer_details={farmer_detail} />
                    <FieldControl collected_data={farm_details} farmer_details={farmer_detail} />
                  </div>
                  <div className="col-12">
                    <MapContainer collected_data={farm_details} />
                  </div>
                  <div className="col-12 my-3">
                    <Sections collected_data={farm_details} />
                  </div>
                  <div className="col-12">
                    <LogsGenerator data={farm_details} />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default User;
