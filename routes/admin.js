const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/farmer', async (req, res) => {
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

router.get('/:admin_id', async (req, res) => {
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

router.put('/farmer/:farmer_id', async (req, res) => {
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

router.delete('/farmer/:farmer_id', async (req, res) => {
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

module.exports = router;