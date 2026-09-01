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



productsRouter.put('/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const { businessId } = (req as any).user
    const { name, category, barcode, purchasePrice, salePrice } = req.body

    if (!name || !purchasePrice || !salePrice) {
        return res.status(400).json({ error: 'name, purchase price and sale price is mandatory' })
    }

    const result = await pool.query(
        `UPDATE products
        SET name = $1, category = $2, barcode = $3, purchase_price = $4, sale_price = $5
        WHERE id = $6 AND business_id = $7
        RETURNING id, name, category, barcode, purchase_price, sale_price`,
        [name, category || null, barcode || null, purchasePrice, salePrice, id, businessId]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'product not found' })
    }

    res.json({ product: result.rows[0] })
})

productsRouter.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params
    const { businessId } = (req as any).user

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING id',
            [id, businessId]
    )

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'product not found' })
    }

    res.status(204).send()

    } catch (err) {
    if ((err as { code?: string }).code === '23503') {
      return res.status(409).json({ error: 'This product cannot be deleted because there is a stock movement or sales record associated with it.' })
    }

    console.error(err)
    
    res.status(500).json({ error: 'An error occurred while deleting the product.' })
  }
})