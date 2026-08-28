import {Router} from "express"
import bcrypt from 'bcrypt'
import { pool } from '../db/pool'
import jwt from 'jsonwebtoken'
import { requireAuth } from "../middleware/auth"

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
    const {businessName, email, password} = req.body

    if(!businessName || !email || !password){
        return res.status(400).json({error: 'businessName, email and password is required'})
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const client = await pool.connect()

    try{
        await client.query('BEGIN')
        const businessResult = await client.query(
            'INSERT INTO businesses (name) VALUES ($1) RETURNING id',
            [businessName]
        )
        const businessId = businessResult.rows[0].id

        const userResult = await client.query(
            `INSERT INTO users (business_id, email, password_hash, role)
            VALUES ($1, $2, $3, 'owner')
            RETURNING id, email, role`,
        [businessId, email, passwordHash]
        )

        await client.query('COMMIT')

        res.status(201).json({user: userResult.rows[0]})
    }catch(err){
        await client.query('ROLLBACK')

        if ((err as { code?: string }).code === '23505') {
      return res.status(409).json({ error: 'this email already created' })
    }

        console.error(err)
        res.status(500).json({ error: 'there is an error during registration'})
    }finally{
        client.release()
    }
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password is mandatory' })
  }

  const result = await pool.query(
    'SELECT id, business_id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  )
  const user = result.rows[0]

  if (!user) {
    return res.status(401).json({ error: 'Email or password is wrong' })
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)

  if (!passwordMatches) {
    return res.status(401).json({ error: 'Email or password is wrong' })
  }

  const token = jwt.sign(
    { userId: user.id, businessId: user.business_id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  )

  res.json({ token })
})

authRouter.get('/me', requireAuth, (req,res) => {
  res.json({user: (req as any).user })
})

