import { NextResponse } from 'next/server'
import { getAllRestaurants, addRestaurant } from '../../../lib/data'

export async function GET() {
  try {
    const restaurants = getAllRestaurants()
    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const newRestaurant = addRestaurant(body)
    return NextResponse.json(newRestaurant, { status: 201 })
  } catch (error) {
    console.error('Error adding restaurant:', error)
    return NextResponse.json({ error: 'Failed to add restaurant' }, { status: 500 })
  }
}
