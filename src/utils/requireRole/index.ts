import { ErrorResponse } from '../errorResponse'

// Types
import { Request, Response, NextFunction } from 'express'

const WRITE_ROLES = ['task.editor', 'task.admin', 'task.sudo']

export const requireWrite = (req: Request, _res: Response, next: NextFunction) => {
  const roles = req.entra?.roles ?? []

  if(!WRITE_ROLES.some(role => roles.includes(role))) {
    return next(new ErrorResponse('Insufficient role to access this route', 403))
  }

  return next()
}
