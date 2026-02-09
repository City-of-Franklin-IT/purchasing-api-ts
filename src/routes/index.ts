import approvals from './approvals'
import attachments from './attachments'
import closed from './closed'
import coding from './coding'
import delegates from './delegates'
import opiq from './opiq'
import purchases from './purchases'
import reconciliation from './reconciliation'
import requests from './requests'
import makeDocsRoute from './makeDocsRoute'

// Types
import { Express, Router } from 'express'

const docsRoutes = makeDocsRoute('purchasing')

export default (app: Express) => {
  const baseURL = `${ process.env.BASE_URL }`

  const setURL = (path: string, router: Router) => {
    return app.use(`${ baseURL }${ path }`, router)
  }

  setURL('/docs', docsRoutes)
  setURL('/approvals', approvals)
  setURL('/attachments', attachments)
  setURL('/closed', closed)
  setURL('/coding', coding)
  setURL('/delegates', delegates)
  setURL('/opiq', opiq)
  setURL('/purchases', purchases)
  setURL('/reconciliation', reconciliation)
  setURL('/requests', requests)
}