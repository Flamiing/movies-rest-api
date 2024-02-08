import z from 'zod'

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string.',
    required_error: 'Movie title is requiered.'
  }),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  director: z.string(), 
  duration: z.number().int().positive(),
  poster: z.string().url({
    message: 'Poster must be a valid URL.'
  }),
  genre: z.array(
    z.enum(['Action', 'Drama', 'Comedy', 'Adventure', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
    {
      required_error: 'Movie genre is required.',
      invalid_type_error: 'Movie genre must be an array of enum.'
    }
  ),
  rate: z.number().min(0).max(10).default(0)
})

export function validateMovie(input) {
  return movieSchema.safeParse(input)
}

export function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input)
}