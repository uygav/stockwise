import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth, requireRole } from '../middleware/auth'

export const alertsRouter = Router()

alertsRouter.get('/low-stock', requireAuth, requireRole('owner', 'warehouse_staff'), async (req, res) => {
  const { businessId } = (req as any).user

  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.min_stock_level,
       COALESCE(SUM(CASE WHEN sm.type = 'in' THEN sm.quantity ELSE -sm.quantity END), 0) AS current_stock
     FROM products p
     LEFT JOIN stock_movements sm ON sm.product_id = p.id
     WHERE p.business_id = $1
     GROUP BY p.id, p.name, p.min_stock_level
     HAVING COALESCE(SUM(CASE WHEN sm.type = 'in' THEN sm.quantity ELSE -sm.quantity END), 0) <= p.min_stock_level
     ORDER BY current_stock ASC`,
    [businessId]
  )

  res.json({ lowStockProducts: result.rows })
})
