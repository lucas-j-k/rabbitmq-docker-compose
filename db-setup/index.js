const mysql = require("mysql2/promise");
const fs = require("fs");

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: parseInt(process.env.DB_PORT, 10),
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  namedPlaceholders: true,
  connectionLimit: 50,
  queueLimit: 0,
  insecureAuth: true,
  multipleStatements: true,
};

let pool = null;
const connectTriesLimit = 5;

const delay = async (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Connect to MySQL
 */
const connect = async () => {
  for (let i = 1; i <= connectTriesLimit; i += 1) {
    try {
      if (pool) continue;
      await delay(5000);
      pool = mysql.createPool(config);
    } catch (err) {
      console.log('connecction error : ', err);
      continue;
    }
  }
  if (!pool) {
    throw new Error('Unable to connect to database');
  }
}

/**
 * Connect and run setup file against DB
 */
async function run() {
  try {
    console.log('Connecting to database');
    await connect();
    console.log("Executing setup file");
    const contents = fs.readFileSync(`./setup.sql`).toString();

    await pool.query(contents);
    console.log('Setup scripts ran successfully');
  } catch (err) {
    console.log("Error Executing setup: ", err);
    process.exit(1);
  }
  await pool.end();
}

run();
