import { Router } from 'express'
import { pool } from '../db/pool'
import { requireAuth } from '../middleware/auth'

export const salesRouter = Router()

salesRouter.post('/', requireAuth, async (req, res) =>{
    const { items } = req.body
    const { businessId, userId } = (req as any).user

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'items is mandatory and connot be empty' })
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        let totalAmount = 0
        const itemsWithPrice = []

        for (const item of items) {
            const productResult = await client.query(
            'SELECT id, sale_price FROM products WHERE id = $1 AND business_id = $2',
            [item.productId, businessId]
            )

            if (productResult.rows.length === 0) {
                throw new Error(`product can not found: ${item.productId}`)
            }

            const unitPrice = Number(productResult.rows[0].sale_price)
            totalAmount += unitPrice * item.quantity
            itemsWithPrice.push({ ...item, unitPrice })
            }

        const saleResult = await client.query(
        `INSERT INTO sales (business_id, cashier_id, total_amount)
        VALUES ($1, $2, $3)
        RETURNING id, total_amount, created_at`,
        [businessId, userId, totalAmount])
        
        const saleId = saleResult.rows[0].id

        for (const item of itemsWithPrice) {
            await client.query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)`,
                [saleId, item.productId, item.quantity, item.unitPrice]
            )

            await client.query(
                `INSERT INTO stock_movements (business_id, product_id, type, quantity, reason, created_by_user_id)
                VALUES ($1, $2, 'out', $3, 'sale', $4)`,
                [businessId, item.productId, item.quantity, userId]
            )
            }

        await client.query('COMMIT')

        res.status(201).json({ sale: saleResult.rows[0] })
            
    } catch (err) {
        await client.query('ROLLBACK')
        console.error(err)
        res.status(500).json({ error: 'An error occurred during the sale.' })
    } finally {
        client.release()
    }
})


salesRouter.get('/', requireAuth, async (req, res) => {
  const { businessId } = (req as any).user

  const result = await pool.query(
    'SELECT id, total_amount, created_at FROM sales WHERE business_id = $1 ORDER BY created_at DESC',
    [businessId]
  )

  res.json({ sales: result.rows })
})






