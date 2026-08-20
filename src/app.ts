import dotenv from 'dotenv'
import path from 'path'

// Resolve paths from project root using cwd
const projectRoot = process.cwd()
const envPath = path.join(projectRoot, '.env')
const envFilePath = path.join(projectRoot, `.env.${ process.env.NODE_ENV || "development" }`)

// Load shared credentials and base config first
dotenv.config({ path: envPath })

// Load environment-specific config second (overrides shared if needed)
dotenv.config({ path: envFilePath, override: true })

import express from 'express'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import pinoHttp from 'pino-http'
import errorHandler from './middleware/errorHandler'
import csp from './middleware/csp'
import inputSanitation from './middleware/inputSanitation'
import logger from './utils/logger'

const app = express()

app.use(pinoHttp({
  logger,
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customProps: (req) => ({
    user: req.entra?.preferred_username,
    name: req.entra?.name
  })
}))
app.use(express.json()) // Request body parser
app.use(helmet())
app.use(hpp())
app.use(csp) // Content security policy
app.use(inputSanitation) // Input sanitation
app.use(cors({ origin: ['https://dev.franklintn.gov', 'https://apps.franklintn.gov', 'https://istest.franklintn.gov'] })) // CORS

import routes from './routes'

routes(app) // Mount routes
app.use('/api/v2/dept-purchasing/api-docs', (req, res, next) => {
  res.redirect('https://documenter.getpostman.com/view/6104227/2sAYdhHV3F')
})

app.use(errorHandler)

const port = process.env.PORT

app.set('port', port)

app.listen({ port }, async () => {
  logger.info(`Server up on ${ process.env.HOST }:${ port } in ${ process.env.NODE_ENV } mode..`)
})