import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Table Initializer Function (Neon par automatic students table banayega)
const createTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      age INT NOT NULL,
      course VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
    try {
        await db.query(queryText);
        console.log('Students table ready on Neon!');
    } catch (err) {
        console.error('Table creation error:', err);
    }
};

createTable();
// -------------------------------------------------------------
// CRUD ENDPOINTS
// ------------------------------------------------------------
// app.get('/',(req,res)=>{
//     res.send({status:'successful',message:'Backend is working'})
// })

// 1. CREATE: Naya student add karna
app.post('/api/students', async (req, res) => {
    const { name, email, age, course } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO students (name, email, age, course) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, age, course]
        );
        res.status(201).json({
            success: true,
            message: 'Student record created successfully',
            data: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. READ ALL: Sabhi students ki list hasil karna
app.get('/api/students', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM students ORDER BY id ASC');
        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 3. READ SINGLE: Specific ID se student search karna
app.get('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM students WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 4. UPDATE: Student details update karna
app.put('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, age, course } = req.body;
    try {
        const result = await db.query(
            'UPDATE students SET name = $1, email = $2, age = $3, course = $4 WHERE id = $5 RETURNING *',
            [name, email, age, course, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            data: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. DELETE: Student record delete karna
app.delete('/api/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully',
            deletedData: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
