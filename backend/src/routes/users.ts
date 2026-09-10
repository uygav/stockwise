import { Router } from "express"
import bcrypt from 'bcrypt'
import { pool } from '../db/pool'
import { requireAuth, requireRole } from "../middleware/auth"

export const usersRouter = Router()

usersRouter.post('/', requireAuth, requireRole('owner'), async (req, res) => {
    const { email, password, role } = req.body
    const businessId = (req as any).user.businessId

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'email, password and role is required' })
    }

    if (!['cashier', 'warehouse_staff'].includes(role)) {
        return res.status(400).json({ error: 'role must be cashier or warehouse_staff' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    try {
        const result = await pool.query(
            `INSERT INTO users (business_id, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, role`,
            [businessId, email, passwordHash, role]
        )

        res.status(201).json({ user: result.rows[0] })
    } catch (err) {
        if ((err as { code?: string }).code === '23505') {
            return res.status(409).json({ error: 'this email already created' })
        }

        console.error(err)
        res.status(500).json({ error: 'there is an error during user creation' })
    }
})


