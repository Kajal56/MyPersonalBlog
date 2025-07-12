import { NextResponse } from 'next/server'
import { readData, addEntry, updateEntry, deleteEntry } from '../../../lib/data'

export async function GET() {
  try {
    const trips = readData('trips')
    return NextResponse.json(trips)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const success = addEntry('trips', body)
    
    if (success) {
      return NextResponse.json({ message: 'Trip added successfully' }, { status: 201 })
    } else {
      return NextResponse.json({ error: 'Failed to add trip' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    const success = updateEntry('trips', id, updateData)
    
    if (success) {
      return NextResponse.json({ message: 'Trip updated successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const success = deleteEntry('trips', id)
    
    if (success) {
      return NextResponse.json({ message: 'Trip deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
