import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import campass from './WeatherImages/campass.png';
import Modal from "./Modal";

const MapContainer = ({ collected_data }) => {
    const locationCoordinates = collected_data?.location_coordinates;
    const device_values = collected_data?.device_values;

    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [legendItems, setLegendItems] = useState([]);
    const scrollerRef = useRef(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [chartType, setChartType] = useState('line');

    // Horizontal scrolling for the map container
    useEffect(() => {
        const handleWheel = (event) => {
            event.preventDefault();
            if (scrollerRef.current) {
                scrollerRef.current.scrollLeft += event.deltaY;
            }
        };

        const scroller = scrollerRef.current;
        if (scroller) {
            scroller.addEventListener("wheel", handleWheel, { passive: false });
        }

        return () => {
            if (scroller) {
                scroller.removeEventListener("wheel", handleWheel);
            }
        };
    }, []);

    // Initialize the map and markers
    useEffect(() => {
        if (!locationCoordinates || !device_values || !mapRef.current) return;

        if (mapInstance.current) {
            mapInstance.current.remove();
        }

        mapInstance.current = L.map(mapRef.current).setView([16.22525, 74.8424], 16);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 27,
            minZoom: 2,
        }).addTo(mapInstance.current);

        const colorMap = {
            farmland: "green",
            valve: "red",
            moisture: "blue",
            npk: "orange",
        };

        const farmlandCoordinates = locationCoordinates.farm_coordinates?.map(coord => {
            const [lat, lon] = coord.split(",").map(Number);
            return [lat, lon];
        }) || [];

        if (farmlandCoordinates.length > 0) {
            const farmlandLayer = L.polygon(farmlandCoordinates, { color: colorMap.farmland }).addTo(mapInstance.current);
            farmlandLayer.bindPopup("Farmland Area");
        }

        const moistureValuesMap = new Map();
        device_values?.moisture_device_value?.forEach(({ section_device_id, moisture_value }) => {
            moistureValuesMap.set(section_device_id, moisture_value);
        });

        locationCoordinates.section_device?.forEach(device => {
            const [lat, lon] = device.device_location?.split(",").map(Number) || [];
            if (lat && lon && isWithinBounds([lat, lon], farmlandCoordinates)) {
                if (device.device_name === "moisture") {
                    const moistureValue = moistureValuesMap.get(device.section_device_id) || 0;
                    const moistureRadius = moistureValue * 0.05;

                    const moistureCircle = L.circle([lat, lon], {
                        radius: moistureRadius,
                        fillColor: colorMap.moisture,
                        color: colorMap.moisture,
                        fillOpacity: 0.4,
                        weight: 1,
                    })
                        .bindPopup(`Moisture Sensor in ${device.section_name}<br/>Value: ${moistureValue}`)
                        .on("click", () => handleMoistureSensorClick(device.section_device_id));
                    moistureCircle.addTo(mapInstance.current);

                    L.circleMarker([lat, lon], {
                        radius: 5,
                        fillColor: colorMap.moisture,
                        color: colorMap.moisture,
                        fillOpacity: 1,
                        weight: 2,
                    })
                        .bindPopup(`Moisture Sensor in ${device.section_name}`)
                        .addTo(mapInstance.current);
                }

                if (device.device_name === "valve") {
                    L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: colorMap.valve,
                        color: colorMap.valve,
                        fillOpacity: 0.8,
                        weight: 2,
                    })
                        .bindPopup(`Valve in ${device.section_name}`)
                        .on("click", () => handleValveClick(device.section_device_id))
                        .addTo(mapInstance.current);
                }

                if (device.device_name === "npk") {
                    L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: colorMap.npk,
                        color: colorMap.npk,
                        fillOpacity: 0.8,
                        weight: 2,
                    })
                        .bindPopup(`NPK Sensor in ${device.section_name}`)
                        .addTo(mapInstance.current);
                }
            }
        });

        const legendData = [
            { type: "moisture", color: colorMap.moisture },
            { type: "valve", color: colorMap.valve },
            { type: "npk", color: colorMap.npk },
        ];
        setLegendItems(legendData);

    }, [locationCoordinates, device_values]);

    const isWithinBounds = (coordinates, farmlandCoordinates) => {
        const polygon = L.polygon(farmlandCoordinates);
        return polygon.getBounds().contains(coordinates);
    };

    const handleMoistureSensorClick = async (sensorId) => {
        try {
            const response = await fetch(`/farmer/farm/moisture/${sensorId}`);
            const data = await response.json();
            
            if (data.length === 0) {
                console.error("No data available for the selected sensor");
                return;
            }

            const labels = data.map(item => new Date(item.timestamp).toLocaleString());
            const values = data.map(item => item.moisture_value);

            setChartData({ labels, values });
            setChartType('line');
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching moisture data:", error);
        }
    };

    const handleValveClick = async (valveId) => {
        try {
            const response = await fetch(`/farmer/farm/valve/${valveId}`);
            const data = await response.json();

            const labels = data.map(item => new Date(item.timestamp).toLocaleString());
            const values = data.map(item => item.valve_status?.trim());

            setChartData({ labels, values });
            setChartType('timeline');
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching valve data:", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setChartData(null);
    };

    return (
        <div ref={scrollerRef} className="borderring p-0" style={{ overflow: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="borderring" style={{ position: "relative", border: 'none' }}>
                <h6 className="text-secondary" style={{ zIndex: 2, position: "relative", top: '0px', left: '0px' }}>Field Overview</h6>
                <div
                    ref={mapRef}
                    style={{
                        width: "100%",
                        height: "445px",
                        scale: "1.45",
                        overflow: "hidden",
                        position: "relative"
                    }}
                ></div>

                <div style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "white",
                    padding: "6px",
                    borderRadius: "5px",
                    boxShadow: "0 0 5px rgba(0,0,0,0.5)",
                    zIndex: 10,
                }}>
                    {legendItems.map((item) => (
                        <div key={item.type} style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ width: "10px", height: "10px", backgroundColor: item.color, marginRight: "5px" }}></div>
                            <span style={{ fontSize: '13px' }}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        </div>
                    ))}
                    <img src={campass} width={20} /> <span style={{ fontSize: '13px' }}>Campass</span>
                </div>

                {isModalOpen && (
                    <Modal show={isModalOpen} handleClose={handleCloseModal} chartData={chartData} chartType={chartType} />
                )}
            </div>
        </div>
    );
};

export default MapContainer;
