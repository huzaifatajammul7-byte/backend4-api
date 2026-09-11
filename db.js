import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Neon PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Neon SSL connection ke liye zaroori hai
  }
});

pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL Database successfully!');
});

// Named export 'db' ke liye
export const db = {
  query: (text, params) => pool.query(text, params),
};

// Default export ke liye (agar kahi direct import karna ho)
export default db;