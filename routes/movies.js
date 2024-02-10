import { Router } from 'express'
import { MovieController } from '../controllers/movies.js'

export const createMovieRouter = ({ movieModel }) => {
  const moviesRouter = Router()
  
  const movieController = new MovieController({ movieModel })
  
  moviesRouter.get('/', movieController.getAll) // GET all movies or matching given genre
  moviesRouter.post('/', movieController.create) // POST to create a movie into the database 
  
  moviesRouter.get('/:id', movieController.getById) // GET movie matching given ID
  moviesRouter.delete('/:id', movieController.delete) // DELETE movie matching given ID
  moviesRouter.patch('/:id', movieController.update) // PATCH movie matching given ID

  return moviesRouter
}