// Types
import { EntraUserInterface } from '../../middleware/auth/types'
import { FileInterface } from '@models/types'

declare global {
  namespace Express {
    interface Request {
      entra?: EntraUserInterface
      file?: FileInterface
      files?: FileInterface[]
    }
  }
}

export {}