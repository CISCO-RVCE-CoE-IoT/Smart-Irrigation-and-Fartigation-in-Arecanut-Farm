const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/moisture', async (req, res) => {
    try {
        const data = req.body;
        
        const valuePlaceholders = [];
        const values = [];
        
        data.forEach((entry, index) => {
            valuePlaceholders.push(`($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`);
            values.push(entry.moisture_device_id, entry.timestamp || "NOW()", entry.value);
        });
        
        const query = `INSERT INTO moisture_data (section_device_id, timestamp, moisture_value) VALUES ${valuePlaceholders.join(', ')};`;

        const result = await pool.query(query, values);

        res.status(200).json({ message: 'Moisture data inserted successfully', rows: result.rowCount });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Error inserting data', error: error.message });
    }
});

router.post('/npk', async (req, res) => {
    try {
        const { npk_device_id, nitrogen, phosphorus, potassium, temperature, humidity, timestamp = "NOW()" } = req.body;

        const query = `INSERT INTO field_data (farm_device_id, nitrogen, phosphorus, potassium, temperature, humidity, timestamp)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`;

        const result = await pool.query(query, [npk_device_id, nitrogen, phosphorus, potassium, temperature, humidity, timestamp]);

        res.status(200).json({ message: 'NPK data inserted successfully', data: result.rowCount });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Error inserting data', error: error.message });
    }
});

module.exports = router;