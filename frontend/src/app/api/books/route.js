import { NextResponse } from 'next/server'
import { getAllBooks, addBook } from '../../../lib/data'

export async function GET() {
  try {
    const books = getAllBooks()
    return NextResponse.json(books)
  } catch (error) {
    console.error('Error fetching books:', error)
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const newBook = addBook(body)
    return NextResponse.json(newBook, { status: 201 })
  } catch (error) {
    console.error('Error adding book:', error)
    return NextResponse.json({ error: 'Failed to add book' }, { status: 500 })
  }
}
