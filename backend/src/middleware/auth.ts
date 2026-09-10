import { Request, Response, NextFunction} from 'express'
import jwt from 'jsonwebtoken'

export function requireAuth(req:Request, res:Response, next:NextFunction){
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({error: 'authorization header missing'})
    }

    const token = authHeader.split(' ')[1]

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET!)
        ;(req as any).user = payload
        next()
    }catch(err){
        return res.status(401).json({error : 'invalid or expired tokens '})
    }
}

export function requireRole(...allowedRoles: string[]){
    return (req:Request, res:Response, next:NextFunction) => {
        const user = (req as any).user

        if(!allowedRoles.includes(user.role)){
            return res.status(403).json({error: 'you dont have permission for this action'})
        }

        next()

    }
}
