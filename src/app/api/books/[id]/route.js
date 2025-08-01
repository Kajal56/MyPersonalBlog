import { NextResponse } from 'next/server'
import { updateBook, deleteBook } from '../../../../lib/data'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const updatedBook = updateBook(id, body)
    
    if (!updatedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedBook)
  } catch (error) {
    console.error('Error updating book:', error)
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deleted = deleteBook(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Book deleted successfully' })
  } catch (error) {
    console.error('Error deleting book:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
