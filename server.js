const express = require('express')
const crypto = require('crypto');
const pool = require('./db')
const port = 3000

const app = express()
app.use(express.json())

// home page api

app.get('/', async (req, res) => {
    try {
        const countRes = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM farmer) AS total_farmers,
                (SELECT COUNT(*) FROM farm) AS total_no_farms,
                (SELECT SUM(farm_size) FROM farm) AS total_land, 
                (SELECT COUNT(*) FROM section_devices) + (SELECT COUNT(*) FROM farm_devices) AS total_devices;
        `);

        res.status(200).send(countRes.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching counts" });
    }
});

app.get('/login', async (req, res) => {
  try {
    const { user, password, type } = req.body;
    let query, params, result, sessionKey;
    
    params = [user];

    if (type === "admin") {
      if (/^\d+$/.test(user)) {
        query = `SELECT admin_id AS user_id, admin_password AS user_password, admin_session_key FROM admin WHERE admin_id = $1`;
      } else {
        query = `SELECT admin_id AS user_id, admin_password AS user_password, admin_session_key FROM admin WHERE admin_email = $1`;
      }
    } else if (type === "user") {
      if (/^\d+$/.test(user)) {
        query = `SELECT farmer_id AS user_id, farmer_password AS user_password, farmer_session_key FROM farmer WHERE farmer_id = $1`;
      } else {
        query = `SELECT farmer_id AS user_id, farmer_password AS user_password, farmer_session_key FROM farmer WHERE farmer_email = $1`;
      }
    } else {
      return res.status(400).send({ message: "Invalid user type" });
    }

    result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "No user found" });
    }

    const isPasswordValid = (password === result.rows[0].user_password);

    if (isPasswordValid) {
      sessionKey = crypto.randomBytes(16).toString('hex');

      if (type === 'admin') {
        await pool.query(`UPDATE admin SET admin_session_key = $1 WHERE admin_id = $2`, [sessionKey, result.rows[0].user_id]);
      } else if (type === 'user') {
        await pool.query(`UPDATE farmer SET farmer_session_key = $1 WHERE farmer_id = $2`, [sessionKey, result.rows[0].user_id]);
      }

      return res.status(200).send({ message: "Authorized", userId: result.rows[0].user_id, sessionKey: sessionKey });
    } else {
      return res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

//admin page api

app.post('/admin/farmer', async (req, res) => {
    try {
        const { farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email, admin_id } = req.body;

        if (!farmer_fname || !farmer_lname || !farmer_password || !farmer_phone || !farmer_email || !admin_id) {
            return res.status(400).send({ error: "All fields are required" });
        }

        const farmerInsertQuery = `
            INSERT INTO farmer (farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email,admin_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;`;

        const farmer_data = await pool.query(farmerInsertQuery, [farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email, admin_id]);

        return res.status(201).send({ message: "Farmer added successfully", farmer_data: farmer_data.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while adding the farmer" });
    }
});

app.get('/admin/:admin_id', async (req, res) => {
    try {
        const { admin_id } = req.params;

        const adminQuery = 'SELECT admin_id, admin_fname, admin_location FROM admin WHERE admin_id = $1';
        const farmerQuery = 'SELECT farmer_id, farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email, join_date FROM farmer WHERE admin_id = $1';

        const admin_data = await pool.query(adminQuery, [admin_id]);
        const farmer_data = await pool.query(farmerQuery, [admin_id]);

        return res.status(200).send({ admin_data: admin_data.rows, farmer_data: farmer_data.rows });
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

app.put('/admin/farmer/:farmer_id', async (req, res) => {
    try {
        const { farmer_id } = req.params;
        const { farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email } = req.body;

        if (!farmer_id || !farmer_fname || !farmer_lname || !farmer_password || !farmer_phone || !farmer_email) {
            return res.status(400).send({ error: "All fields are required" });
        }

        const farmerUpdateQuery = 'UPDATE farmer SET farmer_fname=$1, farmer_lname=$2, farmer_password=$3, farmer_phone=$4, farmer_email=$5 WHERE farmer_id=$6 RETURNING *;';

        const farmer_data = await pool.query(farmerUpdateQuery, [farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email, farmer_id]);

        if (farmer_data.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        return res.status(200).send({ message: "Farmer updated successfully", farmer_data: farmer_data.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while updating the farmer" });
    }
});

app.delete('/admin/farmer/:farmer_id', async (req, res) => {
    try {
        const { farmer_id } = req.params;

        if (!farmer_id) {
            return res.status(400).send({ error: "Farmer ID is required" });
        }

        const farmerDeleteQuery = 'DELETE FROM farmer WHERE farmer_id = $1 RETURNING *;';

        const result = await pool.query(farmerDeleteQuery, [farmer_id]);

        if (result.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        return res.status(200).send({ message: "Farmer deleted successfully", deleted_farmer: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while deleting the farmer" });
    }
});

// farmer page apis

app.get('/farmer/:farmer_id', async (req, res) => {
    try {
        const { farmer_id } = req.params;

        const farmer_details = await pool.query(`
            SELECT 
                farmer_id, 
                farmer_fname,
                (SELECT COUNT(*) FROM farm WHERE farmer_id = farmer.farmer_id) AS farmer_total_farms
            FROM farmer 
            WHERE farmer_id = $1;`, [farmer_id]);

        if (farmer_details.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        const all_farms = await pool.query(`
            SELECT 
                farm_id, 
                farm_name, 
                farm_size, 
                farm_location_cordinates[1] AS farm_location 
            FROM farm 
            WHERE farmer_id = $1
            ORDER BY farm_id`, [farmer_id]);

        if (all_farms.rowCount === 0) {
            return res.status(404).send({ error: "No Farm found for the provided ID" });
        }

        const a_farm_id = all_farms.rows[0].farm_id;

        const a_farm_details = await farm_details(a_farm_id);
        const a_farm_locations = await farm_locations(a_farm_id);
        const all_devices = await all_section_devices(a_farm_id);
        const all_sensor_values_data = await all_sensor_values(a_farm_id)

        res.status(200).send({
            farmer_details: farmer_details.rows[0],
            farmer_farms: all_farms.rows,
            farm_details:a_farm_details,
            location_coordinates: {
                farm_coordinates: a_farm_locations.farm_location_cordinates,
                farm_device: all_devices.farm_devices,
                section_device: all_devices.section_devices
            },
            device_values: all_sensor_values_data
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching farmer details" });
    }
});

app.get('/farmer/farm/valve/:valve_id', async (req, res) => {
    try {
        const { valve_id } = req.params;
        const valve_data = await pool.query(
            "SELECT section_device_id, valve_mode, valve_status, timestamp, manual_off_timer FROM valve_data WHERE section_device_id = $1 ORDER BY valve_data_id DESC LIMIT 10",
            [valve_id]
        );

        if (valve_data.rows.length === 0) {
            return res.status(404).send({ error: "No valve data found for the provided ID" });
        }

        res.status(200).send(valve_data.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching valve data" });
    }
});

app.get('/farmer/farm/moisture/:sensor_id', async (req, res) => {
    try {
        const { sensor_id } = req.params;
        const moisture_data = await pool.query(
            "SELECT section_device_id, timestamp, moisture_value FROM moisture_data WHERE section_device_id =$1 ORDER BY moisture_data_id DESC limit 10;",
            [sensor_id]
        );

        if (moisture_data.rows.length === 0) {
            return res.status(404).send({ error: "No moisture data found for the provided sensor ID" });
        }

        res.status(200).send(moisture_data.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching moisture data" });
    }
});

app.get('/farmer/farm/farm_device/:farm_device_id', async (req, res) => {
    try {
        const { farm_device_id } = req.params;
        const field_data = await pool.query(
            "SELECT nitrogen, phosphorus, potassium, temperature, humidity, timestamp FROM field_data  WHERE farm_device_id = $1 ORDER BY field_data_id DESC limit 10;",
            [farm_device_id]
        );

        if (field_data.rows.length === 0) {
            return res.status(404).send({ error: "No form data found for the provided field ID" });
        }

        res.status(200).send(field_data.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching field data" });
    }
});

app.get('/farmer/farm/:farm_id', async (req, res) => {
    try {
        const { farm_id } = req.params;

        const a_farm_locations = await farm_locations(farm_id);

        if (a_farm_locations.rowCount === 0) {
            return res.status(404).send({ error: "No Farm found for the provided ID" });
        }

        const farm_detail = await farm_details(farm_id);
        const all_devices = await all_section_devices(farm_id);
        const all_sensor_values_data = await all_sensor_values(farm_id)

        res.status(200).send({
            farm_details:farm_detail,
            farm_cordinates: a_farm_locations.farm_location_cordinates,
            all_devices: all_devices,
            all_sensor_values: all_sensor_values_data
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching farmer details" });
    }
});

app.put('/farmer/farm/farm_name/:farm_id', async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { farmer_id, farm_name } = req.body;

        if (!farmer_id, !farm_name) {
            return res.status(400).send({ error: "All fields are required" });
        }

        const farm_name_update_query = 'UPDATE farm SET farm_name=$1 WHERE farm_id=$2 AND farmer_id=$3 RETURNING farm_id, farm_name'

        const farm_updated_name = await pool.query(farm_name_update_query, [farm_name, farm_id, farmer_id]);

        if (farm_updated_name.rowCount === 0) {
            return res.status(404).send({ error: "No Farm found for the provided ID for this farmer" });
        }

        return res.status(200).send({ message: "Farm name updated successfully", farm_updated_name: farm_updated_name.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while updating the farm name" });
    }



});

app.put('/farmer/farm/auto_threshold/:farm_id', async (req, res) => {
    try {
        const { farm_id } = req.params;
        const { auto_on_threshold, auto_off_threshold, farmer_id } = req.body;

        if (!auto_on_threshold || !auto_off_threshold || !farm_id) {
            return res.status(400).send({ error: "All fields are required" });
        }

        if (typeof auto_on_threshold !== 'number' || typeof auto_off_threshold !== 'number' || 100 >= auto_on_threshold <= 0 || 100 >= auto_off_threshold <= 0) {
            return res.status(400).send({ error: "Invalid threshold values" });
        }

        const auto_threshold_update_query = 'UPDATE farm SET auto_on_threshold=$1, auto_off_threshold=$2 WHERE farm_id=$3 AND farmer_id=$4 RETURNING auto_on_threshold, auto_off_threshold';

        const auto_threshold_update = await pool.query(auto_threshold_update_query, [auto_on_threshold, auto_off_threshold, farm_id, farmer_id]);

        if (auto_threshold_update.rowCount === 0) {
            return res.status(404).send({ error: "No Farm found for the provided ID for this farmer" });
        }

        return res.status(200).send({ message: "Auto threshold updated successfully", auto_threshold_update: auto_threshold_update.rows[0] });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while updating auto_threshold values" });
    }
});

app.post('/farmer/farm/valve/:valve_id', async (req, res) => {
    try {
        const { valve_id } = req.params;
        const { mode, status, timer = 0, farmer_id } = req.body;

        if (!mode || !status || !farmer_id) {
            return res.status(400).send({ error: 'Insufficient data' });
        }

        const valveInsertQuery = `
        INSERT INTO valve_data(section_device_id, valve_mode, valve_status, manual_off_timer)
            SELECT $1, $2, $3, $4
            WHERE EXISTS (
            SELECT 1
            FROM all_valve_data
            WHERE section_device_id = $1 AND farmer_id = $5
            )
            RETURNING valve_mode, valve_status, timestamp;
        `

        const valve_data = await pool.query(valveInsertQuery, [valve_id, mode, status, timer, farmer_id]);

        if (valve_data.rowCount === 0) {
            return res.status(404).send({ error: "No valve found for the provided ID" });
        }

        return res.status(200).send({ message: "inserted value data successfully", valve_data: valve_data.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while inserting value data" });
    }

});

async function farm_locations(farm_id) {
    const result = await pool.query(
        'SELECT farm_location_cordinates FROM farm WHERE farm_id = $1',
        [farm_id]
    );
    return result.rows[0];
}

async function farm_details(farm_id) {
    const result = await pool.query(
        'SELECT farm_name, auto_on_threshold, auto_off_threshold FROM farm WHERE farm_id = $1',[farm_id]
    );
    return result.rows[0]; 
}

async function all_section_devices(farm_id) {

    const [section_devices, farm_devices] = await Promise.all([
        pool.query(
            `SELECT 
                sd.section_device_id, 
                sd.section_id, 
                s.section_name, 
                sd.device_name, 
                sd.device_location 
            FROM section_devices sd 
            JOIN section s ON sd.section_id = s.section_id 
            WHERE farm_id = $1`, [farm_id]
        ),
        pool.query(
            `SELECT 
                farm_device_id, 
                device_name, 
                device_location 
            FROM farm_devices 
            WHERE farm_id = $1`, [farm_id]
        )
    ]);

    return { section_devices: section_devices.rows, farm_devices: farm_devices.rows }
}

async function all_sensor_values(farm_id) {

    const [moisture_devices_data, valve_devices_data, farm_device_data] = await Promise.all([
        pool.query(`
        SELECT DISTINCT ON (md.section_device_id) 
            md.section_device_id, 
            md.timestamp, 
            md.moisture_value, 
            md.section_id
        FROM public.all_moisture_data md
        WHERE md.farm_id = $1
        ORDER BY md.section_device_id, md.moisture_data_id DESC`, [farm_id]
        ),
        pool.query(`
        SELECT
            section_id,
            section_name,
            section_device_id,
            valve_mode,
            valve_status,
            valve_timestamp,
            manual_off_timer,
            avg_section_moisture
        FROM
            lst_valve_avg_moisture
        WHERE
            farm_id = $1`, [farm_id]
        ),
        pool.query(`
        SELECT 
            farm_device_id,
            nitrogen,
            phosphorus,
            potassium,
            temperature,
            humidity,
            timestamp,
            avg_moisture
        FROM 
            lst_field_data
        WHERE 
            farm_id = $1`, [farm_id]
        )
    ])
    return {
        moisture_device_value: moisture_devices_data.rows,
        valve_devices_data: valve_devices_data.rows,
        farm_device_data: farm_device_data.rows,
    }

}

app.listen(port, () => console.log(`server started on port: ${port}`)) 