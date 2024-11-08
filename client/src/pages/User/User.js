import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Spinner from "react-bootstrap/Spinner";
import "./CSS/User.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "./Components/NavBar";
import Farmer from "./Components/Farmer/Farmer";
import FarmSensorsControl from "./Components/Farmer/FarmSensorsControl";
import FieldControl from "./Components/Farmer/FieldControl";
import Farms from "./Components/Farmer/Farms";
import Map from "./Components/Farmer/Map";
import Sections from "./Components/Farmer/Sections";
import Logs from "./Components/Farmer/Logs";

const User = () => {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/f/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setRec(data);
        setLoading(false);
        // console.log(data);

      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" variant="secondary" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const famer_details = rec?.farmer_details;
  const farm_detils = rec?.farmer_farms;

  console.log(farm_detils);


  const notifications = [
    { message: "New crop update available", time: "10:30 AM" },
    { message: "Water levels low in field", time: "09:15 AM" },
    { message: "Fertilizer reminder", time: "Yesterday" },
    { message: "Weather alert: Rain tomorrow", time: "2 days ago" },
    { message: "Soil pH adjustment needed", time: "3 days ago" },
  ];

  return (
    <main>
      <header className="fixed-top">
        <NavBar notifications={notifications} />
      </header>
      <div className="container mt-5 pt-4 pb-4">
        <div className="row">
          <aside className="col-12 col-md-3 mb-4">
            <div className="borderring" style={{ position: "sticky", top: "72px", zIndex: 1000 }}>
              <div className="farmerDetails">
                <Farmer farmer_Details={famer_details} />
              </div>
              <div className=" p-1 bg-light">
                <div className="FarmSensorsControl">
                  {/* <FarmSensorsControl gauges={fieldsensorvalve} /> */}
                </div>
                <div>
                  {/* <FieldControl data={farmdata} /> */}
                </div>
              </div>
            </div>
          </aside>
          <section className="col-12 col-md-9">
            <div className="d-flex flex-column align-items-center">
              <div className="col-12 mb-3">
                <Farms farmDetails={farm_detils} />

              </div>
              <div className="col-12">
                {/* <Map data={mapppingdevices} /> */}
              </div>
              <div className="col-12 my-3">
                {/* <Sections sectionsData={sectionsData} /> */}
              </div>
              <div className="col-12 ">
                {/* <Logs logs={logs} /> */}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default User;
