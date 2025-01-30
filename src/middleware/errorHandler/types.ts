// Types
import { Error as SequelizeError } from 'sequelize'

export interface SequelizeErrorWithStatus extends SequelizeError {
  statusCode: number
}

export interface ErrorWithStatus extends Error {
  statusCode: number
}