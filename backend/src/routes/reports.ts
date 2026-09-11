import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth, requireRole } from '../middleware/auth'

export const reportsRouter = Router()

reportsRouter.get('/sales', requireAuth, requireRole('owner'), async (req, res) => {
  const { businessId } = (req as any).user
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'startDate and endDate is mandatory' })
  }

  const summaryResult = await pool.query(
    `SELECT COUNT(*), COALESCE(SUM(total_amount), 0) AS total_revenue
     FROM sales
     WHERE business_id = $1 AND created_at >= $2 AND created_at <= $3`,
    [businessId, startDate, endDate]
  )

  const topProductsResult = await pool.query(
    `SELECT p.id, p.name, SUM(si.quantity) AS quantity_sold, SUM(si.quantity * si.unit_price) AS revenue
     FROM sale_items si
     JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE s.business_id = $1 AND s.created_at >= $2 AND s.created_at <= $3
     GROUP BY p.id, p.name
     ORDER BY quantity_sold DESC
     LIMIT 10`,
    [businessId, startDate, endDate]
  )

  res.json({
    salesCount: Number(summaryResult.rows[0].count),
    totalRevenue: summaryResult.rows[0].total_revenue,
    topProducts: topProductsResult.rows,
  })
})