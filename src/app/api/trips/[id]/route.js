import { NextResponse } from 'next/server'
import { updateTrip, deleteTrip } from '../../../../lib/data'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const updatedTrip = updateTrip(id, body)
    
    if (!updatedTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedTrip)
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deleted = deleteTrip(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Trip deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 })
  }
}
