import asyncHandler from '../async'
import { ErrorResponse } from '../../utils/errorResponse'

// Types
import { Request, Response, NextFunction } from 'express'
import { UserInterface } from "./types"

export const entra = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { // Validate token from Entra
  const env = process.env.NODE_ENV

  if(env === 'development') { // Development
    const today = new Date()

    const user: UserInterface = {
      role: 'Super User',
      department: 'IT',
      email: 'test.o365-3@franklintn.gov',
      iat: Math.floor(today.getTime() / 1000),
      exp: Math.floor(today.getTime() / 1000) + (30 * 24 * 60 * 60)
    }

    req.user = user

    return next()
  }

  if(req.headers.authorization) {
    const headers = new Headers()

    headers.append('Authorization', req.headers.authorization)

    const result = await fetch(`${ process.env.ENTRA_URL }`, { headers })

    if(result.status !== 200) {
      return next(new ErrorResponse('Not authorized to access this route', 401))
    }
    
    const data = await result.json()

    req.entra = data.data

    console.log(data.data)

    return next()
  }
})
