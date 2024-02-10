import { createApp } from './app.js'
import { MovieModel } from './models/mySQL/movie.js'

createApp({ movieModel: MovieModel })
