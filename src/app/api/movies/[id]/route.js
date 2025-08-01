import { NextResponse } from 'next/server'
import { updateMovie, deleteMovie } from '../../../../lib/data'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const updatedMovie = updateMovie(id, body)
    
    if (!updatedMovie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedMovie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deleted = deleteMovie(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Movie deleted successfully' })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}
