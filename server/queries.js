const express = require('express');
const pool = require('./database');
const cors = require('cors'); 

const port = 5500;
const app = express();

app.use(cors());

app.get('/f/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const farmer_details = await pool.query('SELECT farmer_id, farmer_fname FROM farmer WHERE farmer_id = $1', [id]);

        if (farmer_details.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        const all_farms = await pool.query('SELECT farm_id, farm_name, farm_size ,farm_location_cordinates FROM farm WHERE farmer_id = $1', [id]);

        if (all_farms.rowCount === 0) {
            return res.status(404).send({ error: "No Farm found for the provided ID" });
        }

        const a_farm_id = all_farms.rows[0].farm_id;
        const a_farm_locations = await farm_locations(a_farm_id);

        const all_devices = await all_section_devices(a_farm_id);

        const moisture_device_ids = all_devices.section_devices
            .filter(device => device.device_name === "moisture")
            .map(device => device.section_device_id);

        const valve_device_ids = all_devices.section_devices
            .filter(device => device.device_name === "valve")
            .map(device => device.section_device_id);

        const farm_device_ids = all_devices.farm_devices
            .map(device => device.farm_device_id);

        const all_sensor_values_data = await all_sensor_values(moisture_device_ids, valve_device_ids, farm_device_ids);

        const total_farm_count = await pool.query(
            `
            select count(farm_id) as total_count
            from farm
            join farmer 
            on farm.farmer_id = farmer.farmer_id
            where farmer.farmer_id = $1
            `, [id]
        )

        res.status(200).send({
            farmer_details: farmer_details.rows[0],
            All_farms: all_farms.rows,
            farm_cordinates: a_farm_locations.rows,
            all_devices: all_devices,
            all_sensor_values: all_sensor_values_data,
            total_farm_count : total_farm_count.rows[0].total_count
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching farmer details" });
    }
});


async function farm_locations(farm_id) {
    return form_cordinates = await pool.query('SELECT farm_location_cordinates AS farm_loc FROM farm WHERE farm_id= $1', [farm_id])
}

async function all_section_devices(farm_id) {

    const section_devices = await pool.query('SELECT sd.section_device_id, sd.section_id, sd.device_name, sd.device_location FROM section_devices sd JOIN section s ON sd.section_id=s.section_id WHERE farm_id = $1', [farm_id]);
    const farm_devices = await pool.query('SELECT farm_device_id, device_name, device_location FROM farm_devices WHERE farm_id= $1', [farm_id]);
    return { section_devices: section_devices.rows, farm_devices: farm_devices.rows }
}

async function all_sensor_values(moisture_devices, valve_devices, field_device) {
    const moisture_devices_data = await pool.query(`
        SELECT md.moisture_data_id, md.section_device_id, md.timestamp, md.moisture_value
         FROM moisture_data md
         JOIN (
             SELECT section_device_id, MAX(moisture_data_id) AS max_moisture_data_id
             FROM moisture_data
             GROUP BY section_device_id
         ) AS latest ON md.section_device_id = latest.section_device_id 
         AND md.moisture_data_id = latest.max_moisture_data_id 
         WHERE md.section_device_id = ANY($1);`, [moisture_devices]
    );


    const valve_devices_data = await pool.query(`
        WITH latest_data AS (
            SELECT section_device_id, MAX(valve_data_id) AS max_valve_data_id
            FROM valve_data
            GROUP BY section_device_id
        ),
        average_moisture AS (
            SELECT AVG(md.moisture_value) AS moisture, sd.section_id
            FROM moisture_data md
            JOIN section_devices sd ON sd.section_device_id = md.section_device_id
            GROUP BY sd.section_id
        )
        SELECT vd.section_device_id, vd.valve_mode, vd.valve_status, vd.timestamp, vd.manual_off_timer, amd.moisture
        FROM valve_data vd
        JOIN section_devices vsd ON vsd.section_device_id = vd.section_device_id
        JOIN latest_data latest ON vd.section_device_id = latest.section_device_id AND vd.valve_data_id = latest.max_valve_data_id
        JOIN average_moisture amd ON amd.section_id = vsd.section_id
        WHERE vd.section_device_id = ANY ($1);`, [valve_devices]
    );

    const farm_device_data = await pool.query(`
        SELECT farm_device_id, nitrogen, phosphorus, potassium, temperature, humidity, timestamp
	    FROM field_data WHERE farm_device_id= $1 ORDER BY TIMESTAMP DESC LIMIT 1;`, [field_device[0]])

    return { moisture_devices: moisture_devices_data.rows, valve_devices_data: valve_devices_data.rows, farm_device_data: farm_device_data.rows }
}



app.listen(port, () => console.log(`Server started on port: ${port}`));
