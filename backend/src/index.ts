import express from 'express'
import 'dotenv/config';
import { pool } from './db/pool';
import { authRouter } from "./routes/auth"
import cors from 'cors'
import { productsRouter } from './routes/products'
import { stockMovementsRouter } from './routes/stock-movements';

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/stock-movements', stockMovementsRouter)

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