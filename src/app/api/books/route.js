import { NextResponse } from 'next/server'
import { readData, addEntry, updateEntry, deleteEntry } from '../../../lib/data'

export async function GET() {
  try {
    const books = readData('books')
    return NextResponse.json(books)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const success = addEntry('books', body)
    
    if (success) {
      return NextResponse.json({ message: 'Book added successfully' }, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to add book' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const success = updateEntry('books', id, updateData)
    
    if (success) {
      return NextResponse.json({ message: 'Book updated successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const success = deleteEntry('books', id)
    
    if (success) {
      return NextResponse.json({ message: 'Book deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
