import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';

const MapContainer = ({ locationCoordinates, device_values }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);  // Ref to store the map instance
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
        if (!locationCoordinates || !device_values) return;
    
        // Destroy existing map instance if it exists
        if (mapInstance.current) {
            mapInstance.current.remove();
        }
    
        if (mapRef.current) {
            // Initialize the map
            mapInstance.current = L.map(mapRef.current).setView([16.22525, 74.8424], 16);
    
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 29,
                minZoom: 2,
            }).addTo(mapInstance.current);
    
            const colorMap = {
                farmland: "green",
                valve: "orange",
                moisture: "darkblue",
                npk: "red",
            };
    
            const uniqueTypes = new Set();
    
            // Plot farmland coordinates
            const farmlandCoordinates = locationCoordinates.farm_coordinates?.map(coord => {
                const [lat, lon] = coord.split(",");
                return [parseFloat(lat), parseFloat(lon)];
            }) || [];
    
            const farmlandLayer = L.polygon(farmlandCoordinates, { color: colorMap.farmland }).addTo(mapInstance.current);
            farmlandLayer.bindPopup("Farmland Area");
    
            // Create a map for moisture values
            const moistureValuesMap = new Map();
            device_values?.moisture_device_value?.forEach(({ section_device_id, moisture_value }) => {
                moistureValuesMap.set(section_device_id, moisture_value);
            });
    
            // Plot section devices with moisture values
            locationCoordinates.section_device?.forEach(device => {
                const [lat, lon] = device.device_location.split(",").map(Number);
                uniqueTypes.add(device.device_name);
    
                if (device.device_name === "moisture") {
                    const moistureValue = moistureValuesMap.get(device.section_device_id) || 0;
                    const moistureRadius = moistureValue * 0.5; // Adjust scaling factor as needed
    
                    L.circle([lat, lon], {
                        radius: moistureRadius,
                        fillColor: colorMap.moisture,
                        color: colorMap.moisture,
                        fillOpacity: 0.4,
                        weight: 1,
                    }).addTo(mapInstance.current).bindPopup(`Moisture Sensor in ${device.section_name}<br/>Value: ${moistureValue}`);
                } else if (device.device_name === "valve") {
                    const valveStatus = device_values?.valve_devices_data?.find(v => v.section_device_id === device.section_device_id);
                    const valveColor = valveStatus?.valve_status === "on" ? "green" : "red";
    
                    L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: valveColor,
                        color: valveColor,
                        fillOpacity: 0.6,
                        weight: 2,
                    }).addTo(mapInstance.current).bindPopup(`Valve in ${device.section_name}`);
                }
            });
    
            // Plot NPK devices
            locationCoordinates.farm_device?.forEach(device => {
                const [lat, lon] = device.device_location.split(",").map(Number);
                L.circleMarker([lat, lon], {
                    radius: 5,
                    fillColor: colorMap.npk,
                    color: colorMap.npk,
                    fillOpacity: 1,
                    stroke: false,
                }).addTo(mapInstance.current).bindPopup(`NPK Device: ${device.device_name}`);
            });
    
            // Generate legend items
            const legendData = Array.from(uniqueTypes).map(type => ({
                type,
                color: colorMap[type] || "gray",
            }));
    
            setLegendItems(legendData);
    
            // Fit the map to the farmland bounds
            const bounds = L.latLngBounds(farmlandCoordinates);
            mapInstance.current.fitBounds(bounds);
        }
    }, [locationCoordinates, device_values]);
    
    

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

export default MapContainer;
