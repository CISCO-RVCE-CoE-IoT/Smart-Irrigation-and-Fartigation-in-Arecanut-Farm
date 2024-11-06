const {Pool}=require('pg');

const poll = new Pool({
    host:'192.168.0.167',
    port:5432,
    user:'postgres',
    password:'1234',
    database:'arecanut'
})

module.exports=poll