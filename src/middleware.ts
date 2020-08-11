import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export function authenticateToken(request: Request, response: Response, next: NextFunction) {
  const authorization = request.header('authorization')

  if (!authorization) {
    return unauthorized(response)
  }

  const token = authorization.split(' ')[1]
  const secret = process.env.SECRET as string
  jwt.verify(token, secret, (error) => {
    if (error) {
      return unauthorized(response)
    }
  })

  next()
}

function unauthorized(response: Response) {
  return response.status(401).json({
    error: 'You need a authentication'
  })
}
