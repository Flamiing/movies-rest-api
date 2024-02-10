import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

// Get environment variables
dotenv.config()
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB } = process.env

const config = {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB
}

const connection = await mysql.createConnection(config)

export class MovieModel {
  // Gets movies from database and adds the respective genres
  static async #_getMoviesWithGenres(movies) {
    const moviesPromises = movies.map(async (movie) => {
      const [genres_id] = await connection.query(
        'SELECT movie_id, genre_id FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?',
        [movie.id]
      )
        
      const genresPromises = genres_id.map(async (item) => {
        const [[genre]] = await connection.query(
          'SELECT id, name FROM genre WHERE id = ?',
          [item.genre_id]
          )
          return genre.name
        })

        const genres = await Promise.all(genresPromises)
        movie.genre = genres
        return movie
    })
        
    const moviesWithGenres = await Promise.all(moviesPromises)
    return moviesWithGenres
  }

  // Gets movies matching the given genre
  static async #_getFilteredByGenre(genre) {
    const lowerCaseGenre = genre.toLowerCase()

      const [genres] = await connection.query(
        'SELECT id, name FROM genre WHERE LOWER(name) = ?;',
        [lowerCaseGenre]
      )

      if (genres.length === 0) return []

      const [{ id }] = genres

      const [moviesAndGenreIds] = await connection.query(
        'SELECT movie_id, genre_id FROM movie_genres WHERE genre_id = ?;',
        [id]
      )

      const moviesPormises = moviesAndGenreIds.map(async (item) => {
        const [[movie]] = await connection.query(
          'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = ?;',
          [item.movie_id]
        )
        return movie
      })
      
      const movies = await Promise.all(moviesPormises)
      return this.#_getMoviesWithGenres(movies)
  }

  // Gets all movies or filtered by genre
  static async getAll ({ genre }) {
    if (genre) {
      return this.#_getFilteredByGenre(genre)
    }
    
    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie'
    )
      
    return this.#_getMoviesWithGenres(movies)
  }

  // Gets movie matching given ID
  static async getById ({ id }) {
    const [movie] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE BIN_TO_UUID(id) = ?;',
      [id]
    )

    return this.#_getMoviesWithGenres(movie)
  }

  // Creates new movie into the database
  static async create ({ input }) {
    
  }

  // Deletes movie matching the given ID
  static async delete ({ id }) {
    
  }

  // Updates movie matching the given ID
  static async update ({ id, input }) {

  }
}