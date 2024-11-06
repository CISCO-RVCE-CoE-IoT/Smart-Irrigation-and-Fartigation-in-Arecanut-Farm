import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

const Map = ({jsonData}) => {
    const scrollerRef = useRef(null);
    const mapRef = useRef(null);
    const [legendItems, setLegendItems] = useState([]);

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
            const map = L.map(mapRef.current).setView([16.22525, 74.8424], 25);

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 29,
                minZoom: 2,
            }).addTo(map);

            // Create bounds for farmland area
            let farmlandBounds;

            // Define colors for sensor types
            const colorMap = {
                farmland: "green",
                valve: "orange",
                moisture: "blue",
                npk: "red",
            };

            // Create a set to hold unique sensor types for the legend
            const uniqueTypes = new Set();

            // Process each data point
            jsonData.mapData.forEach((data) => {
                uniqueTypes.add(data.type); // Add type to the set
                if (data.type === "farmland") {
                    const farmlandLayer = L.polygon(data.coordinates, { color: colorMap[data.type] }).addTo(map);
                    farmlandLayer.bindPopup("Farmland Area");

                    // Create bounds from farmland coordinates
                    farmlandBounds = L.latLngBounds(data.coordinates.map(coord => [coord[0], coord[1]]));
                } else if (data.type === "valve") {
                    L.circleMarker([data.lat, data.lon], {
                        radius: 8,
                        fillColor: colorMap[data.type],
                        color: colorMap[data.type],
                        fillOpacity: 0.6,
                        weight: 2,
                    }).addTo(map).bindPopup(data.label);
                } else if (data.type === "npk") {
                    L.circleMarker([data.lat, data.lon], {
                        radius: 5,
                        fillColor: colorMap[data.type],
                        color: colorMap[data.type],
                        fillOpacity: 1,
                        stroke: false,
                    }).addTo(map).bindPopup(data.label);
                } else if (data.type === "moisture") {
                    const moistureRadiusInCm = data.moistureValue * 0.11; // Multiplier for centimeters

                    // Large circle for moisture reach in cm
                    L.circle([data.lat, data.lon], {
                        radius: moistureRadiusInCm,
                        fillColor: `rgba(173, 216, 230, 0.4)`,
                        color: colorMap[data.type],
                        fillOpacity: 0.3,
                        weight: 1,
                    }).addTo(map).bindPopup(`${data.label}: ${data.moistureValue}% Moisture`);

                    // Small circle to represent the sensor itself
                    L.circleMarker([data.lat, data.lon], {
                        radius: 5,
                        fillColor: colorMap[data.type],
                        color: "black",
                        fillOpacity: 1,
                        stroke: false,
                    }).addTo(map);
                }
            });

            // Create legend items dynamically
            const legendData = Array.from(uniqueTypes).map(type => ({
                type,
                color: colorMap[type] || "gray" // Fallback color
            }));

            setLegendItems(legendData);

            // Fit the map to the farmland bounds if available
            if (farmlandBounds) {
                map.fitBounds(farmlandBounds);
            } else {
                // Optionally fit bounds to all other markers
                const bounds = L.latLngBounds(
                    jsonData.mapData.filter((loc) => loc.type !== "farmland").map((loc) => [loc.lat, loc.lon])
                );
                map.fitBounds(bounds);
            }

            // Cleanup on component unmount
            return () => {
                map.remove();
            };
        }
    }, []);

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
