import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth } from '../middleware/auth'

export const productsRouter = Router()

productsRouter.post('/', requireAuth , async (req, res) => {
    const {name, category, barcode, purchasePrice, salePrice} = req.body

    const { businessId } = (req as any).user

    if(!name || !purchasePrice || !salePrice){
        return res.status(400).json({error:'name, purchase price and sale price is mandatory'})
    }

    const result = await pool.query(
        `INSERT INTO products (business_id, name, category, barcode, purchase_price, sale_price)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, category, barcode, purchase_price, sale_price`,
        [businessId, name, category || null, barcode || null, purchasePrice, salePrice]
    )

    res.status(201).json({product: result.rows[0]})
})

productsRouter.get('/', requireAuth, async (req, res) => {
    const { businessId } = (req as any).user

    const result = await pool.query(
        'SELECT id, name, category, barcode, purchase_price, sale_price FROM products WHERE business_id = $1 ORDER BY created_at DESC',
        [businessId]
    )

    res.json({ products :result.rows})
})