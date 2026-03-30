import pg from "pg";
import dotenv from "dotenv";
dotenv.config()
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
console.log("Checking DB URL:", process.env.DATABASE_URL ? "Defined" : "UNDEFINED");


export default db;