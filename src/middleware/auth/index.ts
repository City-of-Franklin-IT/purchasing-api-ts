import asyncHandler from '../async'
import { ErrorResponse } from '../../utils/errorResponse'
import jwksClient from 'jwks-rsa'
import jwt from 'jsonwebtoken'

// Types
import { Request, Response, NextFunction } from 'express'
import { EntraUserInterface } from "./types"

export const entra = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const env = process.env.NODE_ENV

  if(env === 'development') { // Development
    const user: EntraUserInterface = {
      aud: '',
      exp: 0,
      iat: 0,
      iss: '',
      name: '',
      nbf: 0,
      nonce: '',
      oid: '',
      preferred_username: 'test.o365-3@franklintn.gov',
      rh: '',
      roles: ['task.write', 'task.admin', 'task.sudo'],
      sid: '',
      sub: '',
      tid: '',
      uti: '',
      ver: ''
    }

    req.entra = user

    return next()
  }

  if(!req.headers.authorization?.startsWith('Bearer ')) {
    return next(new ErrorResponse('Authorization header required', 401))
  }

  const token = req.headers.authorization.slice('Bearer '.length)

  jwt.verify(token, getKey, {
    audience: process.env.ENTRA_CLIENT_ID,
    issuer: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/v2.0`,
    algorithms: ['RS256']
  }, (err, decoded) => {
    if(err) {
      return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    req.entra = decoded as EntraUserInterface

    return next()
  })
})

const jwks = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${ process.env.ENTRA_TENANT_ID }/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 10,
  cacheMaxAge: 600000
})

const getKey = (header: any, callback: any) => {
  try {
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err)
      } else {
        const signingKey = key?.getPublicKey()
        callback(null, signingKey)
      }
    })
  } catch (err) {
    callback(err)
  }
}