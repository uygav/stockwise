import express from 'express'
import 'dotenv/config';
import { pool } from './db/pool';

const app = express()
const PORT = process.env.PORT || 4000

app.get('/api/testing', (_req,res) => {
    res.json({status:'ok'})
})

app.get('/api/db-test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ dbTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.listen(PORT, () => {
    console.log(`Backend is running on http://localhost:${PORT}`)
})