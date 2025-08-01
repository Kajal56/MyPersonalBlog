import { NextResponse } from 'next/server'
import { getAllMovies, addMovie } from '../../../lib/data'

export async function GET() {
  try {
    const movies = getAllMovies()
    return NextResponse.json(movies)
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const newMovie = addMovie(body)
    return NextResponse.json(newMovie, { status: 201 })
  } catch (error) {
    console.error('Error adding movie:', error)
    return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
  }
}
