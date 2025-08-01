import { NextResponse } from 'next/server'
import { getAllTrips, addTrip } from '../../../lib/data'

export async function GET() {
  try {
    const trips = getAllTrips()
    return NextResponse.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const newTrip = addTrip(body)
    return NextResponse.json(newTrip, { status: 201 })
  } catch (error) {
    console.error('Error adding trip:', error)
    return NextResponse.json({ error: 'Failed to add trip' }, { status: 500 })
  }
}
