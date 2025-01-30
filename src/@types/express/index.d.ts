// Types
import { UserInterface } from '../../middleware/auth/types'
import { FileInterface } from '@models/types'

declare global {
  namespace Express {
    interface Request {
      user?: UserInterface
      file?: FileInterface
      files?: FileInterface[]
    }
  }
}

export {}