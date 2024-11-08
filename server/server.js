const express = require('express');
const pool = require('./database')
const cors = require('cors')
const app = express();
const port = 5500;
app.use(cors());

app.get('/f/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const farmer_id_and_name = await pool.query('SELECT farmer_id, farmer_fname FROM farmer WHERE farmer_id = $1', [id])
        const farmer_total_farms = await pool.query('select count(farm_id) from farm where farmer_id = $1', [id])
        const farmer_details = { ...farmer_id_and_name.rows[0], farmer_total_farms: farmer_total_farms.rows[0].count };
        const farmer_farms = await pool.query('SELECT farm_id, farm_name, farm_size, farm_location_cordinates[1] as farm_location FROM farm WHERE farmer_id = $1 ;', [id])
        res.status(200).send({
            farmer_details,
            farmer_farms: farmer_farms.rows
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: "An error occured check server" })
    }
})







app.get('/f/farm/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Query for farm coordinates
        const farmCoordinatesQuery = `
            SELECT farm_location_cordinates AS farm_location_coordinates 
            FROM farm 
            WHERE farm_id = $1
        `;
        const farmCoordinates = await pool.query(farmCoordinatesQuery, [id]);

        // Query for farm device locations
        const farmDeviceLocationQuery = `
            SELECT farm_devices.farm_device_id, farm_devices.device_name, farm_devices.device_location 
            FROM farm_devices 
            JOIN farm ON farm.farm_id = farm_devices.farm_id 
            WHERE farm.farm_id = $1
        `;
        const farmDeviceLocation = await pool.query(farmDeviceLocationQuery, [id]);

        // Query for section device locations
        const sectionDeviceLocationQuery = `
            SELECT section_devices.section_device_id, section_devices.section_id, section.section_name, section_devices.device_name, section_devices.device_location
            FROM section_devices
            JOIN section ON section_devices.section_id = section.section_id
            JOIN farm ON section.farm_id = farm.farm_id
            WHERE farm.farm_id = $1
        `;
        const sectionDeviceLocation = await pool.query(sectionDeviceLocationQuery, [id]);

        // Query for the latest moisture values per section device
        const moistureValueQuery = `
            SELECT DISTINCT ON (section_device_id) 
                moisture_data_id, 
                section_device_id, 
                timestamp, 
                moisture_value
            FROM all_moisture_data
            WHERE farm_id = $1
            ORDER BY section_device_id, timestamp DESC
        `;
        const moistureValue = await pool.query(moistureValueQuery, [id]);

        // Query for the valve device values
        const valveDeviceValueQuery = `
            SELECT 
                valve_data_id, 
                section_device_id, 
                section_name, 
                valve_status, 
                valve_mode, 
                valve_timestamp, 
                manual_off_timer
            FROM lst_valve_avg_moisture
            WHERE farm_id = $1
        `;
        const valveDeviceValue = await pool.query(valveDeviceValueQuery, [id]);

        // Query for farm device data without moisture information
        const farmDeviceDataQuery = `
            SELECT DISTINCT ON (farm_device_id)
                field_data_id, 
                farm_device_id, 
                nitrogen, 
                phosphorus, 
                potassium, 
                temperature, 
                humidity, 
                timestamp
            FROM all_field_data
            WHERE farm_id = $1
            ORDER BY farm_device_id, timestamp DESC
        `;
        const farmDeviceDataWithoutMoisture = await pool.query(farmDeviceDataQuery, [id]);

        // Query for average farm moisture
        const farmMoistureValueQuery = `
            SELECT AVG(avg_moisture_value) AS farm_avg_moisture
            FROM (
                SELECT AVG(moisture_value) AS avg_moisture_value
                FROM all_moisture_data
                WHERE farm_id = $1
                GROUP BY section_id
            ) AS section_avg
        `;
        const farmMoistureValue = await pool.query(farmMoistureValueQuery, [id]);

        // Construct the final response object
        const farmDetails = {
            location_coordinates: {
                farm_coordinates: farmCoordinates.rows,
                farm_device_location: farmDeviceLocation.rows,
                section_device_location: sectionDeviceLocation.rows,
            },
            device_value: {
                moisture_value: moistureValue.rows,
                valve_device_value: valveDeviceValue.rows,
                farm_device_data: {
                    ...farmDeviceDataWithoutMoisture.rows,
                    avg_moisture: farmMoistureValue.rows[0]?.farm_avg_moisture || null,
                },
            },
        };

        res.status(200).json({ farm_details: farmDetails });

    } catch (error) {
        console.error("Error fetching farm details:", error);
        res.status(500).send("Server error");
    }
});




app.listen(port, () => { console.log(`Server is running ${port}`) })
