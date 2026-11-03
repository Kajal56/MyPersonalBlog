
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import EntryCard from '../../../components/EntryCard'
import AddEntryModal from '../../../components/AddEntryModal'
import { useAdminMode } from '../../../components/AdminModeContext'

export default function FlatsPage() {
  const { isAdminMode } = useAdminMode()
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
    } finally {
      setLoading(false)
    }
  }

  const handleFlatAdded = () => {
    loadFlats()
  }

  const handleEdit = (flat) => {
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
          <h1 className="text-3xl font-bold text-ink mb-2">🏠 Flat Hunting</h1>
          <p className="text-muted">Properties I'm considering for rent</p>
        </div>
        {isAdminMode && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent hover:bg-accent-hover text-on-accent px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Flat</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted">Loading flats...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-danger">{error}</div>
        </div>
      ) : flats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-ink mb-2">No flats yet</h3>
          <p className="text-muted">Start adding properties you're interested in!</p>
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
                        className="text-accent-ink hover:text-accent-ink underline"
                      >
                        View on Maps 🗺️
                      </a>
                    ), 
                    icon: '📍' 
                  }] : []),
                  ...(flat.remarks ? [{ label: 'Remarks', value: flat.remarks, icon: '📝' }] : [])
                ]}
                onEdit={isAdminMode ? handleEdit : undefined}
                onDelete={isAdminMode ? handleDelete : undefined}
                cardClassName="bg-transparent"
              />
            ))}
          </div>
      )}

      {(showAddModal || editFlat) && (
        <AddEntryModal
          type="flats"
          editEntry={editFlat}
          onClose={handleCloseModal}
          onEntryAdded={handleFlatAdded}
        />
      )}
      {(isAdminMode && (showAddModal || editFlat)) && (
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
