import { NextResponse } from 'next/server'
import { readData, addEntry, updateEntry, deleteEntry } from '../../../lib/data'

export async function GET() {
  try {
    const restaurants = readData('restaurants')
    return NextResponse.json(restaurants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const success = addEntry('restaurants', body)
    
    if (success) {
      return NextResponse.json({ message: 'Restaurant added successfully' }, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to add restaurant' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const success = updateEntry('restaurants', id, updateData)
    
    if (success) {
      return NextResponse.json({ message: 'Restaurant updated successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const success = deleteEntry('restaurants', id)
    
    if (success) {
      return NextResponse.json({ message: 'Restaurant deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
