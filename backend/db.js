const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "codepulse",
    password: "sharath1078",
    port: 5432
});

module.exports = pool;