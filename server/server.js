const express = require('express');
const pool = require('./database');
const cors = require('cors'); 

const port = 5500;
const app = express();

app.use(cors());

app.get('/farmer/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const farmer_details = await pool.query(
            `
            select farmer_fname , farmer_id from farmer
            where farmer_id = $1
            `,
            [id]
        );
        const farm_details = await pool.query(
            `
            select fr.farm_id,fr.farm_name,fr.farm_size,fr.farm_location_cordinates
            from farmer f
            join farm fr
            on f.farmer_id = fr.farmer_id
            where f.farmer_id=$1
            `, [id]
        );
        const total_farm_count = await pool.query(
            `
            select count(farm_id) as total_count
            from farm
            join farmer 
            on farm.farmer_id = farmer.farmer_id
            where farmer.farmer_id = $1
            `, [id]
        )
        res.status(200).send(
            {
                farmer_details: farmer_details.rows,
                farm_details: farm_details.rows,
                total_farm_count: total_farm_count.rows[0].total_count
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error while fetching" });
    }
});

// app.get('/farmer/:id/:farmid', async(req,res) =>{
//     const {farmid} = req.params;
//     try{

//     }
// })

app.listen(port, () => console.log(`Server started on port: ${port}`));
