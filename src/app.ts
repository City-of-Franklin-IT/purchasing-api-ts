import dotenv from 'dotenv'
dotenv.config({ path: 'src/config/config.env' })

import express from 'express'
import hpp from 'hpp'
import helmet from 'helmet'
import cors from 'cors'
import errorHandler from './middleware/errorHandler'
import csp from './middleware/csp'
import inputSanitation from './middleware/inputSanitation'

const app = express()

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
  console.log(`Server up on ${ process.env.HOST }:${ port } in ${ process.env.NODE_ENV } mode..`)
})