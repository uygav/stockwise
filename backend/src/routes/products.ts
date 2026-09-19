import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth, requireRole } from '../middleware/auth'

export const productsRouter = Router()

productsRouter.post('/', requireAuth , requireRole('owner'), async (req, res) => {
    const {name, category, barcode, purchasePrice, salePrice, minStockLevel} = req.body

    const { businessId } = (req as any).user

    if(!name || !purchasePrice || !salePrice){
        return res.status(400).json({error:'name, purchase price and sale price is mandatory'})
    }

    const result = await pool.query(
        `INSERT INTO products (business_id, name, category, barcode, purchase_price, sale_price, min_stock_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, category, barcode, purchase_price, sale_price, min_stock_level`,
        [businessId, name, category || null, barcode || null, purchasePrice, salePrice, minStockLevel || 0]
    )

    res.status(201).json({product: result.rows[0]})
})

productsRouter.get('/', requireAuth, async (req, res) => {
    const { businessId } = (req as any).user

    const result = await pool.query(
        'SELECT id, name, category, barcode, purchase_price, sale_price, min_stock_level FROM products WHERE business_id = $1 AND is_active = true ORDER BY created_at DESC',
        [businessId]
    )

    res.json({ products :result.rows})
})



productsRouter.put('/:id', requireAuth, requireRole('owner'), async (req, res) => {
    const { id } = req.params
    const { businessId } = (req as any).user
    const { name, category, barcode, purchasePrice, salePrice, minStockLevel } = req.body

    if (!name || !purchasePrice || !salePrice) {
        return res.status(400).json({ error: 'name, purchase price and sale price is mandatory' })
    }

    const result = await pool.query(
        `UPDATE products
        SET name = $1, category = $2, barcode = $3, purchase_price = $4, sale_price = $5, min_stock_level = $6
        WHERE id = $7 AND business_id = $8
        RETURNING id, name, category, barcode, purchase_price, sale_price, min_stock_level`,
        [name, category || null, barcode || null, purchasePrice, salePrice, minStockLevel || 0, id, businessId]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'product not found' })
    }

    res.json({ product: result.rows[0] })
})

productsRouter.delete('/:id', requireAuth, requireRole('owner'), async (req, res) => {
    const { id } = req.params
    const { businessId } = (req as any).user

    const result = await pool.query(
        'UPDATE products SET is_active = false WHERE id = $1 AND business_id = $2 RETURNING id',
        [id, businessId]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'product not found' })
    }

    res.status(204).send()
})