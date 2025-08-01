import { NextResponse } from 'next/server'
import { updateRestaurant, deleteRestaurant } from '../../../../lib/data'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const updatedRestaurant = updateRestaurant(id, body)
    
    if (!updatedRestaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedRestaurant)
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const deleted = deleteRestaurant(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Restaurant deleted successfully' })
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return NextResponse.json({ error: 'Failed to delete restaurant' }, { status: 500 })
  }
}
