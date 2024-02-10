import { validateMovie, validatePartialMovie } from '../schemas/movies.js'

export class MovieController {
  constructor ({ movieModel }) {
    this.movieModel = movieModel
  }

  // Controlls GET request to get all movies or the ones matching the given genre
  getAll = async (req, res) => {
    const { genre } = req.query
    const movies = await this.movieModel.getAll({ genre })
    res.json(movies)
  }

  // Controlls GET request to get movie matching given ID
  getById = async (req, res) => {
    const { id } = req.params
    const movie = await this.movieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
  }

  // Controlls POST request to add new movie into the database
  create = async (req, res) => {
    const result = validateMovie(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const newMovie = await this.movieModel.create({ input: result.data })
    res.status(201).json(newMovie)
  }

  // Controlls DELETE request to remove movie matching given ID
  delete = async (req, res) => {
    const { id } = req.params
    const result = await this.movieModel.delete({ id })
    if (result === false) {
      return res.status(404).json({ message: 'Movie not found' })
    }
    return res.json({ message: 'Movie deleted' })
  }

  // Controlls PATCH request to update movie matching given ID
  update = async (req, res) => {
    const result = validatePartialMovie(req.body)
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    const { id } = req.params
    const updatedMovie = await this.movieModel.update({ id, input: result.data })
    return res.json(updatedMovie)
  }
}