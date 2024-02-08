import express, { json } from 'express'
import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js'

const app = express() // Create app
const PORT = process.env.PORT ?? 3000 // Get port

app.disable('x-powered-by') // Disable 'x-powered-by' header
app.use(json()) // middleware
app.use(corsMiddleware())

app.use('/api/movies', moviesRouter)

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
