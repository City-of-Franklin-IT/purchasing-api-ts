import asyncHandler from '../async'
import { ErrorResponse } from '../../utils/errorResponse'
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

// Types
import { Request, Response, NextFunction } from 'express'
import { UserInterface, EntraUserInterface } from "./types"

const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 600000
})

const getKey = (header: any, callback: any) => {
  try {
    console.log('[AUTH] getKey called, kid:', header?.kid)
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error('[AUTH] getSigningKey error:', err.message)
        callback(err)
      } else {
        console.log('[AUTH] Signing key found')
        const signingKey = key?.getPublicKey()
        callback(null, signingKey)
      }
    })
  } catch (err) {
    console.error('[AUTH] getKey exception:', err)
    callback(err)
  }
}

export const entra = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  console.log('[AUTH] Middleware called, NODE_ENV:', process.env.NODE_ENV)
  const env = process.env.NODE_ENV

  if(env === 'development') {
    console.log('[AUTH] Development mode - bypassing token validation')
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

  if(!req.headers.authorization) {
    return next(new ErrorResponse('Authorization header required', 401))
  }

  const headers = new Headers()

  headers.append('Authorization', req.headers.authorization)

  const result = await fetch(`${ process.env.ENTRA_URL }`, { headers })

  if(result.status !== 200) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  const data = await result.json()

  req.entra = data.data

  return next()
})