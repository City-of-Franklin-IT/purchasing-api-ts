// Types
import { Request, Response, NextFunction } from 'express'
import { InputObj } from './types'

export default (req: Request, res: Response, next: NextFunction) => { // Sanitize input

  const sanitizeObject = (obj: InputObj) => {
    for(const key in obj) {
      if(obj.hasOwnProperty(key)) {
        if(typeof obj[key] === 'string') { // String
          obj[key] = obj[key].trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") // Basic sanitization
        } else if (Array.isArray(obj[key])) { // Arrays
          obj[key].forEach(item => sanitizeObject(item as InputObj))
        } else if (typeof obj[key] === 'object' && obj[key] !== null) { // Nested objects
          sanitizeObject(obj[key])
        }
      }
    }
  };

  // Check if req.body is an array or object and sanitize accordingly
  if(Array.isArray(req.body)) {
    req.body.forEach(item => sanitizeObject(item)) // Sanitize each object in the array
  } else if(typeof req.body === 'object' && req.body !== null) {
    sanitizeObject(req.body) // Sanitize the object directly
  }

  next()
}