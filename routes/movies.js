import { Router } from 'express'
import { MovieController } from '../controllers/movies.js'

export const moviesRouter = Router()

moviesRouter.get('/', MovieController.getAll) // GET all movies or matching given genre
moviesRouter.post('/', MovieController.create) // POST to create a movie into the database 

moviesRouter.get('/:id', MovieController.getById) // GET movie matching given ID
moviesRouter.delete('/:id', MovieController.delete) // DELETE movie matching given ID
moviesRouter.patch('/:id', MovieController.update) // PATCH movie matching given ID