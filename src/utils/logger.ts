import pino from 'pino'

const isDev = process.env.NODE_ENV === 'development'

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.token',
      '*.password'
    ],
    censor: '[REDACTED]'
  }
})

export default logger