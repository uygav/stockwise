import { Router } from "express";
import { pool } from "../db/pool"
import { requireAuth, requireRole } from "../middleware/auth";

export const stockMovementsRouter = Router()

stockMovementsRouter.post('/', requireAuth, requireRole('owner', 'warehouse_staff'), async (req,res) => {
    const {productId, type, quantity, reason } = req.body
    const { businessId, userId } = (req as any).user

    if (!productId || !type || !quantity) {
    return res.status(400).json({ error: 'productId, type and quantity is mandatory' })
    }

    if (type !== 'in' && type !== 'out') {
    return res.status(400).json({ error: 'type only can be in and out' })
    }

    const productCheck = await pool.query(
        'SELECT id, name FROM products WHERE id = $1 AND business_id = $2',
        [productId, businessId]
    )

    if (productCheck.rows.length === 0){
        return res.status(404).json({error: "product not found"})
    }

    const result = await pool.query(
        `INSERT INTO stock_movements (business_id, product_id, type, quantity, reason, created_by_user_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, product_id, type, quantity, reason, created_at`,
    [businessId, productId, type, quantity, reason || null, userId]
    )

    res.status(201).json({
        movement: { ...result.rows[0], product_name: productCheck.rows[0].name },
    })
})

stockMovementsRouter.get('/', requireAuth, requireRole('owner', 'warehouse_staff'), async (req, res) => {
  const { businessId } = (req as any).user

  const result = await pool.query(
    `SELECT sm.id, sm.product_id, p.name AS product_name, sm.type, sm.quantity, sm.reason, sm.created_at
     FROM stock_movements sm
     JOIN products p ON p.id = sm.product_id
     WHERE sm.business_id = $1
     ORDER BY sm.created_at DESC`,
    [businessId]
  )

  res.json({ movements: result.rows })
})