import { ErrorResponse } from '../../utils/errorResponse'

// Types
import { Response, Request, NextFunction } from 'express'
import { ValidationError } from 'sequelize'
import { ErrorWithStatus, SequelizeErrorWithStatus } from './types'

export default (err: ErrorWithStatus | SequelizeErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err }

  if(err.name === 'SequelizeValidationError') {
    const validationError = err as unknown as ValidationError
    error.message = validationError.errors[0].message
    error = new ErrorResponse(error.message, 500)
  } else {
    error = new ErrorResponse(err.message, 500)
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  })
}