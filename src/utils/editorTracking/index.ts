// Types
import { Request } from 'express'

export default (req: Request) => {
  const method = req.method

  const email = process.env.NODE_ENV === 'development' ? 'test.o365-3@franklintn.gov' : req.entra?.preferred_username as string

  return method === 'POST' ? { createdBy: email, updatedBy: email } : { updatedBy: email }
}