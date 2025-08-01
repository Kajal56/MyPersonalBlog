'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import EntryCard from '../../components/EntryCard'
import AddEntryModal from '../../components/AddEntryModal'

export default function FlatsPage() {
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editFlat, setEditFlat] = useState(null)

  useEffect(() => {
    loadFlats()
  }, [])

  const loadFlats = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllFlats()
      setFlats(data)
    } catch (err) {
      setError('Failed to load flats')
      console.error('Error loading flats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFlatAdded = () => {
    loadFlats()
  }

  const handleEdit = (flat) => {
    console.log('Edit flat:', flat)
    setEditFlat(flat)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditFlat(null)
  }

  const handleDelete = async (flatId) => {
    try {
      await apiService.deleteFlat(flatId)
      setFlats(flats.filter(flat => flat.id !== flatId))
    } catch (error) {
      throw error
    }
  }

  const formatRent = (rent) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rent)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Flat Hunting</h1>
          <p className="text-gray-600">Properties I'm considering for rent</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Flat</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading flats...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : flats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No flats yet</h3>
          <p className="text-gray-600">Start adding properties you're interested in!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flats.map((flat) => (
            <EntryCard
              key={flat.id}
              type="flats"
              entry={flat}
              fields={[
                { label: 'Contact', value: flat.contactNumber, icon: '📞' },
                { label: 'Society', value: flat.societyName, icon: '🏢' },
                { label: 'Monthly Rent', value: formatRent(flat.rentValue), icon: '💰' },
                ...(flat.googleMapsLink ? [{ 
                  label: 'Location', 
                  value: (
                    <a 
                      href={flat.googleMapsLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View on Maps 🗺️
                    </a>
                  ), 
                  icon: '📍' 
                }] : []),
                ...(flat.remarks ? [{ label: 'Remarks', value: flat.remarks, icon: '📝' }] : [])
              ]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editFlat) && (
        <AddEntryModal
          type="flats"
          editEntry={editFlat}
          onClose={handleCloseModal}
          onEntryAdded={handleFlatAdded}
        />
      )}
    </div>
  )
}
