import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { pool } from '../db/pool'

export const mlRouter = Router()

mlRouter.get('/health-check', requireAuth, async (_req,res)=>{
    const response = await fetch(`${process.env.ML_SERVICE_URL}/health`)
    const data = await response.json()

    res.json({ mlServiceStatus: data })
})

mlRouter.get('/depletion/:productId', requireAuth, requireRole('owner', 'warehouse_staff'), async (req, res) => {
    const { productId } = req.params
    const { businessId } = (req as any).user

    const productCheck = await pool.query(
        'SELECT id, name FROM products WHERE id = $1 AND business_id = $2',
        [productId, businessId]
    )

    if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: 'product not found' })
    }

    const dailySalesResult = await pool.query(
        `SELECT
           d.day::date AS day,
           COALESCE(SUM(sm.quantity), 0) AS quantity
         FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
         LEFT JOIN stock_movements sm
           ON sm.product_id = $1
           AND sm.type = 'out'
           AND sm.created_at::date = d.day::date
         GROUP BY d.day
         ORDER BY d.day`,
        [productId]
    )

    const stockResult = await pool.query(
        `SELECT COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE -quantity END), 0) AS current_stock
         FROM stock_movements
         WHERE product_id = $1`,
        [productId]
    )

    const dailySales = dailySalesResult.rows.map((row) => Number(row.quantity))
    const currentStock = Number(stockResult.rows[0].current_stock)

    const mlResponse = await fetch(`${process.env.ML_SERVICE_URL}/predict/depletion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_stock: currentStock, daily_sales: dailySales }),
    })

     const prediction = await mlResponse.json() as any

    res.json({
        productName: productCheck.rows[0].name,
        currentStock,
        ...prediction,
    })
})