import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth } from '../middleware/auth'

export const dashboardRouter = Router()

dashboardRouter.get('/summary', requireAuth, async (req, res) => {
  const { businessId } = (req as any).user

  const productCountResult = await pool.query(
    'SELECT COUNT(*) FROM products WHERE business_id = $1',
    [businessId]
  )

  const salesResult = await pool.query(
    'SELECT COUNT(*), COALESCE(SUM(total_amount), 0) AS total_revenue FROM sales WHERE business_id = $1',
    [businessId]
  )

  const recentSalesResult = await pool.query(
    'SELECT id, total_amount, created_at FROM sales WHERE business_id = $1 ORDER BY created_at DESC LIMIT 5',
    [businessId]
  )

  res.json({
    productCount: Number(productCountResult.rows[0].count),
    salesCount: Number(salesResult.rows[0].count),
    totalRevenue: salesResult.rows[0].total_revenue,
    recentSales: recentSalesResult.rows,
  })
})