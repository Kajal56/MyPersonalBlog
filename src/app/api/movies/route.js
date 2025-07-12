import { NextResponse } from 'next/server'
import { readData, addEntry, updateEntry, deleteEntry } from '../../../lib/data'

export async function GET() {
  try {
    const movies = readData('movies')
    return NextResponse.json(movies)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const success = addEntry('movies', body)
    
    if (success) {
      return NextResponse.json({ message: 'Movie added successfully' }, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to add movie' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const success = updateEntry('movies', id, updateData)
    
    if (success) {
      return NextResponse.json({ message: 'Movie updated successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const success = deleteEntry('movies', id)
    
    if (success) {
      return NextResponse.json({ message: 'Movie deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
