import mysql from 'mysql2/promise'

// Get environment variables
const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, DATABASE_URL } = process.env

const DEFAULT_CONFIG = {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB
}

const connectionConfig = DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionConfig)

export class MovieModel {
  // Gets movies from database and adds the respective genres
  static async #_getMoviesWithGenres({ movies }) {
    const moviesPromises = movies.map(async (movie) => {
      if (!movie) return
      const [genres_id] = await connection.query(
        'SELECT movie_id, genre_id FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?;',
        [movie.id]
      )
        
      const genresPromises = genres_id.map(async (item) => {
        const [[genre]] = await connection.query(
          'SELECT id, name FROM genre WHERE id = ?;',
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
  static async #_getFilteredByGenre({ genre }) {
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
      if (movies.length === 0) return []

      return await this.#_getMoviesWithGenres({ movies: movies })
  }

  static async #_addGenresToMovie({ id, genres }) {
    try {
      const genresPromises = await genres.map(async (movieGenre) => {
        await connection.query(
          `INSERT INTO movie_genres
            VALUES (UUID_TO_BIN(?), (SELECT id FROM genre WHERE name = ?));`,
          [id, movieGenre]
        )
      })
      await Promise.all(genresPromises)
    } catch (e) {
      console.error('Error adding genres to movie')
    }
  }

  // Gets all movies or filtered by genre
  static async getAll ({ genre }) {
    if (genre) {
      return await this.#_getFilteredByGenre({ genre: genre })
    }
    
    const [movies] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie;'
    )
    
    if (movies.length === 0) return []

    return await this.#_getMoviesWithGenres({ movies: movies })
  }

  // Gets movie matching given ID
  static async getById ({ id }) {
    const [movie] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE BIN_TO_UUID(id) = ?;',
      [id]
    )

    if (movie.length === 0) return null

    return await this.#_getMoviesWithGenres({ movies: movie })
  }

  // Creates new movie into the database
  static async create ({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input

    const [uuidResult] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = uuidResult

    try {
      await connection.query(
        `INSERT INTO movie (id, title, year, director, duration, poster, rate)
          VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
        [uuid, title, year, director, duration, poster, rate]
      )

      await this.#_addGenresToMovie({ id: uuid, genres: genre })
      
    } catch (e) {
      console.error('Error creating movie')
    }

    const movie = await this.getById({ id: uuid })
    return movie
  }

  // Deletes movie matching the given ID
  static async delete ({ id }) {
    const movie = await this.getById({ id: id })
    if (!movie) return false

    await connection.query(
      'DELETE FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?;',
      [id]
    )

    await connection.query(
      'DELETE FROM movie WHERE BIN_TO_UUID(id) = ?;',
      [id]
    )

    return true
  }

  // Updates movie matching the given ID
  static async update ({ id, input }) {
    const parsedGeneralInput = {
      title: input.title,
      year: input.year,
      director: input.director,
      duration: input.duration,
      poster: input.poster,
      rate: input.rate,
    }

    const parsedGenres = input.genre

    const generalUpdatePromises = Object.keys(parsedGeneralInput).map(async (key) => {
      const value = parsedGeneralInput[key]
      if (!value) return
      await connection.query(
        `UPDATE movie
          SET ${key} = ?
          WHERE BIN_TO_UUID(id) = ?;`,
        [value, id]
      )
    })

    await Promise.all(generalUpdatePromises)

    if (parsedGenres) {
      await connection.query(
        'DELETE FROM movie_genres WHERE BIN_TO_UUID(movie_id) = ?;',
        [id]
      )

      await this.#_addGenresToMovie({ id: id, genres: parsedGenres })
    }

    const movie = this.getById({ id: id })
    return movie
  }
}