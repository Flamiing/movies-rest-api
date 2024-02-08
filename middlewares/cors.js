import cors from 'cors'

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://midu.dev'
]

export const corsMiddleware = ({ accepterOrigins = ACCEPTED_ORIGINS } = {}) => cors({
    origin: (origin, callback) => {
  
      if (accepterOrigins.includes(origin) || !origin) {
        return callback(null, true)
      }
  
      return callback(new Error('Not allowed by CORS'))
    }
})