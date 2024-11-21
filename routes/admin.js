const express = require('express');
const router = express.Router();
const pool = require('../db');
const { promises } = require('dns');

router.post('/', async (req, res) => {
    try {
        const { admin_id } = req.body;

        const [admin_data, farmer_data] = await Promise.all([
            pool.query('SELECT admin_id, admin_fname, admin_location FROM admin WHERE admin_id = $1', [admin_id]),
            pool.query(`
                SELECT 
                    f.farmer_id, 
                    f.farmer_fname, 
                    f.farmer_lname, 
                    f.farmer_password, 
                    f.farmer_phone, 
                    f.farmer_email, 
                    f.join_date,
                    COUNT(fr.farm_id) AS total_farms
                FROM 
                    farmer f
                LEFT JOIN 
                    farm fr ON f.farmer_id = fr.farmer_id
                WHERE 
                    f.admin_id = $1
                GROUP BY 
                    f.farmer_id;`, [admin_id])
        ]);

        if (admin_data.rowCount === 0) {
            return res.status(404).send({ error: "No admin found for provided id" });
        }

        return res.status(200).send({ admin_data: admin_data.rows, farmer_data: farmer_data.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while adding the farmer" });
    }
});

router.post('/farmer', async (req, res) => {
    try {
        const { admin_id, farmer_id } = req.body;

        const [farmer_data, farm_data] = await Promise.all([
            pool.query(`
            SELECT 
                farmer_id, 
                farmer_fname, 
                farmer_lname, 
                farmer_password, 
                farmer_phone, 
                farmer_email, 
                join_date,
                (SELECT COUNT(*) FROM farm WHERE farmer_id = $1) AS total_farms
            FROM farmer
            WHERE farmer_id = $1 AND admin_id = $2`, [farmer_id, admin_id]),

            pool.query(`
            SELECT fr.* 
            FROM farm fr
            JOIN farmer f ON fr.farmer_id = f.farmer_id
            WHERE fr.farmer_id = $1 AND f.admin_id = $2;
            `, [farmer_id, admin_id])
        ]);
        if (farmer_data.rowCount === 0) {
            return res.status(404).send({ error: "No former found for provided id" });
        }

        return res.status(200).send({ farmer_data: farmer_data.rows[0], farm_data: farm_data.rows });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching farm data" });
    }
});

router.post('/farmer/farm', async (req, res) => {
    try {
        const { admin_id, farmer_id, farm_id } = req.body;

        const section_data = await pool.query(`
            SELECT 
                farm_id,
                section_id,
                section_name,
                creation_date 
            FROM farmer_farm_with_sections
            WHERE admin_id = $1 AND farmer_id = $2 AND farm_id = $3`, [admin_id, farmer_id, farm_id]);

        if (section_data.rowCount === 0) {
            return res.status(404).send({ error: "No section found for provided id" });
        }

        return res.status(200).send({ section_data: section_data.rows });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching section data" });
    }
});

router.post('/farmer/farm/section', async (req, res) => {
    try {
        const { admin_id, farmer_id, section_id } = req.body;

        const section_devices_data = await pool.query(`
            SELECT 
                farm_id, section_id, section_device_id,  device_name, device_location, installation_date
            FROM farmer_farm_with_all_section_devices
            WHERE admin_id = $1 AND farmer_id = $2 AND section_id= $3`, [admin_id, farmer_id, section_id]);

        if (section_devices_data.rowCount === 0) {
            return res.status(404).send({ error: "No section devices found for provided id" });
        }

        return res.status(200).send({ section_devices_data: section_devices_data.rows });

    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while fetching section device data" });
    }
});

router.post('/farmer/:admin_id', async (req, res) => {
    try {
        const { admin_id } = req.params;
        const { farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email } = req.body;

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

router.put('/farmer/:admin_id', async (req, res) => {
    try {
        const { admin_id } = req.params;
        const { farmer_id, farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email } = req.body;

        if (!farmer_id || !farmer_fname || !farmer_lname || !farmer_password || !farmer_phone || !farmer_email) {
            return res.status(400).send({ error: "All fields are required" });
        }

        const farmerUpdateQuery = 'UPDATE farmer SET farmer_fname=$1, farmer_lname=$2, farmer_password=$3, farmer_phone=$4, farmer_email=$5 WHERE farmer_id=$6 AND admin_id =$7 RETURNING *;';

        const farmer_data = await pool.query(farmerUpdateQuery, [farmer_fname, farmer_lname, farmer_password, farmer_phone, farmer_email, farmer_id, admin_id]);

        if (farmer_data.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        return res.status(200).send({ message: "Farmer updated successfully", farmer_data: farmer_data.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while updating the farmer" });
    }
});

router.delete('/farmer/:admin_id', async (req, res) => {
    try {
        const { admin_id } = req.params;
        const { farmer_id } = req.body;

        if (!farmer_id) {
            return res.status(400).send({ error: "Farmer ID is required" });
        }

        const farmerDeleteQuery = 'DELETE FROM farmer WHERE farmer_id = $1 AND admin_id =$2 RETURNING *;';

        const result = await pool.query(farmerDeleteQuery, [farmer_id, admin_id]);

        if (result.rowCount === 0) {
            return res.status(404).send({ error: "Farmer not found" });
        }

        return res.status(200).send({ message: "Farmer deleted successfully", deleted_farmer: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "An error occurred while deleting the farmer" });
    }
});

module.exports = router;