import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import campass from './WeatherImages/campass.png';

const MapContainer = ({ collected_data }) => {

    const locationCoordinates = collected_data?.location_coordinates;
    const device_values = collected_data?.device_values;

    const mapRef = useRef(null);
    const mapInstance = useRef(null);  // Ref to store the map instance
    const [legendItems, setLegendItems] = useState([]);
    const scrollerRef = useRef(null);

    // Handle horizontal scrolling
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
        // console.log("Initializing map with coordinates", locationCoordinates);
    
        // Check if locationCoordinates and device_values are available
        if (!locationCoordinates || !device_values || !mapRef.current) return;
    
        // console.log("Map container available, initializing...");
    
        // Clean up existing map instance if any
        if (mapInstance.current) {
            mapInstance.current.remove();
        }
    
        // Initialize map with default position
        mapInstance.current = L.map(mapRef.current).setView([16.22525, 74.8424], 16);
    
        // Add tile layer to the map
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 27,
            minZoom: 2,
        }).addTo(mapInstance.current);
    
        // Color map for different device types
        const colorMap = {
            farmland: "green",
            valve: "orange",
            moisture: "darkblue",
            npk: "red",
        };
    
        // Ensure farm coordinates are parsed correctly
        const farmlandCoordinates = locationCoordinates.farm_coordinates?.map(coord => {
            const [lat, lon] = coord.split(",").map(Number); // Parse as numbers
            return [lat, lon];
        }) || [];
    
        if (farmlandCoordinates.length === 0) {
            console.warn("No valid farmland coordinates found.");
        }
    
        // Create farmland polygon if coordinates exist
        const farmlandLayer = L.polygon(farmlandCoordinates, { color: colorMap.farmland }).addTo(mapInstance.current);
        farmlandLayer.bindPopup("Farmland Area");
    
        // Mapping moisture values
        const moistureValuesMap = new Map();
        device_values?.moisture_device_value?.forEach(({ section_device_id, moisture_value }) => {
            moistureValuesMap.set(section_device_id, moisture_value);
        });
    
        const uniqueDeviceMarkers = [];
    
        // Adding markers for section devices
        locationCoordinates.section_device?.forEach(device => {
            const [lat, lon] = device.device_location?.split(",").map(Number) || [];
            if (lat && lon && isWithinBounds([lat, lon], farmlandCoordinates)) {
                const sensorMarker = L.circleMarker([lat, lon], {
                    radius: 3,
                    fillColor: "black",
                    color: "black",
                    fillOpacity: 1,
                    weight: 1,
                }).bindPopup(`${device.device_name.charAt(0).toUpperCase() + device.device_name.slice(1)} Sensor`);
    
                uniqueDeviceMarkers.push(sensorMarker);
    
                // Add moisture sensor markers with dynamic radius
                if (device.device_name === "moisture") {
                    const moistureValue = moistureValuesMap.get(device.section_device_id) || 0;
                    const moistureRadius = moistureValue * 0.05;
    
                    const moistureCircle = L.circle([lat, lon], {
                        radius: moistureRadius,
                        fillColor: colorMap.moisture,
                        color: colorMap.moisture,
                        fillOpacity: 0.4,
                        weight: 1,
                    }).bindPopup(`Moisture Sensor in ${device.section_name}<br/>Value: ${moistureValue}`);
                    uniqueDeviceMarkers.push(moistureCircle);
                }
                // Add valve markers
                else if (device.device_name === "valve") {
                    const valveStatus = device_values?.valve_devices_data?.find(v => v.section_device_id === device.section_device_id);
                    const valveColor = valveStatus?.valve_status === "on" ? "green" : "red";
    
                    const valveMarker = L.circleMarker([lat, lon], {
                        radius: 8,
                        fillColor: valveColor,
                        color: valveColor,
                        fillOpacity: 0.6,
                        weight: 2,
                    }).bindPopup(`Valve in ${device.section_name}`);
                    uniqueDeviceMarkers.push(valveMarker);
                }
            }
        });
    
        // Adding markers for farm devices (e.g., NPK devices)
        locationCoordinates.farm_device?.forEach(device => {
            const [lat, lon] = device.device_location?.split(",").map(Number) || [];
            if (lat && lon && isWithinBounds([lat, lon], farmlandCoordinates)) {
                const npkMarker = L.circleMarker([lat, lon], {
                    radius: 5,
                    fillColor: colorMap.npk,
                    color: colorMap.npk,
                    fillOpacity: 1,
                    stroke: false,
                }).bindPopup(`NPK Device: ${device.device_name}`);
                uniqueDeviceMarkers.push(npkMarker);
            }
        });
    
        // Add all markers to the map
        uniqueDeviceMarkers.forEach(marker => marker.addTo(mapInstance.current));
    
        // Update the map's bounds to include all the markers
        const bounds = L.latLngBounds(farmlandCoordinates);
        uniqueDeviceMarkers.forEach(marker => bounds.extend(marker.getLatLng()));
    
        // Fit map to the bounds of the farmland and markers
        mapInstance.current.fitBounds(bounds);
    
        // Update legend with sensor types
        const legendData = [
            { type: "moisture", color: colorMap.moisture },
            { type: "valve", color: "orange" },
            { type: "npk", color: colorMap.npk },
        ];
        setLegendItems(legendData);
    
    }, [locationCoordinates, device_values]);
    

    // Function to check if coordinates are within the farmland bounds
    const isWithinBounds = (coordinates, farmlandCoordinates) => {
        const polygon = L.polygon(farmlandCoordinates);
        return polygon.getBounds().contains(coordinates);
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
                >
                </div>

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
            </div>
        </div>
    );
};

export default MapContainer;
