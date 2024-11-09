import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

const Map = ({ locationCoordinates }) => {
    const mapRef = useRef(null);
    const [legendItems, setLegendItems] = useState([]);

    // Handle scroll behavior
    const scrollerRef = useRef(null);

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

    useEffect(() => {
        if (mapRef.current) {
            // Create the map
            const map = L.map(mapRef.current).setView([16.22525, 74.8424], 16);

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 29,
                minZoom: 2,
            }).addTo(map);

            // Define colors for sensor types
            const colorMap = {
                farmland: "green",
                valve: "orange",
                moisture: "blue",
                npk: "red",
            };

            // Create a set to hold unique sensor types for the legend
            const uniqueTypes = new Set();

            // Add farmland as polygon
            const farmlandCoordinates = locationCoordinates.farm_coordinates.map(coord => {
                const [lat, lon] = coord.split(",");
                return [parseFloat(lat), parseFloat(lon)];
            });

            const farmlandLayer = L.polygon(farmlandCoordinates, { color: colorMap.farmland }).addTo(map);
            farmlandLayer.bindPopup("Farmland Area");

            // Create section devices markers
            locationCoordinates.section_device.forEach(device => {
                const [lat, lon] = device.device_location.split(",").map(Number);
                uniqueTypes.add(device.device_name); // Add device type for legend

                if (device.device_name === "moisture") {
                    const moistureRadiusInCm = 50; // Example radius for moisture
                    L.circle([lat, lon], {
                        radius: moistureRadiusInCm,
                        fillColor: colorMap.moisture,
                        color: colorMap.moisture,
                        fillOpacity: 0.4,
                        weight: 1,
                    }).addTo(map).bindPopup(`Moisture Sensor in ${device.section_name}`);
                } else if (device.device_name === "valve") {
                    L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: colorMap.valve,
                        color: colorMap.valve,
                        fillOpacity: 0.6,
                        weight: 2,
                    }).addTo(map).bindPopup(`Valve in ${device.section_name}`);
                }
            });

            // Add farm device (NPK)
            locationCoordinates.farm_device.forEach(device => {
                const [lat, lon] = device.device_location.split(",").map(Number);
                L.circleMarker([lat, lon], {
                    radius: 5,
                    fillColor: colorMap.npk,
                    color: colorMap.npk,
                    fillOpacity: 1,
                    stroke: false,
                }).addTo(map).bindPopup(`NPK Device: ${device.device_name}`);
            });

            // Create legend items dynamically
            const legendData = Array.from(uniqueTypes).map(type => ({
                type,
                color: colorMap[type] || "gray", // Fallback color
            }));

            setLegendItems(legendData);

            // Optionally fit bounds to the farmland
            const bounds = L.latLngBounds(farmlandCoordinates);
            map.fitBounds(bounds);

            return () => {
                map.remove();
            };
        }
    }, [locationCoordinates]);

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
                >
                </div>

                {/* Dynamic Legend */}
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
                            <span style={{fontSize:'13px'}}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Map;
