import { ErrorResponse } from '../../utils/errorResponse'

// Types
import { Response, Request, NextFunction } from 'express'
import { ValidationError } from 'sequelize'
import { ErrorWithStatus, SequelizeErrorWithStatus } from './types'

export default (err: ErrorWithStatus | SequelizeErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error('[ERROR_HANDLER]', JSON.stringify(err, null, 2))
  if ((err as any).errors) {
    console.error('[ERROR_DETAILS]', (err as any).errors)
  }
  let error = { ...err }

  if(err.name === 'SequelizeValidationError') {
    const validationError = err as unknown as ValidationError
    error.message = validationError.errors[0].message
    error = new ErrorResponse(error.message, 500)
  } else {
    error = new ErrorResponse(err.message, err.statusCode || 500)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}