import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import campass from '../Images/campass.png';

const Map = ({ data }) => {
    const mapRef = useRef(null);
    const [legendItems, setLegendItems] = useState([]);

    useEffect(() => {
        if (mapRef.current) {
            const map = L.map(mapRef.current).setView([16.22525, 74.8424], 25);

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    maxZoom: 26,
                    minZoom: 2,
                }
            ).addTo(map);

            // Color mappings
            const colorMap = {
                farmland: "green",
                valve: "orange",
                moisture: "blue",
                npk: "red",
            };

            // Handle farmland polygon
            const farmlandCoordinates = data.farmlocation.farm_loc.map((loc) => {
                const [lat, lon] = loc.split(",").map(Number);
                return [lat, lon];
            });
            const farmlandLayer = L.polygon(farmlandCoordinates, {
                color: colorMap.farmland,
            }).addTo(map);
            farmlandLayer.bindPopup("Farmland Area");

            // Fit map to the farmland bounds
            const farmlandBounds = L.latLngBounds(farmlandCoordinates);
            map.fitBounds(farmlandBounds);

            // Unique types for legend
            const uniqueTypes = new Set();

            // Handle sensor locations with moisture data
            data.sensorlocation.forEach((sensor) => {
                uniqueTypes.add(sensor.device_name);
                const [lat, lon] = sensor.device_location.split(",").map(Number);
                const color = colorMap[sensor.device_name] || "gray";
                
                // Find related moisture data
                const moistureData = data.moisturedata.find(m => m.section_device_id === sensor.section_device_id);
                const popupContent = moistureData
                    ? `${sensor.device_name}: ${sensor.section_id}<br/>Moisture: ${moistureData.moisture_value}%<br/>Timestamp: ${new Date(moistureData.timestamp).toLocaleString()}`
                    : `${sensor.device_name}: ${sensor.section_id}`;

                L.circleMarker([lat, lon], {
                    radius: sensor.device_name === "moisture" ? 5 : 8,
                    fillColor: color,
                    color: "black",
                    fillOpacity: 1,
                    stroke: sensor.device_name === "moisture" ? false : true,
                }).addTo(map).bindPopup(popupContent);
            });

            // Handle farm device locations
            data.farmdevicelocation.forEach((device) => {
                uniqueTypes.add(device.device_name);
                const [lat, lon] = device.device_location.split(",").map(Number);
                const color = colorMap[device.device_name] || "gray";

                L.circleMarker([lat, lon], {
                    radius: 6,
                    fillColor: color,
                    color: color,
                    fillOpacity: 1,
                    weight: 1,
                }).addTo(map).bindPopup(`${device.device_name}: ${device.farm_device_id}`);
            });

            // Legend items
            const legendData = Array.from(uniqueTypes).map((type) => ({
                type,
                color: colorMap[type] || "gray",
            }));
            setLegendItems(legendData);

            // Cleanup on unmount
            return () => {
                map.remove();
            };
        }
    }, [data]);

    return (
        <div style={{ position: "relative" ,overflow:'hidden'}} className="borderring">
            <div ref={mapRef} style={{ width: "100%", height: "445px", scale: "1.25" }}></div>
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
                <img src={campass} width={80} alt="Compass"/>
            </div>
        </div>
    );
};

export default Map;
