import { Router } from 'express'
import path from 'path'
import { entra } from '@middleware/auth'

type AppRouteType = 'purchasing'

type DocNameType = 'Department Purchasing.postman_collection.json'

export const docsMap = new Map<AppRouteType, DocNameType>([
  ['purchasing', 'Department Purchasing.postman_collection.json']
])

const docsPath = process.env.NODE_ENV === 'development'
  ? '/mnt/docs' :
  '/opt/docs'

const makeDocsRoute = (appRoute: AppRouteType) => {
  const router = Router()
  router.use(entra)
  router.get('/', (_req, res) => {
    res.sendFile(path.join(docsPath, docsMap.get(appRoute)!))
  })
  return router
}

export default makeDocsRoute
